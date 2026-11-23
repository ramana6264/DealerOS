import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/locations/")
      .then(response => response.ok ? response.json() : [])
      .then(setLocations)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Master data</span>
          <h1>Locations</h1>
          <p>Review the tenant ownership of every branch location.</p>
        </div>
      </div>
      <section className="location-grid">
        {loading ? (
          <div className="state-card"><span className="loader" /> Loading locations</div>
        ) : locations.map(location => (
          <article className="location-card" key={location.location_id}>
            <div className="location-icon"><MapPin size={20} /></div>
            <div>
              <span className="org-chip">{location.org_id}</span>
              <h2>{location.location_id}</h2>
              <p>{location.name}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
