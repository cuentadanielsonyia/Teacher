import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Coste cero y sin registros: SQLite local en dev, /tmp (escribible) en Vercel serverless.
// Limitación conocida: /tmp es efímero por instancia; la persistencia real multi-instancia
// llegará con Turso/Neon free cuando se acepten sus términos (1 clic en dashboard).
function dbPath(): string {
  if (process.env.VERCEL) return "/tmp/teacher.db";
  return "data/teacher.db";
}

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof drizzle> };

function createDb() {
  const p = dbPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const sqlite = new Database(p);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY, level TEXT NOT NULL DEFAULT 'B1', streak INTEGER NOT NULL DEFAULT 0, last_study TEXT);
    CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, skill TEXT NOT NULL, category TEXT NOT NULL, prompt TEXT NOT NULL, answer TEXT NOT NULL, correct INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS vocab (word TEXT PRIMARY KEY, seen INTEGER NOT NULL DEFAULT 1, mastered INTEGER NOT NULL DEFAULT 0, next_review TEXT);
    CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, started TEXT NOT NULL, duration_sec INTEGER NOT NULL DEFAULT 0);
  `);
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
else globalForDb.db = db;
