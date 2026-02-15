import { Router } from "express";
import authenticate from "../middleware/auth";
import {
  createReview,
  getReviewsByUserId,
} from "../controllers/reviews.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: User review management
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review for a user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reviewed_user_id
 *               - rating
 *             properties:
 *               reviewed_user_id:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Great service! Very professional.
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input or attempting to review self
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User to review not found
 */
router.post("/", authenticate, createReview);

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Get all reviews for a specific user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user's UUID
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       reviewerId:
 *                         type: string
 *                       reviewedUserId:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                       reviewer:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           profileImage:
 *                             type: string
 */
router.get("/user/:userId", getReviewsByUserId);

export default router;
