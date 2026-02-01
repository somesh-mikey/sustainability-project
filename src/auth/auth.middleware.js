import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    console.log('❌ No authorization header');
    return res.status(401).json({ error: "Missing token" });
  }

  const token = header.split(" ")[1];

  try {
    console.log('🔐 Verifying token...');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified:', req.user);
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log('❌ User role not authorized. User role:', req.user.role, 'Required:', roles);
      return res.status(403).json({ error: "Forbidden" });
    }
    console.log('✅ User role authorized:', req.user.role);
    next();
  };
}
