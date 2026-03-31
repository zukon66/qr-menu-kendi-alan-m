# QR Analytics Dashboard MVP

This app is a greenfield Next.js 14 dashboard for QR scan analytics backed by Supabase.

## Stack

- Next.js 14 App Router
- TypeScript
- Supabase SSR and database
- Recharts

## Environment variables

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Apply Supabase migrations in `supabase/migrations`.

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000/dashboard`.

## Auth and tenant assumptions

- The dashboard expects an authenticated Supabase user.
- `organization_id` and optional `organization_timezone` are read from `user_metadata`.
- Example metadata:

```json
{
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "organization_timezone": "Europe/Istanbul"
}
```

## Public scan ingestion

`POST /api/scan`

Example request:

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{
    "qrCodeSlug": "summer-campaign",
    "city": "Istanbul",
    "country": "TR",
    "source": "poster"
  }'
```

The route resolves the QR code record, derives the organization tenant, and writes an append-only `scan_events` row.

## Verification checklist

1. Insert at least one `qr_codes` row with a valid `tenant_id` and `slug`.
2. Hit `POST /api/scan` with that slug and verify a new row in `scan_events`.
3. Sign in as a user whose `organization_id` matches the inserted tenant.
4. Open `/dashboard` and confirm:
   - total scans matches row count for the selected range
   - scans over time renders daily buckets
   - top cities excludes null cities
   - hourly distribution uses the user timezone from metadata

## Notes

- Raw scan data is stored in UTC.
- City and country are nullable and never fabricated.
- Dashboard charts are derived from raw events, not precomputed aggregates.
