import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { getDb } from "../db/index.js";
import { encrypt } from "../lib/crypto.js";
import { createContainer, stopContainer, removeContainer } from "../services/docker.js";

const router = Router();
router.use(requireAuth);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "dev-key-32-chars-change-this!!!";
const BASE_PORT = 10000;

const createSchema = z.object({
  name: z.string().min(1).max(100),
  packId: z.number().int().positive(),
  apiKey: z.string().min(1),
});

router.get("/", (req: AuthRequest, res) => {
  const db = getDb();
  const instances = db.prepare(
    "SELECT id, name, pack_id, status, port, created_at FROM instances WHERE user_id = ?"
  ).all(req.userId);
  res.json(instances);
});

router.post("/", async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, packId, apiKey } = parsed.data;
  const db = getDb();

  const pack = db.prepare("SELECT * FROM packs WHERE id = ?").get(packId) as any;
  if (!pack) return res.status(404).json({ error: "Pack not found" });

  const encryptedKey = encrypt(apiKey, ENCRYPTION_KEY);
  const config = JSON.parse(pack.config_template);
  config.providers.default.api_key_encrypted = encryptedKey;

  const usedPorts = db.prepare("SELECT port FROM instances WHERE status != 'error'").all().map((r: any) => r.port);
  let port: number;
  do {
    port = BASE_PORT + Math.floor(Math.random() * 5000);
  } while (usedPorts.includes(port));
  const result = db.prepare(
    "INSERT INTO instances (user_id, name, pack_id, status, port, config_json) VALUES (?, ?, ?, 'creating', ?, ?)"
  ).run(req.userId, name, packId, port, JSON.stringify(config));

  const instanceId = result.lastInsertRowid as number;

  try {
    const containerId = await createContainer({ instanceId, config: JSON.stringify(config), port });
    db.prepare("UPDATE instances SET status = 'running', container_id = ? WHERE id = ?").run(containerId, instanceId);
    db.prepare("INSERT INTO usage_logs (instance_id, event_type) VALUES (?, 'created')").run(instanceId);
    res.status(201).json({ id: instanceId, name, status: "running", port });
  } catch (err: any) {
    db.prepare("UPDATE instances SET status = 'error' WHERE id = ?").run(instanceId);
    res.status(500).json({ error: "Failed to create container", details: err.message });
  }
});

router.post("/:id/stop", async (req: AuthRequest, res) => {
  const db = getDb();
  const instance = db.prepare("SELECT * FROM instances WHERE id = ? AND user_id = ?").get(req.params.id, req.userId) as any;
  if (!instance) return res.status(404).json({ error: "Instance not found" });
  if (!instance.container_id) return res.status(400).json({ error: "No container" });

  try {
    await stopContainer(instance.container_id);
    db.prepare("UPDATE instances SET status = 'stopped' WHERE id = ?").run(instance.id);
    db.prepare("INSERT INTO usage_logs (instance_id, event_type) VALUES (?, 'stopped')").run(instance.id);
    res.json({ status: "stopped" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to stop container", details: err.message });
  }
});

router.post("/:id/start", async (req: AuthRequest, res) => {
  const db = getDb();
  const instance = db.prepare("SELECT * FROM instances WHERE id = ? AND user_id = ?").get(req.params.id, req.userId) as any;
  if (!instance) return res.status(404).json({ error: "Instance not found" });

  try {
    const containerId = await createContainer({
      instanceId: instance.id,
      config: instance.config_json,
      port: instance.port,
    });
    db.prepare("UPDATE instances SET status = 'running', container_id = ? WHERE id = ?").run(containerId, instance.id);
    db.prepare("INSERT INTO usage_logs (instance_id, event_type) VALUES (?, 'started')").run(instance.id);
    res.json({ status: "running" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const db = getDb();
  const instance = db.prepare("SELECT * FROM instances WHERE id = ? AND user_id = ?").get(req.params.id, req.userId) as any;
  if (!instance) return res.status(404).json({ error: "Instance not found" });

  if (instance.container_id) {
    try { await removeContainer(instance.container_id); } catch { /* ok */ }
  }
  db.prepare("DELETE FROM usage_logs WHERE instance_id = ?").run(instance.id);
  db.prepare("DELETE FROM instances WHERE id = ?").run(instance.id);
  res.status(204).end();
});

export { router as instancesRouter };
