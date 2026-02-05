import type { Context, Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { getDb, routes } from "./utils/db.mts";
import {
  authenticateRequest,
  jsonResponse,
  errorResponse,
} from "./utils/auth.mts";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // All routes require authentication
  const tokenPayload = authenticateRequest(req);
  if (!tokenPayload) {
    return errorResponse("Token de acceso requerido", 401);
  }

  try {
    const db = getDb();

    // GET /api/routes - Get all routes
    if (method === "GET" && path === "/api/routes") {
      const allRoutes = await db.select().from(routes);
      return jsonResponse(allRoutes);
    }

    // POST /api/routes - Create route (admin only)
    if (method === "POST" && path === "/api/routes") {
      if (tokenPayload.role !== "admin") {
        return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
      }

      const body = await req.json();
      const { title, origin, destination, stops, schedule, distanceKm, duration, status, assignedUnitId, assignedDriverId, imageUrl } = body;

      if (!title || !origin || !destination || distanceKm === undefined) {
        return errorResponse("Título, origen, destino y distancia son requeridos");
      }

      const [route] = await db
        .insert(routes)
        .values({
          title,
          origin,
          destination,
          stops: stops || [],
          schedule: schedule || [],
          distanceKm,
          duration: duration || null,
          status: status || "activo",
          assignedUnitId: assignedUnitId || null,
          assignedDriverId: assignedDriverId || null,
          imageUrl: imageUrl || null,
        })
        .returning();

      return jsonResponse(route, 201);
    }

    // Handle routes with ID parameter
    const idMatch = path.match(/^\/api\/routes\/([^/]+)$/);
    if (idMatch) {
      const routeId = idMatch[1];

      // GET /api/routes/:id - Get single route
      if (method === "GET") {
        const [route] = await db.select().from(routes).where(eq(routes.id, routeId));

        if (!route) {
          return errorResponse("Ruta no encontrada", 404);
        }

        return jsonResponse(route);
      }

      // PATCH /api/routes/:id - Update route (admin only)
      if (method === "PATCH") {
        if (tokenPayload.role !== "admin") {
          return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
        }

        const body = await req.json();
        const [route] = await db
          .update(routes)
          .set(body)
          .where(eq(routes.id, routeId))
          .returning();

        if (!route) {
          return errorResponse("Ruta no encontrada", 404);
        }

        return jsonResponse(route);
      }

      // DELETE /api/routes/:id - Delete route (admin only)
      if (method === "DELETE") {
        if (tokenPayload.role !== "admin") {
          return errorResponse("Acceso denegado. Se requiere rol de administrador", 403);
        }

        const result = await db.delete(routes).where(eq(routes.id, routeId)).returning();

        if (result.length === 0) {
          return errorResponse("Ruta no encontrada", 404);
        }

        return jsonResponse({ message: "Ruta eliminada correctamente" });
      }
    }

    return errorResponse("Ruta no encontrada", 404);
  } catch (error) {
    console.error("Routes error:", error);
    return errorResponse("Error interno del servidor", 500);
  }
};

export const config: Config = {
  path: ["/api/routes", "/api/routes/*"],
};
