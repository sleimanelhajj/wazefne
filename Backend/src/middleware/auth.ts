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

    let result = await pool.query(
      "SELECT id, email FROM users WHERE clerk_id = $1",
      [clerkId],
    );

    if (result.rows.length === 0) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email =
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        `${clerkId}@clerk.placeholder`;
      const firstName = clerkUser.firstName || null;
      const lastName = clerkUser.lastName || null;
      const profileImage = clerkUser.imageUrl || null;

      result = await pool.query(
        `INSERT INTO users (clerk_id, email, first_name, last_name, profile_image)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email`,
        [clerkId, email, firstName, lastName, profileImage],
      );
    }

    const user = result.rows[0];
    req.user = { id: user.id, clerkId, email: user.email };
    next();
  } catch (err) {
    console.error("Clerk auth middleware error:", err);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export default authenticate;
