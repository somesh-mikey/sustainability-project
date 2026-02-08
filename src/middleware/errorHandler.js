/**
 * Custom error class for API errors.
 * Attach status and code to any thrown error.
 */
export class AppError extends Error {
  constructor(message, status = 500, code = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Centralized error-handling middleware.
 * Must be registered LAST in the middleware chain.
 */
export function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);

  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = status === 500 && !err.status
    ? "Something went wrong"
    : err.message || "Something went wrong";

  res.status(status).json({
    success: false,
    error: { code, message }
  });
}
