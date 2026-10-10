import { useEffect, useState } from "react";
import { api } from "../services/api";

const POLL_MS = 15000;

/** Polls backend + ML service health so the navbar can show live status. */
export default function useSystemStatus() {
  const [backendUp, setBackendUp] = useState(null); // null = unknown yet
  const [mlUp, setMlUp] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        await api.getHealth();
        if (!cancelled) setBackendUp(true);
      } catch {
        if (!cancelled) setBackendUp(false);
      }
      try {
        const res = await api.getMlHealth();
        if (!cancelled) setMlUp(Boolean(res?.ok));
      } catch {
        if (!cancelled) setMlUp(false);
      }
    }

    check();
    const id = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { backendUp, mlUp };
}
