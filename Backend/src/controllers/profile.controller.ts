import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import pool from "../config/db";
import multer from "multer";
import path from "path";

// ── Multer configuration (memory storage for base64 conversion) ──
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk && mimeOk);
  },
});

/**
 * PUT /api/profile/update-profile
 * Updates the authenticated user's profile information.
 */
export const updateProfile = async (
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

    const {
      first_name,
      last_name,
      title,
      offer_description,
      location,
      about_me,
      hourly_rate,
      profile_image,
      category,
      available_today,
      skills, // string[] – e.g. ["Node.js", "Angular"]
      languages, // string[] – e.g. ["English", "Arabic"]
      portfolio, // { image_url: string; caption?: string }[]
    } = req.body;

    // ── 1. Update core user columns ──────────────────────
    const userResult = await pool.query(
      `UPDATE users
       SET first_name       = COALESCE($1,  first_name),
           last_name        = COALESCE($2,  last_name),
           title            = COALESCE($3,  title),
           offer_description= COALESCE($4,  offer_description),
           location         = COALESCE($5,  location),
           about_me         = COALESCE($6,  about_me),
           hourly_rate      = COALESCE($7,  hourly_rate),
           profile_image    = COALESCE($8,  profile_image),
           category         = COALESCE($9,  category),
           available_today  = COALESCE($10, available_today),
           updated_at       = NOW()
       WHERE id = $11
       RETURNING id, email, first_name, last_name, title,
                 offer_description, location, about_me,
                 hourly_rate, profile_image, category,
                 available_today, rating, review_count, verified`,
      [
        first_name,
        last_name,
        title,
        offer_description,
        location,
        about_me,
        hourly_rate,
        profile_image,
        category,
        available_today,
        userId,
      ],
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const user = userResult.rows[0];

    // ── 2. Sync skills ───────────────────────────────────
    if (Array.isArray(skills)) {
      // Remove old associations
      await pool.query("DELETE FROM user_skills WHERE user_id = $1", [userId]);

      for (const skillName of skills) {
        // Upsert skill
        const skillRes = await pool.query(
          `INSERT INTO skills (name) VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [skillName],
        );
        const skillId = skillRes.rows[0].id;
        await pool.query(
          "INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, skillId],
        );
      }
    }

    // ── 3. Sync languages ────────────────────────────────
    if (Array.isArray(languages)) {
      await pool.query("DELETE FROM user_languages WHERE user_id = $1", [
        userId,
      ]);

      for (const langName of languages) {
        const langRes = await pool.query(
          `INSERT INTO languages (name) VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [langName],
        );
        const langId = langRes.rows[0].id;
        await pool.query(
          "INSERT INTO user_languages (user_id, language_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, langId],
        );
      }
    }

    // ── 4. Sync portfolio images ─────────────────────────
    if (Array.isArray(portfolio)) {
      await pool.query("DELETE FROM portfolio_images WHERE user_id = $1", [
        userId,
      ]);

      for (let i = 0; i < portfolio.length; i++) {
        const img = portfolio[i];
        await pool.query(
          `INSERT INTO portfolio_images (user_id, image_url, caption, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [userId, img.image_url, img.caption || null, i],
        );
      }
    }

    // ── 5. Fetch updated relations for response ──────────
    const skillsResult = await pool.query(
      `SELECT s.name FROM skills s
       JOIN user_skills us ON us.skill_id = s.id
       WHERE us.user_id = $1
       ORDER BY s.name`,
      [userId],
    );

    const langsResult = await pool.query(
      `SELECT l.name FROM languages l
       JOIN user_languages ul ON ul.language_id = l.id
       WHERE ul.user_id = $1
       ORDER BY l.name`,
      [userId],
    );

    const portfolioResult = await pool.query(
      `SELECT image_url, caption, sort_order
       FROM portfolio_images
       WHERE user_id = $1
       ORDER BY sort_order`,
      [userId],
    );

    res.json({
      success: true,
      user: {
        ...user,
        name:
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          undefined,
        skills: skillsResult.rows.map((r: { name: string }) => r.name),
        languages: langsResult.rows.map((r: { name: string }) => r.name),
        portfolio: portfolioResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/profile/me
 * Returns the authenticated user's full profile.
 */
export const getMyProfile = async (
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

    const userResult = await pool.query(
      `SELECT id, email, first_name, last_name, title,
              offer_description, location, about_me,
              hourly_rate, profile_image, category,
              available_today, rating, review_count, verified,
              created_at
       FROM users WHERE id = $1`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const user = userResult.rows[0];

    const skillsResult = await pool.query(
      `SELECT s.name FROM skills s
       JOIN user_skills us ON us.skill_id = s.id
       WHERE us.user_id = $1 ORDER BY s.name`,
      [userId],
    );

    const langsResult = await pool.query(
      `SELECT l.name FROM languages l
       JOIN user_languages ul ON ul.language_id = l.id
       WHERE ul.user_id = $1 ORDER BY l.name`,
      [userId],
    );

    const portfolioResult = await pool.query(
      `SELECT image_url, caption, sort_order
       FROM portfolio_images WHERE user_id = $1
       ORDER BY sort_order`,
      [userId],
    );

    res.json({
      success: true,
      user: {
        ...user,
        name:
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          undefined,
        skills: skillsResult.rows.map((r: { name: string }) => r.name),
        languages: langsResult.rows.map((r: { name: string }) => r.name),
        portfolio: portfolioResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/profile/:id
 * Returns a public user profile by ID.
 */
export const getProfileById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `SELECT id, email, first_name, last_name, title,
              offer_description, location, about_me,
              hourly_rate, profile_image, category,
              available_today, rating, review_count, verified,
              created_at
       FROM users WHERE id = $1`,
      [id],
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const user = userResult.rows[0];

    const skillsResult = await pool.query(
      `SELECT s.name FROM skills s
       JOIN user_skills us ON us.skill_id = s.id
       WHERE us.user_id = $1 ORDER BY s.name`,
      [id],
    );

    const langsResult = await pool.query(
      `SELECT l.name FROM languages l
       JOIN user_languages ul ON ul.language_id = l.id
       WHERE ul.user_id = $1 ORDER BY l.name`,
      [id],
    );

    const portfolioResult = await pool.query(
      `SELECT image_url, caption, sort_order
       FROM portfolio_images WHERE user_id = $1
       ORDER BY sort_order`,
      [id],
    );

    // Fetch reviews for this user
    const reviewsResult = await pool.query(
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
      [id],
    );

    const reviews = reviewsResult.rows.map((row: any) => ({
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
      user: {
        ...user,
        name:
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          undefined,
        skills: skillsResult.rows.map((r: { name: string }) => r.name),
        languages: langsResult.rows.map((r: { name: string }) => r.name),
        portfolio: portfolioResult.rows,
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/profile/upload-portfolio
 * Uploads portfolio images for the authenticated user.
 */
export const uploadPortfolio = async (
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

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: "No files uploaded" });
      return;
    }

    // Get current max sort_order
    const maxOrderRes = await pool.query(
      "SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM portfolio_images WHERE user_id = $1",
      [userId],
    );
    let sortOrder: number = maxOrderRes.rows[0].max_order + 1;

    const inserted: {
      image_url: string;
      caption: string | null;
      sort_order: number;
    }[] = [];

    for (const file of files) {
      // Convert buffer to base64 data URL
      const base64 = file.buffer.toString("base64");
      const dataUrl = `data:${file.mimetype};base64,${base64}`;

      await pool.query(
        `INSERT INTO portfolio_images (user_id, image_url, caption, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [userId, dataUrl, null, sortOrder],
      );
      inserted.push({
        image_url: dataUrl,
        caption: null,
        sort_order: sortOrder,
      });
      sortOrder++;
    }

    res.json({ success: true, images: inserted });
  } catch (err) {
    next(err);
  }
};
