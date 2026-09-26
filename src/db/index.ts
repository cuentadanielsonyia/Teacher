import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
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
  const db = drizzle(sqlite, { schema });
  const tables = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='attempts'")
    .get();
  if (!tables) {
    migrate(db, { migrationsFolder: "./drizzle" });
  }
  return db;
}

export const db = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
else globalForDb.db = db;
