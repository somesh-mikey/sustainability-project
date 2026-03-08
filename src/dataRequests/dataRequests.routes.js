import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  createDataRequest,
  getDataRequestOrganizations,
  getDataRequests,
  updateDataRequestStatus
} from "./dataRequests.controller.js";

const router = express.Router();

router.get("/", requireAuth, getDataRequests);
router.get("/organizations", requireAuth, requireRole("admin", "manager"), getDataRequestOrganizations);
router.post("/", requireAuth, requireRole("admin", "manager"), createDataRequest);
router.patch("/:id/status", requireAuth, updateDataRequestStatus);

export default router;
