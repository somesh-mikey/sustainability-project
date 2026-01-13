import db from "../db.js";
import { calculateEmission } from "../calculations/calculateEmissions.js";

/**
 * POST /emissions
 * Admin / Manager only
 */
export async function createEmission(req, res) {
  const orgId = req.user.organization_id;
  const userId = req.user.user_id;

  const { project_id, date, scope, activity_type, value, unit } =
    req.body || {};

  // 🔍 Validation
  if (!project_id || !date || !scope || !activity_type || !value || !unit) {
    return res.status(400).json({
      success: false,
      error: { message: "All emission fields are required" },
    });
  }

  // 🔐 Ensure project belongs to same org
  const project = await db.oneOrNone(
    `SELECT id FROM projects WHERE id = $1 AND organization_id = $2`,
    [project_id, orgId]
  );

  if (!project) {
    return res.status(403).json({
      success: false,
      error: { message: "Invalid project access" },
    });
  }

  // 📥 Insert raw emission data
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

  // 🔢 Calculate emissions
  try {
    await calculateEmission(rawEmission);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: { message: err.message },
    });
  }

  res.status(201).json({
    success: true,
    data: rawEmission,
  });

  res.status(201).json({
    success: true,
    data: result.rows[0],
  });
}
