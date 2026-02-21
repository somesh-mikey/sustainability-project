import express from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { getMessages, sendMessage } from "./messages.controller.js";

const router = express.Router();

router.get("/", requireAuth, getMessages);
router.post("/", requireAuth, sendMessage);

export default router;
