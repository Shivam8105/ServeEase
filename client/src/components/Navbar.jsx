import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "provider") return "/provider/dashboard";
    return "/customer/dashboard";
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <span>⚡</span> ServEase Pro
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/services" className={`nav-link ${pathname.startsWith("/services") ? "active" : ""}`}>
            Find Services
          </Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span style={{ fontSize: "14px", color: "var(--text-muted)", marginRight: "10px" }}>
                Hi, <strong>{user.name.split(" ")[0]}</strong> ({user.role})
              </span>
              <Link to={getDashboardLink()} className="btn btn-secondary btn-sm">
                Dashboard
              </Link>
              <button onClick={logout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" style={{ marginRight: "10px" }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
