import db from "../db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function runMigration() {
  const migPath = path.resolve("migrations/20260308_fix_notifications_types.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  
  try {
    await db.query(sql);
    console.log("✅ Migration applied successfully");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
