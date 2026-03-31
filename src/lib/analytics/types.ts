export type DashboardRange = "7d" | "30d";

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

export type DashboardAnalytics = {
  range: DashboardRange;
  timezone: string;
  totalScans: number;
  scansOverTime: ScansOverTimePoint[];
  topCities: TopCityRow[];
  hourlyDistribution: HourlyDistributionRow[];
};
