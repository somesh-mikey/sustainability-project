import db from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * GET /projects
 * Any authenticated user
 */
export async function getProjects(req, res) {
  const orgId = req.user.organization_id;

  const result = await db.query(
    `SELECT id, name, location, status, created_at
     FROM projects
     WHERE organization_id = $1
     ORDER BY created_at DESC`,
    [orgId]
  );

  res.json({
    success: true,
    data: result.rows,
  });
}

/**
 * POST /projects
 * Admin / Manager only
 */
export async function createProject(req, res) {
  const orgId = req.user.organization_id;
  const { name, location } = req.body;

  if (!name) {
    throw new AppError("Project name is required", 400, "VALIDATION_ERROR");
  }

  const result = await db.query(
    `INSERT INTO projects (organization_id, name, location)
     VALUES ($1, $2, $3)
     RETURNING id, name, location, status, created_at`,
    [orgId, name, location || null]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0],
  });
}
