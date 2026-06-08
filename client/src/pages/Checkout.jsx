import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { bookingId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState("form"); // form, processing, success
  const [error, setError] = useState("");

  // Card Form State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadBooking() {
      try {
        const res = await fetch(`/api/bookings?customerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const found = data.bookings.find((b) => b.id === bookingId);
          if (found) {
            setBooking(found);
            // If already paid, skip to success
            if (found.paymentStatus === "paid") {
              setPaymentStep("success");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId, user, authLoading, navigate]);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    // Format card number with spaces every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const plainCardNumber = cardNumber.replace(/\s/g, "");
    if (plainCardNumber.length < 16) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }

    if (cardExpiry.length < 5) {
      setError("Please enter card expiration date (MM/YY).");
      return;
    }

    if (cardCvv.length < 3) {
      setError("Please enter card CVV code.");
      return;
    }

    // Step 1: Show Processing Loader
    setPaymentStep("processing");

    // Simulate Network Delay for Checkout authorization
    setTimeout(async () => {
      try {
        const txnId = `txn_${Math.floor(1000000 + Math.random() * 9000000)}`;
        const cardBrand = plainCardNumber.startsWith("4") ? "Visa" : "Mastercard";
        const cardLast4 = plainCardNumber.slice(-4);

        // Step 2: Update booking details in backend DB
        const res = await fetch(`/api/bookings?id=${bookingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: "paid",
            status: "confirmed", // Automatically confirm booking after payment
            paymentDetails: {
              transactionId: txnId,
              cardBrand,
              cardLast4
            }
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to finalize payment in backend database");
        }

        setBooking(data.booking);
        setPaymentStep("success");
      } catch (err) {
        setError(err.message);
        setPaymentStep("form");
      }
    }, 2500);
  };

  if (loading || authLoading) {
    return <div className="spinner" style={{ margin: "100px auto" }}></div>;
  }

  if (!booking) {
    return (
      <div className="container section-padding" style={{ textAlign: "center" }}>
        <h2>Booking Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "16px 0 24px" }}>
          We could not locate the details of the booking you are trying to pay for.
        </p>
        <Link to="/customer/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container section-padding" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {paymentStep === "form" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", width: "100%", maxWidth: "900px" }}>
          {/* Booking Summary */}
          <div className="glass-panel" style={{ padding: "30px" }}>
            <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>Order Summary</h2>
            
            <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <h3 style={{ fontSize: "16px", color: "white", marginBottom: "8px" }}>{booking.serviceTitle}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Provider: {booking.providerName}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Scheduled Date</span>
                <span style={{ color: "white", fontWeight: "600" }}>{booking.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Time Window</span>
                <span style={{ color: "white", fontWeight: "600" }}>{booking.timeSlot}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Duration</span>
                <span style={{ color: "white", fontWeight: "600" }}>{booking.hours} hours</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Hourly Price</span>
                <span style={{ color: "white", fontWeight: "600" }}>${booking.totalPrice / booking.hours}/hr</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "800", color: "white", borderTop: "1px dashed rgba(255, 255, 255, 0.1)", paddingTop: "16px", marginTop: "8px" }}>
                <span>Amount Due</span>
                <span style={{ color: "var(--primary)" }}>${booking.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Card Form */}
          <div className="glass-panel" style={{ padding: "30px" }}>
            <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>Checkout Details</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
              💳 Secure, encrypted checkout. Enter dummy details to process booking.
            </p>

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="4111 2222 3333 4444"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Expiration (MM/YY)</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    placeholder="***"
                    value={cardCvv}
                    onChange={handleCvvChange}
                  />
                </div>
              </div>

              {error && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px" }}>
                Pay ${booking.totalPrice} Now
              </button>
            </form>
          </div>
        </div>
      )}

      {paymentStep === "processing" && (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", maxWidth: "400px", width: "100%" }}>
          <div className="spinner"></div>
          <h3 style={{ fontSize: "20px", marginTop: "24px", marginBottom: "8px" }}>Authorizing Payment</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Connecting with Stripe payment gateway secure channel. Please do not refresh page...
          </p>
        </div>
      )}

      {paymentStep === "success" && (
        <div className="checkout-container">
          <div className="receipt-card animate-slide-up">
            <div style={{ display: "flex", justifyCenter: "center", marginBottom: "16px", justifyContent: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", fontSize: "24px" }}>
                ✓
              </div>
            </div>
            
            <div className="receipt-header">
              <h2 className="receipt-title">Payment Successful!</h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Thank you for booking with ServEase Pro.</p>
            </div>

            <div className="receipt-line">
              <span>Receipt ID</span>
              <span style={{ color: "white" }}>{booking.paymentDetails?.transactionId || "N/A"}</span>
            </div>
            <div className="receipt-line">
              <span>Service Title</span>
              <span style={{ color: "white", textAlign: "right", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {booking.serviceTitle}
              </span>
            </div>
            <div className="receipt-line">
              <span>Provider</span>
              <span style={{ color: "white" }}>{booking.providerName}</span>
            </div>
            <div className="receipt-line">
              <span>Scheduled Date</span>
              <span style={{ color: "white" }}>{booking.date}</span>
            </div>
            <div className="receipt-line">
              <span>Time Slot</span>
              <span style={{ color: "white" }}>{booking.timeSlot}</span>
            </div>
            <div className="receipt-line">
              <span>Payment Type</span>
              <span style={{ color: "white" }}>{booking.paymentDetails?.cardBrand || "Credit Card"} (**** {booking.paymentDetails?.cardLast4 || "4242"})</span>
            </div>

            <div className="receipt-line receipt-total">
              <span style={{ fontWeight: "700" }}>Total Paid</span>
              <span style={{ color: "var(--success)", fontWeight: "800" }}>${booking.totalPrice}</span>
            </div>

            <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/customer/dashboard" className="btn btn-primary" style={{ width: "100%" }}>
                Go to Bookings Dashboard
              </Link>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ width: "100%" }}>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
