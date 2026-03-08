import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  getReports,
  downloadReport,
  generateCSVReport,
  generatePDFReport,
  requestReport,
} from "./reports.controller.js";

const router = express.Router();

router.get("/", requireAuth, getReports);
router.get("/:id/download", requireAuth, downloadReport);

// Client report request (any role)
router.post("/", requireAuth, requestReport);

router.post(
  "/csv",
  requireAuth,
  requireRole("admin", "manager"),
  generateCSVReport
);

router.post(
  "/pdf",
  requireAuth,
  requireRole("admin", "manager"),
  generatePDFReport
);

export default router;
