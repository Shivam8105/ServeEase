import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    providerId: {
      type: String,
      required: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "suspended"],
      default: "approved",
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    },
    availability: {
      type: [String],
      default: ["Monday", "Wednesday", "Friday"],
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

const Service = mongoose.model("Service", serviceSchema);
export default Service;
