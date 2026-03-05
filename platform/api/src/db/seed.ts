import { getDb, initDb } from "./index.js";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsDir = join(__dirname, "../../../packs");

initDb();
const db = getDb();

const files = readdirSync(packsDir).filter(f => f.endsWith(".json"));
const insert = db.prepare(
  "INSERT OR REPLACE INTO packs (name, description, category, config_template, icon) VALUES (?, ?, ?, ?, ?)"
);

for (const file of files) {
  const pack = JSON.parse(readFileSync(join(packsDir, file), "utf-8"));
  insert.run(pack.name, pack.description, pack.category, JSON.stringify(pack.config), pack.icon);
  console.log(`Seeded pack: ${pack.name}`);
}
