import express from "express";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    const services = await Service.find({}).sort({ createdAt: -1 });
    const users = await User.find({}).sort({ createdAt: -1 });
    const reviews = await Review.find({}).sort({ createdAt: -1 });

    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === "paid" && b.status !== "cancelled")
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const completedBookings = bookings.filter((b) => b.status === "completed").length;
    const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;

    const stats = {
      revenue: totalRevenue,
      bookingsCount: bookings.length,
      completedCount: completedBookings,
      activeCount: activeBookings,
      providersCount: users.filter((u) => u.role === "provider").length,
      customersCount: users.filter((u) => u.role === "customer").length,
      servicesCount: services.length,
    };

    // Strip passwords before returning
    const safeUsers = users.map((u) => {
      const uJson = u.toJSON();
      delete uJson.password;
      return uJson;
    });

    return res.json({
      success: true,
      stats,
      users: safeUsers,
      services,
      bookings,
      reviews,
    });
  } catch (error) {
    console.error("Admin GET Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const { action, id } = req.query;

    if (!action || !id) {
      return res.status(400).json({ error: "Action and ID required" });
    }

    if (action === "moderateService") {
      const { status } = req.body;
      const updated = await Service.findOneAndUpdate({ id }, { status }, { new: true });
      if (!updated) return res.status(404).json({ error: "Service not found" });
      return res.json({ success: true, service: updated });
    }

    if (action === "moderateUser") {
      const { suspended } = req.body;
      const updated = await User.findOneAndUpdate({ id }, { suspended }, { new: true });
      if (!updated) return res.status(404).json({ error: "User not found" });
      return res.json({ success: true, user: updated });
    }

    return res.status(400).json({ error: "Invalid admin action" });
  } catch (error) {
    console.error("Admin PUT Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { action, id } = req.query;

    if (!action || !id) {
      return res.status(400).json({ error: "Action and ID required" });
    }

    if (action === "deleteReview") {
      const deleted = await Review.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: "Review not found" });
      return res.json({ success: true, message: "Review deleted" });
    }

    return res.status(400).json({ error: "Invalid delete action" });
  } catch (error) {
    console.error("Admin DELETE Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
