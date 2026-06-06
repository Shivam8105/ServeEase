import { getTable, insert, update } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const providerId = searchParams.get("providerId");
    const role = searchParams.get("role");

    let bookings = getTable("bookings");

    if (role === "admin") {
      // Admin sees everything
    } else if (providerId) {
      bookings = bookings.filter(b => b.providerId === providerId);
    } else if (customerId) {
      bookings = bookings.filter(b => b.customerId === customerId);
    } else {
      return Response.json({ error: "Unauthorized query" }, { status: 400 });
    }

    // Sort by date/time (newest bookings first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return Response.json({ success: true, bookings });
  } catch (error) {
    console.error("Bookings GET Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, customerName, serviceId, serviceTitle, providerId, providerName, date, timeSlot, hours, totalPrice, notes } = body;

    if (!customerId || !customerName || !serviceId || !serviceTitle || !providerId || !providerName || !date || !timeSlot || !hours || !totalPrice) {
      return Response.json({ error: "Required details missing" }, { status: 400 });
    }

    const newBooking = insert("bookings", {
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
      status: "pending", // pending, confirmed, completed, cancelled
      paymentStatus: "pending", // pending, paid
      paymentDetails: null,
      notes: notes || ""
    });

    return Response.json({ success: true, booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error("Bookings POST Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Booking ID required" }, { status: 400 });
    }

    const body = await request.json();
    // We expect body to contain status updates or payment updates
    const updated = update("bookings", id, body);
    if (!updated) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Bookings PUT Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
