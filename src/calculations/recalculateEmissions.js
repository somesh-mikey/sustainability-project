import db from "../db.js";
import { calculateEmission } from "./calculateEmissions.js";
import { CURRENT_CALCULATION_VERSION } from "./calculationVersion.js";

export async function recalculateEmissions({
  organizationId,
  projectId = null,
  from = null,
  to = null
}) {
  const params = [organizationId];
  let idx = 2;

  let filters = [`organization_id = $1`];

  if (projectId) {
    filters.push(`project_id = $${idx++}`);
    params.push(projectId);
  }

  if (from) {
    filters.push(`date >= $${idx++}`);
    params.push(from);
  }

  if (to) {
    filters.push(`date <= $${idx++}`);
    params.push(to);
  }

  const query = `
    SELECT *
    FROM raw_emission_data
    WHERE ${filters.join(" AND ")}
    ORDER BY date
  `;

  const rawResult = await db.query(query, params);

  let recalculated = 0;
  let skipped = 0;

  for (const raw of rawResult.rows) {
    // ❌ Skip if already recalculated with current version
    const exists = await db.oneOrNone(
      `
      SELECT 1
      FROM calculated_emissions
      WHERE raw_emission_id = $1
        AND calculation_version = $2
      `,
      [raw.id, CURRENT_CALCULATION_VERSION]
    );

    if (exists) {
      skipped++;
      continue;
    }

    await calculateEmission({
      ...raw,
      calculation_version: CURRENT_CALCULATION_VERSION
    });

    recalculated++;
  }

  return {
    total_raw_records: rawResult.rows.length,
    recalculated,
    skipped,
    version: CURRENT_CALCULATION_VERSION
  };
}
