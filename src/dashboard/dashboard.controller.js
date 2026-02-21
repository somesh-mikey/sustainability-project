import db from "../db.js";

/**
 * GET /dashboard/summary
 * KPI cards
 */
export async function getDashboardSummary(req, res) {
  const orgId = req.user.organization_id;

  const result = await db.query(
    `
    SELECT
      COALESCE(SUM(c.calculated_value), 0) AS total_emissions,
      COALESCE(SUM(CASE WHEN c.scope = 'scope_1' THEN c.calculated_value END), 0) AS scope_1,
      COALESCE(SUM(CASE WHEN c.scope = 'scope_2' THEN c.calculated_value END), 0) AS scope_2,
      COALESCE(SUM(CASE WHEN c.scope = 'scope_3' THEN c.calculated_value END), 0) AS scope_3
    FROM calculated_emissions c
    WHERE c.organization_id = $1
    `,
    [orgId]
  );

  res.json({
    success: true,
    data: result.rows[0]
  });
}

/**
 * GET /dashboard/scope-breakdown
 * Pie / donut chart
 */
export async function getScopeBreakdown(req, res) {
  const orgId = req.user.organization_id;

  const result = await db.query(
    `
    SELECT
      scope,
      SUM(calculated_value) AS total
    FROM calculated_emissions
    WHERE organization_id = $1
    GROUP BY scope
    `,
    [orgId]
  );

  res.json({
    success: true,
    data: result.rows
  });
}

/**
 * GET /dashboard/trends
 * Monthly emissions trend
 */
export async function getMonthlyTrends(req, res) {
  const orgId = req.user.organization_id;
  const { project_id, scope } = req.query;

  let filters = [`c.organization_id = $1`];
  let params = [orgId];
  let idx = 2;

  if (project_id) {
    filters.push(`c.project_id = $${idx++}`);
    params.push(project_id);
  }

  if (scope) {
    filters.push(`c.scope = $${idx++}`);
    params.push(scope);
  }

  const query = `
    SELECT
      DATE_TRUNC('month', r.date) AS month,
      SUM(c.calculated_value) AS emissions
    FROM calculated_emissions c
    JOIN raw_emission_data r ON r.id = c.raw_emission_id
    WHERE ${filters.join(" AND ")}
    GROUP BY month
    ORDER BY month
  `;

  const result = await db.query(query, params);

  res.json({
    success: true,
    data: result.rows
  });
}

/**
 * GET /dashboard/overview
 * Home overview cards + pending actions
 */
export async function getDashboardOverview(req, res) {
  const orgId = req.user.organization_id;

  const safeCountQuery = async (query, params) => {
    try {
      const result = await db.query(query, params);
      return result.rows[0]?.total || 0;
    } catch {
      return 0;
    }
  };

  const totalProjects = await safeCountQuery(
    `SELECT COUNT(*)::int AS total FROM projects WHERE organization_id = $1`,
    [orgId]
  );

  const projectsWithData = await safeCountQuery(
    `
    SELECT COUNT(DISTINCT project_id)::int AS total
    FROM raw_emission_data
    WHERE organization_id = $1
    `,
    [orgId]
  );

  const pendingDataRequests = await safeCountQuery(
    `
    SELECT COUNT(*)::int AS total
    FROM data_requests
    WHERE organization_id = $1 AND status = 'pending'
    `,
    [orgId]
  );

  const readyReports = await safeCountQuery(
    `
    SELECT COUNT(*)::int AS total
    FROM reports
    WHERE organization_id = $1
    `,
    [orgId]
  );

  const dataCompleteness = totalProjects > 0
    ? Math.round((projectsWithData / totalProjects) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      data_completeness: dataCompleteness,
      carbon_assessment_status: projectsWithData > 0 ? "in_progress" : "not_started",
      net_zero_status: projectsWithData > 0 ? "tracking" : "needs_data",
      pending_data_requests: pendingDataRequests,
      ready_reports: readyReports
    }
  });
}
