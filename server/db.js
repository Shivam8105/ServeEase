import mongoose from "mongoose";
import User from "./models/User.js";
import Service from "./models/Service.js";
import Booking from "./models/Booking.js";
import Review from "./models/Review.js";

const DEFAULT_USERS = [
  {
    id: "u-admin",
    name: "Alex Admin",
    email: "admin@servease.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "u-prov1",
    name: "Alice Sparks",
    email: "provider1@servease.com",
    password: "provider123",
    role: "provider",
  },
  {
    id: "u-prov2",
    name: "Bob Drips",
    email: "provider2@servease.com",
    password: "provider123",
    role: "provider",
  },
  {
    id: "u-prov3",
    name: "Charlie Clean",
    email: "provider3@servease.com",
    password: "provider123",
    role: "provider",
  },
  {
    id: "u-prov4",
    name: "Diane Smart",
    email: "provider4@servease.com",
    password: "provider123",
    role: "provider",
  },
  {
    id: "u-cust1",
    name: "John Doe",
    email: "customer@servease.com",
    password: "customer123",
    role: "customer",
  }
];

const DEFAULT_SERVICES = [
  {
    id: "s-1",
    providerId: "u-prov1",
    providerName: "Alice Sparks",
    title: "Premium Home Electrical Inspections & Repair",
    description: "Complete electrical safety inspections, wiring repairs, socket replacements, and lighting installations by a licensed electrician with over 8 years of local experience. Prompt, professional, and fully insured.",
    category: "electrician",
    price: 75,
    rating: 4.8,
    status: "approved",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    availability: ["Monday", "Wednesday", "Friday"],
  },
  {
    id: "s-2",
    providerId: "u-prov2",
    providerName: "Bob Drips",
    title: "Emergency Plumbing, Leak Detection & Pipe Repair",
    description: "Struggling with clogged drains, leaking faucets, or bursting pipes? Get instant professional response. We specialize in hot water system maintenance, sewage clearance, and appliance piping installation.",
    category: "plumber",
    price: 90,
    rating: 4.9,
    status: "approved",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop",
    availability: ["Tuesday", "Thursday", "Saturday"],
  },
  {
    id: "s-3",
    providerId: "u-prov3",
    providerName: "Charlie Clean",
    title: "Eco-Friendly Full House Deep Cleaning Service",
    description: "Bring the shine back to your home. Comprehensive cleaning including kitchens, bathrooms, carpet vacuuming, dust removal, and window cleaning. We use 100% non-toxic, pet-safe organic cleaning agents.",
    category: "cleaner",
    price: 45,
    rating: 4.5,
    status: "approved",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  {
    id: "s-4",
    providerId: "u-prov4",
    providerName: "Diane Smart",
    title: "High School Mathematics & Physics Private Tutoring",
    description: "Personalized 1-on-1 tutoring sessions to help students master Algebra, Calculus, Trigonometry, and Physics concepts. Exam preparation (AP, SAT, IB) with progress tracking and custom study materials.",
    category: "tutor",
    price: 50,
    rating: 5.0,
    status: "approved",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
    availability: ["Monday", "Tuesday", "Thursday", "Saturday"],
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: "b-1",
    customerId: "u-cust1",
    customerName: "John Doe",
    serviceId: "s-1",
    serviceTitle: "Premium Home Electrical Inspections & Repair",
    providerId: "u-prov1",
    providerName: "Alice Sparks",
    date: "2026-06-02",
    timeSlot: "10:00 AM - 12:00 PM",
    hours: 2,
    totalPrice: 150,
    status: "completed",
    paymentStatus: "paid",
    paymentDetails: {
      transactionId: "txn_0019283",
      cardBrand: "Visa",
      cardLast4: "4242"
    },
    notes: "Need help replacing old sockets in the living room.",
    reviewed: true,
  },
  {
    id: "b-2",
    customerId: "u-cust1",
    customerName: "John Doe",
    serviceId: "s-2",
    serviceTitle: "Emergency Plumbing, Leak Detection & Pipe Repair",
    providerId: "u-prov2",
    providerName: "Bob Drips",
    date: "2026-06-10",
    timeSlot: "02:00 PM - 04:00 PM",
    hours: 1,
    totalPrice: 90,
    status: "confirmed",
    paymentStatus: "paid",
    paymentDetails: {
      transactionId: "txn_0019294",
      cardBrand: "Mastercard",
      cardLast4: "8821"
    },
    notes: "Bathroom faucet is leaking constantly.",
    reviewed: false,
  },
  {
    id: "b-3",
    customerId: "u-cust1",
    customerName: "John Doe",
    serviceId: "s-3",
    serviceTitle: "Eco-Friendly Full House Deep Cleaning Service",
    providerId: "u-prov3",
    providerName: "Charlie Clean",
    date: "2026-06-15",
    timeSlot: "09:00 AM - 12:00 PM",
    hours: 3,
    totalPrice: 135,
    status: "pending",
    paymentStatus: "pending",
    paymentDetails: null,
    notes: "Deep clean 2 bedrooms and kitchen.",
    reviewed: false,
  }
];

const DEFAULT_REVIEWS = [
  {
    id: "r-1",
    bookingId: "b-1",
    serviceId: "s-1",
    customerId: "u-cust1",
    customerName: "John Doe",
    rating: 5,
    comment: "Alice was absolutely fantastic! She showed up right on time, explained the issue with the sockets clearly, and replaced them in less than an hour. Very professional and tidy.",
  }
];

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/servease";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully to:", uri);

    // Run database seeding if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Seeding database with default mock data...");
      await User.insertMany(DEFAULT_USERS);
      await Service.insertMany(DEFAULT_SERVICES);
      await Booking.insertMany(DEFAULT_BOOKINGS);
      await Review.insertMany(DEFAULT_REVIEWS);
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already has data. Skipping seed.");
    }
  } catch (error) {
    console.error("MongoDB connection or seeding error:", error);
    // Don't crash process, allow server to boot but log failure
  }
}
