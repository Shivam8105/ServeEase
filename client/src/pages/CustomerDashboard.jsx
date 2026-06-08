import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings"); // bookings, profile
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "customer") {
      navigate("/");
      return;
    }

    fetchBookings();
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?customerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" })
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment("");
    setReviewError("");
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedBooking(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          serviceId: selectedBooking.serviceId,
          customerId: user.id,
          customerName: user.name,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Review submission failed");
      }

      // Mark the booking as reviewed
      await fetch(`/api/bookings?id=${selectedBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: true })
      });

      closeReviewModal();
      fetchBookings();
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="spinner" style={{ margin: "100px auto" }}></div>;
  }

  // Stats
  const activeBookings = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalSpend = bookings
    .filter((b) => b.status !== "cancelled" && b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="container section-padding" style={{ flex: 1 }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Customer Command Center</h1>
        <p style={{ color: "var(--text-muted)" }}>Manage your service requests, bookings, payments, and feedback.</p>
      </div>

      <div className="dashboard-grid">
        {/* Sidebar Nav */}
        <aside>
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div className="dashboard-nav">
              <button
                className={`dashboard-nav-item ${activeTab === "bookings" ? "active" : ""}`}
                onClick={() => setActiveTab("bookings")}
                style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
              >
                📅 My Bookings
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

        {/* Dashboard Main Panel */}
        <main style={{ flex: 1 }}>
          {activeTab === "bookings" && (
            <div>
              {/* Stats Cards */}
              <div className="dashboard-stats">
                <div className="stat-card glass-panel">
                  <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Total Spendings</div>
                  <div className="stat-val">${totalSpend}</div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Active Bookings</div>
                  <div className="stat-val">{activeBookings.length}</div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Completed Jobs</div>
                  <div className="stat-val">{completedBookings.length}</div>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Bookings Schedule</h3>
                
                {bookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
                      You haven't booked any services yet. Start exploring the marketplace!
                    </p>
                    <Link to="/services" className="btn btn-primary">
                      Explore Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Provider</th>
                          <th>Date & Slot</th>
                          <th>Total Cost</th>
                          <th>Booking Status</th>
                          <th>Payment</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td style={{ fontWeight: "600", color: "white" }}>{booking.serviceTitle}</td>
                            <td>{booking.providerName}</td>
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
                                {booking.paymentStatus === "pending" && booking.status !== "cancelled" && (
                                  <Link to={`/checkout/${booking.id}`} className="btn btn-primary btn-sm">
                                    Pay Now
                                  </Link>
                                )}
                                
                                {booking.status === "completed" && !booking.reviewed && (
                                  <button onClick={() => openReviewModal(booking)} className="btn btn-success btn-sm">
                                    Write Review
                                  </button>
                                )}

                                {(booking.status === "pending" || booking.status === "confirmed") && (
                                  <button onClick={() => handleCancelBooking(booking.id)} className="btn btn-danger btn-sm">
                                    Cancel
                                  </button>
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
            </div>
          )}

          {activeTab === "profile" && (
            <div className="glass-panel" style={{ padding: "30px", maxWidth: "600px" }}>
              <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Profile Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Full Name:</span>
                  <strong style={{ color: "white" }}>{user.name}</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Email Address:</span>
                  <strong style={{ color: "white" }}>{user.email}</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Account Role:</span>
                  <span className="badge badge-confirmed" style={{ width: "fit-content" }}>{user.role}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}>
                  <span style={{ color: "var(--text-muted)" }}>Registered Since:</span>
                  <strong style={{ color: "white" }}>{new Date(user.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedBooking && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: "100%", maxWidth: "480px", padding: "30px", position: "relative" }}>
            <button onClick={closeReviewModal} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}>
              ✕
            </button>
            <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>Rate & Review Service</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Share your feedback for <strong>{selectedBooking.serviceTitle}</strong> by {selectedBooking.providerName}.
            </p>

            <form onSubmit={handleReviewSubmit}>
              {/* Star selector */}
              <div className="form-group">
                <label className="form-label">Select Stars</label>
                <div style={{ display: "flex", gap: "10px", fontSize: "24px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: rating >= star ? "var(--warning)" : "var(--text-dark)" }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="form-group">
                <label className="form-label">Review comments</label>
                <textarea
                  rows="4"
                  className="form-control"
                  placeholder="Share details of your experience with this professional. Was the task resolved correctly? Were they punctual?"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ resize: "none" }}
                ></textarea>
              </div>

              {reviewError && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  ⚠️ {reviewError}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={closeReviewModal} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
