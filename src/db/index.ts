import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof drizzle> };

function createDb() {
  const sqlite = new Database("data/teacher.db");
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
