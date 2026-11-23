import { useEffect, useState } from "react";
import { ArrowUpRight, CircleAlert, Database, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [orgA, setOrgA] = useState([]);
  const [orgB, setOrgB] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/disagreements/?org=ORG-A").then(response => response.json()),
      fetch("/api/disagreements/?org=ORG-B").then(response => response.json()),
    ]).then(([a, b]) => {
      setOrgA(a);
      setOrgB(b);
    }).finally(() => setLoading(false));
  }, []);

  const combined = [...orgA, ...orgB];
  const mismatches = combined.filter(row => row.reason === "VALUE_MISMATCH").length;
  const missing = combined.filter(row => row.reason === "MISSING_IN_B").length;

  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Executive overview</span>
          <h1>Good morning</h1>
          <p>Monitor ledger health across every organization.</p>
        </div>
        <Link className="primary-button" to="/reconciliation">
          Open reconciliation <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="metric-grid">
        <article className="metric-card accent-blue">
          <span className="metric-icon"><Database size={20} /></span>
          <div><small>Total discrepancies</small><strong>{loading ? "—" : combined.length}</strong></div>
        </article>
        <article className="metric-card accent-orange">
          <span className="metric-icon"><CircleAlert size={20} /></span>
          <div><small>Value mismatches</small><strong>{loading ? "—" : mismatches}</strong></div>
        </article>
        <article className="metric-card accent-purple">
          <span className="metric-icon"><MapPin size={20} /></span>
          <div><small>Missing entries</small><strong>{loading ? "—" : missing}</strong></div>
        </article>
        <article className="metric-card accent-green">
          <span className="metric-icon"><ShieldMark /></span>
          <div><small>Tenant checks</small><strong>Protected</strong></div>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Tenant activity</span><h2>Disagreements by organization</h2></div>
          </div>
          <div className="tenant-bars">
            <TenantBar name="ORG-A" count={orgA.length} total={Math.max(orgA.length, orgB.length, 1)} />
            <TenantBar name="ORG-B" count={orgB.length} total={Math.max(orgA.length, orgB.length, 1)} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Current status</span><h2>System health</h2></div>
            <span className="live-badge"><i /> Live</span>
          </div>
          <div className="health-list">
            <HealthItem label="System A ledger" status="Connected" />
            <HealthItem label="System B ledger" status="Connected" />
            <HealthItem label="Tenant isolation" status="Active" />
          </div>
        </section>
      </div>
    </div>
  );
}

function ShieldMark() {
  return <span aria-hidden="true" style={{ fontWeight: 800 }}>S</span>;
}

function TenantBar({ name, count, total }) {
  return (
    <div className="tenant-bar">
      <div><strong>{name}</strong><span>{count} findings</span></div>
      <div className="bar-track"><span style={{ width: `${Math.max(8, count / total * 100)}%` }} /></div>
    </div>
  );
}

function HealthItem({ label, status }) {
  return (
    <div className="health-item">
      <span><i />{label}</span>
      <strong>{status}</strong>
    </div>
  );
}
