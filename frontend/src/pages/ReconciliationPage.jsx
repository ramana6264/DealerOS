import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, RefreshCw, Search } from "lucide-react";

const reasons = [
  "MISSING_IN_B",
  "ORPHAN_IN_B",
  "DUPLICATE_IN_B",
  "VALUE_MISMATCH",
  "LOCATION_MISMATCH",
  "DATE_MISMATCH",
];

export default function ReconciliationPage() {
  const [org, setOrg] = useState("ORG-A");
  const [reason, setReason] = useState("");
  const [sort, setSort] = useState("-value");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ org, sort });
    if (reason) params.set("reason", reason);
    try {
      const response = await fetch(`/api/disagreements/?${params}`);
      if (!response.ok) throw new Error("Could not load reconciliation data");
      setRows(await response.json());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [org, reason, sort]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(row =>
      [row.record_id, row.reason, row.location].some(value =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [rows, search]);

  function exportCsv() {
    const header = ["Reason", "Record ID", "Location", "System A value", "System B value", "Difference"];
    const data = visibleRows.map(row => [
      row.reason,
      row.record_id,
      row.location ?? "",
      row.a_value ?? "",
      row.b_value ?? "",
      difference(row.a_value, row.b_value),
    ]);
    const csv = [header, ...data].map(line =>
      line.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")
    ).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `${org.toLowerCase()}-disagreements.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Ledger control</span>
          <h1>Reconciliation</h1>
          <p>Review and investigate disagreements between System A and System B.</p>
        </div>
        <button className="secondary-button" onClick={exportCsv} disabled={!visibleRows.length}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <section className="filter-card">
        <label>
          <span>Organization</span>
          <select value={org} onChange={event => setOrg(event.target.value)}>
            <option value="ORG-A">ORG-A</option>
            <option value="ORG-B">ORG-B</option>
          </select>
        </label>
        <label>
          <span>Reason</span>
          <div className="select-wrap">
            <select value={reason} onChange={event => setReason(event.target.value)}>
              <option value="">All reasons</option>
              {reasons.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
            <ChevronDown size={15} />
          </div>
        </label>
        <label className="search-label">
          <span>Search</span>
          <div className="search-field">
            <Search size={16} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Record, reason or location" />
          </div>
        </label>
        <button className="icon-button" onClick={load} title="Refresh results" disabled={loading}>
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
        </button>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <strong>{visibleRows.length} findings</strong>
            <span>{org} · {reason || "All reasons"}</span>
          </div>
          <button className="sort-button" onClick={() => setSort(value => value === "-value" ? "value" : "-value")}>
            Value {sort === "-value" ? "↓" : "↑"}
          </button>
        </div>

        {error ? (
          <div className="state-card error-state">{error}</div>
        ) : loading ? (
          <div className="state-card"><span className="loader" /> Loading findings</div>
        ) : visibleRows.length === 0 ? (
          <div className="state-card">
            <span className="empty-mark">✓</span>
            <strong>No disagreements found</strong>
            <p>This organization matches the active filters.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Record ID</th>
                  <th>Location</th>
                  <th>System A value</th>
                  <th>System B value</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr key={`${row.record_id}-${row.reason}-${index}`}>
                    <td><ReasonBadge reason={row.reason} /></td>
                    <td><strong>{row.record_id}</strong></td>
                    <td>{row.location || "—"}</td>
                    <td className="number-cell">{display(row.a_value)}</td>
                    <td className="number-cell">{display(row.b_value)}</td>
                    <td className="number-cell">{difference(row.a_value, row.b_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function display(value) {
  return value === null || value === undefined ? "—" : Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function difference(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) return "—";
  return (Number(a) - Number(b)).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ReasonBadge({ reason }) {
  const type = reason.includes("VALUE") || reason.includes("DUPLICATE")
    ? "danger"
    : reason.includes("MISSING") || reason.includes("ORPHAN")
      ? "warning"
      : "neutral";
  return <span className={`reason-badge ${type}`}>{reason.replaceAll("_", " ")}</span>;
}
