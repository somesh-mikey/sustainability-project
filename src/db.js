import dotenv from "dotenv";
dotenv.config(); // 👈 MUST be first

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sustainability_db",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

export default {
  query: (text, params) => pool.query(text, params),
  oneOrNone: async (text, params) => {
    const res = await pool.query(text, params);
    return res.rows[0] || null;
  },
};
