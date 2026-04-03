import type { DashboardAnalytics } from "@/lib/analytics/types";

function formatPercent(value: number | null) {
  if (value === null) {
    return "--";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function TrendInsights({ analytics }: { analytics: DashboardAnalytics }) {
  const cards = [
    {
      label: "Onceki doneme gore",
      value: formatPercent(analytics.totalChangePct),
      note:
        analytics.previousTotalScans > 0
          ? `${analytics.previousTotalScans.toLocaleString()} onceki donemin toplami`
          : "Karsilastirma icin onceki donemde veri yok"
    },
    {
      label: "En hizli yukselen sehir",
      value: analytics.fastestGrowingCity?.city || "--",
      note: analytics.fastestGrowingCity
        ? `${formatPercent(analytics.fastestGrowingCity.changePct)} artis`
        : "Yeterli onceki donem sehir verisi yok"
    },
    {
      label: "En yogun gun",
      value: analytics.busiestDay?.day || "--",
      note: analytics.busiestDay ? `${analytics.busiestDay.scans.toLocaleString()} tarama` : "Secili aralikta veri yok"
    },
    {
      label: "En verimli saat",
      value: analytics.bestHour ? `${analytics.bestHour.hour}:00` : "--",
      note: analytics.bestHour ? `${analytics.bestHour.scans.toLocaleString()} tarama` : "Saatlik veri yok"
    }
  ];

  return (
    <section className="trend-grid">
      {cards.map((card) => (
        <article className="panel trend-card" key={card.label}>
          <span className="metric-label">{card.label}</span>
          <p className="metric-value">{card.value}</p>
          <p className="metric-note">{card.note}</p>
        </article>
      ))}
    </section>
  );
}
