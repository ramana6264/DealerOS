import { Bell, Database, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>Settings</h1>
          <p>Review reconciliation workspace configuration.</p>
        </div>
      </div>
      <div className="settings-grid">
        <SettingsCard icon={Database} title="Data source" value="Local SQLite" detail="Three CSV assessment datasets" />
        <SettingsCard icon={ShieldCheck} title="Tenant mode" value="Organization query" detail="Database-side location filtering" />
        <SettingsCard icon={Bell} title="Notifications" value="Disabled" detail="Not included in this assessment" />
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, value, detail }) {
  return (
    <article className="settings-card">
      <span className="settings-icon"><Icon size={20} /></span>
      <div><small>{title}</small><h2>{value}</h2><p>{detail}</p></div>
    </article>
  );
}
