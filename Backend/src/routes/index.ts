import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";
import usersRoutes from "./users.routes";
import reviewsRoutes from "./reviews.routes";

const router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Route files ───────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/users", usersRoutes);
router.use("/reviews", reviewsRoutes);
// import bookingRoutes from "./booking.routes";
// import messageRoutes from "./message.routes";
// router.use("/bookings", bookingRoutes);
// router.use("/messages", messageRoutes);

export default router;
