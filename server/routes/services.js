import express from "express";
import Service from "../models/Service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, query, providerId, status, maxPrice, minRating } = req.query;

    let filter = {};

    // Provider filter
    if (providerId) {
      filter.providerId = providerId;
    } else {
      if (status !== "all") {
        filter.status = status || "approved";
      }
    }

    // Category filter
    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

    // Query Search filter
    if (query) {
      const regex = new RegExp(query, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { providerName: regex },
      ];
    }

    // Price and Rating filters
    const priceLimit = parseFloat(maxPrice || "9999");
    const ratingLimit = parseFloat(minRating || "0");

    filter.price = { $lte: priceLimit };
    filter.rating = { $gte: ratingLimit };

    const services = await Service.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, services });
  } catch (error) {
    console.error("Services GET Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { providerId, providerName, title, description, category, price, image, availability } = req.body;

    if (!providerId || !providerName || !title || !description || !category || !price) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const newService = new Service({
      providerId,
      providerName,
      title,
      description,
      category: category.toLowerCase(),
      price: parseFloat(price),
      rating: 5.0,
      status: "approved", // auto-approve for now
      image: image || undefined,
      availability: availability || undefined,
    });

    await newService.save();
    return res.status(201).json({ success: true, service: newService });
  } catch (error) {
    console.error("Services POST Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: "Service ID required" });
    }

    const updated = await Service.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Service not found" });
    }

    return res.json({ success: true, service: updated });
  } catch (error) {
    console.error("Services PUT Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: "Service ID required" });
    }

    const deleted = await Service.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: "Service not found" });
    }

    return res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Services DELETE Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
