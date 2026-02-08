import fs from "fs";
import path from "path";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import db from "../db.js";

const REPORTS_DIR = "reports";

// Ensure directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR);
}

/**
 * Fetch report data (shared logic)
 */
async function fetchReportData(orgId, filters) {
  const params = [orgId];
  let idx = 2;
  let conditions = [`c.organization_id = $1`];

  if (filters.project_id) {
    conditions.push(`c.project_id = $${idx++}`);
    params.push(filters.project_id);
  }

  if (filters.scope) {
    conditions.push(`c.scope = $${idx++}`);
    params.push(filters.scope);
  }

  if (filters.from) {
    conditions.push(`r.date >= $${idx++}`);
    params.push(filters.from);
  }

  if (filters.to) {
    conditions.push(`r.date <= $${idx++}`);
    params.push(filters.to);
  }

  const query = `
    SELECT
      r.date,
      r.scope,
      r.activity_type,
      r.value,
      r.unit,
      c.calculated_value
    FROM calculated_emissions c
    JOIN raw_emission_data r ON r.id = c.raw_emission_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY r.date
  `;

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * POST /reports/csv
 */
export async function generateCSVReport(req, res) {
  const orgId = req.user.organization_id;
  const userId = req.user.user_id;
  const filters = req.body || {};

  const data = await fetchReportData(orgId, filters);

  const parser = new Parser();
  const csv = parser.parse(data);

  const fileName = `report_${Date.now()}.csv`;
  const filePath = path.join(REPORTS_DIR, fileName);

  fs.writeFileSync(filePath, csv);

  await db.query(
    `
    INSERT INTO reports (organization_id, type, filters, file_path, generated_by)
    VALUES ($1, 'csv', $2, $3, $4)
    `,
    [orgId, filters, filePath, userId]
  );

  res.download(filePath);
}

/**
 * POST /reports/pdf
 */
export async function generatePDFReport(req, res) {
  const orgId = req.user.organization_id;
  const userId = req.user.user_id;
  const filters = req.body || {};

  const data = await fetchReportData(orgId, filters);

  const fileName = `report_${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("Sustainability Emissions Report", { align: "center" });
  doc.moveDown();

  data.forEach(row => {
    doc
      .fontSize(10)
      .text(
        `${row.date} | ${row.scope} | ${row.activity_type} | ${row.calculated_value} kg CO₂e`
      );
  });

  doc.end();

  await db.query(
    `
    INSERT INTO reports (organization_id, type, filters, file_path, generated_by)
    VALUES ($1, 'pdf', $2, $3, $4)
    `,
    [orgId, filters, filePath, userId]
  );

  res.download(filePath);
}
