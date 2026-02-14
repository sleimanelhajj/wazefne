import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

/**
 * GET /api/users
 * Returns a list of all users for browsing.
 */
export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usersResult = await pool.query(
      `SELECT id, first_name, last_name, title, profile_image,
              rating, review_count, hourly_rate, verified,
              category, available_today
       FROM users
       ORDER BY created_at DESC`
    );

    // Fetch skills for all users in one query
    const skillsResult = await pool.query(
      `SELECT us.user_id, s.name
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       ORDER BY s.name`
    );

    // Group skills by user_id
    const skillsByUser: Record<string, string[]> = {};
    for (const row of skillsResult.rows) {
      if (!skillsByUser[row.user_id]) skillsByUser[row.user_id] = [];
      skillsByUser[row.user_id].push(row.name);
    }

    const users = usersResult.rows.map((u: any) => ({
      id: u.id,
      firstName: u.first_name || "",
      lastName: u.last_name || "",
      profileImage: u.profile_image || "",
      title: u.title || "",
      rating: Number(u.rating) || 0,
      reviewCount: u.review_count || 0,
      skills: skillsByUser[u.id] || [],
      hourlyRate: Number(u.hourly_rate) || 0,
      verified: u.verified || false,
      category: u.category || "",
      availableToday: u.available_today || false,
    }));

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
