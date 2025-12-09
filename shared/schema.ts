import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with roles (admin, conductor, cliente)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("cliente"),
  phone: text("phone"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Routes table for transportation routes
export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  stops: jsonb("stops").$type<string[]>().default([]),
  schedule: jsonb("schedule").$type<{ day: string; time: string }[]>().default([]),
  distanceKm: integer("distance_km").notNull(),
  duration: text("duration"),
  status: text("status").notNull().default("activo"),
  assignedUnitId: varchar("assigned_unit_id"),
  assignedDriverId: varchar("assigned_driver_id"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Units (vehicles) table for fleet management
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plate: text("plate").notNull().unique(),
  model: text("model").notNull(),
  brand: text("brand").notNull(),
  capacity: integer("capacity").notNull(),
  year: integer("year").notNull(),
  status: text("status").notNull().default("disponible"),
  imageUrl: text("image_url"),
  currentRouteId: varchar("current_route_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact messages from landing page
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedRoutes: many(routes),
}));

export const routesRelations = relations(routes, ({ one }) => ({
  assignedUnit: one(units, {
    fields: [routes.assignedUnitId],
    references: [units.id],
  }),
  assignedDriver: one(users, {
    fields: [routes.assignedDriverId],
    references: [users.id],
  }),
}));

export const unitsRelations = relations(units, ({ one }) => ({
  currentRoute: one(routes, {
    fields: [units.currentRouteId],
    references: [routes.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register schema with validation
export const registerSchema = insertUserSchema.extend({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
