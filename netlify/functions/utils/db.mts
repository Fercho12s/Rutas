import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Schema definitions (duplicated to avoid import issues with shared folder)
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

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Database connection
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const DATABASE_URL = Netlify.env.get("DATABASE_URL");

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
    });
  }

  if (!db) {
    db = drizzle(pool, { schema: { users, routes, units, contacts } });
  }

  return db;
}

// Type exports
export type User = typeof users.$inferSelect;
export type Route = typeof routes.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
