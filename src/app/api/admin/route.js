import { getStats, getTable, update, remove } from "@/lib/db";

export async function GET(request) {
  try {
    // Return all data required for admin console
    const stats = getStats();
    const users = getTable("users").map(({ password, ...u }) => u); // Safe users list
    const services = getTable("services");
    const bookings = getTable("bookings");
    const reviews = getTable("reviews");

    return Response.json({
      success: true,
      stats,
      users,
      services,
      bookings,
      reviews
    });
  } catch (error) {
    console.error("Admin GET Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action"); // moderateService, moderateUser
    const id = searchParams.get("id");

    if (!action || !id) {
      return Response.json({ error: "Action and ID required" }, { status: 400 });
    }

    const body = await request.json();

    if (action === "moderateService") {
      // Body can be { status: "approved" | "suspended" }
      const updated = update("services", id, { status: body.status });
      if (!updated) return Response.json({ error: "Service not found" }, { status: 404 });
      return Response.json({ success: true, service: updated });
    }

    if (action === "moderateUser") {
      // Body can be { suspended: true | false } (or role change, etc.)
      const updated = update("users", id, { suspended: body.suspended });
      if (!updated) return Response.json({ error: "User not found" }, { status: 404 });
      return Response.json({ success: true, user: updated });
    }

    return Response.json({ error: "Invalid admin action" }, { status: 400 });
  } catch (error) {
    console.error("Admin PUT Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action"); // deleteReview
    const id = searchParams.get("id");

    if (!action || !id) {
      return Response.json({ error: "Action and ID required" }, { status: 400 });
    }

    if (action === "deleteReview") {
      const deleted = remove("reviews", id);
      if (!deleted) return Response.json({ error: "Review not found" }, { status: 404 });
      return Response.json({ success: true, message: "Review deleted" });
    }

    return Response.json({ error: "Invalid delete action" }, { status: 400 });
  } catch (error) {
    console.error("Admin DELETE Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
