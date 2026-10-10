import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RiskTrendChart from "../components/charts/RiskTrendChart";
import { api } from "../services/api";
import { getRiskColor, getRiskLevel } from "../utils/riskColor";

export default function ZoneDetails() {
  const { id } = useParams();
  const [zone, setZone] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting for a new zone id fetch, not a cascading render
    setLoading(true);
    setError("");
    api
      .getZone(id)
      .then((data) => !cancelled && setZone(data))
      .catch((err) => !cancelled && setError(String(err.message || err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const riskHistory = (zone?.riskHistory || []).map((p) => ({
    label: new Date(p.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    risk: p.risk,
  }));

  return (
    <div className="container page">
      <div style={{ marginBottom: 16 }}>
        <Link to="/dashboard" className="muted">&larr; Back to overview</Link>
        <div className="h1" style={{ marginTop: 6 }}>Zone {id}</div>
      </div>

      {loading ? (
        <p className="muted">Loading zone…</p>
      ) : error ? (
        <div className="card">
          <p style={{ color: "var(--bad)" }}>{error}</p>
          <p className="muted" style={{ marginTop: 6 }}>
            This zone hasn&apos;t reported any data yet — run a video analysis from the dashboard first.
          </p>
        </div>
      ) : (
        <div className="grid cols-12">
          <div className="card" style={{ gridColumn: "span 3" }}>
            <p className="card-title">People</p>
            <div className="kpi-value">{zone.count}</div>
          </div>
          <div className="card" style={{ gridColumn: "span 3" }}>
            <p className="card-title">Density</p>
            <div className="kpi-value">{Number(zone.density ?? 0).toFixed(2)}</div>
          </div>
          <div className="card" style={{ gridColumn: "span 3" }}>
            <p className="card-title">Movement</p>
            <div className="kpi-value">{Number(zone.speed ?? 0).toFixed(2)}</div>
            <div className="kpi-sub">% of frame width / sec</div>
          </div>
          <div className="card" style={{ gridColumn: "span 3" }}>
            <p className="card-title">Risk score</p>
            <div className="kpi-value" style={{ color: getRiskColor(zone.risk) }}>
              {Number(zone.risk ?? 0).toFixed(2)}
            </div>
            <div className="kpi-sub">{getRiskLevel(zone.risk)}</div>
          </div>

          <div style={{ gridColumn: "span 12" }}>
            <RiskTrendChart data={riskHistory} />
          </div>

          <div className="card" style={{ gridColumn: "span 12" }}>
            <div className="card-header">
              <p className="card-title">People count per sampled frame</p>
            </div>
            {!zone.timeline?.length ? (
              <p className="muted">No timeline recorded for this zone yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr><th>t (s)</th><th>People</th></tr>
                  </thead>
                  <tbody>
                    {zone.timeline.map((p, i) => (
                      <tr key={i}><td>{p.t}</td><td>{p.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
