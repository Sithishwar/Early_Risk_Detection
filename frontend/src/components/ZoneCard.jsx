import { Link } from "react-router-dom";
import { getRiskColor, getRiskLevel } from "../utils/riskColor";

export default function ZoneCard({ zone }) {
  const risk = Number(zone.risk || 0);
  return (
    <Link to={`/zone/${encodeURIComponent(zone.id)}`} className="card" style={{ display: "block" }}>
      <div className="card-header" style={{ marginBottom: 10 }}>
        <p className="h2" style={{ fontSize: 14 }}>{zone.id}</p>
        <span className="badge" style={{ color: getRiskColor(risk), background: "transparent", padding: 0 }}>
          {getRiskLevel(risk)}
        </span>
      </div>
      <div className="kpi">
        <div>
          <div className="kpi-value">{zone.count ?? 0}</div>
          <div className="kpi-sub">People</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="kpi-value" style={{ color: getRiskColor(risk) }}>
            {risk.toFixed(2)}
          </div>
          <div className="kpi-sub">Risk score</div>
        </div>
      </div>
    </Link>
  );
}
