import { Link } from "react-router-dom";
import { timeAgo } from "../utils/format";

export default function AlertPanel({ alerts, limit }) {
  const list = limit ? alerts.slice(0, limit) : alerts;

  return (
    <div className="card">
      <div className="card-header">
        <p className="card-title">Critical alerts</p>
        <span className="pill">
          <span className={`dot ${alerts.length ? "bad" : "good"}`} />
          {alerts.length ? `${alerts.length} recent` : "All clear"}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="empty-state" style={{ padding: "18px 10px" }}>
          <span className="icon">✅</span>
          <p>No zone has crossed the critical threshold.</p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          {list.map((alert) => (
            <li
              key={alert.id || `${alert.zoneId}-${alert.timestamp}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(231,76,60,0.08)",
                border: "1px solid rgba(231,76,60,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span className="badge bad">Critical</span>
                <Link to={`/zone/${encodeURIComponent(alert.zoneId)}`} style={{ fontWeight: 700, fontSize: 13 }}>
                  {alert.message || `Zone ${alert.zoneId} is in critical condition`}
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span className="muted" style={{ fontSize: 12 }}>
                  risk {Number(alert.riskScore ?? 0).toFixed(2)}
                </span>
                <span className="muted" style={{ fontSize: 12 }}>{timeAgo(alert.timestamp)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
