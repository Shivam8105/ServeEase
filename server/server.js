import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

// Routes import
import authRouter from "./routes/auth.js";
import bookingsRouter from "./routes/bookings.js";
import servicesRouter from "./routes/services.js";
import reviewsRouter from "./routes/reviews.js";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB and seed if empty
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/admin", adminRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "ServEase Pro API Server running!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
// Nodemon trigger reload

