import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { getDb } from "../db/index.js";
import { getContainerLogs } from "../services/docker.js";

const router = Router();
router.use(requireAuth);

router.get("/:instanceId", async (req: AuthRequest, res) => {
  const db = getDb();
  const instance = db.prepare(
    "SELECT * FROM instances WHERE id = ? AND user_id = ?"
  ).get(req.params.instanceId, req.userId) as any;

  if (!instance) return res.status(404).json({ error: "Instance not found" });
  if (!instance.container_id) return res.status(400).json({ error: "No container" });

  const tail = parseInt(req.query.tail as string) || 100;
  const logs = await getContainerLogs(instance.container_id, tail);
  res.json({ logs: logs.split("\n") });
});

export { router as logsRouter };
