import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ScanPayload = {
  qrCodeSlug?: string;
  city?: string | null;
  country?: string | null;
  source?: string | null;
  scannedAt?: string | null;
};

function cleanNullableText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function inferDeviceType(userAgent: string | null) {
  if (!userAgent) {
    return null;
  }

  const normalized = userAgent.toLowerCase();

  if (/mobile|iphone|android/.test(normalized)) {
    return "mobile";
  }

  if (/ipad|tablet/.test(normalized)) {
    return "tablet";
  }

  return "desktop";
}

export async function POST(request: Request) {
  let payload: ScanPayload;

  try {
    payload = (await request.json()) as ScanPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const qrCodeSlug = payload.qrCodeSlug?.trim();

  if (!qrCodeSlug) {
    return NextResponse.json({ error: "qrCodeSlug is required." }, { status: 400 });
  }

  const adminClient = createAdminSupabaseClient();
  const { data: qrCode, error: qrError } = await adminClient
    .from("qr_codes")
    .select("id, tenant_id, is_active")
    .eq("slug", qrCodeSlug)
    .maybeSingle();

  if (qrError) {
    return NextResponse.json({ error: "Failed to resolve QR code." }, { status: 500 });
  }

  if (!qrCode || !qrCode.is_active) {
    return NextResponse.json({ error: "QR code not found or inactive." }, { status: 404 });
  }

  const scannedAt =
    payload.scannedAt && !Number.isNaN(Date.parse(payload.scannedAt))
      ? new Date(payload.scannedAt).toISOString()
      : new Date().toISOString();

  const userAgent = request.headers.get("user-agent");

  const { error: insertError } = await adminClient.from("scan_events").insert({
    tenant_id: qrCode.tenant_id,
    qr_code_id: qrCode.id,
    scanned_at: scannedAt,
    city: cleanNullableText(payload.city),
    country: cleanNullableText(payload.country),
    device_type: inferDeviceType(userAgent),
    source: cleanNullableText(payload.source),
    user_agent: cleanNullableText(userAgent)
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to store scan event." }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      qrCodeSlug,
      scannedAt
    },
    { status: 201 }
  );
}
