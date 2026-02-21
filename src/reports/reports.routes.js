import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  getReports,
  downloadReport,
  generateCSVReport,
  generatePDFReport
} from "./reports.controller.js";

const router = express.Router();

router.get("/", requireAuth, getReports);
router.get("/:id/download", requireAuth, downloadReport);

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
