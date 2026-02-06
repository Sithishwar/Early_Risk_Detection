import { useEffect, useState } from "react";
import socket from "../services/socket";

export default function useLiveRisk() {
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const onZoneUpdate = (data) => setZones(data);
    const onAlert = (alert) =>
      setAlerts((prev) => [alert, ...prev].slice(0, 10));

    socket.on("zone_update", onZoneUpdate);
    socket.on("alert", onAlert);

    return () => {
      socket.off("zone_update", onZoneUpdate);
      socket.off("alert", onAlert);
    };
  }, []);

  return { zones, alerts };
}
