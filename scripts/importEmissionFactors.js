import fs from "fs";
import csv from "csv-parser";
import db from "../src/db.js";

async function importFactors() {
  const rows = [];

  fs.createReadStream("emission_factors.csv")
    .pipe(csv())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {
      for (const row of rows) {
        const {
          activity_type,
          unit,
          factor_value,
          factor_unit,
          valid_from
        } = row;

        await db.query(
          `
          INSERT INTO emission_factors
            (activity_type, unit, factor_value, factor_unit, valid_from)
          VALUES
            ($1, $2, $3, $4, $5)
          `,
          [
            activity_type.toLowerCase(),
            unit.toLowerCase(),
            Number(factor_value),
            factor_unit,
            valid_from
          ]
        );
      }

      console.log("✅ Emission factors imported");
      process.exit();
    });
}

importFactors();
