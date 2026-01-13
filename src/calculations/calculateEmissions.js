import db from "../db.js";

/**
 * Increment this whenever
 * calculation logic or factors change
 */
const CALCULATION_VERSION = 1;

/**
 * Calculates emissions for a single raw emission record
 * and stores the result in calculated_emissions table.
 *
 * @param {Object} rawEmission - row from raw_emission_data
 */
export async function calculateEmission(rawEmission) {
  if (!rawEmission) {
    throw new Error("Raw emission data is missing");
  }

  const {
    id: rawId,
    organization_id,
    project_id,
    scope,
    activity_type,
    unit,
    value,
    date,
  } = rawEmission;

  // 🛑 Basic validation (backend safety)
  if (!activity_type || !unit || !value || !date) {
    throw new Error("Incomplete emission data for calculation");
  }

  // 🔄 Normalize inputs (CRITICAL)
  const normalizedActivity = activity_type.toLowerCase().trim();
  const normalizedUnit = unit.toLowerCase().trim();

  console.log("🔢 Starting emission calculation:", {
    rawId,
    activity: normalizedActivity,
    unit: normalizedUnit,
    value,
    date,
  });

  // 1️⃣ Fetch applicable emission factor
  const factor = await db.oneOrNone(
    `
    SELECT
      factor_value
    FROM emission_factors
    WHERE LOWER(activity_type) = $1
      AND LOWER(unit) = $2
      AND valid_from <= $3
      AND (valid_to IS NULL OR valid_to >= $3)
    ORDER BY valid_from DESC
    LIMIT 1
    `,
    [normalizedActivity, normalizedUnit, date]
  );

  if (!factor) {
    console.error("❌ Emission factor not found:", {
      activity_type: normalizedActivity,
      unit: normalizedUnit,
      date,
    });

    throw new Error(
      `No emission factor found for ${normalizedActivity} (${normalizedUnit}) on ${date}`
    );
  }

  // 2️⃣ Calculate emissions
  const numericValue = Number(value);
  const numericFactor = Number(factor.factor_value);

  if (Number.isNaN(numericValue) || Number.isNaN(numericFactor)) {
    throw new Error("Invalid numeric values during emission calculation");
  }

  const calculatedValue = numericValue * numericFactor;

  // 3️⃣ Persist calculated emissions
  await db.query(
    `
    INSERT INTO calculated_emissions
      (
        organization_id,
        project_id,
        raw_emission_id,
        scope,
        calculated_value,
        calculation_version
      )
    VALUES
      ($1, $2, $3, $4, $5, $6)
    `,
    [
      organization_id,
      project_id,
      rawId,
      scope,
      calculatedValue,
      CALCULATION_VERSION,
    ]
  );

  console.log("✅ Emission calculated successfully:", {
    rawId,
    calculatedValue,
    version: CALCULATION_VERSION,
  });

  return calculatedValue;
}
