import { Router } from "express";
import authenticate from "../middleware/auth";
import {
  createOffer,
  getOffersByConversation,
  updateOfferStatus,
  cancelOffer,
  getMyBookings,
} from "../controllers/offers.controller";

const router = Router();

// All offer routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Job offers within conversations
 */

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Create an offer
 *     description: Creates a new job offer within a conversation and sends a special message.
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - title
 *               - hourlyRate
 *             properties:
 *               conversationId:
 *                 type: integer
 *               title:
 *                 type: string
 *                 description: Job title
 *               hourlyRate:
 *                 type: number
 *                 description: Proposed hourly rate
 *     responses:
 *       200:
 *         description: Offer created successfully
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Not part of this conversation
 */
router.post("/", createOffer as any);

/**
 * @swagger
 * /api/offers/my-bookings:
 *   get:
 *     summary: Get all bookings for the current user
 *     description: Returns all offers where the user is sender or recipient, with user info.
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/my-bookings", getMyBookings as any);

/**
 * @swagger
 * /api/offers/{id}/status:
 *   patch:
 *     summary: Update offer status
 *     description: Updates the status of an offer. Only the recipient can perform this action. Supports accepted, declined, in_progress, completed.
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, declined, in_progress, completed]
 *     responses:
 *       200:
 *         description: Offer status updated
 *       403:
 *         description: Only the recipient can update this offer
 */
router.patch("/:id/status", updateOfferStatus as any);

/**
 * @swagger
 * /api/offers/{id}/cancel:
 *   patch:
 *     summary: Cancel an offer
 *     description: Cancels a pending offer. Only the sender can cancel.
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Offer cancelled
 *       400:
 *         description: Can only cancel pending offers
 *       403:
 *         description: Only the sender can cancel
 */
router.patch("/:id/cancel", cancelOffer as any);

/**
 * @swagger
 * /api/offers/conversation/{conversationId}:
 *   get:
 *     summary: Get offers for a conversation
 *     description: Returns all offers for a given conversation.
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of offers
 *       403:
 *         description: Not part of this conversation
 */
router.get("/conversation/:conversationId", getOffersByConversation as any);

export default router;
