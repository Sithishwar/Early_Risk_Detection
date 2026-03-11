import { useState } from "react";
import useLiveRisk from "../hooks/useLiveRisk";
import HeatMap from "../components/HeatMap";
import AlertPanel from "../components/AlertPanel";
import ZoneCard from "../components/ZoneCard";

export default function Dashboard() {
  const { zones, alerts } = useLiveRisk();
  const [selectedZone, setSelectedZone] = useState("zone-1");
  const [videoResult, setVideoResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `http://localhost:5000/api/zones/${encodeURIComponent(selectedZone)}/video`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || result.error || "Upload failed");
      }
      setVideoResult(result);
    } catch (error) {
      console.error("Video upload failed:", error);
      alert("Failed to process video: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h2>Early Risk Detection Dashboard</h2>

      <HeatMap zones={zones} />

      <h3>Video Risk Detection</h3>
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 8 }}>
          Zone:{" "}
          <input
            type="text"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            placeholder="e.g. zone-1"
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", marginRight: 12 }}
          />
        </label>
        <input type="file" accept="video/*" onChange={handleVideoUpload} />
        {uploading && <p>Uploading and processing video...</p>}
        {videoResult && (
          <div style={{ marginTop: 10, padding: 10, border: '1px solid #ccc' }}>
            <h4>Video Analysis Result</h4>
            <p>Total Frames: {videoResult.total_frames}</p>
            <p>Average People Count: {videoResult.average_people_count.toFixed(2)}</p>
            <p>Max People Count: {videoResult.max_people_count}</p>
            <p>Risk Level: <strong>{videoResult.risk_level}</strong></p>
          </div>
        )}
      </div>

      <h3>Zone Overview</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {zones.map((z) => (
          <ZoneCard key={z.id} zone={z} />
        ))}
      </div>

      <AlertPanel alerts={alerts} />
    </main>
  );
}
