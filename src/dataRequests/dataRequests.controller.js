import db from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

const VALID_STATUSES = ["pending", "submitted", "under_review", "closed"];

export async function createDataRequest(req, res) {
  const senderOrgId = req.user.organization_id;
  const { category, reason, priority, deadline, recipient_organization_id } = req.body || {};

  if (!category) {
    throw new AppError("Category is required", 400, "VALIDATION_ERROR");
  }

  const normalizedPriority = priority || "medium";
  if (!["low", "medium", "high"].includes(normalizedPriority)) {
    throw new AppError("Invalid priority. Must be one of: low, medium, high", 400, "VALIDATION_ERROR");
  }

  const recipientOrgId = Number(recipient_organization_id);
  if (!Number.isFinite(recipientOrgId) || recipientOrgId <= 0) {
    throw new AppError("recipient_organization_id is required", 400, "VALIDATION_ERROR");
  }

  const recipientOrg = await db.oneOrNone(
    `SELECT id FROM organizations WHERE id = $1`,
    [recipientOrgId]
  );

  if (!recipientOrg) {
    throw new AppError("Recipient organization not found", 404, "NOT_FOUND");
  }

  const requestId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const result = await db.query(
    `
    INSERT INTO data_requests (
      organization_id,
      request_id,
      category,
      reason,
      priority,
      deadline,
      status,
      sender_organization_id,
      recipient_organization_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
    RETURNING id, request_id, category, reason, priority, deadline, status, created_at, updated_at, sender_organization_id, recipient_organization_id
    `,
    [recipientOrgId, requestId, category, reason || null, normalizedPriority, deadline || null, senderOrgId, recipientOrgId]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}

export async function getDataRequestOrganizations(req, res) {
  const orgId = req.user.organization_id;

  const result = await db.query(
    `
    SELECT id, name
    FROM organizations
    WHERE id <> $1
    ORDER BY name ASC
    `,
    [orgId]
  );

  res.json({
    success: true,
    data: result.rows
  });
}

export async function getDataRequests(req, res) {
  const orgId = req.user.organization_id;
  const { status } = req.query;

  let filters = [
    "(COALESCE(recipient_organization_id, organization_id) = $1 OR COALESCE(sender_organization_id, organization_id) = $1 OR organization_id = $1)"
  ];
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
    SELECT
      d.id,
      d.request_id,
      d.category,
      d.reason,
      d.priority,
      d.deadline,
      d.status,
      d.created_at,
      d.updated_at,
      COALESCE(d.sender_organization_id, d.organization_id) AS sender_organization_id,
      COALESCE(d.recipient_organization_id, d.organization_id) AS recipient_organization_id,
      sender_org.name AS sender_organization_name,
      recipient_org.name AS recipient_organization_name
    FROM data_requests d
    LEFT JOIN organizations sender_org ON sender_org.id = COALESCE(d.sender_organization_id, d.organization_id)
    LEFT JOIN organizations recipient_org ON recipient_org.id = COALESCE(d.recipient_organization_id, d.organization_id)
    WHERE ${filters.join(" AND ")}
    ORDER BY d.deadline ASC NULLS LAST, d.created_at DESC
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
    WHERE id = $2
      AND (
        COALESCE(recipient_organization_id, organization_id) = $3
        OR COALESCE(sender_organization_id, organization_id) = $3
        OR organization_id = $3
      )
    RETURNING id, request_id, category, reason, priority, deadline, status, created_at, updated_at, sender_organization_id, recipient_organization_id
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
