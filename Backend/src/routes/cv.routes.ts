import { Router } from "express";
import authenticate from "../middleware/auth";
import {
  analyzeCv,
  getMyCvAnalyses,
  cvUpload,
} from "../controllers/cv.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: CV
 *   description: CV analyzer (AI scoring + suggestions)
 */

/**
 * @swagger
 * /api/cv/analyze:
 *   post:
 *     summary: Upload and analyze a CV with Gemini AI
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file in PDF or DOCX format
 *               targetRole:
 *                 type: string
 *                 example: Frontend Developer
 *               jobDescription:
 *                 type: string
 *                 example: We need a React/TypeScript engineer with API integration experience.
 *     responses:
 *       201:
 *         description: CV analyzed successfully
 *       400:
 *         description: Invalid upload or unreadable CV
 *       401:
 *         description: Unauthorized
 */
router.post("/analyze", authenticate, cvUpload.single("cv"), analyzeCv);

/**
 * @swagger
 * /api/cv/my-analyses:
 *   get:
 *     summary: Get recent CV analyses for authenticated user
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *         example: 10
 *     responses:
 *       200:
 *         description: Analyses fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-analyses", authenticate, getMyCvAnalyses);

export default router;
