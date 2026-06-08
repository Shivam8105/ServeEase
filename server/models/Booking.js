import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    serviceTitle: {
      type: String,
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
