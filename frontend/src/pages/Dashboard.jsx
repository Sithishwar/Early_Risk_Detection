import { useMemo, useState } from "react";
import useLiveRisk from "../hooks/useLiveRisk";
import HeatMap from "../components/HeatMap";
import AlertPanel from "../components/AlertPanel";
import ZoneCard from "../components/ZoneCard";
import GridVideoAnalysis from "../components/GridVideoAnalysis";
import RiskTrendChart from "../components/charts/RiskTrendChart";
import { getRiskColor, getRiskTone } from "../utils/riskColor";
import { api } from "../services/api";

export default function Dashboard() {
  const { zones, alerts, zoneHistory, topZone, totalPeople, connected } = useLiveRisk();
  const [selectedZone, setSelectedZone] = useState("");
  const [videoResult, setVideoResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const activeZoneId = selectedZone || topZone?.id || "";
  const selectedHistory = zoneHistory?.[activeZoneId] || [];

  const highestRisk = useMemo(() => {
    const r = Number(topZone?.risk ?? 0);
    return { zoneId: topZone?.id || "-", risk: r };
  }, [topZone]);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const zoneId = selectedZone || "zone-1";

    setUploading(true);
    setUploadError("");
    try {
      const result = await api.uploadZoneVideo(zoneId, file);
      setVideoResult(result);
    } catch (err) {
      setUploadError(String(err?.message || err));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="container page">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="h1">Risk overview</div>
          <div className="muted">
            Where risk is highest right now, live zone scores, and alerts when a zone crosses the critical threshold.
          </div>
        </div>
        <span className="pill">
          <span className={`dot ${connected ? "good" : "bad"}`} />
          {connected ? "Live updates connected" : "Reconnecting…"}
        </span>
      </div>

      <div className="grid cols-12">
        <div className="card" style={{ gridColumn: "span 3" }}>
          <div className="card-header">
            <p className="card-title">Highest risk</p>
            <span className="pill">
              <span className={`dot ${getRiskTone(highestRisk.risk)}`} />
              {getRiskTone(highestRisk.risk) === "good" ? "Low" : getRiskTone(highestRisk.risk) === "warn" ? "Medium" : "High"}
            </span>
          </div>
          <div className="kpi">
            <div>
              <div className="kpi-value">{highestRisk.zoneId}</div>
              <div className="kpi-sub">Zone with maximum risk</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="kpi-value" style={{ color: getRiskColor(highestRisk.risk) }}>
                {highestRisk.risk.toFixed(2)}
              </div>
              <div className="kpi-sub">Risk score</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 3" }}>
          <div className="card-header">
            <p className="card-title">People detected</p>
            <span className="pill"><span className="dot good" />Live</span>
          </div>
          <div className="kpi">
            <div>
              <div className="kpi-value">{totalPeople}</div>
              <div className="kpi-sub">Across all zones</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="kpi-value">{zones.length}</div>
              <div className="kpi-sub">Zones active</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 3" }}>
          <div className="card-header">
            <p className="card-title">Alerts</p>
            <span className="pill">
              <span className={`dot ${alerts.length ? "bad" : "good"}`} />
              {alerts.length ? "Attention" : "Clear"}
            </span>
          </div>
          <div className="kpi">
            <div>
              <div className="kpi-value">{alerts.length}</div>
              <div className="kpi-sub">Recent critical alerts</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="kpi-value" style={{ fontSize: 16 }}>{activeZoneId || "—"}</div>
              <div className="kpi-sub">Selected zone</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 3" }}>
          <div className="card-header">
            <p className="card-title">Single-zone upload</p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Target zone id</div>
              <input
                className="input"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                placeholder={topZone?.id || "e.g. R2C3"}
              />
            </div>
            <label className="btn" style={{ justifyContent: "space-between", cursor: uploading ? "wait" : "pointer" }}>
              <span>{uploading ? "Processing…" : "Upload CCTV clip"}</span>
              <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} style={{ display: "none" }} />
            </label>
            {uploadError ? <p style={{ color: "var(--bad)", fontSize: 12, margin: 0 }}>{uploadError}</p> : null}
          </div>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <HeatMap zones={zones} />
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <RiskTrendChart data={selectedHistory} />
        </div>

        <div className="card" style={{ gridColumn: "span 6", minHeight: 260 }}>
          <div className="card-header">
            <p className="card-title">Last single-zone upload</p>
            <span className="pill">
              <span className={`dot ${videoResult ? "good" : "warn"}`} />
              {videoResult ? "Processed" : "No upload yet"}
            </span>
          </div>

          {!videoResult ? (
            <div className="empty-state" style={{ padding: "24px 10px" }}>
              <span className="icon">🎞️</span>
              <p>Upload a CCTV video clip (left) to see a quick single-zone analysis here.</p>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div className="card" style={{ boxShadow: "none", padding: 12 }}>
                <p className="card-title">Total frames</p>
                <div className="kpi-value">{videoResult.total_frames}</div>
              </div>
              <div className="card" style={{ boxShadow: "none", padding: 12 }}>
                <p className="card-title">Max people</p>
                <div className="kpi-value">{videoResult.max_people_count}</div>
              </div>
              <div className="card" style={{ boxShadow: "none", padding: 12 }}>
                <p className="card-title">Avg people</p>
                <div className="kpi-value">{Number(videoResult.average_people_count ?? 0).toFixed(1)}</div>
              </div>
              <div className="card" style={{ boxShadow: "none", padding: 12 }}>
                <p className="card-title">Zone</p>
                <div className="kpi-value" style={{ fontSize: 18 }}>{videoResult.zoneId || selectedZone}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <GridVideoAnalysis />
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <AlertPanel alerts={alerts} limit={5} />
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <div className="card-header" style={{ marginBottom: 10 }}>
            <p className="h2">Zones</p>
            <span className="pill"><span className="dot good" />{zones.length} live cards</span>
          </div>
          {zones.length === 0 ? (
            <div className="card empty-state">
              <span className="icon">📭</span>
              <p>No zones yet — run a grid analysis above to populate them.</p>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
              {zones.map((z) => (
                <ZoneCard key={z.id} zone={z} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
