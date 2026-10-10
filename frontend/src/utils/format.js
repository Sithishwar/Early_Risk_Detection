export function timeAgo(timestamp) {
  const diff = Date.now() - Number(timestamp);
  if (!Number.isFinite(diff) || diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function fmt(n, digits = 2) {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(digits) : "—";
}
