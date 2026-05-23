import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { apiRegister, apiLogin, apiGoogleAuth } from "../api";

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authError, setAuthError] = useState("");
  const setError = setAuthError;
  const [showPass, setShowPass] = useState(false);

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Full name is required";
    if (mode === "signup" && !form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (mode === "signup" && form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleEmailLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setAuthError("");
    try {
      const data = await apiLogin(form.email, form.password);
      login(data.user, data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setAuthError("");
    try {
      const data = await apiRegister(form.name, form.email, form.password);
      login(data.user, data.access_token);
      navigate("/subscription");
    } catch (err) {
      setAuthError(err?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    return mode === "login" ? handleEmailLogin() : handleEmailSignup();
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Save user to backend and get JWT
        const data = await apiGoogleAuth(tokenResponse.access_token);
        login(data.user, data.access_token);
        navigate("/subscription");
      } catch (err) {
        setError("Google sign-in failed. Please try again.");
      }
    },
    onError: () => console.error("Google login failed"),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; color: #fff; font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        .auth-input { width: 100%; background: #1F2937; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.85rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
        .auth-input::placeholder { color: #4B5563; }
        .auth-input:focus { border-color: #F97316; }
        .auth-input.error { border-color: #ef4444; }

        .btn-primary { background: #F97316; color: #fff; border: none; padding: 0.9rem 1.5rem; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; width: 100%; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); }
        .btn-primary:hover:not(:disabled) { background: #EA6C00; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(249,115,22,0.35); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .tab { flex: 1; padding: 0.85rem; background: transparent; border: none; color: #6B7280; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; border-bottom: 2px solid transparent; }
        .tab.active { color: #F97316; border-bottom-color: #F97316; }
        .tab:hover:not(.active) { color: #9CA3AF; }

        .divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .divider span { color: #4B5563; font-size: 0.8rem; letter-spacing: 0.05em; }

        .success-overlay { position: fixed; inset: 0; background: rgba(10,10,10,0.95); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }

        .grid-bg { background-image: linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px); background-size: 60px 60px; }

        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #4B5563; font-size: 0.9rem; pointer-events: none; }
        .input-wrap .auth-input { padding-left: 2.5rem; }
        .toggle-pass { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #6B7280; cursor: pointer; font-size: 0.8rem; letter-spacing: 0.05em; }
        .toggle-pass:hover { color: #F97316; }

        .strength-bar { height: 3px; border-radius: 2px; transition: all 0.3s; margin-top: 0.4rem; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; margin-right: 0.5rem; vertical-align: middle; }
      `}</style>

      {/* Success Overlay */}
      {success && (
        <div className="success-overlay">
          <div style={{ width: 64, height: 64, background: "rgba(34,197,94,0.15)", border: "2px solid #22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>✓</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem" }}>
            {mode === "signup" ? "Account Created!" : "Welcome Back!"}
          </h2>
          <p style={{ color: "#9CA3AF" }}>Redirecting you to Strong Haul...</p>
        </div>
      )}

      <div style={{ minHeight: "100vh", display: "flex" }}>

        {/* LEFT PANEL — Branding */}
        <div className="grid-bg" style={{ flex: 1, background: "#0f0f0f", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "3rem", position: "relative", overflow: "hidden" }}>
          {/* Glow */}
          <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "30%", right: "-5%", width: 300, height: 300, background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />

          {/* Logo */}
          <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", position: "relative" }}>
            <div style={{ width: 36, height: 36, background: "#F97316", clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🚛</div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "0.05em" }}>STRONG HAUL</span>
          </div>

          {/* Main text */}
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-block", background: "rgba(249,115,22,0.15)", color: "#F97316", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.35rem 1rem", marginBottom: "1.25rem", borderLeft: "2px solid #F97316" }}>Global Marketplace</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 4vw, 4.5rem)", lineHeight: 0.95, marginBottom: "1.5rem" }}>
              THE WORLD'S<br />
              <span style={{ color: "#F97316", WebkitTextStroke: "2px #F97316", WebkitTextFillColor: "transparent" }}>HEAVY</span><br />
              FLEET.
            </h2>
            <p style={{ color: "#6B7280", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 360 }}>
              Join thousands of truck and machinery owners listing their vehicles — and hirers finding exactly what they need, anywhere in the world.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: "2.5rem", marginTop: "2.5rem" }}>
              {[["500+", "Vehicles"], ["30+", "Countries"], ["1K+", "Hirers"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#F97316", lineHeight: 1 }}>{v}</div>
                  <div style={{ color: "#6B7280", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p style={{ color: "#374151", fontSize: "0.78rem", position: "relative" }}>© 2025 Strong Haul. All rights reserved.</p>
        </div>

        {/* RIGHT PANEL — Auth Form */}
        <div style={{ width: "100%", maxWidth: 480, background: "#0A0A0A", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 2.5rem", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "2rem" }}>
            <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setErrors({}); setForm({ name: "", username: "", email: "", password: "", confirm: "" }); }}>Log In</button>
            <button className={`tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setErrors({}); setForm({ name: "", username: "", email: "", password: "", confirm: "" }); }}>Sign Up</button>
          </div>

          <div className="fade-in" key={mode}>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.2rem", marginBottom: "0.4rem" }}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p style={{ color: "#6B7280", fontSize: "0.88rem", marginBottom: "2rem" }}>
              {mode === "login" ? "Log in to manage your listings and account." : "Join Strong Haul and start listing your vehicles today."}
            </p>

            {/* Google Login */}
            <div style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => handleGoogle()}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", background: "#111827", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "0.85rem 1rem", fontSize: "0.95rem", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
              >
                <span style={{ fontSize: "1rem" }}>🔎</span>
                {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
              </button>
            </div>

            <div className="divider"><span>OR CONTINUE WITH EMAIL</span></div>
            {authError && (
              <p style={{ color: "#ef4444", textAlign: "center", marginTop: "0.5rem", marginBottom: "1rem" }}>
                {authError}
              </p>
            )}

            {/* Form Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {mode === "signup" && (
                <div>
                  <label style={{ color: "#9CA3AF", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Full Name</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input className={`auth-input ${errors.name ? "error" : ""}`} placeholder="e.g. Kwame Asante" value={form.name} onChange={e => update("name", e.target.value)} />
                  </div>
                  {errors.name && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.name}</p>}
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label style={{ color: "#9CA3AF", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Username</label>
                  <div className="input-wrap">
                    <span className="input-icon">@</span>
                    <input className={`auth-input ${errors.username ? "error" : ""}`} placeholder="e.g. kwameasante" value={form.username} onChange={e => update("username", e.target.value)} />
                  </div>
                  {errors.username && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.username}</p>}
                </div>
              )}

              <div>
                <label style={{ color: "#9CA3AF", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input className={`auth-input ${errors.email ? "error" : ""}`} placeholder="you@example.com" type="email" value={form.email} onChange={e => update("email", e.target.value)} />
                </div>
                {errors.email && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.email}</p>}
              </div>

              <div>
                <label style={{ color: "#9CA3AF", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input className={`auth-input ${errors.password ? "error" : ""}`} placeholder="Min. 6 characters" type={showPass ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} />
                  <button className="toggle-pass" onClick={() => setShowPass(s => !s)}>{showPass ? "HIDE" : "SHOW"}</button>
                </div>
                {/* Password strength */}
                {mode === "signup" && form.password && (
                  <div>
                    <div className="strength-bar" style={{
                      width: form.password.length < 6 ? "25%" : form.password.length < 10 ? "60%" : "100%",
                      background: form.password.length < 6 ? "#ef4444" : form.password.length < 10 ? "#F97316" : "#22c55e"
                    }} />
                    <p style={{ color: form.password.length < 6 ? "#ef4444" : form.password.length < 10 ? "#F97316" : "#22c55e", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                      {form.password.length < 6 ? "Weak" : form.password.length < 10 ? "Good" : "Strong"}
                    </p>
                  </div>
                )}
                {errors.password && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.password}</p>}
              </div>

              {mode === "signup" && (
                <div>
                  <label style={{ color: "#9CA3AF", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>Confirm Password</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input className={`auth-input ${errors.confirm ? "error" : ""}`} placeholder="Re-enter your password" type={showPass ? "text" : "password"} value={form.confirm} onChange={e => update("confirm", e.target.value)} />
                  </div>
                  {errors.confirm && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.confirm}</p>}
                </div>
              )}

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
                  <span style={{ color: "#F97316", fontSize: "0.82rem", cursor: "pointer" }}>Forgot password?</span>
                </div>
              )}

              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: "0.5rem" }}>
                {loading ? <><span className="spinner" />{mode === "login" ? "Logging in..." : "Creating account..."}</> : mode === "login" ? "Log In" : "Create Account"}
              </button>

              {mode === "signup" && (
                <p style={{ color: "#4B5563", fontSize: "0.78rem", textAlign: "center", lineHeight: 1.6 }}>
                  By signing up you agree to our{" "}
                  <span style={{ color: "#F97316", cursor: "pointer" }}>Terms of Service</span>{" "}
                  and{" "}
                  <span style={{ color: "#F97316", cursor: "pointer" }}>Privacy Policy</span>
                </p>
              )}

              <p style={{ color: "#6B7280", fontSize: "0.85rem", textAlign: "center" }}>
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <span style={{ color: "#F97316", cursor: "pointer", fontWeight: 600 }} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrors({}); }}>
                  {mode === "login" ? "Sign Up" : "Log In"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
