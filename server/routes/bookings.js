import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { customerId, providerId, role } = req.query;

    let filter = {};

    if (role === "admin") {
      // Admin sees everything
    } else if (providerId) {
      filter.providerId = providerId;
    } else if (customerId) {
      filter.customerId = customerId;
    } else {
      return res.status(400).json({ error: "Unauthorized query" });
    }

    // Sort by createdAt desc
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (error) {
    console.error("Bookings GET Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      serviceId,
      serviceTitle,
      providerId,
      providerName,
      date,
      timeSlot,
      hours,
      totalPrice,
      notes,
    } = req.body;

    if (
      !customerId ||
      !customerName ||
      !serviceId ||
      !serviceTitle ||
      !providerId ||
      !providerName ||
      !date ||
      !timeSlot ||
      !hours ||
      !totalPrice
    ) {
      return res.status(400).json({ error: "Required details missing" });
    }

    const newBooking = new Booking({
      customerId,
      customerName,
      serviceId,
      serviceTitle,
      providerId,
      providerName,
      date,
      timeSlot,
      hours: parseInt(hours),
      totalPrice: parseFloat(totalPrice),
      notes: notes || "",
      status: "pending",
      paymentStatus: "pending",
      paymentDetails: null,
      reviewed: false,
    });

    await newBooking.save();
    return res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    console.error("Bookings POST Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: "Booking ID required" });
    }

    const updated = await Booking.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Bookings PUT Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
