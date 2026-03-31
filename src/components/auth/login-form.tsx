"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

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
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="list-label">E-posta</span>
        <input autoComplete="email" name="email" placeholder="ornek@mail.com" type="email" />
      </label>
      <label className="field">
        <span className="list-label">Şifre</span>
        <input autoComplete="current-password" name="password" placeholder="Şifre" type="password" />
      </label>
      {error ? <p className="auth-error">{error}</p> : null}
      <button className="button-link" disabled={pending} type="submit">
        {pending ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>
    </form>
  );
}
