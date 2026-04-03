import type {
  DashboardAnalytics,
  DashboardFilterOption,
  DashboardFilters,
  DashboardRange,
  GrowingCityInsight,
  HourlyDistributionRow,
  QRPerformanceRow,
  ScansOverTimePoint,
  TopCityRow
} from "@/lib/analytics/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type UserMetadata = {
  organization_id?: string;
  organization_timezone?: string;
};

type SearchParamsInput = Record<string, string | string[] | undefined>;

type ScanEventRow = {
  id: string;
  tenant_id: string;
  qr_code_id: string;
  scanned_at: string;
  city: string | null;
  country: string | null;
  device_type: string | null;
  source: string | null;
};

type QrCodeRow = {
  id: string;
  slug: string;
  destination_url: string | null;
  is_active: boolean;
};

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseCustomDate(value: string | undefined, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const parsed = new Date(`${value}${suffix}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeFilters(searchParams: SearchParamsInput | undefined): DashboardFilters {
  const rangeParam = getSingleParam(searchParams?.range);
  const range: DashboardRange =
    rangeParam === "today" || rangeParam === "30d" || rangeParam === "custom" ? rangeParam : "7d";

  const filters: DashboardFilters = {
    range,
    startDate: getSingleParam(searchParams?.startDate) || undefined,
    endDate: getSingleParam(searchParams?.endDate) || undefined,
    qrCodeId: getSingleParam(searchParams?.qrCodeId) || undefined,
    city: getSingleParam(searchParams?.city) || undefined,
    deviceType: getSingleParam(searchParams?.deviceType) || undefined,
    source: getSingleParam(searchParams?.source) || undefined
  };

  if (range !== "custom") {
    return filters;
  }

  const start = parseCustomDate(filters.startDate);
  const end = parseCustomDate(filters.endDate, true);

  if (!start || !end) {
    return {
      ...filters,
      range: "7d",
      startDate: undefined,
      endDate: undefined,
      validationError: "Ozel aralik icin baslangic ve bitis tarihi zorunludur."
    };
  }

  if (start > end) {
    return {
      ...filters,
      range: "7d",
      startDate: undefined,
      endDate: undefined,
      validationError: "Baslangic tarihi bitis tarihinden sonra olamaz."
    };
  }

  return filters;
}

function getDateRange(filters: DashboardFilters) {
  const now = new Date();

  if (filters.range === "custom") {
    const start = parseCustomDate(filters.startDate)!;
    const end = parseCustomDate(filters.endDate, true)!;

    return {
      currentFrom: start,
      currentTo: end
    };
  }

  if (filters.range === "today") {
    const currentFrom = new Date(now);
    currentFrom.setUTCHours(0, 0, 0, 0);
    const currentTo = new Date(now);
    currentTo.setUTCHours(23, 59, 59, 999);

    return {
      currentFrom,
      currentTo
    };
  }

  const days = filters.range === "30d" ? 30 : 7;
  return {
    currentFrom: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
    currentTo: now
  };
}

function getPreviousDateRange(currentFrom: Date, currentTo: Date) {
  const duration = currentTo.getTime() - currentFrom.getTime();
  const previousTo = new Date(currentFrom.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - duration);

  return {
    previousFrom,
    previousTo
  };
}

function numberToFixedPercent(value: number) {
  return Number(value.toFixed(1));
}

function buildDayBuckets(from: Date, to: Date) {
  const buckets: string[] = [];
  const cursor = new Date(from);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);

  while (cursor <= end) {
    buckets.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return buckets;
}

function aggregateScansOverTime(rows: ScanEventRow[], from: Date, to: Date): ScansOverTimePoint[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const key = new Date(row.scanned_at).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return buildDayBuckets(from, to).map((day) => ({
    day,
    scans: counts.get(day) || 0
  }));
}

function aggregateTopCities(rows: ScanEventRow[]): TopCityRow[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    if (!row.city) {
      continue;
    }

    counts.set(row.city, (counts.get(row.city) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([city, scans]) => ({ city, scans }))
    .sort((left, right) => right.scans - left.scans || left.city.localeCompare(right.city))
    .slice(0, 5);
}

function aggregateHourlyDistribution(rows: ScanEventRow[], timezone: string): HourlyDistributionRow[] {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: timezone
  });

  const counts = new Map<number, number>();

  for (let hour = 0; hour < 24; hour += 1) {
    counts.set(hour, 0);
  }

  for (const row of rows) {
    const hour = Number(formatter.format(new Date(row.scanned_at)));
    counts.set(hour, (counts.get(hour) || 0) + 1);
  }

  return [...counts.entries()].map(([hour, scans]) => ({
    hour: String(hour).padStart(2, "0"),
    scans
  }));
}

function aggregateQrPerformance(rows: ScanEventRow[], qrCodes: QrCodeRow[], selectedQrCodeId?: string): QRPerformanceRow[] {
  const grouped = new Map<string, { scans: number; lastScannedAt: string | null }>();

  for (const row of rows) {
    const existing = grouped.get(row.qr_code_id) || { scans: 0, lastScannedAt: null };
    const lastScannedAt =
      !existing.lastScannedAt || new Date(row.scanned_at) > new Date(existing.lastScannedAt)
        ? row.scanned_at
        : existing.lastScannedAt;

    grouped.set(row.qr_code_id, {
      scans: existing.scans + 1,
      lastScannedAt
    });
  }

  return qrCodes
    .filter((row) => !selectedQrCodeId || row.id === selectedQrCodeId)
    .map((row) => {
      const performance = grouped.get(row.id);

      return {
        qrCodeId: row.id,
        slug: row.slug,
        destinationUrl: row.destination_url,
        isActive: row.is_active,
        scans: performance?.scans || 0,
        lastScannedAt: performance?.lastScannedAt || null
      };
    })
    .sort((left, right) => right.scans - left.scans || left.slug.localeCompare(right.slug));
}

function getFastestGrowingCity(currentRows: ScanEventRow[], previousRows: ScanEventRow[]): GrowingCityInsight | null {
  const currentCounts = new Map<string, number>();
  const previousCounts = new Map<string, number>();

  for (const row of currentRows) {
    if (row.city) {
      currentCounts.set(row.city, (currentCounts.get(row.city) || 0) + 1);
    }
  }

  for (const row of previousRows) {
    if (row.city) {
      previousCounts.set(row.city, (previousCounts.get(row.city) || 0) + 1);
    }
  }

  let winner: GrowingCityInsight | null = null;

  for (const [city, currentScans] of currentCounts.entries()) {
    const previousScans = previousCounts.get(city) || 0;

    if (previousScans <= 0) {
      continue;
    }

    const changePct = ((currentScans - previousScans) / previousScans) * 100;

    if (changePct <= 0) {
      continue;
    }

    if (!winner || changePct > winner.changePct) {
      winner = {
        city,
        currentScans,
        previousScans,
        changePct: numberToFixedPercent(changePct)
      };
    }
  }

  return winner;
}

function createFilterOptions(values: (string | null)[]): DashboardFilterOption[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))]
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({
      label: value,
      value
    }));
}

function formatRangeLabel(range: DashboardRange) {
  if (range === "today") {
    return "Bugun";
  }

  if (range === "30d") {
    return "Son 30 gun";
  }

  if (range === "custom") {
    return "Ozel aralik";
  }

  return "Son 7 gun";
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

export async function getDashboardAnalytics(filters: DashboardFilters): Promise<DashboardAnalytics> {
  const supabase = createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Unable to resolve Supabase user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error("Dashboard requires an authenticated Supabase user.");
  }

  const { organizationId, timezone } = getOrganizationContext(authData.user.user_metadata as UserMetadata);
  const { currentFrom, currentTo } = getDateRange(filters);
  const { previousFrom, previousTo } = getPreviousDateRange(currentFrom, currentTo);

  let currentEventsQuery = supabase
    .from("scan_events")
    .select("id, tenant_id, qr_code_id, scanned_at, city, country, device_type, source")
    .eq("tenant_id", organizationId)
    .gte("scanned_at", currentFrom.toISOString())
    .lte("scanned_at", currentTo.toISOString());

  let previousEventsQuery = supabase
    .from("scan_events")
    .select("id, tenant_id, qr_code_id, scanned_at, city, country, device_type, source")
    .eq("tenant_id", organizationId)
    .gte("scanned_at", previousFrom.toISOString())
    .lte("scanned_at", previousTo.toISOString());

  if (filters.qrCodeId) {
    currentEventsQuery = currentEventsQuery.eq("qr_code_id", filters.qrCodeId);
    previousEventsQuery = previousEventsQuery.eq("qr_code_id", filters.qrCodeId);
  }

  if (filters.city) {
    currentEventsQuery = currentEventsQuery.eq("city", filters.city);
    previousEventsQuery = previousEventsQuery.eq("city", filters.city);
  }

  if (filters.deviceType) {
    currentEventsQuery = currentEventsQuery.eq("device_type", filters.deviceType);
    previousEventsQuery = previousEventsQuery.eq("device_type", filters.deviceType);
  }

  if (filters.source) {
    currentEventsQuery = currentEventsQuery.eq("source", filters.source);
    previousEventsQuery = previousEventsQuery.eq("source", filters.source);
  }

  const [
    { data: currentEvents, error: currentEventsError },
    { data: previousEvents, error: previousEventsError },
    { data: qrCodes, error: qrCodesError },
    { data: optionRows, error: optionRowsError }
  ] = await Promise.all([
    currentEventsQuery,
    previousEventsQuery,
    supabase.from("qr_codes").select("id, slug, destination_url, is_active").eq("tenant_id", organizationId),
    supabase.from("scan_events").select("city, device_type, source").eq("tenant_id", organizationId)
  ]);

  if (currentEventsError) {
    throw new Error(`Failed to read current scan events: ${currentEventsError.message}`);
  }

  if (previousEventsError) {
    throw new Error(`Failed to read previous scan events: ${previousEventsError.message}`);
  }

  if (qrCodesError) {
    throw new Error(`Failed to read qr codes: ${qrCodesError.message}`);
  }

  if (optionRowsError) {
    throw new Error(`Failed to read filter options: ${optionRowsError.message}`);
  }

  const safeCurrentEvents = (currentEvents as ScanEventRow[] | null) || [];
  const safePreviousEvents = (previousEvents as ScanEventRow[] | null) || [];
  const safeQrCodes = (qrCodes as QrCodeRow[] | null) || [];
  const safeOptionRows =
    ((optionRows as { city: string | null; device_type: string | null; source: string | null }[] | null) || []);

  const scansOverTime = aggregateScansOverTime(safeCurrentEvents, currentFrom, currentTo);
  const topCities = aggregateTopCities(safeCurrentEvents);
  const hourlyDistribution = aggregateHourlyDistribution(safeCurrentEvents, timezone);
  const qrPerformance = aggregateQrPerformance(safeCurrentEvents, safeQrCodes, filters.qrCodeId);
  const topQr = qrPerformance.find((row) => row.scans > 0) || null;
  const busiestDay =
    scansOverTime.reduce<ScansOverTimePoint | null>(
      (current, row) => (!current || row.scans > current.scans ? row : current),
      null
    ) || null;
  const bestHour =
    hourlyDistribution.reduce<HourlyDistributionRow | null>(
      (current, row) => (!current || row.scans > current.scans ? row : current),
      null
    ) || null;
  const totalScans = safeCurrentEvents.length;
  const previousTotalScans = safePreviousEvents.length;
  const totalChangePct =
    previousTotalScans > 0 ? numberToFixedPercent(((totalScans - previousTotalScans) / previousTotalScans) * 100) : null;

  return {
    filters,
    timezone,
    totalScans,
    previousTotalScans,
    totalChangePct,
    scansOverTime,
    topCities,
    hourlyDistribution,
    qrPerformance,
    topQr,
    busiestDay,
    bestHour,
    fastestGrowingCity: getFastestGrowingCity(safeCurrentEvents, safePreviousEvents),
    filterOptions: {
      qrCodes: safeQrCodes
        .sort((left, right) => left.slug.localeCompare(right.slug))
        .map((row) => ({
          label: row.slug,
          value: row.id
        })),
      cities: createFilterOptions(safeOptionRows.map((row) => row.city)),
      deviceTypes: createFilterOptions(safeOptionRows.map((row) => row.device_type)),
      sources: createFilterOptions(safeOptionRows.map((row) => row.source))
    }
  };
}

export function getRangeLabel(range: DashboardRange) {
  return formatRangeLabel(range);
}
