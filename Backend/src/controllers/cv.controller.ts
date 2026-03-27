import { Response, NextFunction } from "express";
import multer from "multer";
import { createHash } from "crypto";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";
import {
  extractCvText,
  isSupportedCvFile,
  isPdfCvFile,
  MAX_CV_FILE_SIZE_BYTES,
} from "../services/cv-extraction.service";
import {
  analyzeCvWithGemini,
  analyzeCvFileWithGemini,
  CvAnalysisResult,
} from "../services/cv-analysis.service";

const MAX_CV_TEXT_CHARS = 15000;

const badRequestError = (message: string): Error & { statusCode: number } => {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = 400;
  return err;
};

export const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CV_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!isSupportedCvFile(file)) {
      cb(badRequestError("Unsupported file type. Upload PDF or DOCX only."));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /api/cv/analyze
 * Analyze uploaded CV using Gemini and return a score + suggestions.
 */
export const analyzeCv = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({
        success: false,
        message: "No CV uploaded. Send a file field named 'cv'.",
      });
      return;
    }

    const fileHash = createHash("sha256").update(file.buffer).digest("hex");

    const cached = await pool.query(
      `SELECT id, analysis_json, overall_score, created_at
       FROM cv_analyses
       WHERE user_id = $1 AND file_hash = $2
       LIMIT 1`,
      [userId, fileHash],
    );

    if (cached.rows.length > 0) {
      const row = cached.rows[0];
      res.json({
        success: true,
        cached: true,
        analysisId: row.id,
        overallScore: row.overall_score,
        createdAt: row.created_at,
        analysis: row.analysis_json,
      });
      return;
    }

    const targetRole =
      typeof req.body?.targetRole === "string"
        ? req.body.targetRole.trim().slice(0, 180)
        : "";
    const jobDescription =
      typeof req.body?.jobDescription === "string"
        ? req.body.jobDescription.trim().slice(0, 5000)
        : "";

    let extractedTextForStorage = "";
    let wasTruncated = false;
    let analysis: CvAnalysisResult;

    if (isPdfCvFile(file)) {
      analysis = await analyzeCvFileWithGemini({
        fileBuffer: file.buffer,
        fileMimeType: file.mimetype || "application/pdf",
        targetRole,
        jobDescription,
      });
      extractedTextForStorage = "[PDF analyzed directly with Gemini]";
    } else {
      let extractedText = await extractCvText(file);

      if (!extractedText || extractedText.length < 80) {
        res.status(400).json({
          success: false,
          message:
            "Could not extract enough text from the CV. Try a clearer PDF/DOCX file.",
        });
        return;
      }

      wasTruncated = extractedText.length > MAX_CV_TEXT_CHARS;
      if (wasTruncated) {
        extractedText = extractedText.slice(0, MAX_CV_TEXT_CHARS);
      }

      analysis = await analyzeCvWithGemini({
        cvText: extractedText,
        targetRole,
        jobDescription,
      });
      extractedTextForStorage = extractedText;
    }

    const saved = await pool.query(
      `INSERT INTO cv_analyses (
         user_id,
         original_filename,
         mime_type,
         file_hash,
         extracted_text,
         overall_score,
         analysis_json
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id, created_at`,
      [
        userId,
        (file.originalname || "cv-file").slice(0, 255),
        file.mimetype || "application/octet-stream",
        fileHash,
        extractedTextForStorage,
        analysis.overallScore,
        JSON.stringify(analysis),
      ],
    );

    res.status(201).json({
      success: true,
      cached: false,
      truncated: wasTruncated,
      analysisId: saved.rows[0].id,
      createdAt: saved.rows[0].created_at,
      overallScore: analysis.overallScore,
      analysis,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cv/my-analyses
 * Return recent CV analysis history for authenticated user.
 */
export const getMyCvAnalyses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(30, Math.trunc(requestedLimit)))
      : 10;

    const result = await pool.query(
      `SELECT id, original_filename, overall_score, analysis_json, created_at
       FROM cv_analyses
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit],
    );

    res.json({
      success: true,
      analyses: result.rows.map((row) => ({
        id: row.id,
        originalFilename: row.original_filename,
        overallScore: row.overall_score,
        createdAt: row.created_at,
        analysis: row.analysis_json,
      })),
    });
  } catch (err) {
    next(err);
  }
};
