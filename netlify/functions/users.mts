import type { Context, Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb, users } from "./utils/db.mts";
import {
  authenticateRequest,
  jsonResponse,
  errorResponse,
} from "./utils/auth.mts";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // All user routes require authentication
  const tokenPayload = authenticateRequest(req);
  if (!tokenPayload) {
    return errorResponse("Token de acceso requerido", 401);
  }

  try {
    const db = getDb();

    // GET /api/users - Get all users (admin only)
    if (method === "GET" && path === "/api/users") {
      if (tokenPayload.role !== "admin") {
        return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
      }

      const allUsers = await db.select().from(users);
      const usersWithoutPasswords = allUsers.map(({ password: _, ...user }) => user);
      return jsonResponse(usersWithoutPasswords);
    }

    // GET /api/users/drivers - Get drivers
    if (method === "GET" && path === "/api/users/drivers") {
      const drivers = await db.select().from(users).where(eq(users.role, "conductor"));
      const driversWithoutPasswords = drivers.map(({ password: _, ...driver }) => driver);
      return jsonResponse(driversWithoutPasswords);
    }

    // POST /api/users - Create user (admin only)
    if (method === "POST" && path === "/api/users") {
      if (tokenPayload.role !== "admin") {
        return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
      }

      const body = await req.json();
      const { email, password, name, phone, role, active } = body;

      if (!email || !password || !name) {
        return errorResponse("Email, password y nombre son requeridos");
      }

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        return errorResponse("El email ya está registrado");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          role: role || "cliente",
          active: active !== undefined ? active : true,
        })
        .returning();

      const { password: _, ...userWithoutPassword } = user;
      return jsonResponse(userWithoutPassword, 201);
    }

    // Handle routes with ID parameter
    const idMatch = path.match(/^\/api\/users\/([^/]+)$/);
    if (idMatch) {
      const userId = idMatch[1];

      if (userId === "drivers") {
        // This was already handled above, but just in case
        return errorResponse("Ruta no encontrada", 404);
      }

      // PATCH /api/users/:id - Update user (admin only)
      if (method === "PATCH") {
        if (tokenPayload.role !== "admin") {
          return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
        }

        const body = await req.json();
        const updateData = { ...body };

        if (updateData.password) {
          updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const [user] = await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId))
          .returning();

        if (!user) {
          return errorResponse("Usuario no encontrado", 404);
        }

        const { password: _, ...userWithoutPassword } = user;
        return jsonResponse(userWithoutPassword);
      }

      // DELETE /api/users/:id - Delete user (admin only)
      if (method === "DELETE") {
        if (tokenPayload.role !== "admin") {
          return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
        }

        const result = await db.delete(users).where(eq(users.id, userId)).returning();

        if (result.length === 0) {
          return errorResponse("Usuario no encontrado", 404);
        }

        return jsonResponse({ message: "Usuario eliminado correctamente" });
      }
    }

    return errorResponse("Ruta no encontrada", 404);
  } catch (error) {
    console.error("Users error:", error);
    return errorResponse("Error interno del servidor", 500);
  }
};

export const config: Config = {
  path: ["/api/users", "/api/users/*"],
};
