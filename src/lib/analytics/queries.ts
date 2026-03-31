import type {
  DashboardAnalytics,
  DashboardRange,
  HourlyDistributionRow,
  ScansOverTimePoint,
  TopCityRow
} from "@/lib/analytics/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type UserMetadata = {
  organization_id?: string;
  organization_timezone?: string;
};

type RpcDayRow = {
  bucket_date: string;
  scan_count: number | string;
};

type RpcCityRow = {
  city: string;
  scan_count: number | string;
};

type RpcHourRow = {
  hour_of_day: number | string;
  scan_count: number | string;
};

export function normalizeRange(range: string | undefined): DashboardRange {
  return range === "30d" ? "30d" : "7d";
}

function numberFromUnknown(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getRangeStart(range: DashboardRange) {
  const now = new Date();
  const days = range === "30d" ? 30 : 7;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function getOrganizationContext(metadata: UserMetadata | undefined) {
  const organizationId = metadata?.organization_id;

  if (!organizationId) {
    throw new Error("Signed-in user is missing user_metadata.organization_id.");
  }

  return {
    organizationId,
    timezone: metadata?.organization_timezone || "UTC"
  };
}

export async function getDashboardAnalytics(range: DashboardRange): Promise<DashboardAnalytics> {
  const supabase = createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Unable to resolve Supabase user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error("Dashboard requires an authenticated Supabase user.");
  }

  const { organizationId, timezone } = getOrganizationContext(authData.user.user_metadata as UserMetadata);
  const from = getRangeStart(range);
  const to = new Date().toISOString();

  const [
    { count, error: countError },
    { data: scansRows, error: scansError },
    { data: cityRows, error: cityError },
    { data: hourlyRows, error: hourlyError }
  ] = await Promise.all([
    supabase
      .from("scan_events")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", organizationId)
      .gte("scanned_at", from)
      .lte("scanned_at", to),
    supabase.rpc("get_scans_over_time", {
      p_from: from,
      p_tenant_id: organizationId,
      p_to: to
    }),
    supabase.rpc("get_top_cities", {
      p_from: from,
      p_limit: 5,
      p_tenant_id: organizationId,
      p_to: to
    }),
    supabase.rpc("get_hourly_distribution", {
      p_from: from,
      p_tenant_id: organizationId,
      p_timezone: timezone,
      p_to: to
    })
  ]);

  if (countError) {
    throw new Error(`Failed to count scans: ${countError.message}`);
  }

  if (scansError) {
    throw new Error(`Failed to read scans over time: ${scansError.message}`);
  }

  if (cityError) {
    throw new Error(`Failed to read top cities: ${cityError.message}`);
  }

  if (hourlyError) {
    throw new Error(`Failed to read hourly distribution: ${hourlyError.message}`);
  }

  const scansOverTime: ScansOverTimePoint[] = ((scansRows as RpcDayRow[] | null) || []).map((row) => ({
    day: row.bucket_date,
    scans: numberFromUnknown(row.scan_count)
  }));

  const topCities: TopCityRow[] = ((cityRows as RpcCityRow[] | null) || []).map((row) => ({
    city: row.city,
    scans: numberFromUnknown(row.scan_count)
  }));

  const hourlyDistribution: HourlyDistributionRow[] = ((hourlyRows as RpcHourRow[] | null) || []).map((row) => ({
    hour: String(row.hour_of_day).padStart(2, "0"),
    scans: numberFromUnknown(row.scan_count)
  }));

  return {
    range,
    timezone,
    totalScans: count || 0,
    scansOverTime,
    topCities,
    hourlyDistribution
  };
}
