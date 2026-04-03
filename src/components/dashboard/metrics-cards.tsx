import type { DashboardAnalytics } from "@/lib/analytics/types";

function formatRange(filters: DashboardAnalytics["filters"]) {
  if (filters.range === "today") {
    return "Bugun";
  }

  if (filters.range === "30d") {
    return "Son 30 gun";
  }

  if (filters.range === "custom") {
    return filters.startDate && filters.endDate ? `${filters.startDate} - ${filters.endDate}` : "Ozel aralik";
  }

  return "Son 7 gun";
}

export function MetricsCards({ analytics }: { analytics: DashboardAnalytics }) {
  const cards = [
    {
      label: "Toplam tarama",
      value: analytics.totalScans.toLocaleString(),
      note: formatRange(analytics.filters)
    },
    {
      label: "En cok sehirler",
      value: analytics.topCities.length.toLocaleString(),
      note: "Bos sehir degerleri siralamaya dahil edilmez."
    },
    {
      label: "En iyi QR",
      value: analytics.topQr?.slug || "--",
      note: analytics.topQr ? `${analytics.topQr.scans.toLocaleString()} tarama` : "Secili filtrede QR verisi yok"
    },
    {
      label: "Saat dilimi",
      value: analytics.timezone,
      note: analytics.bestHour ? `En verimli saat ${analytics.bestHour.hour}:00` : "Saatlik veri bekleniyor"
    }
  ];

  return (
    <div className="metrics-grid compact-metrics-grid">
      {cards.map((card) => (
        <article className="metric-card compact-metric-card" key={card.label}>
          <span className="metric-label">{card.label}</span>
          <p className="metric-value metric-value-sm">{card.value}</p>
          <p className="metric-note">{card.note}</p>
        </article>
      ))}
    </div>
  );
}
