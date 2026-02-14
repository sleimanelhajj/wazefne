import { Router } from "express";
import { getUsers } from "../controllers/users.controller";
import authenticate from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Browse users
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users for browsing
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       profileImage:
 *                         type: string
 *                       title:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       reviewCount:
 *                         type: integer
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                       hourlyRate:
 *                         type: number
 *                       verified:
 *                         type: boolean
 *                       category:
 *                         type: string
 *                       availableToday:
 *                         type: boolean
 */
router.get("/", getUsers, authenticate);

export default router;
