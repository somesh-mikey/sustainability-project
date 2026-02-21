import fs from "fs";
import path from "path";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import db from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

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
 * GET /reports
 */
export async function getReports(req, res) {
  const orgId = req.user.organization_id;

  const result = await db.query(
    `
    SELECT id, type, filters, file_path, created_at
    FROM reports
    WHERE organization_id = $1
    ORDER BY created_at DESC
    `,
    [orgId]
  );

  const rows = result.rows.map((report) => ({
    ...report,
    file_name: path.basename(report.file_path)
  }));

  res.json({
    success: true,
    data: rows
  });
}

/**
 * GET /reports/:id/download
 */
export async function downloadReport(req, res) {
  const orgId = req.user.organization_id;
  const { id } = req.params;

  const report = await db.oneOrNone(
    `
    SELECT id, file_path
    FROM reports
    WHERE id = $1 AND organization_id = $2
    `,
    [id, orgId]
  );

  if (!report) {
    throw new AppError("Report not found", 404, "NOT_FOUND");
  }

  if (!fs.existsSync(report.file_path)) {
    throw new AppError("Report file not found on disk", 404, "FILE_NOT_FOUND");
  }

  res.download(report.file_path);
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
