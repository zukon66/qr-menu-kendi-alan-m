create index if not exists scan_events_tenant_scanned_at_idx
  on public.scan_events (tenant_id, scanned_at desc);

create index if not exists scan_events_tenant_city_idx
  on public.scan_events (tenant_id, city);

create index if not exists scan_events_tenant_qr_scanned_at_idx
  on public.scan_events (tenant_id, qr_code_id, scanned_at desc);

create or replace function public.request_organization_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() -> 'user_metadata' ->> 'organization_id', '')::uuid
$$;

create policy "organization members can read qr codes"
on public.qr_codes
for select
using (tenant_id = public.request_organization_id());

create policy "organization members can read scan events"
on public.scan_events
for select
using (tenant_id = public.request_organization_id());

create or replace function public.get_scans_over_time(
  p_tenant_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  bucket_date date,
  scan_count bigint
)
language sql
security invoker
stable
as $$
  select
    date_trunc('day', scanned_at)::date as bucket_date,
    count(*)::bigint as scan_count
  from public.scan_events
  where tenant_id = p_tenant_id
    and scanned_at >= p_from
    and scanned_at <= p_to
  group by 1
  order by 1 asc
$$;

create or replace function public.get_top_cities(
  p_tenant_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_limit integer default 5
)
returns table (
  city text,
  scan_count bigint
)
language sql
security invoker
stable
as $$
  select
    city,
    count(*)::bigint as scan_count
  from public.scan_events
  where tenant_id = p_tenant_id
    and scanned_at >= p_from
    and scanned_at <= p_to
    and city is not null
  group by city
  order by scan_count desc, city asc
  limit p_limit
$$;

create or replace function public.get_hourly_distribution(
  p_tenant_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_timezone text
)
returns table (
  hour_of_day integer,
  scan_count bigint
)
language sql
security invoker
stable
as $$
  select
    extract(hour from scanned_at at time zone p_timezone)::integer as hour_of_day,
    count(*)::bigint as scan_count
  from public.scan_events
  where tenant_id = p_tenant_id
    and scanned_at >= p_from
    and scanned_at <= p_to
  group by 1
  order by 1 asc
$$;
