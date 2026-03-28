import { Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

/**
 * GET /api/favorites/users
 * Returns current user's favorited users.
 */
export const getFavoriteUsers = async (
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
      `SELECT u.id, u.first_name, u.last_name, u.title, u.profile_image,
              u.rating, u.review_count, u.hourly_rate, u.verified,
              u.category, u.available_today, u.location,
              uf.created_at AS favorited_at
       FROM user_favorites uf
       JOIN users u ON u.id = uf.favorite_user_id
       WHERE uf.user_id = $1
       ORDER BY uf.created_at DESC`,
      [userId],
    );

    const userIds = usersResult.rows.map((u: any) => u.id);

    let skillsByUser: Record<string, string[]> = {};
    if (userIds.length > 0) {
      const skillsResult = await pool.query(
        `SELECT us.user_id, s.name
         FROM user_skills us
         JOIN skills s ON s.id = us.skill_id
         WHERE us.user_id = ANY($1::uuid[])
         ORDER BY s.name`,
        [userIds],
      );

      skillsByUser = {};
      for (const row of skillsResult.rows) {
        if (!skillsByUser[row.user_id]) skillsByUser[row.user_id] = [];
        skillsByUser[row.user_id].push(row.name);
      }
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
      isFavorited: true,
      favoritedAt: u.favorited_at,
    }));

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/favorites/users/:favoriteUserId
 * Save a user as favorite.
 */
export const addFavoriteUser = async (
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

    const { favoriteUserId } = req.params;
    if (!favoriteUserId) {
      res
        .status(400)
        .json({ success: false, message: "favoriteUserId is required" });
      return;
    }

    if (favoriteUserId === userId) {
      res
        .status(400)
        .json({ success: false, message: "You cannot favorite yourself" });
      return;
    }

    const userExists = await pool.query("SELECT id FROM users WHERE id = $1", [
      favoriteUserId,
    ]);
    if (userExists.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO user_favorites (user_id, favorite_user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, favorite_user_id) DO NOTHING
       RETURNING user_id, favorite_user_id`,
      [userId, favoriteUserId],
    );

    res.status(result.rows.length > 0 ? 201 : 200).json({
      success: true,
      isFavorited: true,
      added: result.rows.length > 0,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/favorites/users/:favoriteUserId
 * Remove a user from favorites.
 */
export const removeFavoriteUser = async (
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

    const { favoriteUserId } = req.params;
    if (!favoriteUserId) {
      res
        .status(400)
        .json({ success: false, message: "favoriteUserId is required" });
      return;
    }

    const result = await pool.query(
      `DELETE FROM user_favorites
       WHERE user_id = $1 AND favorite_user_id = $2
       RETURNING user_id`,
      [userId, favoriteUserId],
    );

    res.json({
      success: true,
      isFavorited: false,
      removed: result.rows.length > 0,
    });
  } catch (err) {
    next(err);
  }
};
