import { Router } from "express";
import authenticate from "../middleware/auth";
import {
  createJob,
  getJobs,
  getMyPostedJobs,
  getJobById,
  createBid,
  getJobBids,
  updateBidStatus,
} from "../controllers/jobs.controller";

const router = Router();

// Job Post Routes
router.post("/", authenticate, createJob);
router.get("/", authenticate, getJobs);
router.get("/my-posts", authenticate, getMyPostedJobs);
router.get("/:id", authenticate, getJobById);

// Job Bidding Routes
router.post("/:id/bids", authenticate, createBid);
router.get("/:id/bids", authenticate, getJobBids);
router.patch("/:jobId/bids/:bidId/status", authenticate, updateBidStatus);

export default router;
