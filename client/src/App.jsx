import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Checkout from "./pages/Checkout";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/checkout/:bookingId" element={<Checkout />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <div className="footer-logo">⚡ ServEase Pro</div>
            <div className="footer-links">
              <a href="#" className="footer-link">About Us</a>
              <Link to="/services" className="footer-link">Find Services</Link>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
            <div>© {new Date().getFullYear()} ServEase Pro. All rights reserved. Built with premium design standards.</div>
          </div>
        </footer>
      </AuthProvider>
    </Router>
  );
}

export default App;
