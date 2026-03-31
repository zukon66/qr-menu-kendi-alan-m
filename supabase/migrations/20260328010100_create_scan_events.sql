create table if not exists public.scan_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  qr_code_id uuid not null references public.qr_codes(id) on delete cascade,
  scanned_at timestamptz not null,
  city text null,
  country text null,
  device_type text null,
  source text null,
  user_agent text null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.scan_events enable row level security;
