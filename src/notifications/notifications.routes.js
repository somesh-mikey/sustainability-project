import express from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "./notifications.controller.js";

const router = express.Router();

router.get("/", requireAuth, getNotifications);
router.patch("/:id/read", requireAuth, markAsRead);
router.patch("/read-all", requireAuth, markAllAsRead);

export default router;
