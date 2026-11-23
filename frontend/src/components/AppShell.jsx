import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, MapPin, Settings, TableProperties, ShieldCheck } from "lucide-react";

const navigation = [
  { to: "/", label: "Overview", icon: BarChart3, end: true },
  { to: "/reconciliation", label: "Reconciliation", icon: TableProperties },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/" aria-label="DealerOS overview">
          <span className="brand-mark">D</span>
          <span>
            <strong>DealerOS</strong>
            <small>Financial Console</small>
          </span>
        </NavLink>

        <nav className="nav-list" aria-label="Primary navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <ShieldCheck size={18} />
          <div>
            <strong>Tenant boundary</strong>
            <small>Database filtered</small>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Operations workspace</span>
            <strong>Ledger reconciliation</strong>
          </div>
          <div className="user-avatar" title="Demo operator">RM</div>
        </header>
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
