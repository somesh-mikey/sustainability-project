import jwt from "jsonwebtoken";
import db from "../db.js";
import { verifyPassword } from "./password.js";

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await db.oneOrNone(
    `SELECT * FROM users WHERE email = $1 AND is_active = true`,
    [email]
  );

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({
      success: false,
      error: { message: "Invalid credentials" },
    });
  }

  const token = jwt.sign(
    {
      user_id: user.id,
      organization_id: user.organization_id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    },
  });
}
