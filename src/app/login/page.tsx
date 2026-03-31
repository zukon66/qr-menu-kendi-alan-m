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
    <main className="shell">
      <section className="panel auth-card">
        <div className="status-stack">
          <div>
            <span className="eyebrow">Supabase kimlik doğrulama</span>
            <h1>Panelinize giriş yapın</h1>
          </div>
          <p className="status-copy">
            <strong>raw_user_meta_data</strong> içinde <strong>organization_id</strong> ve
            tercihen <strong>organization_timezone</strong> bulunan aynı Supabase kullanıcısıyla
            giriş yapın.
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
