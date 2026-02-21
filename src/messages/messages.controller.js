import db from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

export async function getMessages(req, res) {
  const orgId = req.user.organization_id;
  const { category } = req.query;

  let filters = ["m.organization_id = $1"];
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
      u.name AS sender_name
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

export async function sendMessage(req, res) {
  const orgId = req.user.organization_id;
  const userId = req.user.user_id;
  const { content, category } = req.body || {};

  if (!content || !String(content).trim()) {
    throw new AppError("Message content is required", 400, "VALIDATION_ERROR");
  }

  const result = await db.query(
    `
    INSERT INTO messages (organization_id, sender_id, category, content)
    VALUES ($1, $2, $3, $4)
    RETURNING id, organization_id, sender_id, category, content, created_at
    `,
    [orgId, userId, category || "General Discussion", String(content).trim()]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}
