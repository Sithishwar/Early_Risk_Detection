/** Reusable "<dot> Label" pill, e.g. connection or service health. */
export default function StatusPill({ tone = "warn", children }) {
  return (
    <span className="pill">
      <span className={`dot ${tone}`} />
      {children}
    </span>
  );
}
