create extension if not exists pgcrypto;

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  slug text not null unique,
  destination_url text null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.qr_codes enable row level security;
