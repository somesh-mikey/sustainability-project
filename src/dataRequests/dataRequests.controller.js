import db from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

const VALID_STATUSES = ["pending", "submitted", "under_review", "closed"];

export async function getDataRequests(req, res) {
  const orgId = req.user.organization_id;
  const { status } = req.query;

  let filters = ["organization_id = $1"];
  let params = [orgId];
  let idx = 2;

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    filters.push(`status = $${idx++}`);
    params.push(status);
  }

  const result = await db.query(
    `
    SELECT id, request_id, category, reason, priority, deadline, status, created_at, updated_at
    FROM data_requests
    WHERE ${filters.join(" AND ")}
    ORDER BY deadline ASC NULLS LAST, created_at DESC
    `,
    params
  );

  res.json({
    success: true,
    data: result.rows
  });
}

export async function updateDataRequestStatus(req, res) {
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
    UPDATE data_requests
    SET status = $1, updated_at = now()
    WHERE id = $2 AND organization_id = $3
    RETURNING id, request_id, category, reason, priority, deadline, status, created_at, updated_at
    `,
    [status, id, orgId]
  );

  if (!result.rows[0]) {
    throw new AppError("Data request not found", 404, "NOT_FOUND");
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}
