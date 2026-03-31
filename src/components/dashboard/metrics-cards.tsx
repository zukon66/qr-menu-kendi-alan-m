import type { DashboardAnalytics } from "@/lib/analytics/types";

export function MetricsCards({ analytics }: { analytics: DashboardAnalytics }) {
  const cityCount = analytics.topCities.length;
  const busiestHour = analytics.hourlyDistribution.reduce<{ hour: string; scans: number } | null>(
    (current, row) => {
      if (!current || row.scans > current.scans) {
        return row;
      }

      return current;
    },
    null
  );

  const averagePerDay =
    analytics.scansOverTime.length > 0
      ? Math.round(analytics.totalScans / analytics.scansOverTime.length)
      : 0;

  const cards = [
    {
      label: "Toplam tarama",
      value: analytics.totalScans.toLocaleString(),
      note: `${analytics.range === "30d" ? "Son 30 gün" : "Son 7 gün"}`
    },
    {
      label: "Görülen şehir",
      value: cityCount.toLocaleString(),
      note: cityCount > 0 ? "Boş şehir değerleri sıralamaya dahil edilmez." : "Henüz şehir kırılımı yok."
    },
    {
      label: "Günlük ortalama",
      value: averagePerDay.toLocaleString(),
      note: "Ham tarama event'lerinden türetilir"
    },
    {
      label: "En yoğun saat",
      value: busiestHour ? `${busiestHour.hour}:00` : "--",
      note: `${analytics.timezone} saat dilimine göre`
    }
  ];

  return (
    <div className="metrics-grid compact-metrics-grid">
      {cards.map((card) => (
        <article className="metric-card compact-metric-card" key={card.label}>
          <span className="metric-label">{card.label}</span>
          <p className="metric-value">{card.value}</p>
          <p className="metric-note">{card.note}</p>
        </article>
      ))}
    </div>
  );
}
