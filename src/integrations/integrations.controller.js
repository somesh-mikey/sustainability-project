import db from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

const VALID_STATUSES = ["connected", "disconnected", "syncing", "error"];

export async function getIntegrations(req, res) {
  const orgId = req.user.organization_id;

  const result = await db.query(
    `
    SELECT id, name, description, status, last_sync, created_at
    FROM integrations
    WHERE organization_id = $1
    ORDER BY created_at DESC
    `,
    [orgId]
  );

  res.json({
    success: true,
    data: result.rows
  });
}

export async function updateIntegrationStatus(req, res) {
  const orgId = req.user.organization_id;
  const { id } = req.params;
  const { status } = req.body || {};

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      400,
      "VALIDATION_ERROR"
    );
  }

  const result = await db.query(
    `
    UPDATE integrations
    SET status = $1,
        last_sync = CASE WHEN $1 = 'connected' OR $1 = 'syncing' THEN now() ELSE last_sync END
    WHERE id = $2 AND organization_id = $3
    RETURNING id, name, description, status, last_sync, created_at
    `,
    [status, id, orgId]
  );

  if (!result.rows[0]) {
    throw new AppError("Integration not found", 404, "NOT_FOUND");
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}
