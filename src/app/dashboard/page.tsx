import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { DashboardFiltersBar } from "@/components/dashboard/filters-bar";
import { HourlyDistributionChart } from "@/components/dashboard/hourly-distribution-chart";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { QrPerformanceTable } from "@/components/dashboard/qr-performance-table";
import { ScansOverTimeChart } from "@/components/dashboard/scans-over-time-chart";
import { EmptyDashboardState } from "@/components/dashboard/states";
import { TopCitiesChart } from "@/components/dashboard/top-cities-chart";
import { TrendInsights } from "@/components/dashboard/trend-insights";
import { getDashboardAnalytics, getRangeLabel, normalizeFilters } from "@/lib/analytics/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const filters = normalizeFilters(searchParams);
  const analytics = await getDashboardAnalytics(filters);

  return (
    <main className="dashboard-page">
      <div className="shell dashboard-shell">
        <section className="brand-head">
          <div className="brand-lockup">
            <div className="brand-badge" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div>
              <span className="brand-title">QR Analytics</span>
              <p className="brand-subtitle">Filtrelenebilir analitik, trend ve QR performans gorunumu</p>
            </div>
          </div>
          <LogoutButton />
        </section>

        <DashboardFiltersBar analytics={analytics} />

        <section className="panel dashboard-hero-card">
          <div className="dashboard-hero-grid">
            <div className="dashboard-control-panel">
              <div className="control-stack">
                <div>
                  <span className="eyebrow">Analitik gorunumu</span>
                  <h1>Dashboard V2</h1>
                </div>

                <div className="stat-field-grid">
                  <article className="dashboard-field stat-field">
                    <span className="field-label">Secili aralik</span>
                    <strong>{getRangeLabel(analytics.filters.range)}</strong>
                  </article>
                  <article className="dashboard-field stat-field">
                    <span className="field-label">Toplam tarama</span>
                    <strong>{analytics.totalScans.toLocaleString()}</strong>
                  </article>
                  <article className="dashboard-field stat-field">
                    <span className="field-label">En yogun gun</span>
                    <strong>{analytics.busiestDay?.day || "--"}</strong>
                  </article>
                  <article className="dashboard-field stat-field">
                    <span className="field-label">En verimli saat</span>
                    <strong>{analytics.bestHour ? `${analytics.bestHour.hour}:00` : "--"}</strong>
                  </article>
                </div>

                <MetricsCards analytics={analytics} />
              </div>
            </div>

            <div className="dashboard-preview-panel">
              {analytics.totalScans === 0 ? (
                <EmptyDashboardState filters={analytics.filters} timezone={analytics.timezone} />
              ) : (
                <div className="preview-stack">
                  <div className="preview-surface">
                    <div className="preview-summary">
                      <span className="eyebrow">Canli ozet</span>
                      <p className="preview-primary-value">{analytics.totalScans.toLocaleString()}</p>
                      <p className="preview-copy">Secili filtrelere uyan toplam QR taramasi</p>
                    </div>
                    <div className="preview-pill-row">
                      <div className="preview-pill">
                        <span>Sehir lideri</span>
                        <strong>{analytics.topCities[0]?.city || "Veri yok"}</strong>
                      </div>
                      <div className="preview-pill">
                        <span>En iyi QR</span>
                        <strong>{analytics.topQr?.slug || "Veri yok"}</strong>
                      </div>
                    </div>
                  </div>
                  <TrendInsights analytics={analytics} />
                </div>
              )}
            </div>
          </div>
        </section>

        {analytics.totalScans > 0 ? (
          <>
            <section className="analytics-bottom-grid analytics-bottom-grid-wide">
              <ScansOverTimeChart points={analytics.scansOverTime} range={analytics.filters.range} />
              <TopCitiesChart rows={analytics.topCities} />
              <HourlyDistributionChart rows={analytics.hourlyDistribution} timezone={analytics.timezone} />
            </section>

            <section className="table-section">
              <QrPerformanceTable rows={analytics.qrPerformance} />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
