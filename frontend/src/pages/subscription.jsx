import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiInitiatePayment, apiVerifyPayment, apiGetMySubscription } from "../api";
import { useAuth } from "../context/AuthContext";
import { detectCurrency, formatPrice, PLAN_PRICES } from "../utils/currency";

const PLANS = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    period: "1 Month",
    description: "Get started and explore the platform at no cost.",
    color: "#9CA3AF",
    features: [
      { text: "Up to 3 vehicle listings", included: true },
      { text: "Basic profile page", included: true },
      { text: "Low search priority", included: true },
      { text: "Community support", included: true },
      { text: "Analytics dashboard", included: false },
      { text: "High search priority", included: false },
      { text: "API access", included: false },
      { text: "Email support", included: false },
      { text: "Dedicated company page", included: false },
      { text: "Fleet management tools", included: false },
      { text: "Dedicated account manager", included: false },
    ],
    cta: "Start Free Trial",
    highlight: false,
    badge: null,
  },
  {
    id: "premium",
    name: "Premium",
    price: null,
    period: "per month",
    description: "Everything you need to grow your fleet business globally.",
    color: "#F97316",
    features: [
      { text: "Unlimited vehicle listings", included: true },
      { text: "Premium profile page", included: true },
      { text: "High search priority", included: true },
      { text: "Email support", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "API access", included: true },
      { text: "Fleet performance reports", included: true },
      { text: "Community support", included: true },
      { text: "Dedicated company page", included: false },
      { text: "Fleet management tools", included: false },
      { text: "Dedicated account manager", included: false },
    ],
    cta: "Get Premium",
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    period: "custom pricing",
    description: "Built for large fleets and companies operating at scale.",
    color: "#a855f7",
    features: [
      { text: "Unlimited vehicle listings", included: true },
      { text: "Dedicated company page", included: true },
      { text: "High search priority", included: true },
      { text: "Fleet management tools", included: true },
      { text: "Monthly fleet analytics", included: true },
      { text: "API access", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Priority email support", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Custom integrations", included: true },
      { text: "SLA guarantee", included: true },
    ],
    cta: "Contact Sales",
    highlight: false,
    badge: "Best Value",
  },
];

const FAQS = [
  { q: "Can I cancel my subscription anytime?", a: "Yes. You can cancel your Premium plan at any time from your dashboard. Your listing will remain active until the end of the billing period." },
  { q: "What happens when my Free Trial ends?", a: "After 1 month, your listings will move to low priority and be capped at 3. You can upgrade to Premium to restore full access." },
  { q: "How does billing work?", a: "Premium plans are billed monthly. Payments are processed securely via Stripe or Paystack depending on your region." },
  { q: "Is there a refund policy?", a: "We offer a 7-day refund if you are not satisfied with your Premium plan. Contact support to request a refund." },
  { q: "What currencies are supported?", a: "Strong Haul supports GHS, USD, GBP, EUR, NGN and more. Pricing is displayed in your local currency at checkout." },
  { q: "Can I upgrade from Premium to Enterprise?", a: "Yes. Contact our sales team and we will migrate your account and listings with zero downtime." },
];

export default function Subscription() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [billing, setBilling] = useState("monthly");
  const [selected, setSelected] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: confirm, 2: payment, 3: success
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardForm, setCardForm] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [processing, setProcessing] = useState(false);
  const [currency, setCurrency] = useState({ code: "USD", symbol: "$", name: "US Dollar" });
  const [currentPlan, setCurrentPlan] = useState(user?.plan ?? "Free Trial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = (plan) => {
    if (plan.id === "enterprise") { return; }
    setSelected(plan);
    setStep(1);
    setShowModal(true);
  };

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setStep(3);
  };

  const formatCard = (val) => {
    return val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  };

  const formatExpiry = (val) => {
    return val.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
  };

  const getPlanPrice = (planName) => {
    const prices = PLAN_PRICES[currency.code] ?? PLAN_PRICES["USD"];
    const price = prices[planName];
    if (!price || price === "Custom" || planName === "Free Trial") return planName === "Free Trial" ? "Free" : "Custom";
    return formatPrice(price, currency);
  };

  useEffect(() => {
    detectCurrency().then(setCurrency);
    
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    const payment = params.get("payment");
    if (payment === "success" && reference) {
      apiVerifyPayment(reference)
        .then(data => {
          setCurrentPlan(data.plan);
          login({ ...user, plan: data.plan }, localStorage.getItem("sh_token"));
          window.history.replaceState({}, "", "/subscription");
        })
        .catch(err => setError("Payment verification failed."));
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; color: #fff; font-family: 'DM Sans', sans-serif; }

        .btn-primary { background: #F97316; color: #fff; border: none; padding: 0.9rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.25s; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); width: 100%; }
        .btn-primary:hover:not(:disabled) { background: #EA6C00; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(249,115,22,0.35); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.2); padding: 0.9rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.25s; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); width: 100%; }
        .btn-outline:hover { border-color: #F97316; color: #F97316; }

        .btn-purple { background: rgba(168,85,247,0.15); color: #a855f7; border: 1px solid rgba(168,85,247,0.3); padding: 0.9rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.25s; width: 100%; }
        .btn-purple:hover { background: rgba(168,85,247,0.25); }

        .plan-card { background: #111827; border: 1px solid rgba(255,255,255,0.07); padding: 2.5rem 2rem; transition: all 0.3s; position: relative; cursor: pointer; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
        .plan-card.highlighted { border-color: #F97316; box-shadow: 0 0 40px rgba(249,115,22,0.15); }
        .plan-card.enterprise { border-color: rgba(168,85,247,0.3); }

        .feature-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; font-size: 0.88rem; }

        .billing-toggle { display: flex; background: #111827; border: 1px solid rgba(255,255,255,0.08); padding: 0.3rem; gap: 0.3rem; }
        .billing-btn { padding: 0.5rem 1.5rem; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; letter-spacing: 0.05em; }
        .billing-btn.active { background: #F97316; color: #fff; }
        .billing-btn:not(.active) { background: transparent; color: #6B7280; }
        .billing-btn:not(.active):hover { color: #fff; }

        .faq-item { border-bottom: 1px solid rgba(255,255,255,0.06); }
        .faq-q { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 0; cursor: pointer; font-weight: 500; }
        .faq-q:hover { color: #F97316; }
        .faq-a { color: #9CA3AF; font-size: 0.9rem; line-height: 1.7; padding-bottom: 1.25rem; }

        .payment-input { width: 100%; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s; margin-bottom: 1rem; }
        .payment-input:focus { border-color: #F97316; }
        .payment-input::placeholder { color: #4B5563; }

        .pay-method { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: all 0.2s; margin-bottom: 0.6rem; }
        .pay-method.active { border-color: #F97316; background: rgba(249,115,22,0.05); }
        .pay-method:hover:not(.active) { border-color: rgba(255,255,255,0.2); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(6px); }
        .modal { background: #111827; border: 1px solid rgba(249,115,22,0.2); max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto; }

        .step-indicator { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
        .step-dot { width: 28px; height: 28px; border-radius: "50%"; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; }
        .step-line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }

        .section-tag { display: inline-block; background: rgba(249,115,22,0.15); color: #F97316; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.35rem 1rem; margin-bottom: 1rem; border-left: 2px solid #F97316; }

        .grid-bg { background-image: linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px); background-size: 60px 60px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; margin-right: 0.5rem; vertical-align: middle; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }

        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr !important; max-width: 480px; margin: 0 auto; }
          .compare-grid { display: none !important; }
        }
        @media (max-width: 768px) {
          .hero-headline { font-size: clamp(2.5rem, 8vw, 4.5rem) !important; }
          .modal { max-width: 100% !important; margin: 0.5rem !important; padding: 1.5rem !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .faq-grid { grid-template-columns: 1fr !important; }
          .payment-input, .btn-primary, .btn-outline, .btn-purple { width: 100% !important; }
        }
        @media (max-width: 600px) {
          .faq-grid { grid-template-columns: 1fr !important; }
          .btn-primary, .btn-outline, .btn-purple { width: 100% !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: "rgba(10,10,10,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1.1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
          <div style={{ width: 30, height: 30, background: "#F97316", clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>🚛</div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "0.05em" }}>STRONG HAUL</span>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-outline" style={{ width: "auto", padding: "0.55rem 1.25rem", fontSize: "0.82rem" }} onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="btn-primary" style={{ width: "auto", padding: "0.55rem 1.25rem", fontSize: "0.82rem" }} onClick={() => navigate("/auth")}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="grid-bg" style={{ padding: "5rem 2rem 3rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span className="section-tag">Pricing</span>
          <h1 className="hero-headline" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 0.95, marginBottom: "1rem" }}>
            SIMPLE,<br /><span style={{ color: "#F97316" }}>TRANSPARENT</span><br />PRICING
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Choose the plan that fits your fleet. No hidden fees. Cancel anytime.
          </p>
          <p style={{ color: "#6B7280", fontSize: "0.82rem", marginTop: "0.25rem" }}>
            Prices shown in {currency.name} ({currency.code})
          </p>

          {/* Billing Toggle */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div className="billing-toggle">
              <button className={`billing-btn ${billing === "monthly" ? "active" : ""}`} onClick={() => setBilling("monthly")}>Monthly</button>
              <button className={`billing-btn ${billing === "annual" ? "active" : ""}`} onClick={() => setBilling("annual")}>Annual</button>
            </div>
            {billing === "annual" && (
              <span style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", letterSpacing: "0.05em" }}>SAVE 20%</span>
            )}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section style={{ padding: "2rem 2rem 5rem", maxWidth: 1200, margin: "0 auto" }}>
        {error && <div style={{ color: "#ef4444", textAlign: "center", marginBottom: "1rem" }}>{error}</div>}
        <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", alignItems: "start" }}>
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.name === (user?.plan ?? "Free Trial");
            return (
              <div key={plan.id} className={`plan-card fade-up ${plan.highlight ? "highlighted" : ""} ${plan.id === "enterprise" ? "enterprise" : ""}`}
                style={{ background: isCurrentPlan ? "rgba(249,115,22,0.08)" : "#111827", border: `1px solid ${isCurrentPlan ? "#F97316" : "rgba(255,255,255,0.07)"}`, padding: "2.5rem 2rem", borderTopColor: plan.color, borderTopWidth: 3 }}>

                {/* Badge */}
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.highlight ? "#F97316" : "#a855f7", color: "#fff", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", padding: "0.3rem 1rem", whiteSpace: "nowrap" }}>{plan.badge}</div>
                )}

                {/* Plan Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ color: plan.color, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3.5rem", color: plan.color, lineHeight: 1 }}>
                      {getPlanPrice(plan.name)}
                    </span>
                    {plan.price !== 0 && <span style={{ color: "#6B7280", fontSize: "0.82rem", paddingBottom: "0.5rem" }}>/ {plan.period}</span>}
                  </div>
                  {plan.price === 0 && <div style={{ color: "#6B7280", fontSize: "0.82rem" }}>No credit card required</div>}
                  <p style={{ color: "#9CA3AF", fontSize: "0.85rem", lineHeight: 1.6, marginTop: "0.75rem" }}>{plan.description}</p>
                </div>

                {/* CTA */}
                <div style={{ marginBottom: "2rem" }}>
                  {plan.id === "free" && <button className="btn-outline" onClick={() => handleSelect(plan)}>{plan.cta}</button>}
                  {plan.id === "premium" && (
                    <button className={isCurrentPlan ? "btn-outline" : "btn-primary"} disabled={isCurrentPlan} onClick={async () => {
                      if (isCurrentPlan) return;
                      try {
                        setLoading(true);
                        const data = await apiInitiatePayment(plan.name);
                        window.location.href = data.authorization_url;
                      } catch (err) {
                        setError(err.detail || "Payment failed. Please try again.");
                        setLoading(false);
                      }
                    }}>{isCurrentPlan ? "Current Plan" : plan.cta}</button>
                  )}
                  {plan.id === "enterprise" && (
                    <button className={isCurrentPlan ? "btn-outline" : "btn-purple"} disabled={isCurrentPlan} onClick={async () => {
                      if (plan.name === "Enterprise") {
                        window.location.href = "mailto:support@stronghaul.com";
                        return;
                      }
                      if (isCurrentPlan) return;
                      try {
                        setLoading(true);
                        const data = await apiInitiatePayment(plan.name);
                        window.location.href = data.authorization_url;
                      } catch (err) {
                        setError(err.detail || "Payment failed. Please try again.");
                        setLoading(false);
                      }
                    }}>{isCurrentPlan ? "Current Plan" : plan.cta}</button>
                  )}
                </div>

                {/* Features */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
                  <div style={{ color: "#6B7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>What's included</div>
                  {plan.features.map((f, i) => (
                    <div key={i} className="feature-row">
                      <span style={{ color: f.included ? plan.color : "#374151", fontSize: "0.9rem", flexShrink: 0 }}>{f.included ? "✓" : "✕"}</span>
                      <span style={{ color: f.included ? "#D1D5DB" : "#4B5563" }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", marginTop: "3rem", flexWrap: "wrap" }}>
          {[["🔒", "Secure Payments", "Stripe & Paystack"], ["🔄", "Cancel Anytime", "No lock-in contracts"], ["🌍", "Multi-Currency", "GHS, USD, NGN & more"], ["📞", "24/7 Support", "We're always here"]].map(([icon, title, sub]) => (
            <div key={title} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{icon}</div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{title}</div>
              <div style={{ color: "#6B7280", fontSize: "0.75rem" }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="compare-grid" style={{ padding: "0 2rem 5rem", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="section-tag">Compare</span>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)" }}>FULL PLAN COMPARISON</h2>
        </div>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ padding: "1rem 1.5rem", color: "#6B7280", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Feature</div>
            {["Free Trial", "Premium", "Enterprise"].map((p, i) => (
              <div key={p} style={{ padding: "1rem", textAlign: "center", color: i === 1 ? "#F97316" : i === 2 ? "#a855f7" : "#9CA3AF", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.05em", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>{p}</div>
            ))}
          </div>
          {[
            ["Vehicle Listings", "Up to 3", "Unlimited", "Unlimited"],
            ["Search Priority", "Low", "High", "High"],
            ["Analytics", "—", "✓", "✓"],
            ["API Access", "—", "✓", "✓"],
            ["Company Page", "—", "—", "✓"],
            ["Fleet Management", "—", "—", "✓"],
            ["Account Manager", "—", "—", "✓"],
            ["Support", "Community", "Email", "Priority"],
          ].map(([feature, ...vals], i) => (
            <div key={feature} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
              <div style={{ padding: "0.85rem 1.5rem", color: "#9CA3AF", fontSize: "0.88rem" }}>{feature}</div>
              {vals.map((v, j) => (
                <div key={j} style={{ padding: "0.85rem", textAlign: "center", fontSize: "0.85rem", color: v === "—" ? "#374151" : j === 1 ? "#F97316" : j === 2 ? "#a855f7" : "#D1D5DB", borderLeft: "1px solid rgba(255,255,255,0.04)", fontWeight: v === "✓" ? 700 : 400 }}>{v}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 2rem 6rem", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="section-tag">FAQ</span>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)" }}>COMMON QUESTIONS</h2>
        </div>
        <div>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span style={{ fontSize: "0.95rem" }}>{faq.q}</span>
                <span style={{ color: "#F97316", fontSize: "1.1rem", transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
              </div>
              {openFaq === i && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FOOTER */}
      <section style={{ background: "#111827", borderTop: "1px solid rgba(249,115,22,0.2)", padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1, marginBottom: "1rem" }}>
          READY TO LIST<br /><span style={{ color: "#F97316" }}>YOUR FLEET?</span>
        </h2>
        <p style={{ color: "#9CA3AF", marginBottom: "2rem", fontSize: "1rem" }}>Start with a free trial. No credit card required.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ width: "auto", padding: "1rem 2.5rem" }} onClick={() => navigate("/auth")}>Start Free Trial</button>
          <button className="btn-outline" style={{ width: "auto", padding: "1rem 2.5rem" }} onClick={() => navigate("/browse")}>Browse Platform</button>
        </div>
      </section>

      {/* MODAL */}
      {showModal && selected && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setStep(1); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "2rem" }}>

              {/* Step Indicator */}
              {step < 3 && (
                <div className="step-indicator">
                  {["Confirm", "Payment"].map((label, i) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: i < 1 ? "none" : 1 }}>
                      {i > 0 && <div className="step-line" />}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: step > i ? "#F97316" : step === i + 1 ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${step >= i + 1 ? "#F97316" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: step > i ? "#fff" : step === i + 1 ? "#F97316" : "#6B7280" }}>{step > i + 1 ? "✓" : i + 1}</div>
                        <span style={{ color: step === i + 1 ? "#F97316" : "#6B7280", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 1 — Confirm */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "1.5rem" }}>CONFIRM PLAN</h2>
                  <div style={{ background: "#0A0A0A", border: "1px solid rgba(249,115,22,0.2)", padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div>
                        <div style={{ color: "#F97316", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.3rem" }}>{selected.name.toUpperCase()} PLAN</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.5rem", lineHeight: 1 }}>
                          {selected.price === 0 ? "Free" : "TBD"}
                        </div>
                        <div style={{ color: "#6B7280", fontSize: "0.8rem" }}>{selected.period}</div>
                      </div>
                      <span style={{ fontSize: "2.5rem" }}>🚛</span>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                      {selected.features.filter(f => f.included).slice(0, 5).map((f, i) => (
                        <div key={i} style={{ color: "#9CA3AF", fontSize: "0.82rem", marginBottom: "0.35rem" }}>✓ {f.text}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn-primary" onClick={() => selected.price === 0 ? setStep(3) : setStep(2)}>
                      {selected.price === 0 ? "Activate Free Trial" : "Continue to Payment"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", marginBottom: "1.5rem" }}>PAYMENT</h2>

                  {/* Payment Methods */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ color: "#6B7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Payment Method</div>
                    {[["card", "💳", "Credit / Debit Card"], ["momo", "📱", "Mobile Money (MoMo)"], ["paystack", "🏦", "Paystack"]].map(([id, icon, label]) => (
                      <div key={id} className={`pay-method ${paymentMethod === id ? "active" : ""}`} onClick={() => setPaymentMethod(id)}>
                        <span>{icon}</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
                        {paymentMethod === id && <span style={{ marginLeft: "auto", color: "#F97316", fontSize: "0.8rem" }}>✓</span>}
                      </div>
                    ))}
                  </div>

                  {/* Card Form */}
                  {paymentMethod === "card" && (
                    <div>
                      <input className="payment-input" placeholder="Cardholder Name" value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} />
                      <input className="payment-input" placeholder="Card Number" value={cardForm.number} onChange={e => setCardForm(f => ({ ...f, number: formatCard(e.target.value) }))} maxLength={19} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <input className="payment-input" placeholder="MM/YY" value={cardForm.expiry} onChange={e => setCardForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))} maxLength={5} />
                        <input className="payment-input" placeholder="CVV" type="password" maxLength={4} value={cardForm.cvv} onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "momo" && (
                    <input className="payment-input" placeholder="Mobile Money Number (e.g. 024 000 0000)" />
                  )}

                  {paymentMethod === "paystack" && (
                    <p style={{ color: "#9CA3AF", fontSize: "0.88rem", marginBottom: "1rem" }}>You'll be redirected to Paystack to complete your payment securely.</p>
                  )}

                  <div style={{ background: "#0A0A0A", padding: "1rem", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9CA3AF", fontSize: "0.88rem" }}>Total due today</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#F97316" }}>TBD</span>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn-primary" onClick={handlePayment} disabled={processing}>
                      {processing ? <><span className="spinner" />Processing...</> : "Pay Now"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Success */}
              {step === 3 && (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <div style={{ width: 72, height: 72, background: "rgba(34,197,94,0.15)", border: "2px solid #22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.5rem" }}>✓</div>
                  <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                    {selected.price === 0 ? "TRIAL ACTIVATED!" : "PAYMENT SUCCESS!"}
                  </h2>
                  <p style={{ color: "#9CA3AF", marginBottom: "0.5rem" }}>
                    {selected.price === 0 ? "Your Free Trial is now active for 1 month." : `Your ${selected.name} plan is now active.`}
                  </p>
                  <p style={{ color: "#6B7280", fontSize: "0.85rem", marginBottom: "2rem" }}>A confirmation has been sent to your email.</p>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                    <button className="btn-primary" style={{ width: "auto", padding: "0.85rem 2rem" }} onClick={() => { setShowModal(false); navigate("/dashboard"); }}>Go to Dashboard</button>
                    <button className="btn-outline" style={{ width: "auto", padding: "0.85rem 2rem" }} onClick={() => setShowModal(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
