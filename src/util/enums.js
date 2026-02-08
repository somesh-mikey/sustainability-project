export const SCOPES = ["scope_1", "scope_2", "scope_3"];

export function normalizeScope(scope) {
  const normalized = scope.toLowerCase().replace(" ", "_");
  if (!SCOPES.includes(normalized)) {
    const error = new Error("Invalid scope value");
    error.status = 400;
    error.code = "INVALID_SCOPE";
    throw error;
  }
  return normalized;
}
