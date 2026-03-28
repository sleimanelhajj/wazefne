import { Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

/**
 * GET /api/users
 * Returns a list of all users for browsing.
 */
export const getUsers = async (
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

    const usersResult = await pool.query(
      `SELECT id, first_name, last_name, title, profile_image,
              rating, review_count, hourly_rate, verified,
              category, available_today, location
       FROM users
       WHERE available_today = true
         AND id <> $1::uuid
       ORDER BY created_at DESC`,
      [userId],
    );

    // Fetch skills for all users in one query
    const userIds = usersResult.rows.map((u: any) => u.id);
    let skillsResult = { rows: [] as any[] };
    if (userIds.length > 0) {
      skillsResult = await pool.query(
        `SELECT us.user_id, s.name
         FROM user_skills us
         JOIN skills s ON s.id = us.skill_id
         WHERE us.user_id = ANY($1::uuid[])
         ORDER BY s.name`,
        [userIds],
      );
    }

    // Fetch favorites for current user
    const favoritesResult = await pool.query(
      `SELECT favorite_user_id
       FROM user_favorites
       WHERE user_id = $1`,
      [userId],
    );
    const favoriteIds = new Set(
      favoritesResult.rows.map((f: any) => f.favorite_user_id),
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
      location: u.location || "",
      isFavorited: favoriteIds.has(u.id),
    }));

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
