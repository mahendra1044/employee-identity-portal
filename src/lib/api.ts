const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function searchEmployee(id: string, token?: string | null) {
  if (!id) throw new Error("search id required");
  const url = `/api/search-employee/${encodeURIComponent(id)}`; // Next.js API proxy
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Search failed");
  return body;
}

export async function fetchFeatures(token?: string | null) {
  const url = `${API_BASE}/config/features`;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to load features");
  return res.json();
}

export default {
  searchEmployee,
  fetchFeatures,
};
