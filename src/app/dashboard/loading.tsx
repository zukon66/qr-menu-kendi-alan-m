export default function DashboardLoading() {
  return (
    <main className="shell">
      <section className="dashboard-head">
        <div>
          <span className="eyebrow">Organizasyon analitiği</span>
          <h1>Panel</h1>
          <p>Tenant kapsamlı tarama özetleri yükleniyor.</p>
        </div>
      </section>
      <section className="loading-grid">
        <div className="metrics-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="skeleton" key={index} />
          ))}
        </div>
        <div className="chart-grid">
          <div className="skeleton" />
          <div className="chart-stack">
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        </div>
      </section>
    </main>
  );
}
