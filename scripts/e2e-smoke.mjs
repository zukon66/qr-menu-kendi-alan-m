import { randomUUID } from "node:crypto";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const appUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables for smoke test.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const tenantId = process.env.E2E_TENANT_ID || randomUUID();
const slug = process.env.E2E_QR_SLUG || `smoke-${Date.now()}`;
const email = process.env.E2E_USER_EMAIL || `analytics-smoke-${Date.now()}@example.com`;
const password = process.env.E2E_USER_PASSWORD || `Smoke-${Date.now()}-Aa1!`;
const timezone = process.env.E2E_TIMEZONE || "Europe/Istanbul";

async function ensureUser() {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      organization_id: tenantId,
      organization_timezone: timezone
    }
  });

  if (error) {
    throw new Error(`Failed to create smoke-test user: ${error.message}`);
  }

  return data.user;
}

async function seedQrCode() {
  const { error } = await admin.from("qr_codes").insert({
    tenant_id: tenantId,
    slug,
    destination_url: "https://example.com/smoke-test",
    is_active: true
  });

  if (error) {
    throw new Error(`Failed to insert qr_codes seed row: ${error.message}`);
  }
}

async function sendScan() {
  const response = await fetch(`${appUrl}/api/scan`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "analytics-dashboard-smoke-test/1.0"
    },
    body: JSON.stringify({
      qrCodeSlug: slug,
      city: "Istanbul",
      country: "TR",
      source: "smoke-test"
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Scan endpoint failed with ${response.status}: ${body}`);
  }
}

async function verifyScan() {
  const { count, error } = await admin
    .from("scan_events")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  if (error) {
    throw new Error(`Failed to verify scan_events rows: ${error.message}`);
  }

  if (!count) {
    throw new Error("Smoke test did not create any scan_events rows.");
  }
}

const user = await ensureUser();
await seedQrCode();
await sendScan();
await verifyScan();

console.log(
  JSON.stringify(
    {
      ok: true,
      tenantId,
      slug,
      email,
      password,
      userId: user.id,
      timezone
    },
    null,
    2
  )
);
