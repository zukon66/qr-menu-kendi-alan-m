import Link from "next/link";
import type { DashboardAnalytics, DashboardFilterOption, DashboardRange } from "@/lib/analytics/types";

function SelectField({
  label,
  name,
  options,
  value,
  placeholder
}: {
  label: string;
  name: string;
  options: DashboardFilterOption[];
  value?: string;
  placeholder: string;
}) {
  return (
    <label className="filter-field">
      <span className="field-label">{label}</span>
      <select defaultValue={value || ""} name={name}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function buildRangeHref(analytics: DashboardAnalytics, range: DashboardRange) {
  const params = new URLSearchParams();
  params.set("range", range);

  if (analytics.filters.startDate) {
    params.set("startDate", analytics.filters.startDate);
  }

  if (analytics.filters.endDate) {
    params.set("endDate", analytics.filters.endDate);
  }

  if (analytics.filters.qrCodeId) {
    params.set("qrCodeId", analytics.filters.qrCodeId);
  }

  if (analytics.filters.city) {
    params.set("city", analytics.filters.city);
  }

  if (analytics.filters.deviceType) {
    params.set("deviceType", analytics.filters.deviceType);
  }

  if (analytics.filters.source) {
    params.set("source", analytics.filters.source);
  }

  return `/dashboard?${params.toString()}`;
}

export function DashboardFiltersBar({ analytics }: { analytics: DashboardAnalytics }) {
  const { filters, filterOptions } = analytics;
  const showCustomDates = filters.range === "custom";

  return (
    <section className="panel filters-panel">
      <div className="filters-header">
        <div>
          <span className="eyebrow">Filtreler</span>
          <h2 className="filters-title">Dashboard gorunumunu secimlerinize gore daraltin</h2>
        </div>
        <p className="panel-copy">Tarih araligi, segment filtreleri ve QR bazli kirilimlar burada yonetilir.</p>
      </div>

      <div className="filters-form">
        <section className="filters-block">
          <div className="filters-block-head">
            <span className="field-label">Tarih araligi</span>
          </div>
          <div className="range-form filters-range-row">
            <Link aria-pressed={filters.range === "today"} className="range-link" href={buildRangeHref(analytics, "today")}>
              Bugun
            </Link>
            <Link aria-pressed={filters.range === "7d"} className="range-link" href={buildRangeHref(analytics, "7d")}>
              Son 7 gun
            </Link>
            <Link aria-pressed={filters.range === "30d"} className="range-link" href={buildRangeHref(analytics, "30d")}>
              Son 30 gun
            </Link>
            <Link
              aria-pressed={filters.range === "custom"}
              className="range-link"
              href={buildRangeHref(analytics, "custom")}
            >
              Ozel aralik
            </Link>
          </div>
        </section>

        <form action="/dashboard" className="filters-apply-form">
          <input name="range" type="hidden" value={filters.range} />

          {showCustomDates ? (
            <section className="filters-block">
              <div className="filters-block-head">
                <span className="field-label">Ozel aralik</span>
              </div>
              <div className="filters-grid filters-grid-dates">
                <label className="filter-field">
                  <span className="field-label">Baslangic</span>
                  <input defaultValue={filters.startDate || ""} name="startDate" type="date" />
                </label>

                <label className="filter-field">
                  <span className="field-label">Bitis</span>
                  <input defaultValue={filters.endDate || ""} name="endDate" type="date" />
                </label>
              </div>
            </section>
          ) : null}

          <section className="filters-block">
            <div className="filters-block-head">
              <span className="field-label">Segment filtreleri</span>
            </div>
            <div className="filters-grid">
              <SelectField
                label="QR kod"
                name="qrCodeId"
                options={filterOptions.qrCodes}
                placeholder="Tum QR kodlari"
                value={filters.qrCodeId}
              />
              <SelectField
                label="Sehir"
                name="city"
                options={filterOptions.cities}
                placeholder="Tum sehirler"
                value={filters.city}
              />
              <SelectField
                label="Cihaz"
                name="deviceType"
                options={filterOptions.deviceTypes}
                placeholder="Tum cihazlar"
                value={filters.deviceType}
              />
              <SelectField
                label="Kaynak"
                name="source"
                options={filterOptions.sources}
                placeholder="Tum kaynaklar"
                value={filters.source}
              />
            </div>
          </section>

          <div className="filters-actions">
            <a className="filter-reset" href="/dashboard">
              Temizle
            </a>
            <button className="button-link filter-submit" type="submit">
              Filtreleri uygula
            </button>
          </div>
        </form>
      </div>

      {filters.validationError ? <p className="filters-error">{filters.validationError}</p> : null}
    </section>
  );
}
