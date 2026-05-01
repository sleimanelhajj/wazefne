import { Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

/**
 * POST /api/jobs
 * Client posts a new job request
 */
export const createJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const clientId = req.user!.id;
    const { title, description, budget, category, location } = req.body;

    if (!title || !description || !category || !location) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const result = await pool.query(
      `WITH inserted_job AS (
         INSERT INTO jobs (client_id, title, description, budget, category, location)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *
       )
       SELECT j.*,
              u.first_name AS client_first_name,
              u.last_name AS client_last_name,
              u.profile_image AS client_avatar,
              (j.client_id = $1::uuid) AS is_owner
       FROM inserted_job j
       JOIN users u ON j.client_id = u.id`,
      [clientId, title, description, budget || null, category, location],
    );

    res.status(201).json({ success: true, job: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs
 * Fetch all open jobs, with optional filters
 */
export const getJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { category, location } = req.query;

    let query = `
      SELECT j.*, 
             u.first_name as client_first_name, 
             u.last_name as client_last_name, 
             u.profile_image as client_avatar,
             (j.client_id = $1::uuid) as is_owner
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      WHERE j.status = 'open'
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (category) {
      query += ` AND j.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (location && location !== "all") {
      query += ` AND j.location = $${paramIndex}`;
      params.push(location);
      paramIndex++;
    }

    query += ` ORDER BY j.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, jobs: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/my-posts
 * Fetch jobs posted by the current user with offers counters
 */
export const getMyPostedJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Reconcile stale statuses from earlier flows:
    // if the linked booking offer is completed, the job should be completed too.
    await pool.query(
      `UPDATE jobs j
       SET status = 'completed',
           updated_at = NOW()
       WHERE j.client_id = $1
         AND j.status IN ('open', 'in_progress')
         AND EXISTS (
           SELECT 1
           FROM job_bids b
           JOIN offers o
             ON o.sender_id = j.client_id
            AND o.recipient_id = b.freelancer_id
            AND o.title = CONCAT('Job: ', j.title)
            AND o.hourly_rate = b.proposed_rate
            AND o.status = 'completed'
           WHERE b.job_id = j.id
             AND b.status = 'accepted'
         )`,
      [userId],
    );

    const result = await pool.query(
      `SELECT
         j.*,
         u.first_name as client_first_name,
         u.last_name as client_last_name,
         u.profile_image as client_avatar,
         true as is_owner,
         COALESCE(tb.total_offers, 0) as offers_count,
         COALESCE(pb.pending_offers, 0) as pending_offers_count
       FROM jobs j
       JOIN users u ON j.client_id = u.id
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int as total_offers
         FROM job_bids b
         WHERE b.job_id = j.id
       ) tb ON true
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int as pending_offers
         FROM job_bids b
         WHERE b.job_id = j.id AND b.status = 'pending'
       ) pb ON true
       WHERE j.client_id = $1
       ORDER BY j.created_at DESC`,
      [userId],
    );

    res.json({ success: true, jobs: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id
 * Fetch a single job by ID
 */
export const getJobById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const jobId = req.params.id;
    const result = await pool.query(
      `SELECT j.*, 
              u.first_name as client_first_name, 
              u.last_name as client_last_name, 
              u.profile_image as client_avatar,
              (j.client_id = $1::uuid) as is_owner
       FROM jobs j
       JOIN users u ON j.client_id = u.id
       WHERE j.id = $2`,
      [userId, jobId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs/:id/bids
 * Freelancer submits a bid/proposal for a job
 */
export const createBid = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const freelancerId = req.user!.id;
    const jobId = req.params.id;
    const { proposal, proposed_rate } = req.body;

    if (!proposal || !proposed_rate) {
      res
        .status(400)
        .json({ success: false, message: "Missing proposal or rate" });
      return;
    }

    // Verify job exists and is open
    const jobCheck = await pool.query(
      `SELECT status, client_id FROM jobs WHERE id = $1`,
      [jobId],
    );

    if (jobCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    if (jobCheck.rows[0].status !== "open") {
      res
        .status(400)
        .json({
          success: false,
          message: "This job is no longer open for bids",
        });
      return;
    }

    if (jobCheck.rows[0].client_id === freelancerId) {
      res
        .status(400)
        .json({ success: false, message: "You cannot bid on your own job" });
      return;
    }

    // Persist bid only. Acceptance flow is handled in Jobs section, not chat.
    const bidResult = await pool.query(
      `INSERT INTO job_bids (job_id, freelancer_id, proposal, proposed_rate)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [jobId, freelancerId, proposal.trim(), proposed_rate],
    );

    res.status(201).json({ success: true, bid: bidResult.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/jobs/:jobId/bids/:bidId/status
 * Job owner accepts or rejects a proposal.
 * When accepted, opens chat via conversation + system message.
 */
export const updateBidStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const client = await pool.connect();
  try {
    const userId = req.user!.id;
    const { jobId, bidId } = req.params;
    const { status } = req.body as { status?: "accepted" | "rejected" };

    if (status !== "accepted" && status !== "rejected") {
      res.status(400).json({
        success: false,
        message: "Status must be 'accepted' or 'rejected'",
      });
      return;
    }

    await client.query("BEGIN");

    const bidCheck = await client.query(
      `SELECT b.id, b.job_id, b.freelancer_id, b.status AS bid_status,
              b.proposed_rate,
              j.client_id, j.title AS job_title, j.status AS job_status
       FROM job_bids b
       JOIN jobs j ON j.id = b.job_id
       WHERE b.id = $1 AND b.job_id = $2`,
      [bidId, jobId],
    );

    if (bidCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ success: false, message: "Bid not found" });
      return;
    }

    const bid = bidCheck.rows[0];

    if (bid.client_id !== userId) {
      await client.query("ROLLBACK");
      res
        .status(403)
        .json({ success: false, message: "Only the job owner can update bids" });
      return;
    }

    if (bid.bid_status !== "pending") {
      await client.query("ROLLBACK");
      res.status(400).json({
        success: false,
        message: `Bid is already '${bid.bid_status}'`,
      });
      return;
    }

    await client.query(`UPDATE job_bids SET status = $1 WHERE id = $2`, [
      status,
      bidId,
    ]);

    let conversationId: number | null = null;

    if (status === "accepted") {
      // Close other pending bids for the same job to keep one accepted source of truth.
      await client.query(
        `UPDATE job_bids
         SET status = 'rejected'
         WHERE job_id = $1 AND id <> $2 AND status = 'pending'`,
        [jobId, bidId],
      );

      await client.query(
        `UPDATE jobs SET status = 'in_progress', updated_at = NOW() WHERE id = $1`,
        [jobId],
      );

      const [u1, u2] =
        userId < bid.freelancer_id
          ? [userId, bid.freelancer_id]
          : [bid.freelancer_id, userId];

      const convResult = await client.query(
        `INSERT INTO conversations (user1_id, user2_id)
         VALUES ($1, $2)
         ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = NOW()
         RETURNING id`,
        [u1, u2],
      );
      conversationId = convResult.rows[0].id;

      // Create a booking record (offers table) so both users see it in /bookings.
      // Sender is the client (booker), recipient is the freelancer (booked).
      await client.query(
        `INSERT INTO offers (conversation_id, sender_id, recipient_id, title, hourly_rate, status)
         VALUES ($1, $2, $3, $4, $5, 'accepted')`,
        [
          conversationId,
          userId,
          bid.freelancer_id,
          `Job: ${bid.job_title}`,
          bid.proposed_rate,
        ],
      );

      const systemText = `Your proposal for "${bid.job_title}" was accepted. You can now coordinate here.`;
      await client.query(
        `INSERT INTO messages (conversation_id, sender_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, conversation_id, sender_id, content, created_at`,
        [conversationId, userId, systemText],
      );

      await client.query(
        `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
        [conversationId],
      );

    }

    await client.query("COMMIT");

    res.json({ success: true, status, conversationId });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    next(err);
  } finally {
    client.release();
  }
};

/**
 * GET /api/jobs/:id/bids
 * Fetch all bids for a specific job (Only the job owner can view)
 */
export const getJobBids = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const jobId = req.params.id;

    // Verify user owns the job
    const jobCheck = await pool.query(
      `SELECT client_id FROM jobs WHERE id = $1`,
      [jobId],
    );

    if (jobCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    if (jobCheck.rows[0].client_id !== userId) {
      res
        .status(403)
        .json({ success: false, message: "Only the job poster can view bids" });
      return;
    }

    const result = await pool.query(
      `SELECT b.*, 
              u.first_name as freelancer_first_name, 
              u.last_name as freelancer_last_name, 
              u.profile_image as freelancer_avatar,
              u.title as freelancer_title,
              u.rating as freelancer_rating
       FROM job_bids b
       JOIN users u ON b.freelancer_id = u.id
       WHERE b.job_id = $1
       ORDER BY b.created_at DESC`,
      [jobId],
    );

    res.json({ success: true, bids: result.rows });
  } catch (err) {
    next(err);
  }
};
