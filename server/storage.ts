import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Route,
  type InsertRoute,
  type Unit,
  type InsertUnit,
  type Contact,
  type InsertContact,
  users,
  routes,
  units,
  contacts,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getDrivers(): Promise<User[]>;

  // Routes
  getRoute(id: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: string, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: string): Promise<boolean>;
  getAllRoutes(): Promise<Route[]>;

  // Units
  getUnit(id: string): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit | undefined>;
  deleteUnit(id: string): Promise<boolean>;
  getAllUnits(): Promise<Unit[]>;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;

  // Stats
  getStats(): Promise<{ users: number; routes: number; units: number; contacts: number }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getDrivers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "conductor"));
  }

  // Routes
  async getRoute(id: string): Promise<Route | undefined> {
    const result = await db.select().from(routes).where(eq(routes.id, id));
    return result[0];
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const result = await db.insert(routes).values(route).returning();
    return result[0];
  }

  async updateRoute(id: string, routeData: Partial<InsertRoute>): Promise<Route | undefined> {
    const result = await db.update(routes).set(routeData).where(eq(routes.id, id)).returning();
    return result[0];
  }

  async deleteRoute(id: string): Promise<boolean> {
    const result = await db.delete(routes).where(eq(routes.id, id)).returning();
    return result.length > 0;
  }

  async getAllRoutes(): Promise<Route[]> {
    return db.select().from(routes);
  }

  // Units
  async getUnit(id: string): Promise<Unit | undefined> {
    const result = await db.select().from(units).where(eq(units.id, id));
    return result[0];
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const result = await db.insert(units).values(unit).returning();
    return result[0];
  }

  async updateUnit(id: string, unitData: Partial<InsertUnit>): Promise<Unit | undefined> {
    const result = await db.update(units).set(unitData).where(eq(units.id, id)).returning();
    return result[0];
  }

  async deleteUnit(id: string): Promise<boolean> {
    const result = await db.delete(units).where(eq(units.id, id)).returning();
    return result.length > 0;
  }

  async getAllUnits(): Promise<Unit[]> {
    return db.select().from(units);
  }

  // Contacts
  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }

  async getAllContacts(): Promise<Contact[]> {
    return db.select().from(contacts);
  }

  // Stats
  async getStats(): Promise<{ users: number; routes: number; units: number; contacts: number }> {
    const [userCount, routeCount, unitCount, contactCount] = await Promise.all([
      db.select().from(users),
      db.select().from(routes),
      db.select().from(units),
      db.select().from(contacts),
    ]);
    return {
      users: userCount.length,
      routes: routeCount.length,
      units: unitCount.length,
      contacts: contactCount.length,
    };
  }
}

export const storage = new DatabaseStorage();
