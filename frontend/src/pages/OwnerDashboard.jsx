import { useAuth } from "../context/AuthContext.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetMyVehicles, apiCreateVehicle, apiUpdateVehicle, apiDeleteVehicle, apiUploadVehicleImage, apiCancelSubscription, apiInitiatePayment, apiSubmitComplaint, apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead } from "../api";

const OWNER = {
  name: "Kwame Asante",
  username: "kwameasante",
  email: "kwame@stronghaul.com",
  plan: "Premium",
  memberSince: "Jan 2025",
  avatar: "K",
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "vehicles", label: "My Vehicles", icon: "🚛" },
  { id: "subscription", label: "Subscription", icon: "💳" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "support", label: "Support", icon: "🛟" },
];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editing, setEditing] = useState(null);
  const [profileForm, setProfileForm] = useState({ username: OWNER.username, email: OWNER.email, password: "" });
  const [supportForm, setSupportForm] = useState({ subject: "", category: "General Enquiry", message: "" });
  const [supportSent, setSupportSent] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: "", type: "Tipper Truck", capacity: "", location: "", phone: "", reg: "", image_url: "" });
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [errors, setErrors] = useState({});

  const unread = notifications.filter(n => !n.read).length;
  const totalViews = vehicles.reduce((a, v) => a + v.views, 0);
  const totalContacts = vehicles.reduce((a, v) => a + v.contacts, 0);
  const onlineCount = vehicles.filter(v => v.online).length;

  useEffect(() => {
    apiGetMyVehicles()
      .then(setVehicles)
      .catch(err => console.error("Failed to load vehicles:", err));
  }, []);

  useEffect(() => {
    apiGetNotifications()
      .then(setNotifications)
      .catch(err => console.error("Failed to load notifications:", err));
  }, []);

  const toggleAvail = async (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    try {
      const updated = await apiUpdateVehicle(id, { online: !vehicle.online });
      setVehicles(vs => vs.map(v => v.id === id ? updated : v));
    } catch (err) {
      console.error("Toggle failed:", err);
      console.error("Toggle error detail:", JSON.stringify(err));
    }
  };

  const openEdit = (v) => {
    setEditing(v.id);
    setNewVehicle({
      name: v.name,
      type: v.type,
      capacity: v.capacity,
      location: v.location,
      reg: v.reg,
      phone: v.phone ?? "",
      image_url: v.image_url ?? "",
    });
    setVehicleErrors({});
    setShowAddVehicle(true);
  };

  const deleteVehicle = async (id) => {
    try {
      await apiDeleteVehicle(id);
      setVehicles(vs => vs.filter(v => v.id !== id));
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
    }
  };

  const markOne = async (id) => {
    await apiMarkNotificationRead(id);
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAll = async () => {
    await apiMarkAllNotificationsRead();
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  };

  const validateVehicle = () => {
    const e = {};
    if (!newVehicle.name.trim()) e.name = "Vehicle name is required";
    if (!newVehicle.capacity.trim()) e.capacity = "Capacity is required";
    if (!newVehicle.location.trim()) e.location = "Location is required";
    if (!newVehicle.reg.trim()) e.reg = "Registration number is required";
    return e;
  };

  const uploadVehicleImage = async (file) => {
    try {
      const { url } = await apiUploadVehicleImage(file);
      setNewVehicle(v => ({ ...v, image_url: url }));
    } catch (err) {
      console.error("Vehicle image upload failed:", err);
    }
  };

  const addVehicle = async () => {
    const e = validateVehicle();
    if (Object.keys(e).length) { setVehicleErrors(e); return; }
    try {
      const created = await apiCreateVehicle(newVehicle);
      setVehicles(vs => [...vs, created]);
      setNewVehicle({ name: "", type: "Tipper Truck", capacity: "", location: "", phone: "", reg: "", image_url: "" });
      setVehicleErrors({});
      setErrors({});
      setShowAddVehicle(false);
    } catch (err) {
      console.error("Failed to save vehicle:", err);
      const message = err.detail || "Failed to save vehicle. Please try again.";
      setErrors({ general: message });
    }
  };

  const sendSupport = async () => {
    if (!supportForm.subject || !supportForm.message) return;
    try {
      await apiSubmitComplaint(supportForm.subject, supportForm.category ?? "General Enquiry", supportForm.message);
      setSupportSent(true);
      setSupportForm({ subject: "", category: "General Enquiry", message: "" });
      setTimeout(() => setSupportSent(false), 3000);
    } catch (err) {
      console.error("Failed to submit complaint:", err);
      alert(err.detail || "Failed to submit. Please try again.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; color: #fff; font-family: 'DM Sans', sans-serif; }

        .sidebar-link { display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 1.25rem; color: #6B7280; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border-left: 2px solid transparent; }
        .sidebar-link:hover { color: #fff; background: rgba(255,255,255,0.04); }
        .sidebar-link.active { color: #F97316; border-left-color: #F97316; background: rgba(249,115,22,0.08); }

        .stat-card { background: #111827; border: 1px solid rgba(255,255,255,0.06); padding: 1.5rem; transition: all 0.25s; }
        .stat-card:hover { border-color: rgba(249,115,22,0.3); transform: translateY(-2px); }

        .vehicle-card { background: #111827; border: 1px solid rgba(255,255,255,0.06); padding: 1.5rem; transition: all 0.25s; }
        .vehicle-card:hover { border-color: rgba(249,115,22,0.2); }

        .btn-primary { background: #F97316; color: #fff; border: none; padding: 0.7rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); }
        .btn-primary:hover { background: #EA6C00; transform: translateY(-1px); }

        .btn-outline { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 0.7rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); }
        .btn-outline:hover { border-color: #F97316; color: #F97316; }

        .btn-danger { background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 0.5rem 1rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .btn-danger:hover { background: rgba(239,68,68,0.1); border-color: #ef4444; }

        .dash-input { width: 100%; background: #1F2937; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.75rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .dash-input::placeholder { color: #4B5563; }
        .dash-input:focus { border-color: #F97316; }
        .dash-input.error { border-color: #ef4444; }

        .dash-select { width: 100%; background: #1F2937; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.75rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; cursor: pointer; }
        .dash-select:focus { border-color: #F97316; }

        .toggle { position: relative; width: 44px; height: 24px; background: #374151; border-radius: 12px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; border: none; }
        .toggle.on { background: #F97316; }
        .toggle::after { content: ''; position: absolute; width: 18px; height: 18px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: transform 0.2s; }
        .toggle.on::after { transform: translateX(20px); }

        .notif-item { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 1rem; align-items: flex-start; transition: background 0.2s; }
        .notif-item:hover { background: rgba(255,255,255,0.02); }
        .notif-item.unread { background: rgba(249,115,22,0.04); border-left: 2px solid #F97316; }

        .section-tag { display: inline-block; background: rgba(249,115,22,0.15); color: #F97316; font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.3rem 0.85rem; margin-bottom: 0.75rem; border-left: 2px solid #F97316; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
        .modal { background: #111827; border: 1px solid rgba(249,115,22,0.3); max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; }

        @media (max-width: 768px) {
          .sidebar { position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 150; transform: translateX(-100%); transition: transform 0.3s; }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0 !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vehicles-grid { grid-template-columns: 1fr !important; }
          .modal { max-width: 100% !important; margin: 0.5rem !important; padding: 1.5rem !important; }
          table, .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .vehicles-grid { grid-template-columns: 1fr !important; }
          .btn-primary, .btn-outline { width: 100% !important; }
          .dash-input, .dash-select, .search-input, .filter-select { width: 100% !important; }
          .modal { padding: 1.5rem !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{ width: 240, background: "#0f0f0f", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 150 }}>
          {/* Logo */}
          <div onClick={() => navigate("/")} style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, background: "#F97316", clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>🚛</div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.05em" }}>STRONG HAUL</span>
          </div>

          {/* Owner Info */}
          <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {user?.avatar
                ? <img
                    src={user.avatar}
                    alt="avatar"
                    style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
                  />
                : <div style={{ width: 38, height: 38, background: "#F97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>
                    {user?.name?.charAt(0) ?? "U"}
                  </div>
              }
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{user?.name ?? "Owner"}</div>
                <div style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", fontSize: "0.68rem", fontWeight: 700, padding: "0.15rem 0.5rem", display: "inline-block", marginTop: "0.2rem" }}>{user?.plan ?? "Free Trial"}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, paddingTop: "0.75rem" }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`sidebar-link ${active === item.id ? "active" : ""}`} onClick={() => { setActive(item.id); setSidebarOpen(false); }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "notifications" && unread > 0 && (
                  <span style={{ marginLeft: "auto", background: "#F97316", color: "#fff", fontSize: "0.68rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "10px" }}>{unread}</span>
                )}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="sidebar-link" onClick={() => { logout(); navigate("/"); }} style={{ color: "#ef4444", borderLeft: "none", padding: "0.75rem 0" }}>
              <span>🚪</span><span>Log Out</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main-content" style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Top Bar */}
          <header style={{ background: "rgba(10,10,10,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
                {NAV_ITEMS.find(n => n.id === active)?.label}
              </h1>
              <p style={{ color: "#6B7280", fontSize: "0.8rem" }}>Member since {OWNER.memberSince}</p>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button onClick={() => setActive("notifications")} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "1.3rem", position: "relative" }}>
                🔔
                {unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#F97316", borderRadius: "50%", width: 16, height: 16, fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unread}</span>}
              </button>
              <button className="btn-primary" style={{ padding: "0.55rem 1.25rem", fontSize: "0.8rem" }} onClick={() => { setActive("vehicles"); setShowAddVehicle(true); }}>+ Add Vehicle</button>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, padding: "2rem" }}>

            {/* DASHBOARD */}
            {active === "dashboard" && (
              <div>
                <span className="section-tag">Overview</span>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "2rem" }}>Welcome back, {user?.name?.split(" ")[0] ?? "Owner"} 👋</h2>

                {/* Stats */}
                <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
                  {[
                    { label: "Total Vehicles", value: vehicles.length, icon: "🚛", color: "#F97316" },
                    { label: "Online Now", value: onlineCount, icon: "🟢", color: "#22c55e" },
                    { label: "Total Views", value: totalViews, icon: "👁️", color: "#60a5fa" },
                    { label: "Total Contacts", value: totalContacts, icon: "📞", color: "#a855f7" },
                  ].map((s, i) => (
                    <div key={i} className="stat-card">
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.5rem", color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ color: "#6B7280", fontSize: "0.82rem", marginTop: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Vehicle Summary */}
                <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.3rem" }}>Your Vehicles</h3>
                    <button className="btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.78rem" }} onClick={() => setActive("vehicles")}>View All</button>
                  </div>
                  {vehicles.map(v => (
                    <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {v.image_url
                          ? <img src={v.image_url} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "0.65rem" }} />
                          : <div style={{ width: 60, height: 60, background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>🚛</div>
                        }
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{v.name}</div>
                          <div style={{ color: "#6B7280", fontSize: "0.78rem" }}>{v.type} · {v.capacity}</div>
                          {v.phone && (
                            <a href={`https://wa.me/${v.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37,211,102,0.15)", color: "#25D366", padding: "0.4rem 0.85rem", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", marginTop: "0.5rem" }}>
                              💬 WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{v.views}</div>
                          <div style={{ color: "#6B7280", fontSize: "0.72rem" }}>Views</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{v.contacts}</div>
                          <div style={{ color: "#6B7280", fontSize: "0.72rem" }}>Contacts</div>
                        </div>
                        <span style={{ background: v.online ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: v.online ? "#22c55e" : "#ef4444", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem" }}>{v.online ? "ONLINE" : "OFFLINE"}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Plan Banner */}
                <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem" }}>You're on the {user?.plan ?? "Free Trial"} Plan</div>
                    <div style={{ color: "#9CA3AF", fontSize: "0.85rem", marginTop: "0.25rem" }}>Unlimited listings · High search priority · Analytics</div>
                  </div>
                  <button className="btn-primary" onClick={() => setActive("subscription")}>Manage Plan</button>
                </div>
              </div>
            )}

            {/* MY VEHICLES */}
            {active === "vehicles" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <div>
                    <span className="section-tag">Fleet</span>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem" }}>My Vehicles</h2>
                  </div>
                  <button className="btn-primary" onClick={() => setShowAddVehicle(true)}>+ Add Vehicle</button>
                </div>

                <div className="vehicles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
                  {vehicles.map(v => (
                    <div key={v.id} className="vehicle-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                          {v.image_url
                            ? <img src={v.image_url} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "0.65rem" }} />
                            : <div style={{ width: 60, height: 60, background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>🚛</div>
                          }
                          <div>
                            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>{v.name}</h3>
                            <p style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>{v.type} · {v.capacity}</p>
                          </div>
                        </div>
                        <button className={`toggle ${v.online ? "on" : ""}`} onClick={() => toggleAvail(v.id)} title={v.online ? "Set Offline" : "Set Online"} />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                        {[["📍 Location", v.location], ["🔖 Reg", v.reg], ["👁️ Views", v.views], ["📞 Contacts", v.contacts]].map(([label, val]) => (
                          <div key={label} style={{ background: "#0A0A0A", padding: "0.65rem 0.85rem" }}>
                            <div style={{ color: "#6B7280", fontSize: "0.7rem", marginBottom: "0.2rem" }}>{label}</div>
                            <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {v.phone && (
                        <a href={`https://wa.me/${v.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37,211,102,0.15)", color: "#25D366", padding: "0.4rem 0.85rem", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", marginBottom: "1rem" }}>
                          💬 WhatsApp
                        </a>
                      )}

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button className="btn-outline" style={{ flex: 1, padding: "0.55rem", fontSize: "0.78rem" }} onClick={() => openEdit(v)}>✏️ Edit</button>
                        <button className="btn-danger" style={{ flex: 1 }} onClick={() => deleteVehicle(v.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {vehicles.length === 0 && (
                  <div style={{ textAlign: "center", padding: "5rem", color: "#6B7280" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚛</div>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.8rem", color: "#9CA3AF", marginBottom: "0.5rem" }}>No vehicles yet</h3>
                    <p style={{ marginBottom: "1.5rem" }}>Add your first vehicle to get discovered by hirers</p>
                    <button className="btn-primary" onClick={() => setShowAddVehicle(true)}>+ Add Vehicle</button>
                  </div>
                )}
              </div>
            )}

            {/* SUBSCRIPTION */}
            {active === "subscription" && (
              <div>
                <span className="section-tag">Billing</span>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "2rem" }}>Subscription</h2>

                {/* Current Plan */}
                <div style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.3)", padding: "1.75rem", marginBottom: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ color: "#F97316", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Current Plan</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.5rem", lineHeight: 1 }}>{user?.plan ?? "Free Trial"}</div>
                      <div style={{ color: "#9CA3AF", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                        {user?.plan === "Premium" && "Unlimited listings · High search priority · Analytics"}
                        {user?.plan === "Enterprise" && "Dedicated company page · Fleet analytics · Account manager"}
                        {(!user?.plan || user?.plan === "Free Trial") && "Up to 3 listings · Basic profile · Low search priority"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {user?.plan !== "Free Trial" && (
                        <button
                          className="btn-danger"
                          style={{ display: "block", marginBottom: "0.5rem" }}
                          onClick={async () => {
                            try {
                              await apiCancelSubscription();
                              login({ ...user, plan: "Free Trial" }, localStorage.getItem("sh_token"));
                              setActive("subscription");
                              alert("Your plan has been cancelled. You are now on the Free Trial.");
                            } catch (err) {
                              console.error("Cancel failed:", err);
                              alert(err.detail || "Failed to cancel subscription. Please try again.");
                            }
                          }}
                        >Cancel Plan</button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan Cards */}
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.4rem", marginBottom: "1.25rem" }}>Available Plans</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  {[
                    { name: "Free Trial", price: "Free", period: "1 Month", features: ["Up to 3 listings", "Basic profile", "Low priority"] },
                    { name: "Premium", price: "TBD", period: "per month", features: ["Unlimited listings", "High priority", "Analytics", "API access"] },
                    { name: "Enterprise", price: "Custom", period: "contact sales", features: ["Company page", "Fleet analytics", "Account manager"] },
                  ].map((plan, i) => {
                    const isCurrent = plan.name === (user?.plan ?? "Free Trial");
                    return (
                      <div key={i} style={{ background: isCurrent ? "rgba(249,115,22,0.08)" : "#111827", border: `1px solid ${isCurrent ? "#F97316" : "rgba(255,255,255,0.08)"}`, padding: "1.75rem" }}>
                        {isCurrent && <div style={{ color: "#F97316", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.5rem" }}>✓ CURRENT PLAN</div>}
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem", marginBottom: "0.25rem" }}>{plan.name}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.5rem", color: isCurrent ? "#F97316" : "#fff", lineHeight: 1 }}>{plan.price}</div>
                        <div style={{ color: "#6B7280", fontSize: "0.8rem", marginBottom: "1.25rem" }}>{plan.period}</div>
                        {plan.features.map(f => (
                          <div key={f} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
                            <span style={{ color: "#F97316" }}>✓</span>
                            <span style={{ color: "#D1D5DB", fontSize: "0.85rem" }}>{f}</span>
                          </div>
                        ))}
                        <button
                          className={isCurrent ? "btn-outline" : "btn-primary"}
                          style={{ width: "100%", marginTop: "1.25rem" }}
                          disabled={isCurrent}
                          onClick={isCurrent ? undefined : async () => {
                            try {
                              if (plan.name === "Free Trial") {
                                await apiCancelSubscription();
                                login({ ...user, plan: "Free Trial" }, localStorage.getItem("sh_token"));
                                alert("You have been downgraded to Free Trial.");
                              } else {
                                const data = await apiInitiatePayment(plan.name);
                                window.location.href = data.authorization_url;
                              }
                            } catch (err) {
                              alert(err.detail || (plan.name === "Free Trial" ? "Failed to cancel subscription." : "Payment failed. Please try again."));
                            }
                          }}
                        >
                          {isCurrent ? "Current Plan" : `Switch to ${plan.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {active === "notifications" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <div>
                    <span className="section-tag">Inbox</span>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem" }}>Notifications</h2>
                  </div>
                  {unread > 0 && <button className="btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.78rem" }} onClick={markAll}>Mark All Read</button>}
                </div>

                <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
                      <span style={{ fontSize: "1.3rem", marginTop: "0.1rem" }}>
                        {n.type === "contact" ? "📞" : n.type === "announcement" ? "📢" : "💳"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.9rem", color: n.read ? "#9CA3AF" : "#fff", lineHeight: 1.5 }}>{n.message}</p>
                        <p style={{ color: "#4B5563", fontSize: "0.75rem", marginTop: "0.3rem" }}>{n.time}</p>
                      </div>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F97316", marginTop: "0.4rem", flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE */}
            {active === "profile" && (
              <div style={{ maxWidth: 540 }}>
                <span className="section-tag">Account</span>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "2rem" }}>Profile</h2>

                <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "2rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                    <div style={{ width: 56, height: 56, background: "#F97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem" }}>{OWNER.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{OWNER.name}</div>
                      <div style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>@{profileForm.username}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {[["Username", "username", "text"], ["Email Address", "email", "email"], ["New Password", "password", "password"]].map(([label, field, type]) => (
                      <div key={field}>
                        <label style={{ color: "#9CA3AF", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>{label}</label>
                        <input className="dash-input" type={type} value={profileForm[field]} placeholder={type === "password" ? "Leave blank to keep current" : ""} onChange={e => setProfileForm(f => ({ ...f, [field]: e.target.value }))} />
                      </div>
                    ))}
                    <button className="btn-primary" style={{ marginTop: "0.5rem" }}>Save Changes</button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#ef4444", marginBottom: "0.5rem" }}>Danger Zone</h3>
                  <p style={{ color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "1rem" }}>Deleting your account is permanent and cannot be undone.</p>
                  <button className="btn-danger">Delete Account</button>
                </div>
              </div>
            )}

            {/* SUPPORT */}
            {active === "support" && (
              <div style={{ maxWidth: 540 }}>
                <span className="section-tag">Help</span>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "2rem" }}>Support</h2>

                {supportSent && (
                  <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span>✓</span>
                    <span style={{ color: "#22c55e", fontSize: "0.9rem" }}>Your message has been sent. We'll get back to you soon.</span>
                  </div>
                )}

                <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "2rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                      <label style={{ color: "#9CA3AF", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Subject</label>
                      <input className="dash-input" placeholder="e.g. Issue with my listing" value={supportForm.subject} onChange={e => setSupportForm(f => ({ ...f, subject: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ color: "#9CA3AF", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Message</label>
                      <textarea className="dash-input" rows={6} placeholder="Describe your issue in detail..." value={supportForm.message} onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))} style={{ resize: "vertical" }} />
                    </div>
                    <button className="btn-primary" onClick={sendSupport}>Send Message</button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ADD VEHICLE MODAL */}
      {showAddVehicle && (
        <div className="modal-overlay" onClick={() => setShowAddVehicle(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.8rem" }}>Add Vehicle</h2>
              <button onClick={() => setShowAddVehicle(false)} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {[["Vehicle Name", "name", "e.g. Mack Granite Tipper"], ["Capacity", "capacity", "e.g. 30 tons"], ["Location", "location", "e.g. Accra, Ghana"], ["WhatsApp / Phone Number", "phone", "e.g. +233 24 123 4567"], ["Registration Number", "reg", "e.g. GR-1234-22"]].map(([label, field, placeholder]) => (
                <div key={field}>
                  <label style={{ color: "#9CA3AF", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>{label}</label>
                  <input className={`dash-input ${vehicleErrors[field] ? "error" : ""}`} placeholder={placeholder} value={newVehicle[field]} onChange={e => { setNewVehicle(v => ({ ...v, [field]: e.target.value })); setVehicleErrors(er => ({ ...er, [field]: "" })); }} />
                  {vehicleErrors[field] && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{vehicleErrors[field]}</p>}
                </div>
              ))}

              <div>
                <label style={{ color: "#9CA3AF", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Vehicle Type</label>
                <select className="dash-select" value={newVehicle.type} onChange={e => setNewVehicle(v => ({ ...v, type: e.target.value }))}>
                  {["Tipper Truck", "Flatbed Truck", "Tanker Truck", "Excavator", "Crane", "Lowboy", "Refrigerated Truck"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ color: "#9CA3AF", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Vehicle Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="dash-input"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await uploadVehicleImage(file);
                    }
                  }}
                />
              </div>

              {errors.general && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.75rem 1rem", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  {errors.general}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={addVehicle}>Add Vehicle</button>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowAddVehicle(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
