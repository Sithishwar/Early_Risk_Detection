import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { getRiskColor } from "../utils/riskColor";

export default function GridVideoAnalysis() {
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const json = await api.analyzeGridVideo(file);
      setResult(json);
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const activeZones = (result?.zones || []).filter((z) => z.peopleCount > 0 || z.riskScore > 0);

  return (
    <div className="card">
      <div className="card-header">
        <p className="card-title">Full pipeline: grid risk analysis</p>
        <span className="pill">
          <span className="dot good" />
          YOLO + ByteTrack → zones → density/movement → LSTM → risk
        </span>
      </div>
      <p className="muted" style={{ margin: "0 0 14px" }}>
        Runs the whole video through person detection and tracking, splits the frame into a{" "}
        {result?.grid?.rows ?? 5}×{result?.grid?.cols ?? 5} zone grid, computes density and
        movement per zone (matched by track id), forecasts near-future density with the LSTM
        model, and scores each zone&apos;s risk. Results are pushed to the live heatmap above
        automatically.
      </p>

      <label className="btn primary" style={{ maxWidth: 280, cursor: uploading ? "wait" : "pointer", marginBottom: 16 }}>
        {uploading ? "Analyzing video…" : "Choose video for grid analysis"}
        <input type="file" accept="video/*" hidden disabled={uploading} onChange={onFile} />
      </label>

      {error ? (
        <p style={{ color: "var(--bad)", fontSize: 13, marginBottom: 12 }}>{error}</p>
      ) : null}

      {result ? (
        <>
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))", marginBottom: 16 }}>
            <Stat label="Highest-risk zone" value={result.topRiskZone?.zoneId ?? "-"} />
            <Stat
              label="Risk score"
              value={Number(result.topRiskZone?.riskScore ?? 0).toFixed(2)}
              color={getRiskColor(result.topRiskZone?.riskScore)}
            />
            <Stat label="Unique people tracked" value={result.summary?.uniquePeopleTracked ?? 0} />
            <Stat label="Critical zones" value={result.summary?.criticalZones ?? 0} />
          </div>

          {activeZones.length === 0 ? (
            <p className="muted">No people detected in this clip — try a busier scene.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>People</th>
                    <th>Density</th>
                    <th>Movement</th>
                    <th>Forecast</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {activeZones.slice(0, 10).map((z) => (
                    <tr key={z.zoneId}>
                      <td style={{ fontWeight: 700 }}>
                        <Link to={`/zone/${encodeURIComponent(z.zoneId)}`}>{z.zoneId}</Link>
                      </td>
                      <td>{z.peopleCount}</td>
                      <td>{Number(z.density ?? 0).toFixed(2)}</td>
                      <td>{Number(z.speed ?? 0).toFixed(2)}</td>
                      <td>{Number(z.forecastDensity ?? 0).toFixed(2)}</td>
                      <td>
                        <span style={{ color: getRiskColor(z.riskScore), fontWeight: 800 }}>
                          {Number(z.riskScore ?? 0).toFixed(2)}
                        </span>{" "}
                        <span className="muted" style={{ fontSize: 12 }}>{z.level}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.alertsFired?.length ? (
            <p style={{ color: "var(--bad)", fontSize: 13, marginTop: 12 }}>
              {result.alertsFired.length} zone(s) crossed the critical threshold —{" "}
              <Link to="/alerts">view alerts</Link>.
            </p>
          ) : (
            <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
              No zone crossed the critical threshold.
            </p>
          )}
        </>
      ) : (
        !uploading && <p className="muted">Upload a video to see the per-zone breakdown here.</p>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="card" style={{ boxShadow: "none", padding: 12 }}>
      <div className="kpi-value" style={{ fontSize: 20, color }}>{value}</div>
      <div className="kpi-sub">{label}</div>
    </div>
  );
}
