import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

export default function Services() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load initial params
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("query") || "";

  // State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(150);
  const [minRating, setMinRating] = useState(0);

  // Sync state with url params when they change
  useEffect(() => {
    setCategory(searchParams.get("category") || "all");
    setSearchText(searchParams.get("query") || "");
  }, [searchParams]);

  // Fetch filtered services
  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== "all") queryParams.append("category", category);
        if (searchText) queryParams.append("query", searchText);
        queryParams.append("maxPrice", maxPrice);
        queryParams.append("minRating", minRating);

        const res = await fetch(`/api/services?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setServices(data.services);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [category, searchText, maxPrice, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchText) {
      params.set("query", searchText);
    } else {
      params.delete("query");
    }
    navigate(`/services?${params.toString()}`);
  };

  const selectCategory = (catId) => {
    setCategory(catId);
    const params = new URLSearchParams(searchParams);
    if (catId && catId !== "all") {
      params.set("category", catId);
    } else {
      params.delete("category");
    }
    navigate(`/services?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchText("");
    setCategory("all");
    setMaxPrice(150);
    setMinRating(0);
    navigate("/services");
  };

  const categories = [
    { id: "all", name: "All", icon: "🌐" },
    { id: "electrician", name: "Electrician", icon: "🔌" },
    { id: "plumber", name: "Plumber", icon: "🪠" },
    { id: "cleaner", name: "Cleaner", icon: "🧹" },
    { id: "tutor", name: "Tutor", icon: "📚" }
  ];

  return (
    <div className="container section-padding" style={{ flex: 1 }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>Explore Marketplace</h1>
        <p style={{ color: "var(--text-muted)" }}>Find professional help for your household, studies, and repairs.</p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "16px", marginBottom: "32px" }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategory(cat.id)}
            className={`btn ${category === cat.id ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "10px 20px" }}
          >
            <span style={{ marginRight: "6px" }}>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      <div className="services-layout">
        {/* Filters Sidebar */}
        <aside className="glass-panel filter-sidebar">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "18px" }}>Filters</h3>
            <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              Reset All
            </button>
          </div>

          {/* Search bar */}
          <div className="filter-group">
            <label className="filter-title">Keyword Search</label>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search services..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ padding: "8px 12px", fontSize: "13px" }}
              />
            </form>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="filter-title" style={{ margin: 0 }}>Max Price</label>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>${maxPrice}/hr</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dark)", marginTop: "4px" }}>
              <span>$20</span>
              <span>$150</span>
            </div>
          </div>

          {/* Ratings */}
          <div className="filter-group">
            <label className="filter-title">Minimum Rating</label>
            <div className="filter-options">
              {[0, 4, 4.5, 4.8].map((rating) => (
                <label key={rating} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer", color: minRating === rating ? "white" : "var(--text-muted)" }}>
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                    style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                  />
                  {rating === 0 ? "Any rating" : `★ ${rating} & above`}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Services Listings Grid */}
        <section style={{ flex: 1 }}>
          {loading ? (
            <div className="spinner" style={{ marginTop: "60px" }}></div>
          ) : services.length === 0 ? (
            <div className="glass-panel" style={{ padding: "60px 40px", textAlign: "center", borderRadius: "16px" }}>
              <span style={{ fontSize: "48px" }}>🔍</span>
              <h3 style={{ fontSize: "20px", marginTop: "16px", marginBottom: "8px" }}>No Services Found</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "400px", margin: "0 auto 24px" }}>
                We couldn't find any service matches for your current search queries or filters. Try adjusting your parameters.
              </p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid-3col">
              {services.map((service) => (
                <div key={service.id} className="glass-card service-card">
                  <div className="service-card-img">
                    <img src={service.image} alt={service.title} />
                    <span className="service-tag">{service.category}</span>
                  </div>
                  <div className="service-card-info">
                    <div className="service-rating">
                      ★ {service.rating.toFixed(1)} <span style={{ color: "var(--text-dark)", fontWeight: "normal" }}>(Active)</span>
                    </div>
                    <h3 className="service-card-title">{service.title}</h3>
                    <p className="service-card-desc">{service.description}</p>
                    <div className="service-card-footer">
                      <div className="service-price">
                        ${service.price} <span>/hr</span>
                      </div>
                      <Link to={`/services/${service.id}`} className="btn btn-primary btn-sm">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
