import fs from "fs";
import csv from "csv-parser";
import db from "../db.js";
import { calculateEmission } from "../calculations/calculateEmissions.js";
import { AppError } from "../middleware/errorHandler.js";

export async function uploadEmissionsCSV(req, res) {
  const orgId = req.user.organization_id;
  const userId = req.user.user_id;

  if (!req.file) {
    throw new AppError("CSV file is required", 400, "VALIDATION_ERROR");
  }

  let inserted = 0;
  let failed = 0;
  const errors = [];

  const stream = fs.createReadStream(req.file.path)
    .pipe(csv());

  for await (const row of stream) {
    try {
      const {
        project_id,
        date,
        scope,
        activity_type,
        value,
        unit
      } = row;

      // 🔍 Basic validation
      if (!project_id || !date || !scope || !activity_type || !value || !unit) {
        failed++;
        errors.push({ row, reason: "Missing required fields" });
        continue;
      }

      // 🔐 Project ownership check
      const project = await db.oneOrNone(
        `SELECT id FROM projects WHERE id = $1 AND organization_id = $2`,
        [project_id, orgId]
      );

      if (!project) {
        failed++;
        errors.push({ row, reason: "Invalid project access" });
        continue;
      }

      // 📥 Insert raw emission
      const result = await db.query(
        `
        INSERT INTO raw_emission_data
          (organization_id, project_id, date, scope, activity_type, value, unit, created_by, source)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, 'csv')
        RETURNING *
        `,
        [
          orgId,
          project_id,
          date,
          scope,
          activity_type.toLowerCase(),
          Number(value),
          unit.toLowerCase(),
          userId
        ]
      );

      // 🔢 Trigger calculation
      await calculateEmission(result.rows[0]);

      inserted++;
    } catch (err) {
      failed++;
      errors.push({ row, reason: err.message });
    }
  }

  // 🧹 Cleanup uploaded file
  fs.unlinkSync(req.file.path);

  res.json({
    success: true,
    data: {
      inserted,
      failed,
      errors
    }
  });
}
