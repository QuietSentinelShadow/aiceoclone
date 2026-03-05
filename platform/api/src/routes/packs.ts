import { Router } from "express";
import { getDb } from "../db/index.js";

const router = Router();

router.get("/", (_req, res) => {
  const db = getDb();
  const packs = db.prepare("SELECT id, name, description, category, icon FROM packs").all();
  res.json(packs);
});

router.get("/:id", (req, res) => {
  const db = getDb();
  const pack = db.prepare("SELECT * FROM packs WHERE id = ?").get(req.params.id);
  if (!pack) return res.status(404).json({ error: "Pack not found" });
  res.json(pack);
});

export { router as packsRouter };
