import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, listings, reviews

  // Admin Data State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchAdminData();
  }, [user, authLoading, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users);
        setServices(data.services);
        setBookings(data.bookings);
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching admin console data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateService = async (serviceId, newStatus) => {
    try {
      const res = await fetch(`/api/admin?action=moderateService&id=${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error("Error moderating service listing:", error);
    }
  };

  const handleModerateUser = async (userId, isSuspended) => {
    try {
      const res = await fetch(`/api/admin?action=moderateUser&id=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: isSuspended })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error("Error moderating user status:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review comment from the system?")) return;

    try {
      const res = await fetch(`/api/admin?action=deleteReview&id=${reviewId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (authLoading || loading) {
    return <div className="spinner" style={{ margin: "100px auto" }}></div>;
  }

  return (
    <div className="container section-padding" style={{ flex: 1 }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Platform Admin Command Center</h1>
        <p style={{ color: "var(--text-muted)" }}>Monitor metrics, manage system users, approve listings, and moderate feedback.</p>
      </div>

      <div className="dashboard-grid">
        {/* Sidebar Nav */}
        <aside>
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div className="dashboard-nav">
              <button
                className={`dashboard-nav-item ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                📊 Platform Metrics
              </button>
              <button
                className={`dashboard-nav-item ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                👥 User Directory
              </button>
              <button
                className={`dashboard-nav-item ${activeTab === "listings" ? "active" : ""}`}
                onClick={() => setActiveTab("listings")}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                💼 Service Catalog
              </button>
              <button
                className={`dashboard-nav-item ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                💬 Review Moderation
              </button>
            </div>
          </div>
        </aside>

        {/* Dashboard Main Content */}
        <main style={{ flex: 1 }}>
          {/* Overview Metrics tab */}
          {activeTab === "overview" && stats && (
            <div>
              <div className="dashboard-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <div className="stat-card glass-panel">
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Gross Revenue</div>
                  <div className="stat-val">${stats.revenue}</div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Bookings</div>
                  <div className="stat-val">{stats.bookingsCount}</div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Active Listings</div>
                  <div className="stat-val">{stats.servicesCount}</div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Providers</div>
                  <div className="stat-val">{stats.providersCount}</div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Customers</div>
                  <div className="stat-val">{stats.customersCount}</div>
                </div>
              </div>

              {/* Recent Bookings table */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Recent Transactions</h3>
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Service Target</th>
                        <th>Provider</th>
                        <th>Total Cost</th>
                        <th>Booking Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td style={{ fontFamily: "monospace", color: "var(--primary)" }}>{booking.id}</td>
                          <td style={{ fontWeight: "600" }}>{booking.customerName}</td>
                          <td>{booking.serviceTitle}</td>
                          <td>{booking.providerName}</td>
                          <td style={{ fontWeight: "bold" }}>${booking.totalPrice}</td>
                          <td>
                            <span className={`badge badge-${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge-${booking.paymentStatus === "paid" ? "paid" : "unpaid"}`}>
                              {booking.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Moderation tab */}
          {activeTab === "users" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Platform Directory</h3>
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email Address</th>
                      <th>Account Role</th>
                      <th>Registration Date</th>
                      <th>System Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: "600", color: "var(--text-main)" }}>{item.name}</td>
                        <td>{item.email}</td>
                        <td>
                          <span className="badge badge-confirmed" style={{ background: item.role === "admin" ? "rgba(168,85,247,0.15)" : item.role === "provider" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)", color: item.role === "admin" ? "var(--secondary)" : item.role === "provider" ? "var(--primary)" : "var(--text-muted)" }}>
                            {item.role}
                          </span>
                        </td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${item.suspended ? "badge-cancelled" : "badge-completed"}`}>
                            {item.suspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {item.role !== "admin" && (
                            <button
                              onClick={() => handleModerateUser(item.id, !item.suspended)}
                              className={`btn ${item.suspended ? "btn-success" : "btn-danger"} btn-sm`}
                            >
                              {item.suspended ? "Activate" : "Suspend"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Listings Moderation tab */}
          {activeTab === "listings" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Moderate Service Listings</h3>
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Service Title</th>
                      <th>Category</th>
                      <th>Hourly Rate</th>
                      <th>Rating</th>
                      <th>Moderation Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id}>
                        <td style={{ fontWeight: "500" }}>{service.providerName}</td>
                        <td style={{ fontWeight: "600", color: "var(--text-main)" }}>{service.title}</td>
                        <td><span className="badge badge-confirmed" style={{ background: "rgba(99, 102, 241, 0.15)" }}>{service.category}</span></td>
                        <td style={{ fontWeight: "bold" }}>${service.price}/hr</td>
                        <td style={{ color: "var(--warning)" }}>★ {service.rating.toFixed(1)}</td>
                        <td>
                          <span className={`badge ${service.status === "approved" ? "badge-completed" : service.status === "pending" ? "badge-pending" : "badge-cancelled"}`}>
                            {service.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            {service.status !== "approved" && (
                              <button onClick={() => handleModerateService(service.id, "approved")} className="btn btn-success btn-sm">
                                Approve
                              </button>
                            )}
                            {service.status !== "suspended" && (
                              <button onClick={() => handleModerateService(service.id, "suspended")} className="btn btn-danger btn-sm">
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews Moderation tab */}
          {activeTab === "reviews" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Moderate Review Feedbacks</h3>
              {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No feedback reviews have been posted on the platform yet.
                </div>
              ) : (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Service Target</th>
                        <th>Rating Stars</th>
                        <th>Comment</th>
                        <th>Date Posted</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id}>
                          <td style={{ fontWeight: "600", color: "var(--text-main)" }}>{review.customerName}</td>
                          <td>{review.serviceId}</td>
                          <td style={{ color: "var(--warning)" }}>{"★".repeat(review.rating)}</td>
                          <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-muted)" }}>
                            "{review.comment}"
                          </td>
                          <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                          <td style={{ textAlign: "right" }}>
                            <button onClick={() => handleDeleteReview(review.id)} className="btn btn-danger btn-sm">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
