"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "provider") return "/provider/dashboard";
    return "/customer/dashboard";
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="logo">
          <span>⚡</span> ServEase Pro
        </Link>

        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            Home
          </Link>
          <Link href="/services" className={`nav-link ${pathname.startsWith("/services") ? "active" : ""}`}>
            Find Services
          </Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span style={{ fontSize: "14px", color: "var(--text-muted)", marginRight: "10px" }}>
                Hi, <strong>{user.name.split(" ")[0]}</strong> ({user.role})
              </span>
              <Link href={getDashboardLink()} className="btn btn-secondary btn-sm">
                Dashboard
              </Link>
              <button onClick={logout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link" style={{ marginRight: "10px" }}>
                Login
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
