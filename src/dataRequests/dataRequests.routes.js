import express from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  getDataRequests,
  updateDataRequestStatus
} from "./dataRequests.controller.js";

const router = express.Router();

router.get("/", requireAuth, getDataRequests);
router.patch("/:id/status", requireAuth, updateDataRequestStatus);

export default router;
