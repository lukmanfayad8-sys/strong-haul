import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetAllVehicles } from "../api";

const TRUCK_TYPES = ["All Types", "Tipper Truck", "Flatbed Truck", "Tanker Truck", "Excavator", "Crane", "Lowboy", "Refrigerated Truck"];
const CAPACITIES = ["All Capacities", "Under 10 tons", "10–20 tons", "20–30 tons", "30–40 tons", "40+ tons"];
const LOCATIONS = ["All Locations", "Ghana", "Nigeria", "Kenya", "South Africa", "Tanzania", "Egypt", "USA", "UK"];
const SORT_OPTIONS = ["Most Relevant", "Newest First", "Capacity: High to Low", "Capacity: Low to High"];

const LISTINGS = [
  { id: 1, name: "Mack Granite Tipper", type: "Tipper Truck", capacity: 30, location: "Accra, Ghana", country: "Ghana", owner: "Kwame Asante", phone: "+233 24 000 0001", available: true, tier: "Premium", image: "🚛", description: "Heavy-duty tipper ideal for construction and mining sites. Well maintained with full documentation.", reg: "GR-1234-22" },
  { id: 2, name: "Caterpillar 320 Excavator", type: "Excavator", capacity: 22, location: "Lagos, Nigeria", country: "Nigeria", owner: "Chidi Okafor", phone: "+234 80 000 0002", available: true, tier: "Enterprise", image: "🏗️", description: "Cat 320 excavator in excellent condition. Available for hire on construction and mining projects.", reg: "LG-5678-21" },
  { id: 3, name: "Mercedes Actros Flatbed", type: "Flatbed Truck", capacity: 25, location: "Nairobi, Kenya", country: "Kenya", owner: "Amara Njoroge", phone: "+254 70 000 0003", available: false, tier: "Premium", image: "🚚", description: "Mercedes Actros flatbed, perfect for transporting heavy equipment and oversized cargo.", reg: "KE-9012-23" },
  { id: 4, name: "Volvo FH16 Tanker", type: "Tanker Truck", capacity: 40, location: "Johannesburg, SA", country: "South Africa", owner: "Sipho Dlamini", phone: "+27 60 000 0004", available: true, tier: "Premium", image: "⛽", description: "Volvo FH16 tanker suitable for fuel, water, and chemical transportation.", reg: "GP-3456-22" },
  { id: 5, name: "Liebherr LTM Crane", type: "Crane", capacity: 50, location: "Accra, Ghana", country: "Ghana", owner: "Fiifi Mensah", phone: "+233 27 000 0005", available: true, tier: "Enterprise", image: "🏗️", description: "Mobile crane with 50-ton lifting capacity. Operated by certified professionals.", reg: "GR-7890-20" },
  { id: 6, name: "DAF XF Lowboy", type: "Lowboy", capacity: 35, location: "Cairo, Egypt", country: "Egypt", owner: "Hassan Ibrahim", phone: "+20 10 000 0006", available: true, tier: "Premium", image: "🚛", description: "DAF XF lowboy trailer for transporting heavy machinery and equipment with low ground clearance.", reg: "EG-2345-23" },
  { id: 7, name: "Scania R500 Flatbed", type: "Flatbed Truck", capacity: 28, location: "Dar es Salaam, Tanzania", country: "Tanzania", owner: "Juma Makonde", phone: "+255 75 000 0007", available: false, tier: "Premium", image: "🚚", description: "Scania R500 flatbed ready for long-haul transport across East Africa.", reg: "TZ-6789-21" },
  { id: 8, name: "Komatsu PC200 Excavator", type: "Excavator", capacity: 20, location: "Kumasi, Ghana", country: "Ghana", owner: "Abena Boateng", phone: "+233 26 000 0008", available: true, tier: "Free Trial", image: "🏗️", description: "Komatsu PC200 excavator available for earthmoving and foundation work.", reg: "GR-1357-22" },
  { id: 9, name: "MAN TGS Tipper", type: "Tipper Truck", capacity: 18, location: "Abuja, Nigeria", country: "Nigeria", owner: "Emeka Eze", phone: "+234 81 000 0009", available: true, tier: "Premium", image: "🚛", description: "MAN TGS tipper truck, reliable for sand, gravel, and aggregate haulage.", reg: "AB-2468-23" },
  { id: 10, name: "Isuzu Refrigerated Truck", type: "Refrigerated Truck", capacity: 8, location: "Nairobi, Kenya", country: "Kenya", owner: "Grace Wanjiku", phone: "+254 72 000 0010", available: true, tier: "Free Trial", image: "❄️", description: "Isuzu refrigerated truck for temperature-controlled cargo. Ideal for food and pharmaceutical transport.", reg: "NB-3579-23" },
  { id: 11, name: "Terex RT100 Crane", type: "Crane", capacity: 100, location: "Houston, USA", country: "USA", owner: "Mike Johnson", phone: "+1 713 000 0011", available: false, tier: "Enterprise", image: "🏗️", description: "Terex rough terrain crane with 100-ton capacity for industrial and construction projects.", reg: "TX-4680-21" },
  { id: 12, name: "Volvo FMX Tipper", type: "Tipper Truck", capacity: 32, location: "London, UK", country: "UK", owner: "James Osei", phone: "+44 20 000 0012", available: true, tier: "Premium", image: "🚛", description: "Volvo FMX tipper, well-maintained and ready for construction site haulage in the UK.", reg: "LN-5791-22" },
];

function capacityInRange(capacity, range) {
  if (range === "All Capacities") return true;
  if (range === "Under 10 tons") return capacity < 10;
  if (range === "10–20 tons") return capacity >= 10 && capacity <= 20;
  if (range === "20–30 tons") return capacity > 20 && capacity <= 30;
  if (range === "30–40 tons") return capacity > 30 && capacity <= 40;
  if (range === "40+ tons") return capacity > 40;
  return true;
}

export default function BrowseTrucks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [capacity, setCapacity] = useState("All");
  const [location, setLocation] = useState("All");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("Most Relevant");
  const [selected, setSelected] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const typeOptions = useMemo(() => {
    const types = [...new Set(listings.map(v => v.type).filter(Boolean))];
    return ["All", ...types];
  }, [listings]);

  const capacityOptions = useMemo(() => {
    const caps = [...new Set(listings.map(v => v.capacity).filter(Boolean))];
    return ["All", ...caps];
  }, [listings]);

  const locationOptions = useMemo(() => {
    const locs = [...new Set(listings.map(v => v.location).filter(Boolean))];
    return ["All", ...locs];
  }, [listings]);

  useEffect(() => {
    apiGetAllVehicles()
      .then(data => {
        setListings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load listings:", err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = listings.filter(v => {
      const matchSearch = !q ||
        v.name?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q) ||
        v.location?.toLowerCase().includes(q);
      const matchType = type === "All" || v.type === type;
      const matchCap = capacity === "All" || v.capacity?.toString() === capacity;
      const matchLoc = location === "All" || v.location === location;
      const online = v.online ?? v.available;
      const matchAvail = availability === "all" ||
        (availability === "available" && online) ||
        (availability === "unavailable" && !online);
      return matchSearch && matchType && matchCap && matchLoc && matchAvail;
    });

    if (sort === "Newest First") result = [...result].reverse();
    if (sort === "Capacity: High to Low") result = [...result].sort((a, b) => b.capacity - a.capacity);
    if (sort === "Capacity: Low to High") result = [...result].sort((a, b) => a.capacity - b.capacity);
    return result;
  }, [listings, search, type, capacity, location, availability, sort]);

  const tierColor = (tier) => {
    if (tier === "Enterprise") return { bg: "rgba(168,85,247,0.15)", color: "#a855f7" };
    if (tier === "Premium") return { bg: "rgba(249,115,22,0.15)", color: "#F97316" };
    return { bg: "rgba(156,163,175,0.15)", color: "#9CA3AF" };
  };

  if (loading) return <div style={{ color: "#fff", padding: "4rem", textAlign: "center" }}>Loading listings...</div>;
  if (!loading && listings.length === 0) return <div style={{ textAlign: "center", padding: "4rem", color: "#6B7280" }}>No vehicles listed yet.</div>;

  const selectedOnline = selected ? selected.online ?? selected.available : false;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; color: #fff; font-family: 'DM Sans', sans-serif; }

        .filter-select { background: #1F2937; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.65rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; cursor: pointer; outline: none; width: 100%; transition: border-color 0.2s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239CA3AF' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; }
        .filter-select:focus { border-color: #F97316; }

        .search-input { background: #1F2937; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.75rem 1rem 0.75rem 2.75rem; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none; width: 100%; transition: border-color 0.2s; }
        .search-input::placeholder { color: #6B7280; }
        .search-input:focus { border-color: #F97316; }

        .truck-card { background: #111827; border: 1px solid rgba(255,255,255,0.06); transition: all 0.25s; cursor: pointer; position: relative; overflow: hidden; }
        .truck-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #F97316; transform: scaleX(0); transition: transform 0.3s; transform-origin: left; }
        .truck-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); border-color: rgba(249,115,22,0.25); }
        .truck-card:hover::before { transform: scaleX(1); }

        .btn-primary { background: #F97316; color: #fff; border: none; padding: 0.7rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; width: 100%; }
        .btn-primary:hover { background: #EA6C00; }

        .btn-outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.2); padding: 0.7rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; width: 100%; }
        .btn-outline:hover { border-color: #F97316; color: #F97316; }

        .avail-btn { padding: 0.5rem 1.25rem; font-size: 0.82rem; font-family: 'DM Sans', sans-serif; font-weight: 600; letter-spacing: 0.05em; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; }
        .avail-btn.active { background: #F97316; border-color: #F97316; color: #fff; }
        .avail-btn:not(.active) { background: transparent; color: #9CA3AF; }
        .avail-btn:not(.active):hover { border-color: #F97316; color: #F97316; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
        .modal { background: #111827; border: 1px solid rgba(249,115,22,0.3); max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; }

        @media (max-width: 768px) {
          .filters-grid { grid-template-columns: 1fr 1fr !important; }
          .listings-grid { grid-template-columns: 1fr !important; }
          .modal { max-width: 100% !important; margin: 0.5rem !important; padding: 1.5rem !important; }
        }
        @media (max-width: 480px) {
          .filters-grid { grid-template-columns: 1fr !important; }
          .btn-primary, .btn-outline { width: 100% !important; }
          .search-input, .filter-select { width: 100% !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: "rgba(10,10,10,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1.1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
          <div style={{ width: 30, height: 30, background: "#F97316", clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>🚛</div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "0.05em" }}>STRONG HAUL</span>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-outline" style={{ width: "auto", padding: "0.55rem 1.25rem", fontSize: "0.82rem" }} onClick={() => navigate("/")}>← Home</button>
          <button className="btn-primary" style={{ width: "auto", padding: "0.55rem 1.25rem", fontSize: "0.82rem" }}>List Your Truck</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* Page Header */}
        <div style={{ marginBottom: "2rem" }}>
          <span style={{ display: "inline-block", background: "rgba(249,115,22,0.15)", color: "#F97316", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.35rem 1rem", marginBottom: "0.75rem", borderLeft: "2px solid #F97316" }}>Marketplace</span>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1 }}>BROWSE TRUCKS</h1>
          <p style={{ color: "#9CA3AF", marginTop: "0.5rem" }}>{filtered.length} vehicles available worldwide</p>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "1.5rem" }}>
          <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontSize: "1rem" }}>🔍</span>
          <input className="search-input" placeholder="Search by name, type, or location..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Filters */}
        <div className="filters-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ color: "#6B7280", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Truck Type</label>
            <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: "#6B7280", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Capacity</label>
            <select className="filter-select" value={capacity} onChange={e => setCapacity(e.target.value)}>
              {capacityOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: "#6B7280", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Country</label>
            <select className="filter-select" value={location} onChange={e => setLocation(e.target.value)}>
              {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: "#6B7280", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Sort By</label>
            <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Availability Toggle */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {[["all", "All"], ["available", "Available"], ["unavailable", "Unavailable"]].map(([val, label]) => (
            <button key={val} className={`avail-btn ${availability === val ? "active" : ""}`} onClick={() => setAvailability(val)}>{label}</button>
          ))}
          <div style={{ marginLeft: "auto", color: "#6B7280", fontSize: "0.85rem", display: "flex", alignItems: "center" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Listings Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: "#6B7280" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.8rem", marginBottom: "0.5rem", color: "#9CA3AF" }}>No vehicles found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="listings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
            {filtered.filter(Boolean).map(l => {
              const online = l.online ?? l.available;
              const tc = tierColor(l.tier);
              return (
                <div key={l.id} className="truck-card" onClick={() => setSelected(l)}>
                  {/* Image */}
                  <div style={{ background: "#0A0A0A", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative" }}>
                    {l.image_url
                      ? <img src={l.image_url} alt={l.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>🚛</div>
                    }
                    <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: tc.bg, color: tc.color, fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", letterSpacing: "0.05em" }}>{l.tier}</div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                      <span style={{ color: "#9CA3AF", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l.type}</span>
                      <span style={{ background: online ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: online ? "#22c55e" : "#ef4444", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.55rem", letterSpacing: "0.04em" }}>
                        {online ? "● AVAILABLE" : "● UNAVAILABLE"}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", marginBottom: "0.4rem", lineHeight: 1.2 }}>{l.name}</h3>

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                      <span style={{ color: "#9CA3AF", fontSize: "0.82rem" }}>⚖️ {l.capacity} tons</span>
                      <span style={{ color: "#9CA3AF", fontSize: "0.82rem" }}>📍 {l.location}</span>
                    </div>

                    <p style={{ color: "#6B7280", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>{l.description?.slice(0, 80) ?? ""}...</p>

                    <button className="btn-primary">View Details</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {/* Modal Image */}
            <div style={{ background: "#0A0A0A", height: 180, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", position: "relative" }}>
              {selected.image_url
                ? <img src={selected.image_url} alt={selected.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>🚛</div>
              }
              <button onClick={() => setSelected(null)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 32, height: 32, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <span style={{ color: "#9CA3AF", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{selected.type}</span>
                  <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", lineHeight: 1.1 }}>{selected.name}</h2>
                </div>
                <span style={{ background: selectedOnline ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: selectedOnline ? "#22c55e" : "#ef4444", fontSize: "0.75rem", fontWeight: 700, padding: "0.35rem 0.75rem" }}>
                  {selectedOnline ? "AVAILABLE" : "UNAVAILABLE"}
                </span>
              </div>

              <p style={{ color: "#9CA3AF", lineHeight: 1.7, marginBottom: "1.5rem", fontSize: "0.92rem" }}>{selected.description}</p>

              {/* Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  ["Capacity", `${selected.capacity} tons`],
                  ["Location", selected.location],
                  ["Registration", selected.reg],
                  ["Tier", selected.tier],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: "#0A0A0A", padding: "0.85rem 1rem" }}>
                    <div style={{ color: "#6B7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{label}</div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.92rem" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Owner Info */}
              <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ color: "#F97316", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", fontWeight: 700 }}>Owner Information</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{selected.owner}</div>
                    <div style={{ color: "#9CA3AF", fontSize: "0.88rem" }}>{selected.phone}</div>
                  </div>
                  <div style={{ width: 44, height: 44, background: "#F97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.2rem" }}>{selected.owner?.[0] ?? "U"}</div>
                </div>
              </div>

              <button className="btn-primary" style={{ marginBottom: "0.75rem" }}>📞 Contact Owner</button>
              <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
