import type { DashboardRange } from "@/lib/analytics/types";

export function EmptyDashboardState({
  range,
  timezone
}: {
  range: DashboardRange;
  timezone: string;
}) {
  return (
    <section className="empty-card empty-preview-card">
      <div className="status-stack">
        <div>
          <span className="eyebrow">Henüz tarama verisi yok</span>
          <h2 className="chart-title">Panel hazır, fakat seçilen aralık boş.</h2>
        </div>
        <p className="status-copy">
          <strong>POST /api/scan</strong> üzerinden en az bir herkese açık tarama event&apos;i gönderin ve
          giriş yaptığınız kullanıcının Supabase metadata&apos;sında eşleşen bir
          <strong> organization_id</strong> bulunduğundan emin olun.
        </p>
        <ul className="empty-list">
          <li>
            <span className="list-label">Aralık</span>
            {range === "30d" ? "Son 30 gün" : "Son 7 gün"}
          </li>
          <li>
            <span className="list-label">Saat dilimi</span>
            {timezone}
          </li>
          <li>
            <span className="list-label">Gerekli event akışı</span>
            herkese açık QR isteği -&gt; server route -&gt; Supabase scan_events
          </li>
        </ul>
      </div>
    </section>
  );
}
