import { randomUUID } from "node:crypto";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables for demo seed.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const tenantId = randomUUID();
const timezone = "Europe/Istanbul";
const email = `analytics-demo-${Date.now()}@example.com`;
const password = `Demo-${Date.now()}-Aa1!`;

const qrCodes = [
  {
    tenant_id: tenantId,
    slug: `menu-main-${Date.now()}`,
    destination_url: "https://example.com/menu/main",
    is_active: true
  },
  {
    tenant_id: tenantId,
    slug: `campaign-lunch-${Date.now()}`,
    destination_url: "https://example.com/menu/lunch",
    is_active: true
  },
  {
    tenant_id: tenantId,
    slug: `table-takeaway-${Date.now()}`,
    destination_url: "https://example.com/menu/takeaway",
    is_active: true
  }
];

const cityProfiles = [
  { city: "Istanbul", country: "TR", weight: 32 },
  { city: "Ankara", country: "TR", weight: 20 },
  { city: "Izmir", country: "TR", weight: 17 },
  { city: "Bursa", country: "TR", weight: 12 },
  { city: "Antalya", country: "TR", weight: 10 },
  { city: null, country: "TR", weight: 9 }
];

const sources = [
  { value: "masa-qr", weight: 32 },
  { value: "vitrin-afis", weight: 20 },
  { value: "instagram-bio", weight: 18 },
  { value: "paket-servis", weight: 16 },
  { value: "google-maps", weight: 14 }
];

const deviceTypes = [
  { value: "mobile", weight: 72 },
  { value: "tablet", weight: 8 },
  { value: "desktop", weight: 20 }
];

const userAgents = {
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
  tablet: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)",
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
};

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;

  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickHour(dayOffset) {
  if (dayOffset <= 7) {
    return weightedPick([
      { weight: 12, value: 9 },
      { weight: 18, value: 12 },
      { weight: 22, value: 13 },
      { weight: 16, value: 15 },
      { weight: 20, value: 19 },
      { weight: 12, value: 21 }
    ]).value;
  }

  return weightedPick([
    { weight: 10, value: 10 },
    { weight: 18, value: 12 },
    { weight: 16, value: 14 },
    { weight: 18, value: 18 },
    { weight: 22, value: 20 },
    { weight: 16, value: 22 }
  ]).value;
}

function createTimestamp(dayOffset) {
  const now = new Date();
  const target = new Date(now);
  target.setUTCDate(now.getUTCDate() - dayOffset);
  target.setUTCHours(pickHour(dayOffset), randomInt(0, 59), randomInt(0, 59), 0);
  return target.toISOString();
}

function createScanEvents(qrCodeRows) {
  const totalEvents = 180;
  const events = [];

  for (let index = 0; index < totalEvents; index += 1) {
    const dayOffset = index < 110 ? randomInt(0, 6) : randomInt(7, 29);
    const location = weightedPick(cityProfiles);
    const source = weightedPick(sources);
    const device = weightedPick(deviceTypes);
    const qrCode = qrCodeRows[randomInt(0, qrCodeRows.length - 1)];

    events.push({
      tenant_id: tenantId,
      qr_code_id: qrCode.id,
      scanned_at: createTimestamp(dayOffset),
      city: location.city,
      country: location.country,
      device_type: device.value,
      source: source.value,
      user_agent: userAgents[device.value]
    });
  }

  return events;
}

async function createDemoUser() {
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
    throw new Error(`Failed to create demo user: ${error.message}`);
  }

  return data.user;
}

async function createQrCodes() {
  const { data, error } = await admin.from("qr_codes").insert(qrCodes).select("id, slug");

  if (error) {
    throw new Error(`Failed to seed qr_codes: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("No qr_codes rows were created.");
  }

  return data;
}

async function createScanRows(qrCodeRows) {
  const rows = createScanEvents(qrCodeRows);
  const { error } = await admin.from("scan_events").insert(rows);

  if (error) {
    throw new Error(`Failed to seed scan_events: ${error.message}`);
  }

  return rows.length;
}

const user = await createDemoUser();
const qrCodeRows = await createQrCodes();
const scanCount = await createScanRows(qrCodeRows);

console.log(
  JSON.stringify(
    {
      ok: true,
      tenantId,
      timezone,
      user: {
        id: user.id,
        email,
        password
      },
      qrCodes: qrCodeRows,
      scanCount
    },
    null,
    2
  )
);
