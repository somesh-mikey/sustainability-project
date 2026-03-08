import db from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

export async function getMessages(req, res) {
  const orgId = req.user.organization_id;
  const { category } = req.query;

  let filters = [
    "(m.recipient_organization_id = $1 OR m.sender_organization_id = $1 OR m.organization_id = $1)"
  ];
  let params = [orgId];
  let idx = 2;

  if (category) {
    filters.push(`m.category = $${idx++}`);
    params.push(category);
  }

  const result = await db.query(
    `
    SELECT
      m.id,
      m.content,
      m.category,
      m.created_at,
      u.name AS sender_name,
      COALESCE(m.sender_organization_id, m.organization_id) AS sender_organization_id,
      COALESCE(m.recipient_organization_id, m.organization_id) AS recipient_organization_id
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE ${filters.join(" AND ")}
    ORDER BY m.created_at ASC
    `,
    params
  );

  res.json({
    success: true,
    data: result.rows
  });
}

export async function getMessageOrganizations(req, res) {
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

export async function sendMessage(req, res) {
  const senderOrgId = req.user.organization_id;
  const userId = req.user.user_id;
  const { content, category, recipient_organization_id } = req.body || {};

  if (!content || !String(content).trim()) {
    throw new AppError("Message content is required", 400, "VALIDATION_ERROR");
  }

  const requestedRecipientOrgId = recipient_organization_id
    ? Number(recipient_organization_id)
    : null;

  const recipientOrgId = Number.isFinite(requestedRecipientOrgId) && requestedRecipientOrgId > 0
    ? requestedRecipientOrgId
    : senderOrgId;

  const org = await db.oneOrNone(
    `SELECT id FROM organizations WHERE id = $1`,
    [recipientOrgId]
  );

  if (!org) {
    throw new AppError("Recipient organization not found", 404, "NOT_FOUND");
  }

  const result = await db.query(
    `
    INSERT INTO messages (organization_id, sender_id, category, content, sender_organization_id, recipient_organization_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, organization_id, sender_id, category, content, created_at, sender_organization_id, recipient_organization_id
    `,
    [recipientOrgId, userId, category || "General Discussion", String(content).trim(), senderOrgId, recipientOrgId]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}
