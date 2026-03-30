import type { Context, Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb, users } from "./utils/db.mts";
import {
  signToken,
  authenticateRequest,
  jsonResponse,
  errorResponse,
} from "./utils/auth.mts";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/auth", "");
  const method = req.method;

  try {
    // POST /api/auth/register
    if (method === "POST" && path === "/register") {
      const body = await req.json();
      const { email, password, name, phone, role } = body;

      if (!email || !password || !name) {
        return errorResponse("Email, password y nombre son requeridos");
      }

      if (password.length < 6) {
        return errorResponse("La contraseña debe tener al menos 6 caracteres");
      }

      const db = getDb();

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        return errorResponse("El email ya está registrado");
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          role: role || "cliente",
          active: true,
        })
        .returning();

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      const { password: _, ...userWithoutPassword } = user;

      return jsonResponse({ user: userWithoutPassword, token }, 201);
    }

    // POST /api/auth/login
    if (method === "POST" && path === "/login") {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return errorResponse("Email y password son requeridos");
      }

      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        return errorResponse("Credenciales inválidas", 401);
      }

      if (!user.active) {
        return errorResponse("Cuenta desactivada", 401);
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return errorResponse("Credenciales inválidas", 401);
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      const { password: _, ...userWithoutPassword } = user;

      return jsonResponse({ user: userWithoutPassword, token });
    }

    // GET /api/auth/me
    if (method === "GET" && path === "/me") {
      const tokenPayload = authenticateRequest(req);
      if (!tokenPayload) {
        return errorResponse("Token de acceso requerido", 401);
      }

      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.id, tokenPayload.id));

      if (!user) {
        return errorResponse("Usuario no encontrado", 404);
      }

      const { password: _, ...userWithoutPassword } = user;
      return jsonResponse(userWithoutPassword);
    }

    return errorResponse("Ruta no encontrada", 404);
  } catch (error) {
    console.error("Auth error:", error);
    return errorResponse("Error interno del servidor", 500);
  }
};

export const config: Config = {
  path: ["/api/auth/register", "/api/auth/login", "/api/auth/me"],
};
