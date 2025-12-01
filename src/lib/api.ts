/**
 * API Functions
 * 
 * Only actively used API functions are kept here.
 * Direct fetch calls are used in components for other endpoints.
 */

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

const api = { searchEmployee };
export default api;

