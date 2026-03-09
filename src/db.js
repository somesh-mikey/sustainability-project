import dotenv from "dotenv";
dotenv.config(); // Must be first

import pkg from "pg";
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production";

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    })
  : new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "sustainability_db",
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432
    });

export default {
  query: (text, params) => pool.query(text, params),
  oneOrNone: async (text, params) => {
    const res = await pool.query(text, params);
    return res.rows[0] || null;
  },
  end: () => pool.end(),
};
