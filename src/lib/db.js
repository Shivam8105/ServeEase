const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(process.cwd(), 'db.json');

const DEFAULT_DATA = {
  users: [
    {
      id: "u-admin",
      name: "Alex Admin",
      email: "admin@servease.com",
      password: "admin123",
      role: "admin",
      createdAt: "2026-01-01T12:00:00Z"
    },
    {
      id: "u-prov1",
      name: "Alice Sparks",
      email: "provider1@servease.com",
      password: "provider123",
      role: "provider",
      createdAt: "2026-02-15T09:00:00Z"
    },
    {
      id: "u-prov2",
      name: "Bob Drips",
      email: "provider2@servease.com",
      password: "provider123",
      role: "provider",
      createdAt: "2026-03-10T10:30:00Z"
    },
    {
      id: "u-prov3",
      name: "Charlie Clean",
      email: "provider3@servease.com",
      password: "provider123",
      role: "provider",
      createdAt: "2026-04-05T14:15:00Z"
    },
    {
      id: "u-prov4",
      name: "Diane Smart",
      email: "provider4@servease.com",
      password: "provider123",
      role: "provider",
      createdAt: "2026-04-20T08:00:00Z"
    },
    {
      id: "u-cust1",
      name: "John Doe",
      email: "customer@servease.com",
      password: "customer123",
      role: "customer",
      createdAt: "2026-05-01T11:00:00Z"
    }
  ],
  services: [
    {
      id: "s-1",
      providerId: "u-prov1",
      providerName: "Alice Sparks",
      title: "Premium Home Electrical Inspections & Repair",
      description: "Complete electrical safety inspections, wiring repairs, socket replacements, and lighting installations by a licensed electrician with over 8 years of local experience. Prompt, professional, and fully insured.",
      category: "electrician",
      price: 75,
      rating: 4.8,
      status: "approved", // approved, pending, suspended
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
      availability: ["Monday", "Wednesday", "Friday"],
      createdAt: "2026-02-16T10:00:00Z"
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
      createdAt: "2026-03-12T11:00:00Z"
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
      createdAt: "2026-04-06T15:00:00Z"
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
      createdAt: "2026-04-22T09:00:00Z"
    }
  ],
  bookings: [
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
      status: "completed", // pending, confirmed, completed, cancelled
      paymentStatus: "paid", // pending, paid
      paymentDetails: {
        transactionId: "txn_0019283",
        cardBrand: "Visa",
        cardLast4: "4242"
      },
      notes: "Need help replacing old sockets in the living room.",
      createdAt: "2026-06-01T14:22:00Z"
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
      createdAt: "2026-06-05T09:12:00Z"
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
      createdAt: "2026-06-06T11:45:00Z"
    }
  ],
  reviews: [
    {
      id: "r-1",
      bookingId: "b-1",
      serviceId: "s-1",
      customerId: "u-cust1",
      customerName: "John Doe",
      rating: 5,
      comment: "Alice was absolutely fantastic! She showed up right on time, explained the issue with the sockets clearly, and replaced them in less than an hour. Very professional and tidy.",
      createdAt: "2026-06-02T13:00:00Z"
    }
  ]
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database:", error);
    return DEFAULT_DATA;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

export function getTable(tableName) {
  const db = readDb();
  return db[tableName] || [];
}

export function saveTable(tableName, data) {
  const db = readDb();
  db[tableName] = data;
  return writeDb(db);
}

export function findById(tableName, id) {
  const table = getTable(tableName);
  return table.find(item => item.id === id);
}

export function findByEmail(email) {
  const users = getTable('users');
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function insert(tableName, item) {
  const table = getTable(tableName);
  const newItem = {
    id: `${tableName.slice(0, 1)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    ...item
  };
  table.push(newItem);
  saveTable(tableName, table);
  return newItem;
}

export function update(tableName, id, updates) {
  const table = getTable(tableName);
  const index = table.findIndex(item => item.id === id);
  if (index === -1) return null;

  table[index] = { ...table[index], ...updates };
  saveTable(tableName, table);
  return table[index];
}

export function remove(tableName, id) {
  const table = getTable(tableName);
  const filtered = table.filter(item => item.id !== id);
  if (filtered.length === table.length) return false;
  saveTable(tableName, filtered);
  return true;
}

export function getStats() {
  const bookings = getTable('bookings');
  const services = getTable('services');
  const users = getTable('users');

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid' && b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

  return {
    revenue: totalRevenue,
    bookingsCount: bookings.length,
    completedCount: completedBookings,
    activeCount: activeBookings,
    providersCount: users.filter(u => u.role === 'provider').length,
    customersCount: users.filter(u => u.role === 'customer').length,
    servicesCount: services.length
  };
}
