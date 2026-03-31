"use client";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell">
      <section className="panel error-card">
        <span className="eyebrow">Panel hatası</span>
        <h1>Analitik verisi yüklenemedi</h1>
        <p className="status-copy">
          {error.message || "Analitik verisi okunurken beklenmeyen bir hata oluştu."}
        </p>
        <div className="hero-actions">
          <button className="button-link" onClick={reset} type="button">
            Tekrar dene
          </button>
        </div>
      </section>
    </main>
  );
}
