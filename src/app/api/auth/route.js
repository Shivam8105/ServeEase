import { getTable, insert, findByEmail } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) {
        return Response.json({ error: "Email and password are required" }, { status: 400 });
      }

      const user = findByEmail(email);
      if (!user || user.password !== password) {
        return Response.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // Return user details (omit password)
      const { password: _, ...safeUser } = user;
      return Response.json({ success: true, user: safeUser });
    }

    if (action === "register") {
      const { name, email, password, role } = body;
      if (!name || !email || !password || !role) {
        return Response.json({ error: "All fields are required" }, { status: 400 });
      }

      if (findByEmail(email)) {
        return Response.json({ error: "Email is already registered" }, { status: 409 });
      }

      if (!["customer", "provider", "admin"].includes(role)) {
        return Response.json({ error: "Invalid user role" }, { status: 400 });
      }

      const user = insert("users", {
        name,
        email,
        password,
        role
      });

      const { password: _, ...safeUser } = user;
      return Response.json({ success: true, user: safeUser }, { status: 201 });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
