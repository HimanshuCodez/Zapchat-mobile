import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getConsentStatus,
  acceptConsentAndEnable,
  disableBackup,
  createUploadSignature,
  registerPhoto,
  listMyPhotos,
  getMyPhotoContent,
  listBackedUpAssetIds,
  getMyBackupStats,
  deleteMyPhoto,
} from "../controllers/gallery.controller.js";

const router = express.Router();

router.get("/consent", protectRoute, getConsentStatus);
router.post("/consent", protectRoute, acceptConsentAndEnable);
router.post("/disable", protectRoute, disableBackup);

router.post("/upload-signature", protectRoute, createUploadSignature);
router.post("/photos", protectRoute, registerPhoto);
router.get("/photos", protectRoute, listMyPhotos);
router.get("/photos/:id/content", protectRoute, getMyPhotoContent);
router.get("/backed-up-ids", protectRoute, listBackedUpAssetIds);
router.delete("/photos/:id", protectRoute, deleteMyPhoto);

router.get("/stats", protectRoute, getMyBackupStats);

export default router;
