// Add at the top of App.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["Home", "Browse Trucks", "How It Works", "Pricing", "Contact"];

const STATS = [
  { value: 500, suffix: "+", label: "Vehicles Listed" },
  { value: 30, suffix: "+", label: "Countries" },
  { value: 1000, suffix: "+", label: "Hirers Browsing" },
  { value: 3, suffix: "", label: "Subscription Tiers" },
];

const LISTINGS = [
  { name: "Mack Granite Tipper", type: "Tipper Truck", capacity: "30 tons", location: "Accra, Ghana", available: true, tier: "Premium" },
  { name: "Caterpillar 320 Excavator", type: "Excavator", capacity: "22 tons", location: "Lagos, Nigeria", available: true, tier: "Enterprise" },
  { name: "Mercedes Actros Flatbed", type: "Flatbed Truck", capacity: "25 tons", location: "Nairobi, Kenya", available: false, tier: "Premium" },
  { name: "Volvo FH16 Tanker", type: "Tanker Truck", capacity: "40 tons", location: "Johannesburg, SA", available: true, tier: "Premium" },
];

const FEATURES = [
  { icon: "🌍", title: "Global Reach", desc: "List once. Get discovered by hirers across 30+ countries worldwide." },
  { icon: "🔍", title: "Smart Search", desc: "Filter by capacity, location, truck type, and real-time availability." },
  { icon: "✅", title: "Verified Listings", desc: "Owner verification with document upload and trusted verified badges." },
  { icon: "💬", title: "Direct Contact", desc: "No middlemen. Hirers contact owners directly and arrange hire." },
  { icon: "📊", title: "Fleet Analytics", desc: "Premium and Enterprise owners get detailed performance reports." },
  { icon: "🔒", title: "Secure Platform", desc: "Trusted by thousands of owners and hirers around the globe." },
];

const PLANS = [
  {
    name: "Free Trial",
    price: "Free",
    period: "1 Month",
    features: ["Up to 3 listings", "Basic profile", "Low search priority", "Community support"],
    highlight: false,
    cta: "Start Free Trial",
  },
  {
    name: "Premium",
    price: "TBD",
    period: "per month",
    features: ["Unlimited listings", "High search priority", "Analytics dashboard", "API access", "Email support"],
    highlight: true,
    cta: "Get Premium",
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    features: ["Dedicated company page", "Fleet analytics", "Fleet management tools", "Dedicated account manager"],
    highlight: false,
    cta: "Contact Sales",
  },
];

const TESTIMONIALS = [
  { quote: "Strong Haul helped me fill my trucks every single week. Best decision I made for my fleet.", name: "Kwame A.", role: "Truck Owner, Ghana" },
  { quote: "Found the exact excavator I needed in under 10 minutes. Incredible platform.", name: "Chidi O.", role: "Construction Manager, Nigeria" },
  { quote: "As a fleet manager, this platform changed how I do business across Africa.", name: "Amara N.", role: "Fleet Manager, Kenya" },
];

function useCountUp(target, duration = 2000, trigger) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target, duration]);
  return count;
}

function StatCard({ value, suffix, label, trigger }) {
  const count = useCountUp(value, 1800, trigger);
  return (
    <div style={{ textAlign: "center", padding: "0 2rem" }}>
      <div style={{ fontSize: "3.5rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: "#F97316", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ color: "#9CA3AF", fontSize: "0.95rem", marginTop: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const navigate = useNavigate(); // ← ADD THIS LINE


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0A0A; color: #fff; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: #F97316; border-radius: 3px; }

        .nav-link { color: #9CA3AF; text-decoration: none; font-size: 0.9rem; letter-spacing: 0.05em; transition: color 0.2s; cursor: pointer; }
        .nav-link:hover { color: #F97316; }

        .btn-primary { background: #F97316; color: #fff; border: none; padding: 0.75rem 1.75rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.25s; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); }
        .btn-primary:hover { background: #EA6C00; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(249,115,22,0.4); }

        .btn-outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.4); padding: 0.75rem 1.75rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.25s; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); }
        .btn-outline:hover { border-color: #F97316; color: #F97316; transform: translateY(-2px); }

        .hero-animate { animation: heroReveal 1s ease forwards; opacity: 0; }
        .hero-animate-1 { animation-delay: 0.1s; }
        .hero-animate-2 { animation-delay: 0.3s; }
        .hero-animate-3 { animation-delay: 0.5s; }
        .hero-animate-4 { animation-delay: 0.7s; }

        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .listing-card { background: #1F2937; border: 1px solid rgba(255,255,255,0.06); padding: 1.5rem; transition: all 0.3s; cursor: pointer; position: relative; overflow: hidden; }
        .listing-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #F97316; transform: scaleX(0); transition: transform 0.3s; }
        .listing-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); border-color: rgba(249,115,22,0.3); }
        .listing-card:hover::before { transform: scaleX(1); }

        .feature-card { padding: 2rem; border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; }
        .feature-card:hover { border-color: rgba(249,115,22,0.4); background: rgba(249,115,22,0.05); transform: translateY(-3px); }

        .plan-card { padding: 2.5rem 2rem; border: 1px solid rgba(255,255,255,0.08); background: #111827; transition: all 0.3s; position: relative; }
        .plan-card:hover { transform: translateY(-4px); }
        .plan-card.highlight { border-color: #F97316; background: #1a1a1a; box-shadow: 0 0 40px rgba(249,115,22,0.15); }

        .testimonial-card { background: #111827; border: 1px solid rgba(255,255,255,0.06); padding: 2rem; position: relative; }
        .testimonial-card::before { content: '"'; font-family: 'Barlow Condensed', sans-serif; font-size: 5rem; color: #F97316; opacity: 0.3; position: absolute; top: -10px; left: 1.5rem; line-height: 1; }

        .section-tag { display: inline-block; background: rgba(249,115,22,0.15); color: #F97316; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.35rem 1rem; margin-bottom: 1rem; border-left: 2px solid #F97316; }

        .diagonal-line { position: absolute; top: 0; right: 0; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, rgba(249,115,22,0.3), transparent); }

        .grid-bg { background-image: linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px); background-size: 60px 60px; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .hero-headline { font-size: 3.5rem !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 2rem !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .listings-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-buttons { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "1.25rem 2rem",
        background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 32, height: 32, background: "#F97316", clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🚛</div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "0.05em" }}>STRONG HAUL</span>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {NAV_LINKS.map(link => <a key={link} className="nav-link">{link}</a>)}
        </div>

        
      {/* CTA Buttons */}
<div className="desktop-nav" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
  <button className="btn-outline" onClick={() => navigate("/auth")} style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem" }}>Log In</button>
  <button className="btn-primary" onClick={() => navigate("/auth")} style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem" }}>List Your Truck</button>
</div>

        {/* Mobile menu */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ position: "fixed", top: 70, left: 0, right: 0, background: "#111827", zIndex: 99, padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {NAV_LINKS.map(link => <a key={link} className="nav-link" style={{ fontSize: "1rem" }}>{link}</a>)}
          <button className="btn-primary" style={{ marginTop: "0.5rem" }}>List Your Truck</button>
        </div>
      )}

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center", position: "relative",
        background: "linear-gradient(135deg, #0A0A0A 0%, #0f1a0a 50%, #0A0A0A 100%)",
        overflow: "hidden", paddingTop: "6rem"
      }}>
        {/* Background pattern */}
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
        
        {/* Orange glow */}
        <div style={{ position: "absolute", top: "20%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Diagonal accent lines */}
        <div style={{ position: "absolute", top: 0, right: "20%", width: 1, height: "100%", background: "linear-gradient(to bottom, transparent, rgba(249,115,22,0.15), transparent)" }} />
        <div style={{ position: "absolute", top: 0, right: "40%", width: 1, height: "60%", background: "linear-gradient(to bottom, rgba(249,115,22,0.08), transparent)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1 }}>
          <div className="hero-animate hero-animate-1">
            <span className="section-tag">Global Truck & Heavy Machinery Marketplace</span>
          </div>
          
          <h1 className="hero-animate hero-animate-2 hero-headline" style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: "clamp(3.5rem, 9vw, 7.5rem)", lineHeight: 0.95,
            letterSpacing: "-0.02em", marginBottom: "1.5rem", maxWidth: 900
          }}>
            FIND THE RIGHT<br />
            <span style={{ color: "#F97316", WebkitTextStroke: "2px #F97316", WebkitTextFillColor: "transparent" }}>TRUCK.</span><br />
            ANYWHERE.
          </h1>

          <p className="hero-animate hero-animate-3" style={{ color: "#9CA3AF", fontSize: "1.15rem", maxWidth: 540, lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Strong Haul connects truck and heavy machinery owners with businesses that need them — fast, simple, and worldwide.
          </p>

          <div className="hero-animate hero-animate-4 hero-buttons" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: "1rem", padding: "1rem 2.25rem" }} onClick={() => navigate("/browse")}>Browse Trucks</button>
            <button className="btn-outline" style={{ fontSize: "1rem", padding: "1rem 2.25rem" }} onClick={() => navigate("/list-truck")}>List Your Vehicle</button>
            <button className="btn-outline" onClick={() => navigate("/auth")} style={{ padding: "0.6rem 1.25rem", fontSize: "0.82rem" }}>Log In</button>
          </div>

          {/* Floating badge */}
          <div style={{ marginTop: "4rem", display: "inline-flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.75rem 1.25rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>500+ vehicles available right now</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ background: "#0f0f0f", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "3rem 2rem" }}>
        <div className="stats-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} trigger={statsVisible} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-tag">Process</span>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.01em" }}>HOW STRONG HAUL WORKS</h2>
          <p style={{ color: "#9CA3AF", marginTop: "1rem", fontSize: "1.05rem" }}>Two sides. One platform. Zero friction.</p>
        </div>

        <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          {/* For Hirers */}
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", padding: "2.5rem" }}>
            <div style={{ color: "#F97316", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>FOR HIRERS</div>
            {["Browse trucks and machinery by location, type, and capacity", "View full listing details — images, specs, and contact info", "Contact the owner directly and arrange hire"].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "1.25rem", marginBottom: "1.75rem", alignItems: "flex-start" }}>
                <div style={{ minWidth: 36, height: 36, background: "rgba(249,115,22,0.15)", border: "1px solid #F97316", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: "#F97316", fontSize: "1.1rem" }}>{i + 1}</div>
                <p style={{ color: "#D1D5DB", lineHeight: 1.6, paddingTop: "0.4rem" }}>{step}</p>
              </div>
            ))}
            <button className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>Browse Now</button>
          </div>

          {/* For Owners */}
          <div style={{ background: "#111827", border: "1px solid rgba(249,115,22,0.2)", padding: "2.5rem" }}>
            <div style={{ color: "#F97316", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>FOR OWNERS</div>
            {["Sign up and choose your subscription plan", "List your vehicles with photos, specs, and availability", "Get discovered by hirers worldwide and grow your business"].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "1.25rem", marginBottom: "1.75rem", alignItems: "flex-start" }}>
                <div style={{ minWidth: 36, height: 36, background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: "#fff", fontSize: "1.1rem" }}>{i + 1}</div>
                <p style={{ color: "#D1D5DB", lineHeight: 1.6, paddingTop: "0.4rem" }}>{step}</p>
              </div>
            ))}
            <button className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>List Your Truck</button>
          </div>
        </div>
      </section>

      {/* LISTINGS PREVIEW */}
      <section style={{ background: "#0f0f0f", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="section-tag">Live Listings</span>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>AVAILABLE NOW</h2>
            </div>
            <a style={{ color: "#F97316", cursor: "pointer", fontSize: "0.95rem", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid #F97316", paddingBottom: "2px" }}>View All Listings →</a>
          </div>

          <div className="listings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
            {LISTINGS.map((l, i) => (
              <div key={i} className="listing-card">
                <div style={{ background: "#0A0A0A", height: 120, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontSize: "3rem" }}>🚛</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ background: l.available ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: l.available ? "#22c55e" : "#ef4444", fontSize: "0.72rem", padding: "0.2rem 0.6rem", fontWeight: 600, letterSpacing: "0.05em" }}>{l.available ? "AVAILABLE" : "UNAVAILABLE"}</span>
                  <span style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", fontSize: "0.72rem", padding: "0.2rem 0.6rem", fontWeight: 600 }}>{l.tier}</span>
                </div>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.25rem" }}>{l.name}</h3>
                <p style={{ color: "#9CA3AF", fontSize: "0.82rem", marginBottom: "0.25rem" }}>{l.type} · {l.capacity}</p>
                <p style={{ color: "#6B7280", fontSize: "0.8rem", marginBottom: "1rem" }}>📍 {l.location}</p>
                <button className="btn-primary" style={{ width: "100%", padding: "0.6rem", fontSize: "0.82rem" }}>Contact Owner</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-tag">Why Us</span>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>BUILT FOR THE HEAVY INDUSTRY</h2>
        </div>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.3rem", marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ color: "#9CA3AF", lineHeight: 1.65, fontSize: "0.92rem" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: "#0f0f0f", padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="section-tag">Pricing</span>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>CHOOSE YOUR PLAN</h2>
            <p style={{ color: "#9CA3AF", marginTop: "1rem" }}>List your vehicles and get discovered by hirers worldwide</p>
          </div>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", alignItems: "start" }}>
            {PLANS.map((plan, i) => (
              <div key={i} className={`plan-card ${plan.highlight ? "highlight" : ""}`}>
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#F97316", color: "#fff", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", padding: "0.3rem 1rem", whiteSpace: "nowrap" }}>{plan.badge}</div>
                )}
                <div style={{ color: "#9CA3AF", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>{plan.name}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "3rem", color: plan.highlight ? "#F97316" : "#fff", lineHeight: 1 }}>{plan.price}</div>
                <div style={{ color: "#6B7280", fontSize: "0.82rem", marginBottom: "2rem" }}>{plan.period}</div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", marginBottom: "2rem" }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
                      <span style={{ color: "#F97316", fontSize: "0.9rem" }}>✓</span>
                      <span style={{ color: "#D1D5DB", fontSize: "0.9rem" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button className={plan.highlight ? "btn-primary" : "btn-outline"} style={{ width: "100%" }}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-tag">Testimonials</span>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>TRUSTED WORLDWIDE</h2>
        </div>
        <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p style={{ color: "#D1D5DB", lineHeight: 1.7, marginBottom: "1.5rem", fontSize: "0.95rem", paddingTop: "1rem" }}>{t.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 36, height: 36, background: "#F97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1rem" }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</div>
                  <div style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ background: "#111827", borderTop: "1px solid rgba(249,115,22,0.2)", borderBottom: "1px solid rgba(249,115,22,0.2)", padding: "5rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1, marginBottom: "1rem" }}>
            READY TO GET<br /><span style={{ color: "#F97316" }}>STARTED?</span>
          </h2>
          <p style={{ color: "#9CA3AF", marginBottom: "2.5rem", fontSize: "1.05rem" }}>Join thousands of owners and hirers on Strong Haul today.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: "1rem", padding: "1rem 2.25rem" }}>List Your Vehicle</button>
            <button className="btn-outline" style={{ fontSize: "1rem", padding: "1rem 2.25rem" }}>Browse Trucks</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "4rem 2rem 2rem" }}>
        <div className="footer-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <div style={{ width: 28, height: 28, background: "#F97316", clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>🚛</div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.05em" }}>STRONG HAUL</span>
            </div>
            <p style={{ color: "#6B7280", fontSize: "0.88rem", lineHeight: 1.7, maxWidth: 260 }}>The global marketplace for trucks and heavy machinery. Connecting owners and hirers worldwide.</p>
          </div>
          <div>
            <div style={{ color: "#F97316", fontSize: "0.75rem", letterSpacing: "0.12em", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase" }}>Platform</div>
            {["Browse Trucks", "List Your Vehicle", "Pricing", "How It Works"].map(l => <div key={l} style={{ color: "#6B7280", fontSize: "0.88rem", marginBottom: "0.6rem", cursor: "pointer" }}>{l}</div>)}
          </div>
          <div>
            <div style={{ color: "#F97316", fontSize: "0.75rem", letterSpacing: "0.12em", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase" }}>Company</div>
            {["About", "Contact", "Careers", "Admin Login"].map(l => <div key={l} style={{ color: "#6B7280", fontSize: "0.88rem", marginBottom: "0.6rem", cursor: "pointer" }}>{l}</div>)}
          </div>
          <div>
            <div style={{ color: "#F97316", fontSize: "0.75rem", letterSpacing: "0.12em", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase" }}>Follow Us</div>
            {["LinkedIn", "Twitter / X", "Instagram", "Facebook"].map(l => <div key={l} style={{ color: "#6B7280", fontSize: "0.88rem", marginBottom: "0.6rem", cursor: "pointer" }}>{l}</div>)}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ color: "#4B5563", fontSize: "0.82rem" }}>© 2025 Strong Haul. All rights reserved.</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span style={{ color: "#4B5563", fontSize: "0.82rem", cursor: "pointer" }}>Privacy Policy</span>
            <span style={{ color: "#4B5563", fontSize: "0.82rem", cursor: "pointer" }}>Terms of Service</span>
          </div>
        </div>
      </footer>
    </>
  );
}
