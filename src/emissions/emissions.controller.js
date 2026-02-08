import db from "../db.js";
import { calculateEmission } from "../calculations/calculateEmissions.js";
import { AppError } from "../middleware/errorHandler.js";
import { SCOPES } from "../util/enums.js";

/**
 * GET /emissions
 * Any authenticated user
 */
export async function getEmissions(req, res) {
  const orgId = req.user.organization_id;

  const {
    project_id,
    scope,
    from,
    to
  } = req.query;

  if (scope && !SCOPES.includes(scope)) {
    throw new AppError("Invalid scope value. Must be one of: " + SCOPES.join(", "), 400, "INVALID_SCOPE");
  }

  let filters = [`r.organization_id = $1`];
  let params = [orgId];
  let idx = 2;

  if (project_id) {
    filters.push(`r.project_id = $${idx++}`);
    params.push(project_id);
  }

  if (scope) {
    filters.push(`r.scope = $${idx++}`);
    params.push(scope);
  }

  if (from) {
    filters.push(`r.date >= $${idx++}`);
    params.push(from);
  }

  if (to) {
    filters.push(`r.date <= $${idx++}`);
    params.push(to);
  }

  const query = `
    SELECT
      r.id AS raw_emission_id,
      r.date,
      r.scope,
      r.activity_type,
      r.value,
      r.unit,
      p.name AS project_name,
      c.calculated_value
    FROM raw_emission_data r
    JOIN projects p ON p.id = r.project_id
    LEFT JOIN calculated_emissions c
      ON c.raw_emission_id = r.id
    WHERE ${filters.join(" AND ")}
    ORDER BY r.date DESC
  `;

  const result = await db.query(query, params);

  res.json({
    success: true,
    data: result.rows
  });
}

/**
 * POST /emissions
 * Admin / Manager only
 */
export async function createEmission(req, res) {
  const orgId = req.user.organization_id;
  const userId = req.user.user_id;

  const { project_id, date, scope, activity_type, value, unit } =
    req.body || {};

  // Validation
  if (!project_id || !date || !scope || !activity_type || !value || !unit) {
    throw new AppError("All emission fields are required (project_id, date, scope, activity_type, value, unit)", 400, "VALIDATION_ERROR");
  }

  if (!SCOPES.includes(scope)) {
    throw new AppError("Invalid scope value. Must be one of: " + SCOPES.join(", "), 400, "INVALID_SCOPE");
  }

  // Ensure project belongs to same org
  const project = await db.oneOrNone(
    `SELECT id FROM projects WHERE id = $1 AND organization_id = $2`,
    [project_id, orgId]
  );

  if (!project) {
    throw new AppError("Invalid project access", 403, "FORBIDDEN");
  }

  // Insert raw emission data
  const result = await db.query(
    `
  INSERT INTO raw_emission_data
    (organization_id, project_id, date, scope, activity_type, value, unit, created_by)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *
  `,
    [orgId, project_id, date, scope, activity_type, value, unit, userId]
  );

  const rawEmission = result.rows[0];

  // Calculate emissions
  await calculateEmission(rawEmission);

  res.status(201).json({
    success: true,
    data: rawEmission,
  });
}
