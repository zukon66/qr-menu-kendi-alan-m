"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

const DEMO_EMAIL = "analytics-demo-1775227248145@example.com";
const DEMO_PASSWORD = "Demo-1775227248145-Aa1!";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError("E-posta ve şifre zorunludur.");
      return;
    }

    const supabase = createClientSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    startTransition(() => {
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="auth-form login-form" onSubmit={handleSubmit}>
      <div className="login-demo-box">
        <span className="login-field-inline">Test hesabı</span>
        <p className="login-demo-line">
          <strong>Mail:</strong> {DEMO_EMAIL}
        </p>
        <p className="login-demo-line">
          <strong>Şifre:</strong> {DEMO_PASSWORD}
        </p>
      </div>
      <label className="field">
        <span className="login-field-inline">Email</span>
        <input
          autoComplete="email"
          defaultValue={DEMO_EMAIL}
          name="email"
          placeholder="E-posta"
          type="email"
        />
      </label>
      <label className="field">
        <span className="login-field-inline">Password</span>
        <input
          autoComplete="current-password"
          defaultValue={DEMO_PASSWORD}
          name="password"
          placeholder="Şifre"
          type="password"
        />
      </label>
      {error ? <p className="auth-error">{error}</p> : null}
      <button className="button-link login-submit" disabled={pending} type="submit">
        {pending ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>
    </form>
  );
}
