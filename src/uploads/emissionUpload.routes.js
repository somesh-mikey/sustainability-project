import express from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { uploadEmissionsCSV } from "./emissionUpload.controller.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post(
  "/emissions",
  requireAuth,
  requireRole("admin", "manager"),
  upload.single("file"),
  uploadEmissionsCSV
);

export default router;
