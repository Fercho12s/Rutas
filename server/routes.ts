import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  insertUserSchema,
  insertRouteSchema,
  insertUnitSchema,
  insertContactSchema,
  loginSchema,
  registerSchema,
} from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "rutas-seguras-secret-key";

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado" });
    }
    req.user = decoded as { id: string; email: string; role: string };
    next();
  });
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador" });
  }
  next();
}

function requireAdminOrDriver(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin" && req.user?.role !== "conductor") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // =============== AUTH ROUTES ===============

  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, password, name, phone, role } = validation.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "El email ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || "cliente",
        active: true,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      if (!user.active) {
        return res.status(401).json({ error: "Cuenta desactivada" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get me error:", error);
      res.status(500).json({ error: "Error al obtener usuario" });
    }
  });

  // =============== USERS ROUTES ===============

  // Get all users (admin only)
  app.get("/api/users", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });

  // Get drivers (for route assignment)
  app.get("/api/users/drivers", authenticateToken, async (req: Request, res: Response) => {
    try {
      const drivers = await storage.getDrivers();
      const driversWithoutPasswords = drivers.map(({ password: _, ...driver }) => driver);
      res.json(driversWithoutPasswords);
    } catch (error) {
      console.error("Get drivers error:", error);
      res.status(500).json({ error: "Error al obtener conductores" });
    }
  });

  // Create user (admin only)
  app.post("/api/users", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, password, ...rest } = validation.data;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "El email ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        ...rest,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Error al crear usuario" });
    }
  });

  // Update user (admin only)
  app.patch("/api/users/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/users/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  });

  // =============== ROUTES (RUTAS) ===============

  // Get all routes
  app.get("/api/routes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const routes = await storage.getAllRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Get routes error:", error);
      res.status(500).json({ error: "Error al obtener rutas" });
    }
  });

  // Get single route
  app.get("/api/routes/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const route = await storage.getRoute(req.params.id);
      if (!route) {
        return res.status(404).json({ error: "Ruta no encontrada" });
      }
      res.json(route);
    } catch (error) {
      console.error("Get route error:", error);
      res.status(500).json({ error: "Error al obtener ruta" });
    }
  });

  // Create route (admin only)
  app.post("/api/routes", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validation = insertRouteSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const route = await storage.createRoute(validation.data);
      res.status(201).json(route);
    } catch (error) {
      console.error("Create route error:", error);
      res.status(500).json({ error: "Error al crear ruta" });
    }
  });

  // Update route (admin only)
  app.patch("/api/routes/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const route = await storage.updateRoute(req.params.id, req.body);
      if (!route) {
        return res.status(404).json({ error: "Ruta no encontrada" });
      }
      res.json(route);
    } catch (error) {
      console.error("Update route error:", error);
      res.status(500).json({ error: "Error al actualizar ruta" });
    }
  });

  // Delete route (admin only)
  app.delete("/api/routes/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteRoute(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Ruta no encontrada" });
      }
      res.json({ message: "Ruta eliminada correctamente" });
    } catch (error) {
      console.error("Delete route error:", error);
      res.status(500).json({ error: "Error al eliminar ruta" });
    }
  });

  // =============== UNITS (FLOTA) ===============

  // Get all units
  app.get("/api/units", authenticateToken, async (req: Request, res: Response) => {
    try {
      const units = await storage.getAllUnits();
      res.json(units);
    } catch (error) {
      console.error("Get units error:", error);
      res.status(500).json({ error: "Error al obtener unidades" });
    }
  });

  // Get single unit
  app.get("/api/units/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ error: "Unidad no encontrada" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Get unit error:", error);
      res.status(500).json({ error: "Error al obtener unidad" });
    }
  });

  // Create unit (admin only)
  app.post("/api/units", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validation = insertUnitSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const unit = await storage.createUnit(validation.data);
      res.status(201).json(unit);
    } catch (error) {
      console.error("Create unit error:", error);
      res.status(500).json({ error: "Error al crear unidad" });
    }
  });

  // Update unit (admin only)
  app.patch("/api/units/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const unit = await storage.updateUnit(req.params.id, req.body);
      if (!unit) {
        return res.status(404).json({ error: "Unidad no encontrada" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Update unit error:", error);
      res.status(500).json({ error: "Error al actualizar unidad" });
    }
  });

  // Delete unit (admin only)
  app.delete("/api/units/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteUnit(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Unidad no encontrada" });
      }
      res.json({ message: "Unidad eliminada correctamente" });
    } catch (error) {
      console.error("Delete unit error:", error);
      res.status(500).json({ error: "Error al eliminar unidad" });
    }
  });

  // =============== CONTACTS ===============

  // Create contact (public - no auth)
  app.post("/api/contacts", async (req: Request, res: Response) => {
    try {
      const validation = insertContactSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const contact = await storage.createContact(validation.data);
      res.status(201).json({ message: "Mensaje enviado correctamente", contact });
    } catch (error) {
      console.error("Create contact error:", error);
      res.status(500).json({ error: "Error al enviar mensaje" });
    }
  });

  // Get all contacts (admin only)
  app.get("/api/contacts", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ error: "Error al obtener contactos" });
    }
  });

  // =============== STATS ===============

  // Get dashboard stats
  app.get("/api/stats", authenticateToken, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  return httpServer;
}
