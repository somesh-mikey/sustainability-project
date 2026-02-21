const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function loginUser(email, password) {
  if (!API_URL) {
    throw new Error("Missing VITE_API_BASE_URL in frontend/.env");
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();
  const data = contentType.includes("application/json") && rawText
    ? JSON.parse(rawText)
    : null;

  if (!res.ok || !data?.success) {
    throw new Error(
      data?.error?.message ||
      (rawText ? `Login failed: ${rawText.slice(0, 120)}` : "Login failed")
    );
  }

  return data.data; // { token, user }
}
