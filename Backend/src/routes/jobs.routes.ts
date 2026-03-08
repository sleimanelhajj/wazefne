import { Router } from "express";
import authenticate from "../middleware/auth";
import {
  createJob,
  getJobs,
  getJobById,
  createBid,
  getJobBids,
} from "../controllers/jobs.controller";

const router = Router();

// Job Post Routes
router.post("/", authenticate, createJob);
router.get("/", authenticate, getJobs);
router.get("/:id", authenticate, getJobById);

// Job Bidding Routes
router.post("/:id/bids", authenticate, createBid);
router.get("/:id/bids", authenticate, getJobBids);

export default router;
