import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { getMessages, getMessageOrganizations, sendMessage } from "./messages.controller.js";

const router = express.Router();

router.get("/", requireAuth, getMessages);
router.get("/organizations", requireAuth, requireRole("admin", "manager"), getMessageOrganizations);
router.post("/", requireAuth, sendMessage);

export default router;
