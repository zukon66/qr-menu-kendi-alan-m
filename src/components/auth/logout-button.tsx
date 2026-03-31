"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleLogout() {
    const supabase = createClientSupabaseClient();
    await supabase.auth.signOut();

    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <button className="button-link logout-button" disabled={pending} onClick={handleLogout} type="button">
      {pending ? "Çıkış yapılıyor..." : "Çıkış yap"}
    </button>
  );
}
