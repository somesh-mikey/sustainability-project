import db from "../db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const migrations = [
  "20260222_add_prd_screen_tables.sql",
  "20260308_fix_notifications_types.sql",
  "20260308_add_client_portal.sql",
  "20260309_enable_cross_org_messages.sql",
  "20260309_enable_cross_org_data_requests.sql"
];

async function runMigration() {
  try {
    for (const migFile of migrations) {
      const migPath = path.resolve(`migrations/${migFile}`);
      if (!fs.existsSync(migPath)) {
        console.log(`⏭️  Skipping ${migFile} (not found)`);
        continue;
      }
      const sql = fs.readFileSync(migPath, "utf-8");
      await db.query(sql);
      console.log(`✅ Applied: ${migFile}`);
    }
    console.log("✅ All migrations applied successfully");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
    process.exit(1);
  } finally {
    await db.end();
    process.exit(0);
  }
}

runMigration();
