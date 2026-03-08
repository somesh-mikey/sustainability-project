import db from "../db.js";

/**
 * GET /notifications
 */
export async function getNotifications(req, res) {
  const userId = req.user.user_id;
  const orgId = req.user.organization_id;

  const result = await db.query(
    `SELECT id, type, title, description, is_read, link, created_at
     FROM notifications
     WHERE (user_id = $1 OR (user_id IS NULL AND organization_id = $2))
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId, orgId]
  );

  res.json({ success: true, data: result.rows });
}

/**
 * PATCH /notifications/:id/read
 */
export async function markAsRead(req, res) {
  const { id } = req.params;
  const userId = req.user.user_id;

  await db.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`,
    [id, userId]
  );

  res.json({ success: true });
}

/**
 * PATCH /notifications/read-all
 */
export async function markAllAsRead(req, res) {
  const userId = req.user.user_id;
  const orgId = req.user.organization_id;

  await db.query(
    `UPDATE notifications SET is_read = true WHERE (user_id = $1 OR (user_id IS NULL AND organization_id = $2))`,
    [userId, orgId]
  );

  res.json({ success: true });
}
