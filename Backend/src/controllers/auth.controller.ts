import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import pool from "../config/db";

/**
 * GET /api/auth/me
 * Returns the current authenticated user's basic info from the database.
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const result = await pool.query(
      "SELECT id, email, first_name, last_name, profile_image FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
