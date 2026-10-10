import { useEffect, useMemo, useRef, useState } from "react";
import socket from "../services/socket";
import { api } from "../services/api";

const HISTORY_POINTS = 30;

function timeLabel(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/**
 * Single source of truth for live dashboard state: zones (from REST on
 * load + Socket.IO "zone_update" after), alerts (REST + "alert" events),
 * a rolling per-zone risk trend, and the connection status.
 */
export default function useLiveRisk() {
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const [zoneHistory, setZoneHistory] = useState({});
  const historyRef = useRef({});

  useEffect(() => {
    // Seed from REST so the dashboard isn't empty before the first push.
    api.getZones().then(setZones).catch(() => {});
    api.getAlerts().then(setAlerts).catch(() => {});

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onZoneUpdate = (data) => {
      setZones(Array.isArray(data) ? data : []);
      const now = Date.now();
      for (const z of data || []) {
        const list = historyRef.current[z.id] || [];
        const next = [...list, { label: timeLabel(now), risk: Number(z.risk ?? 0) }].slice(-HISTORY_POINTS);
        historyRef.current[z.id] = next;
      }
      setZoneHistory({ ...historyRef.current });
    };

    const onAlert = (alert) => setAlerts((prev) => [alert, ...prev].slice(0, 50));

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("zone_update", onZoneUpdate);
    socket.on("alert", onAlert);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("zone_update", onZoneUpdate);
      socket.off("alert", onAlert);
    };
  }, []);

  const topZone = useMemo(() => {
    if (!zones.length) return null;
    return zones.reduce((best, z) => (Number(z.risk) > Number(best.risk) ? z : best), zones[0]);
  }, [zones]);

  const totalPeople = useMemo(
    () => zones.reduce((sum, z) => sum + Number(z.count || 0), 0),
    [zones]
  );

  return { zones, alerts, zoneHistory, topZone, totalPeople, connected };
}
