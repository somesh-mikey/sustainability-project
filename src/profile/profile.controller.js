import db from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

export async function getOrganizationProfile(req, res) {
  const orgId = req.user.organization_id;
  const userId = req.user.user_id;

  const organization = await db.oneOrNone(
    `
    SELECT id, name, industry
    FROM organizations
    WHERE id = $1
    `,
    [orgId]
  );

  if (!organization) {
    throw new AppError("Organization not found", 404, "NOT_FOUND");
  }

  const user = await db.oneOrNone(
    `
    SELECT id, name, email, role
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  res.json({
    success: true,
    data: {
      organization,
      user
    }
  });
}

export async function updateOrganizationProfile(req, res) {
  const orgId = req.user.organization_id;
  const { name, industry } = req.body || {};

  const result = await db.query(
    `
    UPDATE organizations
    SET name = COALESCE($1, name),
        industry = COALESCE($2, industry)
    WHERE id = $3
    RETURNING id, name, industry
    `,
    [name || null, industry || null, orgId]
  );

  if (!result.rows[0]) {
    throw new AppError("Organization not found", 404, "NOT_FOUND");
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}

export async function getOrganizationUsers(req, res) {
  const orgId = req.user.organization_id;

  const result = await db.query(
    `
    SELECT id, name, email, role, is_active
    FROM users
    WHERE organization_id = $1
    ORDER BY name
    `,
    [orgId]
  );

  res.json({
    success: true,
    data: result.rows
  });
}
