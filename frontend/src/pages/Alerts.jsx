import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import socket from "../services/socket";
import { api } from "../services/api";
import { timeAgo } from "../utils/format";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getAlerts()
      .then((data) => !cancelled && setAlerts(data))
      .catch((err) => !cancelled && setError(String(err.message || err)))
      .finally(() => !cancelled && setLoading(false));

    const onAlert = (alert) => setAlerts((prev) => [alert, ...prev].slice(0, 200));
    socket.on("alert", onAlert);
    return () => {
      cancelled = true;
      socket.off("alert", onAlert);
    };
  }, []);

  async function handleClear() {
    setClearing(true);
    try {
      await api.clearAlerts();
      setAlerts([]);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="container page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="h1">Alerts</div>
          <div className="muted">Every zone that crossed the critical risk threshold, most recent first.</div>
        </div>
        <button className="btn danger" style={{ width: "auto" }} onClick={handleClear} disabled={clearing || alerts.length === 0}>
          {clearing ? "Clearing…" : "Clear all"}
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Loading alerts…</p>
        ) : error ? (
          <p style={{ color: "var(--bad)" }}>{error}</p>
        ) : alerts.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <span className="icon">✅</span>
            <p>No critical alerts. This page updates in real time as zones cross the threshold.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Level</th>
                  <th>Risk score</th>
                  <th>Message</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id || `${a.zoneId}-${a.timestamp}`}>
                    <td style={{ fontWeight: 700 }}>
                      <Link to={`/zone/${encodeURIComponent(a.zoneId)}`}>{a.zoneId}</Link>
                    </td>
                    <td><span className="badge bad">{a.level || "CRITICAL"}</span></td>
                    <td style={{ color: "var(--bad)", fontWeight: 700 }}>{Number(a.riskScore ?? 0).toFixed(2)}</td>
                    <td className="muted">{a.message}</td>
                    <td className="muted">{timeAgo(a.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
