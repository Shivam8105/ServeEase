import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch featured (top-rated) services
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/services?minRating=4.6");
        if (res.ok) {
          const data = await res.json();
          // Take first 3 services
          setFeaturedServices(data.services.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching featured services:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/services");
    }
  };

  const categories = [
    { id: "electrician", name: "Electrician", icon: "🔌", desc: "Wiring, fixtures, inspections & repairs" },
    { id: "plumber", name: "Plumber", icon: "🪠", desc: "Leaking pipes, drainage & water systems" },
    { id: "cleaner", name: "Cleaner", icon: "🧹", desc: "Deep cleans, sanitizing & home upkeep" },
    { id: "tutor", name: "Tutor", icon: "📚", desc: "1-on-1 Math, Physics & study prep" }
  ];

  return (
    <div style={{ flex: 1 }}>
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-glow"></div>
        <div className="container">
          <div className="hero-tagline">🚀 Professional Local Services on Demand</div>
          <h1 className="hero-title">Your Household Needs, Resolved Instantly.</h1>
          <p className="hero-subtitle">
            Connect with certified, background-checked electricians, plumbers, cleaners, and tutors in your area. Secure bookings, simple billing.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ maxWidth: "600px", margin: "0 auto 40px", position: "relative" }}>
            <div style={{ display: "flex", gap: "12px", background: "#ffffff", padding: "8px", borderRadius: "14px", border: "1px solid var(--border-glass)" }}>
              <input
                type="text"
                className="form-control"
                placeholder="What service do you need today? (e.g. electrical inspection...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: "none", background: "transparent", flex: 1, padding: "12px" }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px" }}>
                Search
              </button>
            </div>
          </form>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Link to="/services" className="btn btn-primary">
              Browse Marketplace
            </Link>
            <Link to="/register?role=provider" className="btn btn-secondary">
              Become a Provider
            </Link>
          </div>
        </div>
      </header>

      {/* Categories Section */}
      <section className="section-padding" style={{ background: "rgba(16, 185, 129, 0.03)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>Browse by Service Category</h2>
            <p style={{ color: "var(--text-muted)" }}>Explore our directory of trusted and accredited professionals</p>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="glass-card category-card"
                onClick={() => navigate(`/services?category=${cat.id}`)}
              >
                <div className="category-icon">{cat.icon}</div>
                <h3 className="category-title">{cat.name}</h3>
                <p className="category-desc">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px" }}>
            <div>
              <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>Featured Services</h2>
              <p style={{ color: "var(--text-muted)" }}>Top-rated service listings available for instant booking</p>
            </div>
            <Link to="/services" className="btn btn-outline">
              View All Services
            </Link>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="grid-3col">
              {featuredServices.map((service) => (
                <div key={service.id} className="glass-card service-card">
                  <div className="service-card-img">
                    <img src={service.image} alt={service.title} />
                    <span className="service-tag">{service.category}</span>
                  </div>
                  <div className="service-card-info">
                    <div className="service-rating">
                      ★ {service.rating.toFixed(1)} <span style={{ color: "var(--text-dark)", fontWeight: "normal" }}>(Local Pro)</span>
                    </div>
                    <h3 className="service-card-title">{service.title}</h3>
                    <p className="service-card-desc">{service.description}</p>
                    <div className="service-card-footer">
                      <div className="service-price">
                        ${service.price} <span>/hr</span>
                      </div>
                      <Link to={`/services/${service.id}`} className="btn btn-primary btn-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Platform Value Pillars / Metrics */}
      <section className="section-padding" style={{ background: "rgba(99, 102, 241, 0.03)", borderTop: "1px solid rgba(255, 255, 255, 0.03)", borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "40px", fontWeight: "800", color: "var(--primary)" }}>5,000+</div>
            <h4 style={{ margin: "10px 0 6px" }}>Bookings Done</h4>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Satisfied clients across dozens of fields</p>
          </div>
          <div>
            <div style={{ fontSize: "40px", fontWeight: "800", color: "var(--secondary)" }}>150+</div>
            <h4 style={{ margin: "10px 0 6px" }}>Certified Pro Partners</h4>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Rigorous background-checking process</p>
          </div>
          <div>
            <div style={{ fontSize: "40px", fontWeight: "800", color: "var(--success)" }}>4.9 ★</div>
            <h4 style={{ margin: "10px 0 6px" }}>Average Satisfaction</h4>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Rated by customers in your neighborhood</p>
          </div>
        </div>
      </section>
    </div>
  );
}
