import { Router } from "express";
import authenticate from "../middleware/auth";
import {
  addFavoriteUser,
  getFavoriteUsers,
  removeFavoriteUser,
} from "../controllers/favorites.controller";

const router = Router();

router.use(authenticate);

router.get("/users", getFavoriteUsers as any);
router.post("/users/:favoriteUserId", addFavoriteUser as any);
router.delete("/users/:favoriteUserId", removeFavoriteUser as any);

export default router;
