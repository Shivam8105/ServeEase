import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Read user session from localStorage on load
    const stored = localStorage.getItem("servease_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored session:", e);
        localStorage.removeItem("servease_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("servease_user", JSON.stringify(data.user));
      setUser(data.user);
      
      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", name, email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("servease_user", JSON.stringify(data.user));
      setUser(data.user);

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("servease_user");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
