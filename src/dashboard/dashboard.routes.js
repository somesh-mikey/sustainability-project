import express from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  getDashboardSummary,
  getScopeBreakdown,
  getMonthlyTrends
} from "./dashboard.controller.js";

const router = express.Router();

router.get("/summary", requireAuth, getDashboardSummary);
router.get("/scope-breakdown", requireAuth, getScopeBreakdown);
router.get("/trends", requireAuth, getMonthlyTrends);

export default router;
