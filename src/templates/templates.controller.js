import fs from "fs";
import path from "path";
import { AppError } from "../middleware/errorHandler.js";

const TEMPLATES_DIR = path.resolve("templates");

export async function getTemplates(req, res) {
  const templates = [
    {
      id: 1,
      name: "Electricity Consumption",
      category: "Energy",
      sector: "All Templates",
      file: "electricity_template.xlsx"
    },
    {
      id: 2,
      name: "Fuel Consumption",
      category: "Energy",
      sector: "Manufacturing",
      file: "fuel_template.xlsx"
    },
    {
      id: 3,
      name: "Water Consumption",
      category: "Resources",
      sector: "All Templates",
      file: "water_template.xlsx"
    },
    {
      id: 4,
      name: "Data Center Electricity",
      category: "Energy",
      sector: "IT / Services",
      file: "datacenter_template.xlsx"
    }
  ];

  res.json({
    success: true,
    data: templates
  });
}

export async function downloadTemplate(req, res) {
  const { filename } = req.params;
  const filePath = path.join(TEMPLATES_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new AppError("Template not found", 404, "NOT_FOUND");
  }

  res.download(filePath);
}
