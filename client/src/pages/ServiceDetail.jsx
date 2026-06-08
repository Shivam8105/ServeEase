import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Booking Form State
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");
  const [hours, setHours] = useState(2);
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "01:00 PM - 03:00 PM",
    "03:00 PM - 05:00 PM"
  ];

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch service details
        const sRes = await fetch("/api/services?status=all");
        if (sRes.ok) {
          const sData = await sRes.json();
          const found = sData.services.find((item) => item.id === id);
          setService(found);
        }

        // Fetch reviews
        const rRes = await fetch(`/api/reviews?serviceId=${id}`);
        if (rRes.ok) {
          const rData = await rRes.json();
          setReviews(rData.reviews);
        }
      } catch (error) {
        console.error("Error loading service data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError("");

    if (!user) {
      navigate(`/login?redirect=/services/${id}`);
      return;
    }

    if (user.role !== "customer") {
      setBookingError("Only customer accounts can place service bookings.");
      return;
    }

    if (!bookingDate) {
      setBookingError("Please select a date.");
      return;
    }

    if (!bookingSlot) {
      setBookingError("Please select a preferred time slot.");
      return;
    }

    if (hours < 1 || hours > 8) {
      setBookingError("Booking hours must be between 1 and 8.");
      return;
    }

    setBookingLoading(true);
    try {
      const totalPrice = service.price * hours;
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          customerName: user.name,
          serviceId: service.id,
          serviceTitle: service.title,
          providerId: service.providerId,
          providerName: service.providerName,
          date: bookingDate,
          timeSlot: bookingSlot,
          hours,
          totalPrice,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Booking submission failed");
      }

      // Redirect to simulated checkout page
      navigate(`/checkout/${data.booking.id}`);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner" style={{ margin: "100px auto" }}></div>;
  }

  if (!service) {
    return (
      <div className="container section-padding" style={{ textAlign: "center" }}>
        <h2>Service Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "16px 0 24px" }}>
          The service listing you are looking for does not exist or has been removed.
        </p>
        <Link to="/services" className="btn btn-primary">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const totalPrice = service.price * hours;

  return (
    <div className="container section-padding" style={{ flex: 1 }}>
      <Link to="/services" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
        ← Back to Marketplace
      </Link>

      <div className="detail-layout">
        {/* Left Side: Details & Reviews */}
        <div>
          <div className="detail-main-img">
            <img src={service.image} alt={service.title} />
          </div>

          <div className="detail-header">
            <span className="badge badge-confirmed" style={{ marginBottom: "12px", background: "rgba(99, 102, 241, 0.15)" }}>
              {service.category}
            </span>
            <h1 className="detail-title">{service.title}</h1>
            <div style={{ display: "flex", gap: "24px", color: "var(--text-muted)", fontSize: "14px" }}>
              <span>★ {service.rating.toFixed(1)} Rating</span>
              <span>•</span>
              <span>{reviews.length} Reviews</span>
            </div>
          </div>

          <div className="provider-banner">
            <div className="provider-avatar">
              {service.providerName.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="provider-info">
              <h4>Service Offered by {service.providerName}</h4>
              <p>Verified Local Service Provider Partner</p>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Description</h3>
            <p style={{ color: "var(--text-muted)", whiteSpace: "pre-line", fontSize: "15px", lineHeight: "1.7" }}>
              {service.description}
            </p>
          </div>

          {/* Reviews List */}
          <div className="detail-section" style={{ borderBottom: "none" }}>
            <h3 className="detail-section-title">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <div style={{ padding: "30px", background: "rgba(255, 255, 255, 0.01)", border: "1px dashed rgba(255, 255, 255, 0.1)", borderRadius: "12px", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  No reviews yet for this service. Be the first to book and rate!
                </p>
              </div>
            ) : (
              <div>
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-meta">
                      <div className="review-author">
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: "12px", fontWeight: "bold", justifyContent: "center" }}>
                          {review.customerName.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <span style={{ fontSize: "14px", fontWeight: "600", display: "block" }}>{review.customerName}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-dark)" }}>
                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="review-stars">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Booking Widget */}
        <aside>
          <div className="glass-panel booking-sidebar">
            <div className="booking-sidebar-price">
              ${service.price} <span>/ hr</span>
            </div>

            <form onSubmit={handleBookingSubmit}>
              {/* Date Selection */}
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              {/* Time Slots */}
              <div className="form-group">
                <label className="form-label">Available Time Slots</label>
                <div className="booking-slots-grid">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`booking-slot-btn ${bookingSlot === slot ? "active" : ""}`}
                      onClick={() => setBookingSlot(slot)}
                    >
                      {slot.split(" - ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Hours */}
              <div className="form-group">
                <label className="form-label">Estimated Hours</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  className="form-control"
                  required
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                />
              </div>

              {/* Booking Notes */}
              <div className="form-group">
                <label className="form-label">Describe your requirements (Optional)</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="E.g., Please bring extra wire, or tap leakage is in the kitchen..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: "none" }}
                ></textarea>
              </div>

              {/* Price Calculation */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-muted)", marginBottom: "6px" }}>
                  <span>Price Rate:</span>
                  <span>${service.price}/hr</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  <span>Duration:</span>
                  <span>{hours} {hours === 1 ? "hour" : "hours"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "10px" }}>
                  <span>Est. Total:</span>
                  <span style={{ color: "var(--text-main)" }}>${totalPrice}</span>
                </div>
              </div>

              {bookingError && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  ⚠️ {bookingError}
                </div>
              )}

              {/* Submit Action */}
              {!user ? (
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Login to Book Service
                </button>
              ) : user.role === "customer" ? (
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={bookingLoading}>
                  {bookingLoading ? "Submitting..." : "Confirm & Proceed to Checkout"}
                </button>
              ) : (
                <div style={{ fontSize: "12px", color: "var(--text-dark)", textAlign: "center", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                  Logged in as <strong>{user.role}</strong>. Please sign in as customer to book.
                </div>
              )}
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
