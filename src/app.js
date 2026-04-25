import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { login } from "./auth/auth.controller.js";
import projectsRoutes from "./projects/projects.routes.js";
import emissionsRoutes from "./emissions/emissions.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import uploadRoutes from "./uploads/emissionUpload.routes.js";
import recalcRoutes from "./recalculate/recalculate.routes.js";
import reportsRoutes from "./reports/reports.routes.js";
import integrationsRoutes from "./integrations/integrations.routes.js";
import dataRequestsRoutes from "./dataRequests/dataRequests.routes.js";
import messagesRoutes from "./messages/messages.routes.js";
import templatesRoutes from "./templates/templates.routes.js";
import profileRoutes from "./profile/profile.routes.js";
import notificationsRoutes from "./notifications/notifications.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, "http://localhost:5173"]
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Lightweight health endpoint for uptime probes
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok"
  });
});

// Serve frontend static files (in production)
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Routes
app.post("/auth/login", login);
app.use("/projects", projectsRoutes);
app.use("/emissions", emissionsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/upload", uploadRoutes);
app.use("/recalculate", recalcRoutes);
app.use("/reports", reportsRoutes);
app.use("/integrations", integrationsRoutes);
app.use("/data-requests", dataRequestsRoutes);
app.use("/messages", messagesRoutes);
app.use("/templates", templatesRoutes);
app.use("/profile", profileRoutes);
app.use("/notifications", notificationsRoutes);

// Serve index.html for client-side routing (must be after all API routes)
app.use((req, res, next) => {
  // List of API path prefixes
  const apiPaths = [
    "/auth", "/dashboard", "/data-", "/emissions", "/projects",
    "/reports", "/upload", "/integrations", "/messages",
    "/templates", "/profile", "/recalculate", "/notifications"
  ];
  
  // If path starts with any API prefix, let Express handle the 404
  if (apiPaths.some(prefix => req.path.startsWith(prefix))) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found` }
    });
  }
  
  // Otherwise serve index.html for SPA routing
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Not found" }
      });
    }
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
