import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initDb } from "./db/index.js";

const app = express();
const PORT = parseInt(process.env.PORT || "4000");

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes will be added in subsequent tasks
// app.use("/api/auth", authRouter);
// app.use("/api/instances", instancesRouter);
// app.use("/api/packs", packsRouter);
// app.use("/api/logs", logsRouter);

initDb();

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export { app };
