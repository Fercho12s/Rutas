import type { Context, Config } from "@netlify/functions";
import { getDb, users, routes, units, contacts } from "./utils/db.mts";
import {
  authenticateRequest,
  jsonResponse,
  errorResponse,
} from "./utils/auth.mts";

export default async (req: Request, context: Context) => {
  const method = req.method;

  // Stats require authentication
  const tokenPayload = authenticateRequest(req);
  if (!tokenPayload) {
    return errorResponse("Token de acceso requerido", 401);
  }

  if (method !== "GET") {
    return errorResponse("Método no permitido", 405);
  }

  try {
    const db = getDb();

    const [userList, routeList, unitList, contactList] = await Promise.all([
      db.select().from(users),
      db.select().from(routes),
      db.select().from(units),
      db.select().from(contacts),
    ]);

    return jsonResponse({
      users: userList.length,
      routes: routeList.length,
      units: unitList.length,
      contacts: contactList.length,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return errorResponse("Error interno del servidor", 500);
  }
};

export const config: Config = {
  path: "/api/stats",
};
