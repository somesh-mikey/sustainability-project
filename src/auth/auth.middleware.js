import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    throw new AppError("Missing token", 401, "MISSING_TOKEN");
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    throw new AppError("Invalid or expired token", 401, "INVALID_TOKEN");
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError("Forbidden: insufficient role", 403, "FORBIDDEN");
    }
    next();
  };
}
