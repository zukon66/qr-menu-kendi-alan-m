"use client";

import type { DashboardRange, ScansOverTimePoint } from "@/lib/analytics/types";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ScansOverTimeChart({
  points,
  range
}: {
  points: ScansOverTimePoint[];
  range: DashboardRange;
}) {
  return (
    <article className="panel chart-card hero-chart-card">
      <div className="chart-head">
        <div>
          <span className="chart-label">Zaman serisi</span>
          <h2 className="chart-title">Zamana göre taramalar</h2>
        </div>
        <p className="panel-copy">{range === "30d" ? "Son 30 gün" : "Son 7 gün"}</p>
      </div>
      <div className="chart-shell">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={points} margin={{ left: -18, right: 8, top: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="scanGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#6e59f7" stopOpacity={0.42} />
                <stop offset="95%" stopColor="#6e59f7" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(110, 89, 247, 0.12)" vertical={false} />
            <XAxis dataKey="day" stroke="#9b98a6" tickLine={false} />
            <YAxis allowDecimals={false} stroke="#9b98a6" tickLine={false} width={36} />
            <Tooltip />
            <Area
              dataKey="scans"
              fill="url(#scanGradient)"
              stroke="#6e59f7"
              strokeWidth={2.5}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
