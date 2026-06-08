import express from "express";
import Review from "../models/Review.js";
import Service from "../models/Service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { serviceId } = req.query;

    let filter = {};
    if (serviceId) {
      filter.serviceId = serviceId;
    }

    // Sort by createdAt desc
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (error) {
    console.error("Reviews GET Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { bookingId, serviceId, customerId, customerName, rating, comment } = req.body;

    if (!bookingId || !serviceId || !customerId || !customerName || !rating) {
      return res.status(400).json({ error: "Required details missing" });
    }

    // 1. Save new review
    const newReview = new Review({
      bookingId,
      serviceId,
      customerId,
      customerName,
      rating: parseInt(rating),
      comment: comment || "",
    });

    await newReview.save();

    // 2. Recalculate average rating
    const serviceReviews = await Review.find({ serviceId });
    const totalRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / serviceReviews.length).toFixed(1));

    await Service.findOneAndUpdate({ id: serviceId }, { rating: avgRating });

    return res.status(201).json({ success: true, review: newReview, avgRating });
  } catch (error) {
    console.error("Reviews POST Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
