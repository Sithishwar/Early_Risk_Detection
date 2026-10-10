export function getRiskColor(risk) {
  const r = Number(risk) || 0;
  if (r < 0.3) return "var(--good)";
  if (r < 0.7) return "var(--warn)";
  return "var(--bad)";
}

export function getRiskLevel(risk) {
  const r = Number(risk) || 0;
  if (r < 0.3) return "LOW";
  if (r < 0.7) return "MEDIUM";
  return "HIGH";
}

/** "good" | "warn" | "bad" — matches the .dot/.badge CSS modifiers. */
export function getRiskTone(risk) {
  const r = Number(risk) || 0;
  if (r < 0.3) return "good";
  if (r < 0.7) return "warn";
  return "bad";
}
