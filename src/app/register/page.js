"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function RegisterContent() {
  const { user, register, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load default role
  const defaultRole = searchParams.get("role") || "customer";

  // State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect them
    if (!authLoading && user) {
      if (user.role === "admin") router.push("/admin/dashboard");
      else if (user.role === "provider") router.push("/provider/dashboard");
      else router.push("/customer/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await register(name, email, password, role);
    if (!result.success) {
      setError(result.error || "Registration failed. Try a different email.");
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="spinner" style={{ margin: "100px auto" }}></div>;
  }

  return (
    <div className="container" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass-panel auth-container animate-fade-in" style={{ margin: "40px auto" }}>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join ServEase Pro marketplace community</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              placeholder="•••••••• (min 6 characters)"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Role Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                className={`btn ${role === "customer" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setRole("customer")}
                style={{ padding: "10px", fontSize: "13px" }}
              >
                🙋 Customer (Book Services)
              </button>
              <button
                type="button"
                className={`btn ${role === "provider" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setRole("provider")}
                style={{ padding: "10px", fontSize: "13px" }}
              >
                🛠️ Provider (Sell Services)
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }} disabled={submitting}>
            {submitting ? "Signing up..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "20px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }}></div>}>
      <RegisterContent />
    </Suspense>
  );
}
