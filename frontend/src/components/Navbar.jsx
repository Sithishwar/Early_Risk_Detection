import { NavLink } from "react-router-dom";
import useSystemStatus from "../hooks/useSystemStatus";
import StatusPill from "./StatusPill";

const links = [
  { to: "/dashboard", label: "Overview" },
  { to: "/alerts", label: "Alerts" },
];

function statusTone(up) {
  if (up === null) return "warn";
  return up ? "good" : "bad";
}
function statusLabel(name, up) {
  if (up === null) return `Checking ${name}…`;
  return up ? `${name} online` : `${name} offline`;
}

export default function Navbar() {
  const { backendUp, mlUp } = useSystemStatus();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,14,20,0.85)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", gap: 20, height: 58 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, letterSpacing: "-0.01em" }}>
          <span aria-hidden style={{ fontSize: 18 }}>🛰️</span>
          Crowd Risk Detection
        </div>

        <nav style={{ display: "flex", gap: 4 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              style={({ isActive }) => ({
                padding: "7px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? "var(--text)" : "var(--text-dim)",
                background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <StatusPill tone={statusTone(backendUp)}>{statusLabel("API", backendUp)}</StatusPill>
          <StatusPill tone={statusTone(mlUp)}>{statusLabel("ML service", mlUp)}</StatusPill>
        </div>
      </div>
    </header>
  );
}
