import express from "express";
import dotenv from "dotenv";
import { login } from "./auth/auth.controller.js";
import projectsRoutes from "./projects/projects.routes.js";
import emissionsRoutes from "./emissions/emissions.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/auth/login", login);
app.use("/projects", projectsRoutes);
app.use("/emissions", emissionsRoutes);

export default app;
