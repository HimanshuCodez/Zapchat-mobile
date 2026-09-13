import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createGroup,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  addGroupMembers,
  removeGroupMember,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/messages", protectRoute, sendGroupMessage);
router.post("/:id/members", protectRoute, addGroupMembers);
router.delete("/:id/members/:memberId", protectRoute, removeGroupMember);
router.post("/:id/leave", protectRoute, leaveGroup);

export default router;
