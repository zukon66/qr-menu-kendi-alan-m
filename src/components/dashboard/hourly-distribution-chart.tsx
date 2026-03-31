"use client";

import type { HourlyDistributionRow } from "@/lib/analytics/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function HourlyDistributionChart({
  rows,
  timezone
}: {
  rows: HourlyDistributionRow[];
  timezone: string;
}) {
  return (
    <article className="panel chart-card secondary-chart-card">
      <div className="chart-head">
        <div>
          <span className="chart-label">Saatlik desen</span>
          <h2 className="chart-title">Saatlik dağılım</h2>
        </div>
        <p className="panel-copy">{timezone}</p>
      </div>
      <div className="chart-shell">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={rows}>
            <CartesianGrid stroke="rgba(110, 89, 247, 0.12)" vertical={false} />
            <XAxis dataKey="hour" stroke="#9b98a6" tickLine={false} />
            <YAxis allowDecimals={false} stroke="#9b98a6" tickLine={false} width={36} />
            <Tooltip />
            <Bar dataKey="scans" fill="#2b2b31" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
