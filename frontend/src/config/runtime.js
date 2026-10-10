function defaultBackendUrl() {
  const host = window.location.hostname;
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  // Node risk-engine is a separate service; default port 5000.
  return `${protocol}//${host}:5000`;
}

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL?.trim?.() || defaultBackendUrl();
