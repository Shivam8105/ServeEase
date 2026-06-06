import { getTable, insert, update } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    let reviews = getTable("reviews");
    if (serviceId) {
      reviews = reviews.filter(r => r.serviceId === serviceId);
    }

    // Sort by date (newest first)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return Response.json({ success: true, reviews });
  } catch (error) {
    console.error("Reviews GET Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, serviceId, customerId, customerName, rating, comment } = body;

    if (!bookingId || !serviceId || !customerId || !customerName || !rating) {
      return Response.json({ error: "Required details missing" }, { status: 400 });
    }

    // 1. Insert review
    const newReview = insert("reviews", {
      bookingId,
      serviceId,
      customerId,
      customerName,
      rating: parseInt(rating),
      comment: comment || ""
    });

    // 2. Mark booking as reviewed or update booking meta if needed (optional)
    // Here we can just flag the booking if we want, or just leave it.
    
    // 3. Recalculate average rating for the service
    const reviews = getTable("reviews").filter(r => r.serviceId === serviceId);
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / reviews.length).toFixed(1));

    update("services", serviceId, { rating: avgRating });

    return Response.json({ success: true, review: newReview, avgRating }, { status: 201 });
  } catch (error) {
    console.error("Reviews POST Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
