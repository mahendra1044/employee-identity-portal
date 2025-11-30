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

// SNOW incidents
export async function getSnowIncidents(userEmail: string, token?: string | null) {
  const url = `/api/snow-incidents?email=${encodeURIComponent(userEmail)}`;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to load SNOW incidents");
  return res.json();
}

// Ping Federate endpoints
export async function getPfUserInfo() {
  const res = await fetch("/api/pf/userinfo");
  if (!res.ok) throw new Error("Failed to load PF User Info");
  return res.json();
}

export async function getPfOidc() {
  const res = await fetch("/api/pf/oidc");
  if (!res.ok) throw new Error("Failed to load PF OIDC");
  return res.json();
}

export async function getPfConnections() {
  const res = await fetch("/api/pf/connections");
  if (!res.ok) throw new Error("Failed to load PF Connections");
  return res.json();
}

// Azure AD endpoints
export async function getAadGroups(userId: string, token?: string | null) {
  const url = `/api/aad/groups?userId=${encodeURIComponent(userId)}`;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to load AAD Groups");
  return res.json();
}

export async function getAadSignins(userId: string, token?: string | null) {
  const url = `/api/aad/signins?userId=${encodeURIComponent(userId)}`;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to load AAD Sign-ins");
  return res.json();
}

// CyberArk endpoints
export async function getCyberarkAccounts() {
  const res = await fetch("/api/cyberark/accounts");
  if (!res.ok) throw new Error("Failed to load CyberArk Accounts");
  return res.json();
}

export async function getCyberarkActivity() {
  const res = await fetch("/api/cyberark/activity");
  if (!res.ok) throw new Error("Failed to load CyberArk Activity");
  return res.json();
}

export async function getCyberarkSafes() {
  const res = await fetch("/api/cyberark/safes");
  if (!res.ok) throw new Error("Failed to load CyberArk Safes");
  return res.json();
}

// Saviynt endpoint
export async function getSaviynt() {
  const res = await fetch("/api/saviynt/requests");
  if (!res.ok) throw new Error("Failed to load Saviynt");
  return res.json();
}

const api = {
  searchEmployee,
  fetchFeatures,
  getSnowIncidents,
  getPfUserInfo,
  getPfOidc,
  getPfConnections,
  getAadGroups,
  getAadSignins,
  getCyberarkAccounts,
  getCyberarkActivity,
  getCyberarkSafes,
  getSaviynt,
};

export default api;
