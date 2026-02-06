export function getRiskColor(risk) {
  if (risk < 0.3) return "#2ecc71";   // green
  if (risk < 0.7) return "#f39c12";   // orange
  return "#e74c3c";                  // red
}
