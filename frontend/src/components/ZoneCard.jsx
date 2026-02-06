import { getRiskColor } from "../utils/riskColor";

export default function ZoneCard({ zone }) {
  return (
    <div style={cardStyle}>
      <h4>Zone {zone.id}</h4>
      <p>People: {zone.count}</p>
      <p style={{ color: getRiskColor(zone.risk) }}>
        Risk: {zone.risk.toFixed(2)}
      </p>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 12,
};
