import type { QRPerformanceRow } from "@/lib/analytics/types";

function formatDateTime(value: string | null) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function QrPerformanceTable({ rows }: { rows: QRPerformanceRow[] }) {
  return (
    <article className="panel table-card">
      <div className="chart-head">
        <div>
          <span className="chart-label">QR performansi</span>
          <h2 className="chart-title">QR kod bazli performans</h2>
        </div>
        <p className="panel-copy">Tarama, son aktivite ve hedef URL tek tabloda gorunur.</p>
      </div>

      <div className="table-shell">
        <table className="performance-table">
          <thead>
            <tr>
              <th>QR</th>
              <th>Tarama</th>
              <th>Son taranma</th>
              <th>Durum</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.qrCodeId}>
                <td>
                  <div className="table-primary-cell">
                    <strong>{row.slug}</strong>
                  </div>
                </td>
                <td>{row.scans.toLocaleString()}</td>
                <td>{formatDateTime(row.lastScannedAt)}</td>
                <td>
                  <span className={row.isActive ? "status-badge is-active" : "status-badge is-inactive"}>
                    {row.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="table-url-cell">{row.destinationUrl || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
