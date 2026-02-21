import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  getOrganizationProfile,
  updateOrganizationProfile,
  getOrganizationUsers
} from "./profile.controller.js";

const router = express.Router();

router.get("/", requireAuth, getOrganizationProfile);
router.put("/", requireAuth, requireRole("admin"), updateOrganizationProfile);
router.get("/users", requireAuth, requireRole("admin"), getOrganizationUsers);

export default router;
