import dotenv from "dotenv";
import db from "../db.js";
import { hashPassword } from "../auth/password.js";

dotenv.config();

async function seedAdmin() {
  try {
    console.log("🌱 Seeding admin user...");

    // 1️⃣ Create organization
    const orgResult = await db.query(
      `
      INSERT INTO organizations (name, industry)
      VALUES ($1, $2)
      RETURNING id
      `,
      ["Green Corp", "Manufacturing"]
    );

    const organizationId = orgResult.rows[0].id;

    // 2️⃣ Hash password
    const passwordHash = await hashPassword("admin123");

    // 3️⃣ Create admin user
    await db.query(
      `
      INSERT INTO users (organization_id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [organizationId, "Admin User", "admin@company.com", passwordHash, "admin"]
    );

    console.log("✅ Admin user created successfully");
    console.log("📧 Email: admin@company.com");
    console.log("🔑 Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seedAdmin();
