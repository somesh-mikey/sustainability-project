import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  getIntegrations,
  updateIntegrationStatus
} from "./integrations.controller.js";

const router = express.Router();

router.get("/", requireAuth, getIntegrations);
router.patch("/:id/status", requireAuth, requireRole("admin", "manager"), updateIntegrationStatus);

export default router;
