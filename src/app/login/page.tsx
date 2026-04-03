import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="login-page">
      <div className="login-spark login-spark-left" aria-hidden="true" />
      <div className="login-spark login-spark-right" aria-hidden="true" />
      <section className="login-centered-card" aria-label="Giriş formu">
        <div className="login-top">
          <span className="login-card-kicker">QR Analytics MVP</span>
          <h1>Giriş Yap</h1>
        </div>
        <div className="login-body">
          <LoginForm />
          <p className="login-helper">Şifremi Unuttum</p>
        </div>
        <div className="login-footer">Hesabın yok mu? Kayıt Ol</div>
      </section>
    </main>
  );
}
