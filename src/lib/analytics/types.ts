export type DashboardRange = "today" | "7d" | "30d" | "custom";

export type DashboardFilters = {
  range: DashboardRange;
  startDate?: string;
  endDate?: string;
  qrCodeId?: string;
  city?: string;
  deviceType?: string;
  source?: string;
  validationError?: string;
};

export type ScansOverTimePoint = {
  day: string;
  scans: number;
};

export type TopCityRow = {
  city: string;
  scans: number;
};

export type HourlyDistributionRow = {
  hour: string;
  scans: number;
};

export type DashboardFilterOption = {
  label: string;
  value: string;
};

export type QRPerformanceRow = {
  qrCodeId: string;
  slug: string;
  destinationUrl: string | null;
  isActive: boolean;
  scans: number;
  lastScannedAt: string | null;
};

export type GrowingCityInsight = {
  city: string;
  currentScans: number;
  previousScans: number;
  changePct: number;
};

export type DashboardAnalytics = {
  filters: DashboardFilters;
  timezone: string;
  totalScans: number;
  previousTotalScans: number;
  totalChangePct: number | null;
  scansOverTime: ScansOverTimePoint[];
  topCities: TopCityRow[];
  hourlyDistribution: HourlyDistributionRow[];
  qrPerformance: QRPerformanceRow[];
  topQr: QRPerformanceRow | null;
  busiestDay: ScansOverTimePoint | null;
  bestHour: HourlyDistributionRow | null;
  fastestGrowingCity: GrowingCityInsight | null;
  filterOptions: {
    qrCodes: DashboardFilterOption[];
    cities: DashboardFilterOption[];
    deviceTypes: DashboardFilterOption[];
    sources: DashboardFilterOption[];
  };
};
