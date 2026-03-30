import type { Context, Config } from "@netlify/functions";
import { getDb, contacts } from "./utils/db.mts";
import {
  authenticateRequest,
  jsonResponse,
  errorResponse,
} from "./utils/auth.mts";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    const db = getDb();

    // POST /api/contacts - Create contact (public - no auth)
    if (method === "POST" && path === "/api/contacts") {
      const body = await req.json();
      const { name, email, phone, message } = body;

      if (!name || !email || !message) {
        return errorResponse("Nombre, email y mensaje son requeridos");
      }

      const [contact] = await db
        .insert(contacts)
        .values({
          name,
          email,
          phone: phone || null,
          message,
        })
        .returning();

      return jsonResponse({ message: "Mensaje enviado correctamente", contact }, 201);
    }

    // GET /api/contacts - Get all contacts (admin only)
    if (method === "GET" && path === "/api/contacts") {
      const tokenPayload = authenticateRequest(req);
      if (!tokenPayload) {
        return errorResponse("Token de acceso requerido", 401);
      }

      if (tokenPayload.role !== "admin") {
        return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
      }

      const allContacts = await db.select().from(contacts);
      return jsonResponse(allContacts);
    }

    return errorResponse("Ruta no encontrada", 404);
  } catch (error) {
    console.error("Contacts error:", error);
    return errorResponse("Error interno del servidor", 500);
  }
};

export const config: Config = {
  path: "/api/contacts",
};
