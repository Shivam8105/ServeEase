import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "";

  useEffect(() => {
    if (!authLoading && user) {
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        // Redirect based on role
        if (user.role === "admin") navigate("/admin/dashboard");
        else if (user.role === "provider") navigate("/provider/dashboard");
        else navigate("/customer/dashboard");
      }
    }
  }, [user, authLoading, redirectUrl, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Login failed. Check your credentials.");
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError("");
    setSubmitting(true);
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    const result = await login(demoEmail, demoPassword);
    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="spinner" style={{ margin: "100px auto" }}></div>;
  }

  return (
    <div className="container" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass-panel auth-container animate-fade-in">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your ServEase Pro account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }} disabled={submitting}>
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "20px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600" }}>
            Sign up
          </Link>
        </p>

        {/* Quick Demo Logins */}
        <div className="auth-demo-links">
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dark)", fontWeight: "600" }}>
            Quick Demo Accounts
          </span>
          <div className="auth-demo-grid">
            <button
              onClick={() => handleQuickLogin("customer@servease.com", "customer123")}
              className="auth-demo-btn"
              disabled={submitting}
            >
              🙋 Customer
            </button>
            <button
              onClick={() => handleQuickLogin("provider1@servease.com", "provider123")}
              className="auth-demo-btn"
              disabled={submitting}
            >
              🛠️ Provider
            </button>
            <button
              onClick={() => handleQuickLogin("admin@servease.com", "admin123")}
              className="auth-demo-btn"
              disabled={submitting}
            >
              👑 Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
