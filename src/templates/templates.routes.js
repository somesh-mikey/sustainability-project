import express from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { getTemplates, downloadTemplate } from "./templates.controller.js";

const router = express.Router();

router.get("/", requireAuth, getTemplates);
router.get("/download/:filename", requireAuth, downloadTemplate);

export default router;
