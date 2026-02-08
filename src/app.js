import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { login } from "./auth/auth.controller.js";
import projectsRoutes from "./projects/projects.routes.js";
import emissionsRoutes from "./emissions/emissions.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import uploadRoutes from "./uploads/emissionUpload.routes.js";
import recalcRoutes from "./recalculate/recalculate.routes.js";
import reportsRoutes from "./reports/reports.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Routes
app.post("/auth/login", login);
app.use("/projects", projectsRoutes);
app.use("/emissions", emissionsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/upload", uploadRoutes);
app.use("/recalculate", recalcRoutes);
app.use("/reports", reportsRoutes);

// 404 catch-all — no HTML responses
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
