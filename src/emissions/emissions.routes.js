import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { createEmission } from "./emissions.controller.js";
import { getEmissions } from "./emissions.controller.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("admin", "manager"), createEmission);
router.get(
  "/",
  requireAuth,
  getEmissions
);

export default router;
