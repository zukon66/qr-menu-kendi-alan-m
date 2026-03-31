import { redirect } from "next/navigation";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { LogoutButton } from "@/components/auth/logout-button";
import { HourlyDistributionChart } from "@/components/dashboard/hourly-distribution-chart";
import { ScansOverTimeChart } from "@/components/dashboard/scans-over-time-chart";
import { TopCitiesChart } from "@/components/dashboard/top-cities-chart";
import { EmptyDashboardState } from "@/components/dashboard/states";
import { getDashboardAnalytics, normalizeRange } from "@/lib/analytics/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DashboardAnalytics } from "@/lib/analytics/types";

type DashboardPageProps = {
  searchParams?: {
    range?: string;
  };
};

export const dynamic = "force-dynamic";

function getBusiestHour(analytics: DashboardAnalytics) {
  return analytics.hourlyDistribution.reduce<{ hour: string; scans: number } | null>((current, row) => {
    if (!current || row.scans > current.scans) {
      return row;
    }

    return current;
  }, null);
}

function getTopCity(analytics: DashboardAnalytics) {
  return analytics.topCities[0] ?? null;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const range = normalizeRange(searchParams?.range);
  const analytics = await getDashboardAnalytics(range);
  const busiestHour = getBusiestHour(analytics);
  const topCity = getTopCity(analytics);
  const recentActivity = analytics.scansOverTime.slice(-5).reverse();

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
              <p className="brand-subtitle">İşletmeniz için anlık tarama içgörüleri</p>
            </div>
          </div>
          <LogoutButton />
        </section>

        <section className="panel dashboard-hero-card">
          <div className="dashboard-hero-grid">
            <div className="dashboard-control-panel">
              <div className="control-stack">
                <div>
                  <span className="eyebrow">Analitik görünümü</span>
                  <h1>Dashboard</h1>
                </div>
                <label className="dashboard-field">
                  <span className="field-label">Veri aralığı</span>
                  <form className="range-form range-form-wide" action="/dashboard">
                    <button aria-pressed={range === "7d"} name="range" type="submit" value="7d">
                      Son 7 gün
                    </button>
                    <button aria-pressed={range === "30d"} name="range" type="submit" value="30d">
                      Son 30 gün
                    </button>
                  </form>
                </label>

                <div className="stat-field-grid">
                  <article className="dashboard-field stat-field">
                    <span className="field-label">Toplam tarama</span>
                    <strong>{analytics.totalScans.toLocaleString()}</strong>
                  </article>
                  <article className="dashboard-field stat-field">
                    <span className="field-label">Görülen şehir</span>
                    <strong>{analytics.topCities.length.toLocaleString()}</strong>
                  </article>
                  <article className="dashboard-field stat-field">
                    <span className="field-label">En yoğun saat</span>
                    <strong>{busiestHour ? `${busiestHour.hour}:00` : "--"}</strong>
                  </article>
                  <article className="dashboard-field stat-field">
                    <span className="field-label">Saat dilimi</span>
                    <strong>{analytics.timezone}</strong>
                  </article>
                </div>

                <MetricsCards analytics={analytics} />
              </div>
            </div>

            <div className="dashboard-preview-panel">
              {analytics.totalScans === 0 ? (
                <EmptyDashboardState range={range} timezone={analytics.timezone} />
              ) : (
                <div className="preview-stack">
                  <div className="preview-surface">
                    <div className="preview-summary">
                      <span className="eyebrow">Canlı özet</span>
                      <p className="preview-primary-value">{analytics.totalScans.toLocaleString()}</p>
                      <p className="preview-copy">Bu aralıkta kaydedilen toplam QR taraması</p>
                    </div>
                    <div className="preview-pill-row">
                      <div className="preview-pill">
                        <span>Şehir lideri</span>
                        <strong>{topCity ? topCity.city : "Veri yok"}</strong>
                      </div>
                      <div className="preview-pill">
                        <span>Yoğun saat</span>
                        <strong>{busiestHour ? `${busiestHour.hour}:00` : "--"}</strong>
                      </div>
                    </div>
                  </div>
                  <ScansOverTimeChart points={analytics.scansOverTime} range={range} />
                </div>
              )}
            </div>
          </div>
        </section>

        {analytics.totalScans > 0 ? (
          <>
            <section className="recent-activity-section">
              <div className="section-copy">
                <span className="eyebrow">Son hareketler</span>
                <h2 className="section-title">En yeni tarama yoğunlukları</h2>
              </div>
              <div className="recent-list">
                {recentActivity.map((item) => (
                  <article className="recent-list-item" key={item.day}>
                    <div className="recent-avatar" aria-hidden="true">
                      {item.scans}
                    </div>
                    <div className="recent-meta">
                      <strong>{item.day}</strong>
                      <span>{item.scans} tarama kaydı</span>
                    </div>
                    <div className="recent-actions">
                      <span className="recent-badge">{range === "30d" ? "30 Gün" : "7 Gün"}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="analytics-bottom-grid">
              <TopCitiesChart rows={analytics.topCities} />
              <HourlyDistributionChart rows={analytics.hourlyDistribution} timezone={analytics.timezone} />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
