const API_BASE = "http://localhost:8000";

async function parseError(response) {
  const data = await response.json();
  throw data;
}

export async function apiRegister(name, email, password) {
  const response = await fetch(`${API_BASE}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}

export async function apiLogin(email, password) {
  const response = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}
