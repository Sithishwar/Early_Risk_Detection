import { BACKEND_URL } from "../config/runtime";

async function request(path, options = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no/invalid JSON body — leave as null
  }
  if (!res.ok) {
    const message = body?.detail || body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export const api = {
  getHealth: () => request("/health"),
  getMlHealth: () => request("/health/ml"),

  getZones: () => request("/api/zones"),
  getZone: (zoneId) => request(`/api/zones/${encodeURIComponent(zoneId)}`),
  resetZones: () => request("/api/zones", { method: "DELETE" }),
  uploadZoneVideo: (zoneId, file) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/api/zones/${encodeURIComponent(zoneId)}/video`, {
      method: "POST",
      body: form,
    });
  },

  getAlerts: () => request("/api/alerts"),
  clearAlerts: () => request("/api/alerts", { method: "DELETE" }),

  analyzeGridVideo: (file, { rows, cols, accumulate } = {}) => {
    const form = new FormData();
    form.append("file", file);
    const params = new URLSearchParams();
    if (rows) params.set("rows", rows);
    if (cols) params.set("cols", cols);
    if (accumulate) params.set("accumulate", "true");
    const qs = params.toString();
    return request(`/api/video/analyze${qs ? `?${qs}` : ""}`, {
      method: "POST",
      body: form,
    });
  },
};
