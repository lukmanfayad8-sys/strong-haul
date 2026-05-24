import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiAdminDashboard, apiAdminGetUsers, apiAdminToggleUser, apiAdminGetComplaints, apiAdminResolveComplaint, apiAdminSendAnnouncement, apiAdminGetSubscriptions, apiAdminUpdatePrice, apiAdminMonthlyStats, apiAdminGetEmployees, apiAdminAddEmployee, apiAdminToggleEmployee } from "../api";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SECTIONS = ["Users", "Complaints", "Subscriptions", "Announcements", "Admin-Support"];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "users", label: "Users", icon: "◉" },
  { id: "support", label: "Admin-Support", icon: "⊕" },
  { id: "complaints", label: "Complaints", icon: "⚑" },
  { id: "employees", label: "Employees", icon: "⊞" },
  { id: "announcements", label: "Announcements", icon: "◎" },
  { id: "subscriptions", label: "Subscriptions", icon: "★" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const TAG = { display: "inline-block", background: "rgba(249,115,22,0.15)", color: "#F97316", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.3rem 0.85rem", marginBottom: "0.5rem", borderLeft: "2px solid #F97316" };
const H2 = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.4rem", letterSpacing: "-0.01em", lineHeight: 1 };
const LABEL = { color: "#9CA3AF", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" };
const INPUT = { width: "100%", background: "#1F2937", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "0.75rem 1rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", outline: "none", display: "block" };
const MODAL_OVL = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" };
const MODAL_BOX = { background: "#111827", border: "1px solid rgba(249,115,22,0.3)", padding: "2.25rem", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" };
const TH = { padding: "0.75rem 1rem", color: "#6B7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0A0A0A", whiteSpace: "nowrap" };
const TD = { padding: "0.85rem 1rem", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" };

const PLAN_COLOR = { Premium: "#F97316", Enterprise: "#a855f7", "Free Trial": "#6B7280" };
const STATUS_STYLE = (s) => ({ background: s === "active" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: s === "active" ? "#22c55e" : "#ef4444", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", padding: "0.2rem 0.6rem", textTransform: "uppercase" });

// ─── Sections ─────────────────────────────────────────────────────────────────

function DashboardSection({ users, complaints, dashboardStats, monthlyData }) {
  const totalOwners = dashboardStats?.total_owners ?? 0;
  const activeSubs = dashboardStats?.active_owners ?? 0;
  const premium = dashboardStats?.premium_subscribers ?? 0;
  const enterprise = dashboardStats?.enterprise_subscribers ?? 0;
  const openComplaints = dashboardStats?.open_complaints ?? 0;
  const max = Math.max(...(monthlyData.length ? monthlyData.map(d => d.subs) : [1]));
  const currentMonthShort = new Date().toLocaleString("default", { month: "short" });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <span style={TAG}>Overview</span>
        <h2 style={H2}>ADMIN DASHBOARD</h2>
        <p style={{ color: "#6B7280", fontSize: "0.88rem", marginTop: "0.4rem" }}>Platform health at a glance.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { value: totalOwners, label: "Total Owners", sub: "Registered accounts", accent: true },
          { value: activeSubs, label: "Active Owners", sub: `${totalOwners - activeSubs} inactive` },
          { value: premium + enterprise, label: "Paid Subscribers", sub: `${premium} Premium · ${enterprise} Enterprise` },
          { value: openComplaints, label: "Open Complaints", sub: `${complaints.length - openComplaints} resolved` },
        ].map(s => (
          <div key={s.label} style={{ background: "#111827", border: `1px solid ${s.accent ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.06)"}`, padding: "1.5rem", position: "relative", overflow: "hidden" }}>
            {s.accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#F97316" }} />}
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.4rem", color: s.accent ? "#F97316" : "#fff", lineHeight: 1 }}>{s.value}</div>
            <div style={{ color: "#9CA3AF", fontSize: "0.78rem", marginTop: "0.35rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
            <div style={{ color: "#4B5563", fontSize: "0.73rem", marginTop: "0.2rem" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Monthly chart */}
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "1.75rem" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", color: "#F97316", marginBottom: "1.5rem" }}>MONTHLY SUBSCRIBERS</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: 120 }}>
            {monthlyData.map(d => (
              <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.75rem", color: "#6B7280" }}>{d.subs}</div>
                <div style={{ width: "100%", background: d.month === currentMonthShort ? "#F97316" : "rgba(249,115,22,0.25)", height: `${(d.subs / max) * 90}px`, transition: "height 0.3s" }} />
                <div style={{ color: "#6B7280", fontSize: "0.7rem" }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan breakdown */}
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "1.75rem" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", color: "#F97316", marginBottom: "1.5rem" }}>PLAN DISTRIBUTION</div>
          {[["Free Trial", users.filter(u => u.plan === "Free Trial").length, "#6B7280"], ["Premium", premium, "#F97316"], ["Enterprise", enterprise, "#a855f7"]].map(([plan, count, color]) => (
            <div key={plan} style={{ marginBottom: "1.1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "#D1D5DB", fontSize: "0.85rem" }}>{plan}</span>
                <span style={{ color, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{count}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <div style={{ height: "100%", background: color, borderRadius: 3, width: `${users.length > 0 ? (count / users.length) * 100 : 0}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>Total registered owners</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#fff" }}>{users.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent complaints */}
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "1.75rem", marginTop: "1.5rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", color: "#F97316", marginBottom: "1.25rem" }}>RECENT COMPLAINTS</div>
        {complaints.slice(0, 3).map(c => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.15rem" }}>{c.subject}</div>
              <div style={{ color: "#6B7280", fontSize: "0.78rem" }}>{c.email} · {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}</div>
            </div>
            <span style={STATUS_STYLE(c.status === "open" ? "inactive" : "active")}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersSection({ users, setUsers }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = users.filter(u => {
    const q = (search || "").toLowerCase();
    const matchSearch = !q || (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q) || (u.truckType ?? "").toLowerCase().includes(q);
    const matchPlan = planFilter === "All" || u.plan === planFilter;
    const matchStatus = statusFilter === "All" || (statusFilter === (u.is_active ? "active" : "inactive"));
    return matchSearch && matchPlan && matchStatus;
  });

  const toggleStatus = async (id) => {
    const updated = await apiAdminToggleUser(id);
    setUsers(us => us.map(u => u.id === id ? { ...u, is_active: updated.is_active } : u));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.75rem" }}>
        <div><span style={TAG}>Registry</span><h2 style={H2}>USERS</h2></div>
        <div style={{ color: "#6B7280", fontSize: "0.85rem" }}>{filtered.length} of {users.length} owners</div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
      <input style={{ ...INPUT, width: 240 }} placeholder="Search name, email, type…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...INPUT, width: 150 }} value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          {["All", "Free Trial", "Premium", "Enterprise"].map(p => <option key={p}>{p}</option>)}
        </select>
        <select style={{ ...INPUT, width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {["All", "active", "inactive"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Email", "Truck Type", "Phone", "Plan", "Listings", "Status", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", cursor: "pointer" }} onClick={() => setSelected(u)}>
                <td style={TD}><span style={{ fontWeight: 600 }}>{u.name ?? u.email?.split("@")[0]}</span></td>
                <td style={{ ...TD, color: "#9CA3AF" }}>{u.email}</td>
                <td style={TD}>{u.truckType ?? "—"}</td>
                <td style={{ ...TD, color: "#9CA3AF" }}>{u.phone ?? "—"}</td>
                <td style={TD}><span style={{ color: PLAN_COLOR[u.plan], fontWeight: 600, fontSize: "0.82rem" }}>{u.plan}</span></td>
                <td style={{ ...TD, textAlign: "center" }}>{u.listings ?? "—"}</td>
                <td style={TD} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }} onClick={() => toggleStatus(u.id)}>
                    <div style={{ width: 28, height: 16, background: (u.is_active ? "#F97316" : "#374151"), borderRadius: 8, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 2, left: (u.is_active ? 14 : 2), width: 12, height: 12, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
                    </div>
                    <span style={{ ...STATUS_STYLE(u.is_active ? "active" : "inactive") }}>{u.is_active ? "active" : "inactive"}</span>
                  </div>
                </td>
                <td style={TD} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelected(u)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#9CA3AF", padding: "0.3rem 0.75rem", fontSize: "0.75rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: "2.5rem", textAlign: "center", color: "#4B5563" }}>No users match your filters.</div>}
      </div>

      {/* User detail modal */}
      {selected && (
        <div style={MODAL_OVL} onClick={() => setSelected(null)}>
          <div style={{ ...MODAL_BOX, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.75rem" }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>{selected.name ?? selected.email?.split("@")[0]}</div>
                <div style={{ color: "#6B7280", fontSize: "0.82rem", marginTop: "0.2rem" }}>Member since {selected.created_at ? new Date(selected.created_at).toLocaleDateString() : "-"}</div>
              </div>
              <span style={STATUS_STYLE(selected.is_active ? "active" : "inactive")}>{selected.is_active ? "active" : "inactive"}</span>
            </div>
            {[["Email", selected.email], ["Phone", selected.phone], ["Truck Type", selected.truckType], ["Active Listings", selected.listings], ["Plan", selected.plan]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#6B7280", fontSize: "0.85rem" }}>{k}</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: k === "Plan" ? PLAN_COLOR[v] : "#D1D5DB" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
              <button onClick={() => { toggleStatus(selected.id); setSelected(null); }} style={{ flex: 1, background: selected.is_active ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: selected.is_active ? "#ef4444" : "#22c55e", border: `1px solid ${selected.is_active ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, padding: "0.75rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                {selected.is_active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => setSelected(null)} style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#9CA3AF", padding: "0.75rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSupportSection({ employees, setEmployees }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", section: "Users" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    return e;
  };

  const handleAdd = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      const newEmp = await apiAdminAddEmployee(form.name, form.email, form.section);
      setEmployees(prev => [...prev, newEmp]);
      setShowForm(false);
      setForm({ name: "", email: "", section: "Users" });
      setErrors({});
    } catch (err) {
      setErrors({ general: err.detail || "Failed to add sub-admin. Make sure the user has registered first." });
    }
  };

  const toggleEmp = async (id) => {
    try {
      const updated = await apiAdminToggleEmployee(id);
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, is_active: updated.is_active } : e));
    } catch (err) {
      console.error("Failed to toggle employee:", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.75rem" }}>
        <div><span style={TAG}>Access</span><h2 style={H2}>ADMIN-SUPPORT</h2></div>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ padding: "0.6rem 1.4rem", fontSize: "0.82rem" }}>+ Add Sub-Admin</button>
      </div>

      <div style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.18)", padding: "1rem 1.25rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#9CA3AF", lineHeight: 1.6 }}>
        Super admin assigns sub-admins to specific sections. Each sub-admin can only access their assigned section. Use the toggle to activate or deactivate access.
      </div>

      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Name", "Username", "Email", "Assigned Section", "Status", "Since", "Access"].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr key={emp.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <td style={{ ...TD, fontWeight: 600 }}>{emp.name}</td>
                <td style={{ ...TD, color: "#9CA3AF" }}>@{emp.username}</td>
                <td style={{ ...TD, color: "#9CA3AF" }}>{emp.email}</td>
                <td style={TD}><span style={{ background: "rgba(249,115,22,0.12)", color: "#F97316", fontSize: "0.75rem", padding: "0.2rem 0.6rem", fontWeight: 600 }}>{emp.section}</span></td>
                <td style={TD}><span style={STATUS_STYLE(emp.is_active ? "active" : "inactive")}>{emp.is_active ? "active" : "inactive"}</span></td>
                <td style={{ ...TD, color: "#6B7280" }}>{emp.since}</td>
                <td style={TD}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }} onClick={() => toggleEmp(emp.id)}>
                    <div style={{ width: 28, height: 16, background: emp.is_active ? "#F97316" : "#374151", borderRadius: 8, position: "relative", transition: "background 0.2s" }}>
                      <div style={{ position: "absolute", top: 2, left: emp.is_active ? 14 : 2, width: 12, height: 12, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={MODAL_OVL} onClick={() => setShowForm(false)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.6rem", marginBottom: "1.75rem" }}>ADD SUB-ADMIN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={LABEL}>Full Name</label>
                <input style={{ ...INPUT, ...(errors.name ? { borderColor: "#ef4444" } : {}) }} placeholder="e.g. Ama Boateng" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }} />
                {errors.name && <p style={{ color: "#ef4444", fontSize: "0.73rem", marginTop: "0.2rem" }}>{errors.name}</p>}
              </div>
              {/** username removed - backend ignores it */}
              <div>
                <label style={LABEL}>Email</label>
                <input style={{ ...INPUT, ...(errors.email ? { borderColor: "#ef4444" } : {}) }} placeholder="e.g. ama@stronghaul.com" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: "" })); }} />
                {errors.email && <p style={{ color: "#ef4444", fontSize: "0.73rem", marginTop: "0.2rem" }}>{errors.email}</p>}
              </div>
              <div>
                <label style={LABEL}>Assigned Section</label>
                <select style={INPUT} value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}>
                  {SECTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {errors.general && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.75rem 1rem", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  {errors.general}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button className="btn-primary" onClick={handleAdd} style={{ flex: 1 }}>Add Sub-Admin</button>
                <button className="btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplaintsSection({ complaints, setComplaints }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? complaints : complaints.filter(c => c.status === filter);
  const resolve = async (id) => {
    await apiAdminResolveComplaint(id);
    setComplaints(cs => cs.map(c => c.id === id ? { ...c, status: "resolved" } : c));
    setSelected(null);
  };

  const CATEGORY_COLOR = { "Listing Problem": "#F97316", "Billing Issue": "#ef4444", "Technical Support": "#3b82f6", "Report Abuse": "#a855f7", "General Enquiry": "#22c55e" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.75rem" }}>
        <div><span style={TAG}>Inbox</span><h2 style={H2}>COMPLAINTS</h2></div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["All", "open", "resolved"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "#F97316" : "transparent", color: filter === f ? "#fff" : "#6B7280", border: `1px solid ${filter === f ? "#F97316" : "rgba(255,255,255,0.1)"}`, padding: "0.4rem 1rem", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize", letterSpacing: "0.05em" }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filtered.map(c => (
          <div key={c.id} onClick={() => setSelected(c)} style={{ background: "#111827", border: `1px solid ${c.status === "open" ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)"}`, padding: "1.25rem 1.5rem", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ background: `${CATEGORY_COLOR[c.category] || "#6B7280"}20`, color: CATEGORY_COLOR[c.category] || "#6B7280", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.6rem", letterSpacing: "0.06em" }}>{c.category}</span>
                {c.status === "open" && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F97316", display: "inline-block" }} />}
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{c.subject}</div>
              <div style={{ color: "#6B7280", fontSize: "0.78rem" }}>{c.email} · {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}</div>
            </div>
            <span style={STATUS_STYLE(c.status === "open" ? "inactive" : "active")}>{c.status}</span>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "#4B5563", background: "#111827", border: "1px solid rgba(255,255,255,0.04)" }}>No complaints in this category.</div>}
      </div>

      {selected && (
        <div style={MODAL_OVL} onClick={() => setSelected(null)}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <span style={{ background: `${CATEGORY_COLOR[selected.category] || "#6B7280"}20`, color: CATEGORY_COLOR[selected.category] || "#6B7280", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.7rem", letterSpacing: "0.06em", display: "inline-block", marginBottom: "0.5rem" }}>{selected.category}</span>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem" }}>{selected.subject}</div>
              </div>
              <span style={STATUS_STYLE(selected.status === "open" ? "inactive" : "active")}>{selected.status}</span>
            </div>
            <div style={{ background: "#0A0A0A", padding: "1.25rem", marginBottom: "1.5rem", lineHeight: 1.7, color: "#D1D5DB", fontSize: "0.9rem" }}>{selected.message}</div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#6B7280", fontSize: "0.78rem", marginBottom: "1.5rem" }}>
              <span>From: {selected.email}</span><span>{selected.created_at ? new Date(selected.created_at).toLocaleDateString() : "-"}</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {selected.status === "open" && <button onClick={() => resolve(selected.id)} className="btn-primary" style={{ flex: 1 }}>Mark Resolved</button>}
              <button onClick={() => setSelected(null)} className="btn-outline" style={{ flex: 1 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeesSection({ employees }) {
  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <span style={TAG}>Team</span>
        <h2 style={H2}>EMPLOYEES</h2>
        <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: "0.4rem" }}>All sub-admins added by super admin. Manage access from Admin-Support.</p>
      </div>
      {employees.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#4B5563" }}>No sub-admins added yet.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {employees.map(emp => (
            <div key={emp.id} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, background: emp.is_active ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${emp.is_active ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: emp.is_active ? "#F97316" : "#6B7280", flexShrink: 0 }}>
                {(emp.name ?? emp.email)?.charAt(0) ?? "?"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{emp.name ?? emp.email}</div>
                    <div style={{ color: "#6B7280", fontSize: "0.78rem" }}>@{emp.username ?? emp.email?.split("@")[0]}</div>
                  </div>
                  <span style={STATUS_STYLE(emp.is_active ? "active" : "inactive")}>{emp.is_active ? "active" : "inactive"}</span>
                </div>
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(249,115,22,0.12)", color: "#F97316", fontSize: "0.72rem", padding: "0.2rem 0.6rem", fontWeight: 600 }}>{emp.admin_section ?? emp.section ?? "Unassigned"}</span>
                  <span style={{ color: "#4B5563", fontSize: "0.75rem", padding: "0.2rem 0" }}>{emp.created_at ? new Date(emp.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementsSection() {
  const [form, setForm] = useState({ title: "", message: "", audience: "owners" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const AUDIENCES = [
    { value: "owners", label: "All Owners", desc: "Sent to all registered truck owners" },
    { value: "employees", label: "Employees / Sub-Admins", desc: "Sent to internal team only" },
    { value: "public", label: "Public (Browse Page)", desc: "Shown as a banner on the Browse Trucks page" },
  ];

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) return;

    try {
      await apiAdminSendAnnouncement(form.title, form.message, form.audience);
      setForm({ title: "", message: "", audience: "owners" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to send announcement:", err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <span style={TAG}>Broadcast</span>
        <h2 style={H2}>ANNOUNCEMENTS</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Compose */}
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "2rem" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.07em", color: "#F97316", marginBottom: "1.5rem" }}>COMPOSE ANNOUNCEMENT</div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={LABEL}>Send To</label>
            {AUDIENCES.map(a => (
              <label key={a.value} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem", cursor: "pointer", background: form.audience === a.value ? "rgba(249,115,22,0.08)" : "transparent", border: `1px solid ${form.audience === a.value ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.05)"}`, marginBottom: "0.5rem", transition: "all 0.2s" }}>
                <input type="radio" name="audience" value={a.value} checked={form.audience === a.value} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} style={{ marginTop: "0.2rem", accentColor: "#F97316" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{a.label}</div>
                  <div style={{ color: "#6B7280", fontSize: "0.75rem" }}>{a.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={LABEL}>Title</label>
            <input style={{ ...INPUT, ...(errors.title ? { borderColor: "#ef4444" } : {}) }} placeholder="Announcement title" value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: "" })); }} />
            {errors.title && <p style={{ color: "#ef4444", fontSize: "0.73rem", marginTop: "0.2rem" }}>{errors.title}</p>}
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={LABEL}>Message</label>
            <textarea style={{ ...INPUT, minHeight: 120, resize: "vertical", ...(errors.message ? { borderColor: "#ef4444" } : {}) }} placeholder="Write your announcement…" value={form.message} onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: "" })); }} />
            {errors.message && <p style={{ color: "#ef4444", fontSize: "0.73rem", marginTop: "0.2rem" }}>{errors.message}</p>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button className="btn-primary" onClick={handleSend} style={{ flex: 1 }}>Send Announcement</button>
            {success && <span style={{ color: "#22c55e", fontSize: "0.85rem", fontWeight: 600 }}>✓ Sent</span>}
          </div>
        </div>

        {/* Sent history */}
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "2rem" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.07em", color: "#F97316", marginBottom: "1.25rem" }}>SENT HISTORY</div>
          <p style={{ color: "#4B5563", fontSize: "0.85rem" }}>Announcements are delivered as notifications to recipients.</p>
        </div>
      </div>
    </div>
  );
}

function SubscriptionsSection({ subscriptions }) {
  const [prices, setPrices] = useState({ Premium: "29", Enterprise: "Custom" });
  const [editing, setEditing] = useState(null);
  const [tempPrice, setTempPrice] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const subs = subscriptions.filter(u => u.plan !== "Free Trial");
  const filtered = subs.filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.plan?.toLowerCase().includes(search.toLowerCase()));

  const savePrice = async (plan) => {
    if (!tempPrice) return;
    setError("");
    try {
      await apiAdminUpdatePrice(plan, tempPrice);
      setPrices(p => ({ ...p, [plan]: tempPrice }));
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to update price:", err);
      setError(err?.detail || "Unable to update price");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <span style={TAG}>Billing</span>
        <h2 style={H2}>SUBSCRIPTIONS</h2>
      </div>

      {/* Pricing management */}
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "1.75rem", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.07em", color: "#F97316", marginBottom: "1.25rem" }}>
          MANAGE PRICING {saved && <span style={{ color: "#22c55e", fontSize: "0.8rem", fontWeight: 400, marginLeft: "1rem" }}>✓ Prices updated</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {[["Free Trial", "Free", "#6B7280", false], ["Premium", prices.Premium, "#F97316", true], ["Enterprise", prices.Enterprise, "#a855f7", false]].map(([plan, price, color, editable]) => (
            <div key={plan} style={{ background: "#0A0A0A", border: `1px solid ${color}30`, padding: "1.25rem" }}>
              <div style={{ color, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{plan}</div>
              {editing === plan ? (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <label style={{ color, fontSize: "0.9rem", marginRight: 6 }}>Amount</label>
                  <input style={{ ...INPUT, padding: "0.4rem 0.6rem", fontSize: "1rem", width: 80 }} value={tempPrice} onChange={e => setTempPrice(e.target.value)} autoFocus />
                  <button onClick={() => savePrice(plan)} style={{ background: "#F97316", border: "none", color: "#fff", padding: "0.4rem 0.75rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem" }}>Save</button>
                  <button onClick={() => setEditing(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#6B7280", padding: "0.4rem 0.6rem", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", color }}>{plan === "Free Trial" ? "Free" : plan === "Enterprise" ? "Custom" : `$${price}`}</span>
                  {editable && <button onClick={() => { setEditing(plan); setTempPrice(price); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3AF", padding: "0.3rem 0.7rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>Edit</button>}
                </div>
              )}
              {plan !== "Free Trial" && plan !== "Enterprise" && <div style={{ color: "#4B5563", fontSize: "0.75rem", marginTop: "0.25rem" }}>per month · billed monthly</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Subscriber table */}
      <div style={{ marginBottom: "1rem" }}>
        <input style={{ ...INPUT, width: 280 }} placeholder="Search subscribers…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Email", "Plan", "Status", "Started"].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <td style={{ ...TD, color: "#9CA3AF" }}>{u.email}</td>
                <td style={TD}><span style={{ color: PLAN_COLOR[u.plan], fontWeight: 700 }}>{u.plan}</span></td>
                <td style={TD}><span style={STATUS_STYLE(u.is_active ? "active" : "inactive")}>{u.is_active ? "active" : "inactive"}</span></td>
                <td style={{ ...TD, color: "#6B7280" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: "2.5rem", textAlign: "center", color: "#4B5563" }}>No subscribers found.</div>}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openComplaints = complaints.filter(c => c.status === "open").length;

  const displayedNav = (user && user.admin_section) ? NAV_ITEMS.filter(i => i.id === "dashboard" || i.id === user.admin_section) : NAV_ITEMS;

  useEffect(() => {
    Promise.all([
      apiAdminDashboard(),
      apiAdminGetUsers(),
      apiAdminGetComplaints(),
    ])
      .then(([stats, usersData, complaintsData]) => {
        setDashboardStats(stats);
        setUsers(usersData);
        setComplaints(complaintsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load admin data:", err);
        setLoading(false);
      });

    apiAdminMonthlyStats().then(setMonthlyData).catch(console.error);
    apiAdminGetEmployees().then(setEmployees).catch(console.error);
    apiAdminGetSubscriptions().then(setSubscriptions).catch(console.error);
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: "4rem", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2rem" }}>LOADING...</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; color: #fff; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: #F97316; border-radius: 3px; }
        select option { background: #1F2937; }

        .btn-primary { background: #F97316; color: #fff; border: none; padding: 0.75rem 1.75rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); }
        .btn-primary:hover:not(:disabled) { background: #EA6C00; transform: translateY(-1px); }
        .btn-outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.25); padding: 0.75rem 1.75rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); }
        .btn-outline:hover { border-color: #F97316; color: #F97316; }

        .admin-nav { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1.25rem; cursor: pointer; transition: all 0.2s; color: #6B7280; font-size: 0.86rem; font-weight: 500; border-left: 2px solid transparent; }
        .admin-nav:hover { color: #D1D5DB; background: rgba(255,255,255,0.025); }
        .admin-nav.active { color: #F97316; background: rgba(249,115,22,0.08); border-left-color: #F97316; }

        @media (max-width: 960px) {
          .admin-sidebar { transform: translateX(-100%); transition: transform 0.3s; position: fixed !important; z-index: 150; height: 100vh; }
          .admin-sidebar.open { transform: translateX(0); }
          .mob-btn { display: flex !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A" }}>

        {/* SIDEBAR */}
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`} style={{ width: 240, background: "#0a0a0a", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }} onClick={() => navigate("/")}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 30, height: 30, background: "#ef4444", clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>⚙</div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.05em" }}>STRONG HAUL</div>
                <div style={{ color: "#ef4444", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Admin Portal</div>
              </div>
            </div>
          </div>

          {/* Admin badge */}
          <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 38, height: 38, background: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0 }}>{user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? "A"}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{user?.name ?? user?.email ?? "Admin"}</div>
                <div style={{ color: "#ef4444", fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>{user?.role ?? "Admin"}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
            {displayedNav.map(item => (
              <div key={item.id} className={`admin-nav ${active === item.id ? "active" : ""}`} onClick={() => { setActive(item.id); setSidebarOpen(false); }}>
                <span style={{ fontSize: "0.95rem", width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "complaints" && openComplaints > 0 && (
                  <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", fontSize: "0.63rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 10 }}>{openComplaints}</span>
                )}
              </div>
            ))}
          </nav>

          <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="admin-nav" onClick={() => navigate("/")} style={{ color: "#6B7280", borderLeft: "none" }}>
              <span>→</span><span>Back to Site</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="admin-nav" onClick={() => { logout?.(); navigate("/"); }} style={{ color: "#6B7280", borderLeft: "none", background: "transparent", border: "none", padding: 0 }}>Logout</button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
          {/* Topbar */}
          <header style={{ background: "#0f0f0f", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button className="mob-btn" onClick={() => setSidebarOpen(o => !o)} style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: "1.3rem", cursor: "pointer", padding: 0 }}>☰</button>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", lineHeight: 1 }}>{NAV_ITEMS.find(n => n.id === active)?.label.toUpperCase()}</div>
                <div style={{ color: "#4B5563", fontSize: "0.72rem", marginTop: "0.1rem" }}>Strong Haul · Admin Portal</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {openComplaints > 0 && (
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setActive("complaints")}>
                  <span style={{ fontSize: "1.2rem" }}>⚑</span>
                  <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: "0.6rem", fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{openComplaints}</span>
                </div>
              )}
              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ width: 32, height: 32, background: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}>{user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? "A"}</div>
            </div>
          </header>

          {/* Content */}
          <div style={{ flex: 1, padding: "2.5rem 2rem", maxWidth: 1200, width: "100%" }}>
            {active === "dashboard" && <DashboardSection users={users} complaints={complaints} dashboardStats={dashboardStats} monthlyData={monthlyData} />}
            {active === "users" && <UsersSection users={users} setUsers={setUsers} />}
            {active === "support" && <AdminSupportSection employees={employees} setEmployees={setEmployees} />}
            {active === "complaints" && <ComplaintsSection complaints={complaints} setComplaints={setComplaints} />}
            {active === "employees" && <EmployeesSection employees={employees} setEmployees={setEmployees} />}
            {active === "announcements" && <AnnouncementsSection />}
            {active === "subscriptions" && <SubscriptionsSection subscriptions={subscriptions} />}
          </div>
        </main>
      </div>
    </>
  );
}
