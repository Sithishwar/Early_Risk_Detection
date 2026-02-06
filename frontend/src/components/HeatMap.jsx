import { getRiskColor } from "../utils/riskColor";

export default function HeatMap({ zones }) {
  if (!zones.length) return <p>No live data</p>;

  return (
    <section>
      <h3>Risk Heatmap</h3>
      <div style={gridStyle}>
        {zones.map((zone) => (
          <div
            key={zone.id}
            style={{
              ...cellStyle,
              backgroundColor: getRiskColor(zone.risk),
            }}
            title={`People: ${zone.count}, Risk: ${zone.risk.toFixed(2)}`}
          >
            {zone.id}
          </div>
        ))}
      </div>
    </section>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 12,
};

const cellStyle = {
  height: 80,
  color: "white",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
};
