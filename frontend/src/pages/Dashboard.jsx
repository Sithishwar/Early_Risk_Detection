import useLiveRisk from "../hooks/useLiveRisk";
import HeatMap from "../components/HeatMap";
import AlertPanel from "../components/AlertPanel";
import ZoneCard from "../components/ZoneCard";

export default function Dashboard() {
  const { zones, alerts } = useLiveRisk();

  return (
    <main style={{ padding: 20 }}>
      <h2>Early Risk Detection Dashboard</h2>

      <HeatMap zones={zones} />

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
