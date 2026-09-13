import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  listUsers,
  getGlobalStats,
  listUserPhotos,
  getAdminPhotoContent,
  deleteUserPhoto,
} from "../controllers/admin.controller.js";

const router = express.Router();

// requireAdmin checks req.user.role, populated server-side by protectRoute -
// never trust a client-sent role/isAdmin flag.
router.use(protectRoute, requireAdmin);

router.get("/users", listUsers);
router.get("/stats", getGlobalStats);
router.get("/users/:userId/photos", listUserPhotos);
router.get("/photos/:photoId/content", getAdminPhotoContent);
router.delete("/photos/:photoId", deleteUserPhoto);

export default router;
