import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import pool from "../config/db";

/**
 * POST /api/reviews
 * Create a new review for a user
 */
export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { reviewed_user_id, rating, comment } = req.body;

    // Validation
    if (!reviewed_user_id || !rating) {
      res.status(400).json({
        success: false,
        message: "reviewed_user_id and rating are required",
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
      return;
    }

    // Prevent users from reviewing themselves
    if (reviewerId === reviewed_user_id) {
      res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
      return;
    }

    // Check if reviewer (authenticated user) exists
    const reviewerCheck = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [reviewerId],
    );

    if (reviewerCheck.rows.length === 0) {
      res.status(400).json({
        success: false,
        message: "Your user account was not found. Please log in again.",
      });
      return;
    }

    // Check if reviewed user exists
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
      reviewed_user_id,
    ]);

    if (userCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User to review not found",
      });
      return;
    }

    // Insert or update the review (upsert)
    const result = await pool.query(
      `INSERT INTO reviews (reviewer_id, reviewed_user_id, rating, comment, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (reviewer_id, reviewed_user_id)
       DO UPDATE SET 
         rating = EXCLUDED.rating,
         comment = EXCLUDED.comment,
         updated_at = NOW()
       RETURNING id, reviewer_id, reviewed_user_id, rating, comment, created_at, updated_at`,
      [reviewerId, reviewed_user_id, rating, comment || null],
    );

    const review = result.rows[0];

    res.status(201).json({
      success: true,
      review: {
        id: review.id,
        reviewerId: review.reviewer_id,
        reviewedUserId: review.reviewed_user_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reviews/user/:userId
 * Get all reviews for a specific user
 */
export const getReviewsByUserId = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        r.id,
        r.reviewer_id,
        r.reviewed_user_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.first_name,
        u.last_name,
        u.profile_image
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewed_user_id = $1
       ORDER BY r.created_at DESC`,
      [userId],
    );

    const reviews = result.rows.map((row: any) => ({
      id: row.id,
      reviewerId: row.reviewer_id,
      reviewedUserId: row.reviewed_user_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reviewer: {
        firstName: row.first_name,
        lastName: row.last_name,
        profileImage: row.profile_image,
      },
    }));

    res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};
