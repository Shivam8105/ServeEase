import { getTable, insert, update, remove } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const providerId = searchParams.get("providerId");
    const status = searchParams.get("status"); // approved, pending, suspended, all
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "9999");
    const minRating = parseFloat(searchParams.get("minRating") || "0");

    let services = getTable("services");

    // Providers filter to their own listings
    if (providerId) {
      services = services.filter(s => s.providerId === providerId);
    } else {
      // By default, non-providers only see approved services
      if (status !== "all") {
        const filterStatus = status || "approved";
        services = services.filter(s => s.status === filterStatus);
      }
    }

    if (category && category !== "all") {
      services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase();
      services = services.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.providerName.toLowerCase().includes(q)
      );
    }

    services = services.filter(s => s.price <= maxPrice && s.rating >= minRating);

    return Response.json({ success: true, services });
  } catch (error) {
    console.error("Services API Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { providerId, providerName, title, description, category, price, image, availability } = body;

    if (!providerId || !providerName || !title || !description || !category || !price) {
      return Response.json({ error: "Required fields missing" }, { status: 400 });
    }

    const newService = insert("services", {
      providerId,
      providerName,
      title,
      description,
      category: category.toLowerCase(),
      price: parseFloat(price),
      rating: 5.0, // Default rating for new service
      status: "approved", // auto-approve for the dashboard demo, admin can suspend later
      image: image || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
      availability: availability || ["Monday", "Wednesday", "Friday"]
    });

    return Response.json({ success: true, service: newService }, { status: 201 });
  } catch (error) {
    console.error("Create Service Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Service ID required" }, { status: 400 });
    }

    const body = await request.json();
    const updated = update("services", id, body);
    if (!updated) {
      return Response.json({ error: "Service not found" }, { status: 404 });
    }

    return Response.json({ success: true, service: updated });
  } catch (error) {
    console.error("Update Service Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Service ID required" }, { status: 400 });
    }

    const deleted = remove("services", id);
    if (!deleted) {
      return Response.json({ error: "Service not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete Service Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
