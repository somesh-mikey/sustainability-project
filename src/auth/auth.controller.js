import jwt from "jsonwebtoken";
import db from "../db.js";
import { verifyPassword } from "./password.js";
import { AppError } from "../middleware/errorHandler.js";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400, "VALIDATION_ERROR");
  }

  const user = await db.oneOrNone(
    `SELECT u.*, o.name AS organization_name
     FROM users u
     LEFT JOIN organizations o ON o.id = u.organization_id
     WHERE u.email = $1 AND u.is_active = true`,
    [email]
  );

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
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
        organization_name: user.organization_name,
      },
    },
  });
}
