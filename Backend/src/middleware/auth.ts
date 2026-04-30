import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import pool from "../config/db";

export interface AuthRequest extends Request {
  user?: { id: string; clerkId: string; email: string };
}

const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = getAuth(req);

    if (!auth?.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const clerkId = auth.userId;

    // Fetch user data from Clerk to upsert into DB
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email =
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      `${clerkId}@clerk.placeholder`;
    const firstName = clerkUser.firstName || null;
    const lastName = clerkUser.lastName || null;
    const profileImage = clerkUser.imageUrl || null;

    // Upsert: insert if not exists, update email/name/image if they signed in before
    const result = await pool.query(
      `INSERT INTO users (clerk_id, email, first_name, last_name, profile_image)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (clerk_id) DO UPDATE
         SET email = EXCLUDED.email,
             first_name = COALESCE(users.first_name, EXCLUDED.first_name),
             last_name  = COALESCE(users.last_name,  EXCLUDED.last_name),
             profile_image = COALESCE(users.profile_image, EXCLUDED.profile_image)
       RETURNING id, email`,
      [clerkId, email, firstName, lastName, profileImage],
    );

    const user = result.rows[0];
    req.user = { id: user.id, clerkId, email: user.email };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export default authenticate;
