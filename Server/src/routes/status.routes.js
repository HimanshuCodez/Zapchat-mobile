import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createStatus, deleteStatus, getStatuses, viewStatus } from "../controllers/status.controller.js";

const router = express.Router();

router.get("/", protectRoute, getStatuses);
router.post("/", protectRoute, createStatus);
router.post("/:id/view", protectRoute, viewStatus);
router.delete("/:id", protectRoute, deleteStatus);

export default router;
