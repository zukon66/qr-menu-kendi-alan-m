"use client";

import type { TopCityRow } from "@/lib/analytics/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TopCitiesChart({ rows }: { rows: TopCityRow[] }) {
  return (
    <article className="panel chart-card secondary-chart-card">
      <div className="chart-head">
        <div>
          <span className="chart-label">Konum</span>
          <h2 className="chart-title">En cok taranan sehirler</h2>
        </div>
        <p className="panel-copy">Bos sehir degerleri siralamaya dahil edilmez.</p>
      </div>
      <div className="chart-shell">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={rows} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid horizontal={false} stroke="rgba(110, 89, 247, 0.12)" />
            <XAxis allowDecimals={false} stroke="#9b98a6" tickLine={false} type="number" />
            <YAxis dataKey="city" stroke="#9b98a6" tickLine={false} type="category" width={90} />
            <Tooltip />
            <Bar dataKey="scans" fill="#6e59f7" radius={[0, 12, 12, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
