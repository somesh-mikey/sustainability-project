import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { login } from "./auth/auth.controller.js";
import projectsRoutes from "./projects/projects.routes.js";
import emissionsRoutes from "./emissions/emissions.routes.js";

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

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: err.message });
});

export default app;
