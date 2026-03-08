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
      `INSERT INTO jobs (client_id, title, description, budget, category, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
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
    const { category, location } = req.query;

    let query = `
      SELECT j.*, 
             u.first_name as client_first_name, 
             u.last_name as client_last_name, 
             u.profile_image as client_avatar
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      WHERE j.status = 'open'
    `;
    const params: any[] = [];
    let paramIndex = 1;

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
 * GET /api/jobs/:id
 * Fetch a single job by ID
 */
export const getJobById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const jobId = req.params.id;
    const result = await pool.query(
      `SELECT j.*, 
              u.first_name as client_first_name, 
              u.last_name as client_last_name, 
              u.profile_image as client_avatar
       FROM jobs j
       JOIN users u ON j.client_id = u.id
       WHERE j.id = $1`,
      [jobId],
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

    // Insert bid
    const result = await pool.query(
      `INSERT INTO job_bids (job_id, freelancer_id, proposal, proposed_rate)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [jobId, freelancerId, proposal, proposed_rate],
    );

    res.status(201).json({ success: true, bid: result.rows[0] });
  } catch (err) {
    next(err);
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
