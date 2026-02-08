export function requireFields(obj, fields) {
  for (const field of fields) {
    if (!obj[field]) {
      const error = new Error(`${field} is required`);
      error.status = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }
  }
}
