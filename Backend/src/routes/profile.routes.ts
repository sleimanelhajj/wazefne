import { Router } from "express";
import authenticate from "../middleware/auth";
import { updateProfile, getMyProfile } from "../controllers/profile.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get authenticated user's full profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticate, getMyProfile);

/**
 * @swagger
 * /api/profile/update-profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               title:
 *                 type: string
 *                 example: Full-Stack Developer
 *               offer_description:
 *                 type: string
 *                 example: I build modern web applications
 *               location:
 *                 type: string
 *                 example: Amman, Jordan
 *               about_me:
 *                 type: string
 *                 example: Passionate developer with 5 years experience
 *               hourly_rate:
 *                 type: number
 *                 example: 35.00
 *               profile_image:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               category:
 *                 type: string
 *                 example: Development
 *               available_today:
 *                 type: boolean
 *                 example: true
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Angular", "Node.js", "PostgreSQL"]
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["English", "Arabic"]
 *               portfolio:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                       example: https://example.com/project1.jpg
 *                     caption:
 *                       type: string
 *                       example: E-commerce project
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put("/update-profile", authenticate, updateProfile);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         name:
 *           type: string
 *         title:
 *           type: string
 *         offer_description:
 *           type: string
 *         location:
 *           type: string
 *         about_me:
 *           type: string
 *         hourly_rate:
 *           type: number
 *         profile_image:
 *           type: string
 *         category:
 *           type: string
 *         available_today:
 *           type: boolean
 *         rating:
 *           type: number
 *         review_count:
 *           type: integer
 *         verified:
 *           type: boolean
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *         portfolio:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               image_url:
 *                 type: string
 *               caption:
 *                 type: string
 *               sort_order:
 *                 type: integer
 */

export default router;
