import { Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { getIO } from "../config/socket";

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

    if (!conversationId || !title?.trim() || !hourlyRate) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    // Verify conversation exists and user is a participant
    const convResult = await pool.query(
      `SELECT user1_id, user2_id FROM conversations WHERE id = $1`,
      [conversationId],
    );

    if (convResult.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
      return;
    }

    const conv = convResult.rows[0];
    if (conv.user1_id !== userId && conv.user2_id !== userId) {
      res
        .status(403)
        .json({ success: false, message: "Not part of this conversation" });
      return;
    }

    // Determine recipient
    const recipientId =
      conv.user1_id === userId ? conv.user2_id : conv.user1_id;

    // Insert the offer
    const offerResult = await pool.query(
      `INSERT INTO offers (conversation_id, sender_id, recipient_id, title, hourly_rate)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, conversation_id, sender_id, recipient_id, title, hourly_rate, status, created_at`,
      [conversationId, userId, recipientId, title.trim(), hourlyRate],
    );

    const offer = offerResult.rows[0];

    // Insert a special message linked to the offer
    const messageContent = `Offer: "${title.trim()}" at $${Number(hourlyRate).toFixed(2)}/hr`;

    const msgResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content, offer_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, conversation_id, sender_id, content, created_at, offer_id`,
      [conversationId, userId, messageContent, offer.id],
    );

    // Update conversation timestamp
    await pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [conversationId],
    );

    const message = {
      ...msgResult.rows[0],
      offer: {
        id: offer.id,
        title: offer.title,
        hourly_rate: Number(offer.hourly_rate),
        status: offer.status,
        sender_id: offer.sender_id,
        recipient_id: offer.recipient_id,
      },
    };

    // Emit the message via WebSocket to both users
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit("new_message", message);
      io.to(`user:${String(recipientId)}`).emit("new_message", message);
    } catch (socketErr) {
      console.error("Socket emit error (non-fatal):", socketErr);
    }

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
 * Accept or decline an offer. Only the recipient can do this.
 * Body: { status: 'accepted' | 'declined' }
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

    if (!status || !["accepted", "declined"].includes(status)) {
      res
        .status(400)
        .json({
          success: false,
          message: "Status must be 'accepted' or 'declined'",
        });
      return;
    }

    // Fetch the offer and verify the user is the recipient
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
      res
        .status(403)
        .json({
          success: false,
          message: "Only the recipient can accept or decline",
        });
      return;
    }

    if (offer.status !== "pending") {
      res
        .status(400)
        .json({
          success: false,
          message: "Offer has already been " + offer.status,
        });
      return;
    }

    // Update the offer status
    await pool.query(`UPDATE offers SET status = $1 WHERE id = $2`, [
      status,
      offerId,
    ]);

    // Insert a status change message
    const emoji = status === "accepted" ? "✅" : "❌";
    const messageContent = `${emoji} Offer "${offer.title}" has been ${status}`;

    const msgResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id, sender_id, content, created_at`,
      [offer.conversation_id, userId, messageContent],
    );

    // Update conversation timestamp
    await pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [offer.conversation_id],
    );

    const message = msgResult.rows[0];

    // Emit via WebSocket
    try {
      const io = getIO();
      io.to(`user:${String(offer.sender_id)}`).emit("new_message", message);
      io.to(`user:${String(offer.recipient_id)}`).emit("new_message", message);

      // Also emit an offer_updated event so the UI can update the card
      const offerUpdate = {
        offerId: offer.id,
        status,
        conversationId: offer.conversation_id,
      };
      io.to(`user:${String(offer.sender_id)}`).emit(
        "offer_updated",
        offerUpdate,
      );
      io.to(`user:${String(offer.recipient_id)}`).emit(
        "offer_updated",
        offerUpdate,
      );
    } catch (socketErr) {
      console.error("Socket emit error (non-fatal):", socketErr);
    }

    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/offers/conversation/:conversationId
 * Get all offers for a conversation.
 */
export const getOffersByConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    // Verify user is part of the conversation
    const convCheck = await pool.query(
      `SELECT id FROM conversations
       WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [conversationId, userId],
    );

    if (convCheck.rows.length === 0) {
      res
        .status(403)
        .json({ success: false, message: "Not part of this conversation" });
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
