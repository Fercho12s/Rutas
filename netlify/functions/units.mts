import type { Context, Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { getDb, units } from "./utils/db.mts";
import {
  authenticateRequest,
  jsonResponse,
  errorResponse,
} from "./utils/auth.mts";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // All unit routes require authentication
  const tokenPayload = authenticateRequest(req);
  if (!tokenPayload) {
    return errorResponse("Token de acceso requerido", 401);
  }

  try {
    const db = getDb();

    // GET /api/units - Get all units
    if (method === "GET" && path === "/api/units") {
      const allUnits = await db.select().from(units);
      return jsonResponse(allUnits);
    }

    // POST /api/units - Create unit (admin only)
    if (method === "POST" && path === "/api/units") {
      if (tokenPayload.role !== "admin") {
        return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
      }

      const body = await req.json();
      const { plate, model, brand, capacity, year, status, imageUrl, currentRouteId } = body;

      if (!plate || !model || !brand || capacity === undefined || year === undefined) {
        return errorResponse("Placa, modelo, marca, capacidad y año son requeridos");
      }

      const [unit] = await db
        .insert(units)
        .values({
          plate,
          model,
          brand,
          capacity,
          year,
          status: status || "disponible",
          imageUrl: imageUrl || null,
          currentRouteId: currentRouteId || null,
        })
        .returning();

      return jsonResponse(unit, 201);
    }

    // Handle routes with ID parameter
    const idMatch = path.match(/^\/api\/units\/([^/]+)$/);
    if (idMatch) {
      const unitId = idMatch[1];

      // GET /api/units/:id - Get single unit
      if (method === "GET") {
        const [unit] = await db.select().from(units).where(eq(units.id, unitId));

        if (!unit) {
          return errorResponse("Unidad no encontrada", 404);
        }

        return jsonResponse(unit);
      }

      // PATCH /api/units/:id - Update unit (admin only)
      if (method === "PATCH") {
        if (tokenPayload.role !== "admin") {
          return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
        }

        const body = await req.json();
        const [unit] = await db
          .update(units)
          .set(body)
          .where(eq(units.id, unitId))
          .returning();

        if (!unit) {
          return errorResponse("Unidad no encontrada", 404);
        }

        return jsonResponse(unit);
      }

      // DELETE /api/units/:id - Delete unit (admin only)
      if (method === "DELETE") {
        if (tokenPayload.role !== "admin") {
          return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
        }

        const result = await db.delete(units).where(eq(units.id, unitId)).returning();

        if (result.length === 0) {
          return errorResponse("Unidad no encontrada", 404);
        }

        return jsonResponse({ message: "Unidad eliminada correctamente" });
      }
    }

    return errorResponse("Ruta no encontrada", 404);
  } catch (error) {
    console.error("Units error:", error);
    return errorResponse("Error interno del servidor", 500);
  }
};

export const config: Config = {
  path: ["/api/units", "/api/units/*"],
};
