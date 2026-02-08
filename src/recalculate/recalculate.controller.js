import { recalculateEmissions } from "../calculations/recalculateEmissions.js";

export async function triggerRecalculation(req, res) {
  const orgId = req.user.organization_id;

  const {
    project_id,
    from,
    to
  } = req.body || {};

  const result = await recalculateEmissions({
    organizationId: orgId,
    projectId: project_id || null,
    from: from || null,
    to: to || null
  });

  res.json({
    success: true,
    data: result
  });
}
