import { Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

const OFFER_STATE_MESSAGES: Record<string, { emoji: string; label: string }> = {
  accepted: { emoji: "✅", label: "accepted" },
  declined: { emoji: "❌", label: "declined" },
  in_progress: { emoji: "🔨", label: "started (In Progress)" },
  completed: { emoji: "🎉", label: "completed" },
  cancelled: { emoji: "🚫", label: "cancelled" },
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["accepted", "declined"],
  accepted: ["in_progress"],
  in_progress: ["completed"],
};

const JOB_TITLE_PREFIX = "Job:";

const extractBookedJobTitle = (title: string): string | null => {
  if (!title || !title.startsWith(JOB_TITLE_PREFIX)) {
    return null;
  }
  const parsed = title.slice(JOB_TITLE_PREFIX.length).trim();
  return parsed.length > 0 ? parsed : null;
};

/**
 * POST /api/offers
 * Create an offer within a conversation.
 * Body: { conversationId, title, hourlyRate }
 */
export const createOffer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId, title, hourlyRate } = req.body;

    if (
      !conversationId ||
      !title?.trim() ||
      hourlyRate === undefined ||
      hourlyRate === null
    ) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    const parsedRate = Number(hourlyRate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      res.status(400).json({
        success: false,
        message: "Hourly rate must be a valid positive number",
      });
      return;
    }

    const convResult = await pool.query(
      `SELECT user1_id, user2_id FROM conversations WHERE id = $1`,
      [conversationId],
    );

    if (convResult.rows.length === 0) {
      res.status(404).json({ success: false, message: "Conversation not found" });
      return;
    }

    const conv = convResult.rows[0];
    if (conv.user1_id !== userId && conv.user2_id !== userId) {
      res.status(403).json({ success: false, message: "Not part of this conversation" });
      return;
    }

    const recipientId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

    const offerResult = await pool.query(
      `INSERT INTO offers (conversation_id, sender_id, recipient_id, title, hourly_rate)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, conversation_id, sender_id, recipient_id, title, hourly_rate, status, created_at`,
      [conversationId, userId, recipientId, title.trim(), hourlyRate],
    );

    const offer = offerResult.rows[0];

    const messageContent = `Offer: "${title.trim()}" at $${Number(hourlyRate).toFixed(2)}/hr`;

    await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content, offer_id)
       VALUES ($1, $2, $3, $4)`,
      [conversationId, userId, messageContent, offer.id],
    );

    await pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [conversationId],
    );

    res.json({
      success: true,
      offer: {
        id: offer.id,
        conversationId: offer.conversation_id,
        senderId: offer.sender_id,
        recipientId: offer.recipient_id,
        title: offer.title,
        hourlyRate: Number(offer.hourly_rate),
        status: offer.status,
        createdAt: offer.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/offers/:id/status
 */
export const updateOfferStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const offerId = req.params.id;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: "Status is required" });
      return;
    }

    const offerResult = await pool.query(
      `SELECT id, conversation_id, sender_id, recipient_id, title, hourly_rate, status
       FROM offers WHERE id = $1`,
      [offerId],
    );

    if (offerResult.rows.length === 0) {
      res.status(404).json({ success: false, message: "Offer not found" });
      return;
    }

    const offer = offerResult.rows[0];

    if (offer.recipient_id !== userId) {
      res.status(403).json({
        success: false,
        message: "Only the recipient can update this offer",
      });
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[offer.status] || [];
    if (!allowed.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Cannot transition from '${offer.status}' to '${status}'`,
      });
      return;
    }

    await pool.query(`UPDATE offers SET status = $1 WHERE id = $2`, [status, offerId]);

    const bookedJobTitle =
      (status === "in_progress" || status === "completed") &&
      typeof offer.title === "string"
        ? extractBookedJobTitle(offer.title)
        : null;

    if (bookedJobTitle) {
      await pool.query(
        `UPDATE jobs j
         SET status = $1, updated_at = NOW()
         FROM job_bids b
         WHERE b.job_id = j.id
           AND b.status = 'accepted'
           AND b.freelancer_id = $2
           AND j.client_id = $3
           AND j.title = $4
           AND b.proposed_rate = $5
           AND (
             ($1 = 'in_progress' AND j.status IN ('open', 'in_progress'))
             OR
             ($1 = 'completed' AND j.status = 'in_progress')
           )`,
        [status, offer.recipient_id, offer.sender_id, bookedJobTitle, offer.hourly_rate],
      );
    }

    const stateMessage = OFFER_STATE_MESSAGES[status] || { emoji: "ℹ️", label: status };
    const messageContent = `${stateMessage.emoji} Offer "${offer.title}" has been ${stateMessage.label}`;

    await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)`,
      [offer.conversation_id, userId, messageContent],
    );

    await pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [offer.conversation_id],
    );

    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/offers/:id/cancel
 */
export const cancelOffer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const offerId = req.params.id;

    const offerResult = await pool.query(
      `SELECT id, conversation_id, sender_id, recipient_id, title, status
       FROM offers WHERE id = $1`,
      [offerId],
    );

    if (offerResult.rows.length === 0) {
      res.status(404).json({ success: false, message: "Offer not found" });
      return;
    }

    const offer = offerResult.rows[0];

    if (offer.sender_id !== userId) {
      res.status(403).json({ success: false, message: "Only the sender can cancel an offer" });
      return;
    }

    if (offer.status !== "pending") {
      res.status(400).json({ success: false, message: "Can only cancel pending offers" });
      return;
    }

    await pool.query(`UPDATE offers SET status = 'cancelled' WHERE id = $1`, [offerId]);

    const { emoji, label } = OFFER_STATE_MESSAGES.cancelled;
    const messageContent = `${emoji} Offer "${offer.title}" has been ${label}`;

    await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)`,
      [offer.conversation_id, userId, messageContent],
    );

    await pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [offer.conversation_id],
    );

    res.json({ success: true, status: "cancelled" });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/offers/my-bookings
 */
export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT
         o.id,
         o.conversation_id,
         o.sender_id,
         o.recipient_id,
         o.title,
         o.hourly_rate,
         o.status,
         o.created_at,
         s.first_name  AS sender_first_name,
         s.last_name   AS sender_last_name,
         s.profile_image AS sender_avatar,
         r.first_name  AS recipient_first_name,
         r.last_name   AS recipient_last_name,
         r.profile_image AS recipient_avatar
       FROM offers o
       JOIN users s ON s.id = o.sender_id
       JOIN users r ON r.id = o.recipient_id
       WHERE o.sender_id = $1 OR o.recipient_id = $1
       ORDER BY o.created_at DESC`,
      [userId],
    );

    const bookings = result.rows.map((row: any) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      recipientId: row.recipient_id,
      title: row.title,
      hourlyRate: Number(row.hourly_rate),
      status: row.status,
      createdAt: row.created_at,
      direction: row.sender_id === userId ? "i-booked" : "booked-me",
      sender: {
        firstName: row.sender_first_name,
        lastName: row.sender_last_name,
        avatar: row.sender_avatar,
      },
      recipient: {
        firstName: row.recipient_first_name,
        lastName: row.recipient_last_name,
        avatar: row.recipient_avatar,
      },
    }));

    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/offers/conversation/:conversationId
 */
export const getOffersByConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    const convCheck = await pool.query(
      `SELECT id FROM conversations
       WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [conversationId, userId],
    );

    if (convCheck.rows.length === 0) {
      res.status(403).json({ success: false, message: "Not part of this conversation" });
      return;
    }

    const result = await pool.query(
      `SELECT id, conversation_id, sender_id, recipient_id, title, hourly_rate, status, created_at
       FROM offers
       WHERE conversation_id = $1
       ORDER BY created_at DESC`,
      [conversationId],
    );

    const offers = result.rows.map((o: any) => ({
      id: o.id,
      conversationId: o.conversation_id,
      senderId: o.sender_id,
      recipientId: o.recipient_id,
      title: o.title,
      hourlyRate: Number(o.hourly_rate),
      status: o.status,
      createdAt: o.created_at,
    }));

    res.json({ success: true, offers });
  } catch (err) {
    next(err);
  }
};
