import { Router } from "express";
import authenticate from "../middleware/auth";
import {
  getConversations,
  getMessages,
  createConversation,
} from "../controllers/messages.controller";

const router = Router();

// All message routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Real-time messaging and conversations
 */

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: List user's conversations
 *     description: Returns all conversations for the authenticated user with last message and other user info.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       otherUser:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           title:
 *                             type: string
 *                       lastMessage:
 *                         type: string
 *                       lastMessageTime:
 *                         type: string
 *                         format: date-time
 */
router.get("/conversations", getConversations as any);

/**
 * @swagger
 * /api/messages/conversations/{id}:
 *   get:
 *     summary: Get messages in a conversation
 *     description: Returns all messages for a specific conversation. User must be a participant.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       conversation_id:
 *                         type: integer
 *                       sender_id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Not part of this conversation
 */
router.get("/conversations/:id", getMessages as any);

/**
 * @swagger
 * /api/messages/conversations:
 *   post:
 *     summary: Create or get a conversation
 *     description: Creates a new conversation with another user, or returns the existing one if it already exists.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otherUserId
 *             properties:
 *               otherUserId:
 *                 type: string
 *                 description: UUID of the other user
 *     responses:
 *       200:
 *         description: Conversation created or found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     otherUser:
 *                       type: object
 *                     lastMessage:
 *                       type: string
 *                     lastMessageTime:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid recipient
 */
router.post("/conversations", createConversation as any);

export default router;
