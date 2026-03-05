import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(process.env.DB_PATH || "data/platform.db");
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function initDb(): void {
  const d = getDb();
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  d.exec(schema);
}
