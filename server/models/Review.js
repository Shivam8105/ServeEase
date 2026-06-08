import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    bookingId: {
      type: String,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
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

const Review = mongoose.model("Review", reviewSchema);
export default Review;
