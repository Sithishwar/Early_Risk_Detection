import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RiskTrendChart({ data }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="card" style={{ height: 320 }}>
      <div className="card-header">
        <p className="card-title">Risk trend</p>
        <span className="pill">
          <span className={`dot ${hasData ? "good" : "warn"}`} />
          {hasData ? "Live" : "No data yet"}
        </span>
      </div>

      {!hasData ? (
        <p className="muted" style={{ margin: 0 }}>
          Select a zone with activity to see its risk score over time.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />
            <Tooltip
              contentStyle={{
                background: "#12161f",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.75)" }}
              formatter={(value, name) => [
                Number(value).toFixed(2),
                name === "risk" ? "Risk score" : name,
              ]}
            />
            <Line
              type="monotone"
              dataKey="risk"
              stroke="#e74c3c"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
