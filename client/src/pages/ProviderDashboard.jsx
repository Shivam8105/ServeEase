import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation Tab
  const [activeTab, setActiveTab] = useState("bookings"); // bookings, listings, profile
  
  // Dashboard Data State
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Listing Modal State
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("electrician");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "provider") {
      navigate("/");
      return;
    }

    loadDashboardData();
  }, [user, authLoading, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch bookings for provider
      const bRes = await fetch(`/api/bookings?providerId=${user.id}`);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData.bookings);
      }

      // Fetch services for provider
      const sRes = await fetch(`/api/services?providerId=${user.id}`);
      if (sRes.ok) {
        const sData = await sRes.json();
        setServices(sData.services);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const openListingModal = () => {
    setTitle("");
    setCategory("electrician");
    setPrice("");
    setImageUrl("");
    setDescription("");
    setModalError("");
    setListingModalOpen(true);
  };

  const closeListingModal = () => {
    setListingModalOpen(false);
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setModalError("");
    
    if (!title || !price || !description) {
      setModalError("Please fill out all required fields.");
      return;
    }

    setModalSubmitting(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: user.id,
          providerName: user.name,
          title,
          category,
          price: parseFloat(price),
          image: imageUrl || undefined,
          description,
          availability: ["Monday", "Wednesday", "Friday"]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create service listing");
      }

      closeListingModal();
      loadDashboardData();
    } catch (error) {
      setModalError(error.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteListing = async (serviceId) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const res = await fetch(`/api/services?id=${serviceId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error deleting service listing:", error);
    }
  };

  if (authLoading || loading) {
    return <div className="spinner" style={{ margin: "100px auto" }}></div>;
  }

  // Stats Calculations
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarnings = bookings
    .filter((b) => b.status === "completed" && b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalPrice, 0);
  
  const avgRating = services.length > 0
    ? (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)
    : "5.0";

  return (
    <div className="container section-padding" style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Provider Dashboard</h1>
          <p style={{ color: "var(--text-muted)" }}>Manage service listings, respond to customer schedules, and track earnings.</p>
        </div>
        {activeTab === "listings" && (
          <button onClick={openListingModal} className="btn btn-primary">
            + Add New Listing
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Sidebar Navigation */}
        <aside>
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div className="dashboard-nav">
              <button
                className={`dashboard-nav-item ${activeTab === "bookings" ? "active" : ""}`}
                onClick={() => setActiveTab("bookings")}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                📅 Booking Tasks
              </button>
              <button
                className={`dashboard-nav-item ${activeTab === "listings" ? "active" : ""}`}
                onClick={() => setActiveTab("listings")}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                💼 My Service Listings
              </button>
              <button
                className={`dashboard-nav-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                👤 Profile Settings
              </button>
            </div>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main style={{ flex: 1 }}>
          {/* Stats Bar */}
          {activeTab !== "profile" && (
            <div className="dashboard-stats">
              <div className="stat-card glass-panel">
                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Total Revenue</div>
                <div className="stat-val">${totalEarnings}</div>
              </div>
              <div className="stat-card glass-panel">
                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Total Bookings</div>
                <div className="stat-val">{bookings.length}</div>
              </div>
              <div className="stat-card glass-panel">
                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Avg Rating</div>
                <div className="stat-val">{avgRating} ★</div>
              </div>
            </div>
          )}

          {/* Bookings Scheduler */}
          {activeTab === "bookings" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Bookings Schedule</h3>
              {bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "14px" }}>
                  No customer bookings have been placed for your services yet.
                </div>
              ) : (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Service Target</th>
                        <th>Date & Slot</th>
                        <th>Hours & Price</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td style={{ fontWeight: "600", color: "white" }}>{booking.customerName}</td>
                          <td>{booking.serviceTitle}</td>
                          <td>
                            <div style={{ fontWeight: "500" }}>{booking.date}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-dark)" }}>{booking.timeSlot}</div>
                          </td>
                          <td>${booking.totalPrice} <span style={{ fontSize: "11px", color: "var(--text-dark)" }}>({booking.hours}h)</span></td>
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
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                              {booking.status === "pending" && (
                                <>
                                  <button onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")} className="btn btn-success btn-sm">
                                    Accept
                                  </button>
                                  <button onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")} className="btn btn-danger btn-sm">
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              {booking.status === "confirmed" && (
                                <button onClick={() => handleUpdateBookingStatus(booking.id, "completed")} className="btn btn-primary btn-sm">
                                  Mark Completed
                                </button>
                              )}
                              
                              {booking.status === "completed" && (
                                <span style={{ fontSize: "12px", color: "var(--text-dark)" }}>Completed</span>
                              )}

                              {booking.status === "cancelled" && (
                                <span style={{ fontSize: "12px", color: "var(--text-dark)" }}>Cancelled</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Listings Manager */}
          {activeTab === "listings" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Manage Service Catalog</h3>
              {services.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "14px" }}>
                  You do not have any services listed. Click "+ Add New Listing" to create one.
                </div>
              ) : (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Thumbnail</th>
                        <th>Service Title</th>
                        <th>Category</th>
                        <th>Hourly Rate</th>
                        <th>Current Rating</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr key={service.id}>
                          <td>
                            <img src={service.image} alt={service.title} style={{ width: "60px", height: "45px", objectFit: "cover", borderRadius: "4px" }} />
                          </td>
                          <td style={{ fontWeight: "600", color: "white" }}>{service.title}</td>
                          <td><span className="badge badge-confirmed" style={{ background: "rgba(99, 102, 241, 0.15)" }}>{service.category}</span></td>
                          <td style={{ fontSize: "15px", fontWeight: "700" }}>${service.price}/hr</td>
                          <td style={{ color: "var(--warning)", fontWeight: "600" }}>★ {service.rating.toFixed(1)}</td>
                          <td>
                            <span className={`badge ${service.status === "approved" ? "badge-completed" : service.status === "pending" ? "badge-pending" : "badge-cancelled"}`}>
                              {service.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button onClick={() => handleDeleteListing(service.id)} className="btn btn-danger btn-sm">
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

          {/* Profile Details */}
          {activeTab === "profile" && (
            <div className="glass-panel" style={{ padding: "30px", maxWidth: "600px" }}>
              <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Provider Profile</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Provider Name:</span>
                  <strong style={{ color: "white" }}>{user.name}</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Email Address:</span>
                  <strong style={{ color: "white" }}>{user.email}</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Account Type:</span>
                  <span className="badge badge-confirmed" style={{ width: "fit-content" }}>{user.role}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}>
                  <span style={{ color: "var(--text-muted)" }}>Joined Platform:</span>
                  <strong style={{ color: "white" }}>{new Date(user.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Listing Modal */}
      {listingModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: "100%", maxWidth: "540px", padding: "30px", position: "relative" }}>
            <button onClick={closeListingModal} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}>
              ✕
            </button>
            <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>Create Service Listing</h3>

            <form onSubmit={handleCreateListing}>
              <div className="form-group">
                <label className="form-label">Service Title (Be descriptive)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g., Licensed Residential Air Conditioning Repair"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Service Category</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="tutor">Tutor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rate ($ USD)</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    className="form-control"
                    placeholder="55"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/... or blank for default"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  rows="4"
                  className="form-control"
                  placeholder="Explain details of what is included, your experience, work guarantees, tools you provide, etc..."
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: "none" }}
                ></textarea>
              </div>

              {modalError && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  ⚠️ {modalError}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={closeListingModal} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={modalSubmitting}>
                  {modalSubmitting ? "Creating..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
