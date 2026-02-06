export default function AlertPanel({ alerts }) {
  if (!alerts.length) return <p>No active alerts</p>;

  return (
    <section>
      <h3>Critical Alerts</h3>
      <ul style={{ paddingLeft: 20 }}>
        {alerts.map((alert, i) => (
          <li key={i} style={{ color: "#e74c3c" }}>
            {alert.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
