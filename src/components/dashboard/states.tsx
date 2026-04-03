import type { DashboardFilters } from "@/lib/analytics/types";

function formatRange(filters: DashboardFilters) {
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

export function EmptyDashboardState({
  filters,
  timezone
}: {
  filters: DashboardFilters;
  timezone: string;
}) {
  return (
    <section className="empty-card empty-preview-card">
      <div className="status-stack">
        <div>
          <span className="eyebrow">Henuz tarama verisi yok</span>
          <h2 className="chart-title">Panel hazir, fakat secili filtre sonuc vermedi.</h2>
        </div>
        <p className="status-copy">
          Farkli bir tarih araligi veya filtre deneyin. Gerekirse <strong>POST /api/scan</strong> uzerinden yeni
          event gonderip ayni tenant ile tekrar kontrol edin.
        </p>
        <ul className="empty-list">
          <li>
            <span className="list-label">Aralik</span>
            {formatRange(filters)}
          </li>
          <li>
            <span className="list-label">Saat dilimi</span>
            {timezone}
          </li>
          <li>
            <span className="list-label">Filtreler</span>
            QR, sehir, cihaz ve kaynak secimleri mevcut gorunumu daraltir.
          </li>
        </ul>
      </div>
    </section>
  );
}
