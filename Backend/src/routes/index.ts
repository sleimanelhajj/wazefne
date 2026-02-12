import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";

const router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Route files ───────────────────────────────────────
router.use("/auth", authRoutes);
// import userRoutes    from "./user.routes";
// import bookingRoutes from "./booking.routes";
// import messageRoutes from "./message.routes";
// router.use("/users",    userRoutes);
// router.use("/bookings", bookingRoutes);
// router.use("/messages", messageRoutes);

export default router;
