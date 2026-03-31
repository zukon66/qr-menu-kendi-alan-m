import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">QR Analytics MVP</span>
        <h1>Tarama verisini net bir akışla yönetin.</h1>
        <p>
          Bu proje, minimal bir Next.js 14 uygulaması ve Supabase event modeliyle başlar.
          Supabase bilgilerini ve migration&apos;ları bağladıktan sonra paneli kullanabilirsiniz.
        </p>
        <div className="hero-actions">
          <Link className="button-link" href="/dashboard">
            Paneli aç
          </Link>
          <Link className="button-link" href="/login">
            Giriş yap
          </Link>
          <span className="pill">Herkese açık tarama endpoint&apos;i: POST /api/scan</span>
        </div>
      </section>
    </main>
  );
}
