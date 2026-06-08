import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { action } = req.body;

    if (action === "login") {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (user.suspended) {
        return res.status(403).json({ error: "Your account has been suspended by an administrator." });
      }

      const safeUser = user.toJSON();
      delete safeUser.password;
      return res.json({ success: true, user: safeUser });
    }

    if (action === "register") {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      if (!["customer", "provider", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid user role" });
      }

      const newUser = new User({ name, email, password, role });
      await newUser.save();

      const safeUser = newUser.toJSON();
      delete safeUser.password;
      return res.status(201).json({ success: true, user: safeUser });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("Auth Route Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
