import { Request, Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

/**
 * GET /api/messages/conversations
 * Returns all conversations for the current user, with last message + other user info.
 */
export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    console.log("[getConversations] userId:", userId);

    const result = await pool.query(
      `SELECT
         c.id,
         c.user1_id,
         c.user2_id,
         c.updated_at,
         -- Other user info
         u.id           AS other_user_id,
         u.first_name   AS other_first_name,
         u.last_name    AS other_last_name,
         u.profile_image AS other_avatar,
         u.title        AS other_title,
         -- Last message (lateral join)
         lm.content     AS last_message,
         lm.created_at  AS last_message_time,
         lm.sender_id   AS last_message_sender_id
       FROM conversations c
       JOIN users u ON u.id = CASE
         WHEN c.user1_id = $1::uuid THEN c.user2_id
         ELSE c.user1_id
       END
       LEFT JOIN LATERAL (
         SELECT content, created_at, sender_id
         FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC
         LIMIT 1
       ) lm ON true
       WHERE c.user1_id = $1::uuid OR c.user2_id = $1::uuid
       ORDER BY COALESCE(lm.created_at, c.updated_at) DESC`,
      [userId],
    );

    const conversations = result.rows.map((r: any) => ({
      id: r.id,
      otherUser: {
        id: r.other_user_id,
        firstName: r.other_first_name || "",
        lastName: r.other_last_name || "",
        avatar: r.other_avatar || "",
        title: r.other_title || "",
      },
      lastMessage: r.last_message || "",
      lastMessageTime: r.last_message_time || r.updated_at,
      lastMessageSenderId: r.last_message_sender_id || null,
    }));

    console.log(
      "[getConversations] found",
      conversations.length,
      "conversations",
    );
    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/messages/conversations/:id
 * Returns all messages in a conversation.
 */
export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id;

    // Verify the user belongs to this conversation
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
      `SELECT id, conversation_id, sender_id, content, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId],
    );

    res.json({ success: true, messages: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/messages/conversations
 * Create (or return existing) conversation with another user.
 * Body: { otherUserId: number }
 */
export const createConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const otherUserId = req.body.otherUserId;
    console.log(
      "[createConversation] userId:",
      userId,
      "otherUserId:",
      otherUserId,
    );

    if (!otherUserId || userId === otherUserId) {
      res.status(400).json({ success: false, message: "Invalid recipient" });
      return;
    }

    // Normalise ordering so the unique constraint works both ways
    const [u1, u2] =
      userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

    // Upsert: return existing or create new
    const result = await pool.query(
      `INSERT INTO conversations (user1_id, user2_id)
       VALUES ($1, $2)
       ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = NOW()
       RETURNING id, user1_id, user2_id, created_at, updated_at`,
      [u1, u2],
    );

    const conv = result.rows[0];

    // Fetch other user info
    const userResult = await pool.query(
      `SELECT id, first_name, last_name, profile_image, title
       FROM users WHERE id = $1`,
      [otherUserId],
    );

    const otherUser = userResult.rows[0];

    res.json({
      success: true,
      conversation: {
        id: conv.id,
        otherUser: {
          id: otherUser?.id || otherUserId,
          firstName: otherUser?.first_name || "",
          lastName: otherUser?.last_name || "",
          avatar: otherUser?.profile_image || "",
          title: otherUser?.title || "",
        },
        lastMessage: "",
        lastMessageTime: conv.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};
