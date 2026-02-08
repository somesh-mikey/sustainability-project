import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { triggerRecalculation } from "./recalculate.controller.js";

const router = express.Router();

router.post(
  "/emissions",
  requireAuth,
  requireRole("admin"),
  triggerRecalculation
);

export default router;
