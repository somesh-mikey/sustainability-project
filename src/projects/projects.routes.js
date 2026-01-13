import express from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { getProjects, createProject } from "./projects.controller.js";

const router = express.Router();

router.get("/", requireAuth, getProjects);

router.post("/", requireAuth, requireRole("admin", "manager"), createProject);

export default router;
