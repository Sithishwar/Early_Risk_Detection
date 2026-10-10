import { Link } from "react-router-dom";
import { getRiskColor } from "../utils/riskColor";

/** Parses "R{row}C{col}" zone ids back into a grid layout; falls back to
 * an auto-fit grid for any other id scheme (e.g. manual/simulator zones). */
function layoutZones(zones) {
  const pattern = /^R(\d+)C(\d+)$/;
  let rows = 0;
  let cols = 0;
  let allMatch = zones.length > 0;

  for (const z of zones) {
    const m = pattern.exec(z.id);
    if (!m) {
      allMatch = false;
      break;
    }
    rows = Math.max(rows, Number(m[1]) + 1);
    cols = Math.max(cols, Number(m[2]) + 1);
  }

  if (!allMatch) return null;

  const cells = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const z of zones) {
    const [, r, c] = pattern.exec(z.id);
    cells[Number(r)][Number(c)] = z;
  }
  return { rows, cols, cells };
}

function Cell({ zone }) {
  if (!zone) {
    return <div style={{ ...cellStyle, background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border)" }} />;
  }
  const active = zone.count > 0;
  return (
    <Link
      to={`/zone/${encodeURIComponent(zone.id)}`}
      title={`${zone.id} — ${zone.count} people, risk ${Number(zone.risk).toFixed(2)}`}
      style={{
        ...cellStyle,
        background: active ? getRiskColor(zone.risk) : "rgba(255,255,255,0.04)",
        color: active ? "#0b0e14" : "var(--text-faint)",
        border: active ? "1px solid rgba(0,0,0,0.15)" : "1px solid var(--border)",
      }}
    >
      <span style={{ fontWeight: 800 }}>{zone.id}</span>
      <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>{zone.count}</span>
    </Link>
  );
}

export default function HeatMap({ zones }) {
  if (!zones || zones.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <p className="card-title">Risk heatmap</p>
        </div>
        <div className="empty-state">
          <span className="icon">🗺️</span>
          <p>No zone data yet — analyze a video below to populate the map.</p>
        </div>
      </div>
    );
  }

  const layout = layoutZones(zones);

  return (
    <div className="card">
      <div className="card-header">
        <p className="card-title">Risk heatmap</p>
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-dim)" }}>
          <Legend color="var(--good)" label="Low" />
          <Legend color="var(--warn)" label="Medium" />
          <Legend color="var(--bad)" label="High" />
        </div>
      </div>

      {layout ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gap: 8,
          }}
        >
          {layout.cells.map((row, r) =>
            row.map((zone, c) => <Cell key={`${r}-${c}`} zone={zone} />)
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
          {zones.map((z) => (
            <Cell key={z.id} zone={z} />
          ))}
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

const cellStyle = {
  height: 64,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  fontSize: 12,
  transition: "transform 0.1s ease",
};
