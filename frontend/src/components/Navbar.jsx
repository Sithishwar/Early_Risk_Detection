import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "12px", background: "#1e1e1e", color: "white" }}>
      <Link to="/dashboard" style={{ marginRight: 16, color: "white" }}>
        Dashboard
      </Link>
      <Link to="/alerts" style={{ color: "white" }}>
        Alerts
      </Link>
    </nav>
  );
}
