# Docker + SaaS Platform + Security Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working Docker content creation pipeline, a multi-instance SaaS platform MVP with React dashboard, and comprehensive security hardening — all documented as new pages on the existing aiceoclone site.

**Architecture:** Monorepo extension. `docker/` for content pipeline containers, `platform/` for SaaS MVP (Express API + React dashboard + Traefik), three new HTML pages (`/docker/`, `/saas/`, `/security/`). Everything runs locally via `docker compose up`.

**Tech Stack:** Docker Compose, NullClaw (ghcr.io), Node.js 24, Express, React 18, Vite, Tailwind CSS, SQLite (better-sqlite3), dockerode, JWT, bcrypt, zod, Traefik v3.

**Design doc:** `docs/plans/2026-03-05-docker-saas-security-design.md`

---

## Phase 1: Docker Content Creation Pipeline (Tasks 1-6)

### Task 1: NullClaw Dockerfile and Config

**Files:**
- Create: `docker/Dockerfile.nullclaw`
- Create: `docker/configs/content-creator.json`
- Create: `docker/.env.example`
- Modify: `.gitignore` (add `docker/.env`)

**Step 1: Create Dockerfile.nullclaw**

```dockerfile
FROM ghcr.io/homebrew/core/nullclaw:2026.3.3 AS nullclaw-bin

FROM alpine:3.21
RUN addgroup -g 1000 nullclaw && adduser -u 1000 -G nullclaw -D nullclaw
RUN mkdir -p /home/nullclaw/.nullclaw /output /tmp/nullclaw \
    && chown -R nullclaw:nullclaw /home/nullclaw /output /tmp/nullclaw
COPY --from=nullclaw-bin /usr/bin/nullclaw /usr/bin/nullclaw
COPY configs/content-creator.json /home/nullclaw/.nullclaw/config.json
USER nullclaw
WORKDIR /home/nullclaw
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/health || exit 1
CMD ["nullclaw", "--gateway"]
```

**Step 2: Create content-creator.json**

```json
{
  "providers": {
    "default": {
      "name": "openrouter",
      "api_key_env": "OPENROUTER_API_KEY",
      "model": "google/gemini-2.5-flash"
    }
  },
  "channels": {},
  "memory": {
    "backend": "sqlite",
    "path": "/home/nullclaw/.nullclaw/memory.db",
    "search": "hybrid"
  },
  "autonomy": {
    "level": "full",
    "confirm_dangerous": true
  },
  "sandbox": {
    "backend": "auto",
    "workspace": "/output",
    "allowed_commands": ["echo", "cat", "ls", "mkdir", "cp"]
  },
  "gateway": {
    "bind": "0.0.0.0:3000",
    "pairing": false
  },
  "resources": {
    "max_memory_mb": 256,
    "max_disk_mb": 512
  }
}
```

**Step 3: Create .env.example**

```env
# AI Provider API Key (required)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional: Use a different provider
# ANTHROPIC_API_KEY=sk-ant-your-key-here
# OPENAI_API_KEY=sk-your-key-here
```

**Step 4: Update .gitignore**

Append: `docker/.env`

**Step 5: Commit**

```bash
git add docker/Dockerfile.nullclaw docker/configs/content-creator.json docker/.env.example .gitignore
git commit -m "feat(docker): add NullClaw container with content-creator config"
```

---

### Task 2: Content Pipeline Dockerfile

**Files:**
- Create: `docker/Dockerfile.content-pipeline`

**Step 1: Create Dockerfile.content-pipeline**

```dockerfile
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv ffmpeg chromium curl \
    && python3 -m venv /opt/tts-venv \
    && /opt/tts-venv/bin/pip install edge-tts \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PATH="/opt/tts-venv/bin:$PATH"

RUN groupadd -g 1000 pipeline && useradd -u 1000 -g pipeline -m pipeline
RUN mkdir -p /app /output /tmp/pipeline \
    && chown -R pipeline:pipeline /app /output /tmp/pipeline

WORKDIR /app
COPY --chown=pipeline:pipeline package.json package-lock.json ./
RUN npm ci --production
COPY --chown=pipeline:pipeline . .

USER pipeline
VOLUME ["/output"]
CMD ["node", "scripts/render-all.mjs"]
```

**Step 2: Commit**

```bash
git add docker/Dockerfile.content-pipeline
git commit -m "feat(docker): add content pipeline container with Remotion + edge-tts"
```

---

### Task 3: Docker Compose Orchestration

**Files:**
- Create: `docker/docker-compose.yml`

**Step 1: Create docker-compose.yml**

```yaml
version: "3.9"

services:
  nullclaw:
    build:
      context: .
      dockerfile: Dockerfile.nullclaw
    container_name: nullclaw-content
    env_file: .env
    ports:
      - "3000:3000"
    volumes:
      - nullclaw-data:/home/nullclaw/.nullclaw
      - shared-output:/output
    networks:
      - content-net
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.5"
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp/nullclaw:size=64M
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  pipeline:
    build:
      context: ..
      dockerfile: docker/Dockerfile.content-pipeline
    container_name: content-pipeline
    volumes:
      - shared-output:/output
    networks:
      - content-net
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "2.0"
    security_opt:
      - no-new-privileges:true
    depends_on:
      nullclaw:
        condition: service_healthy
    profiles:
      - render

volumes:
  nullclaw-data:
  shared-output:

networks:
  content-net:
    driver: bridge
    internal: false
```

**Step 2: Commit**

```bash
git add docker/docker-compose.yml
git commit -m "feat(docker): add compose orchestration for NullClaw + pipeline"
```

---

### Task 4: Content Generation Script

**Files:**
- Create: `docker/scripts/generate-content.sh`
- Create: `docker/configs/blog-prompt.md`
- Create: `docker/configs/video-script-prompt.md`

**Step 1: Create generate-content.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

NULLCLAW_URL="${NULLCLAW_URL:-http://localhost:3000}"
OUTPUT_DIR="${OUTPUT_DIR:-./output}"

mkdir -p "$OUTPUT_DIR"/{blog,scripts,audio,video}

echo "=== NullClaw Content Generator ==="
echo "Gateway: $NULLCLAW_URL"

# Wait for NullClaw to be ready
echo "[1/4] Waiting for NullClaw gateway..."
for i in $(seq 1 30); do
  if curl -sf "$NULLCLAW_URL/health" > /dev/null 2>&1; then
    echo "  Gateway ready."
    break
  fi
  [ "$i" -eq 30 ] && { echo "  ERROR: Gateway not ready after 30s"; exit 1; }
  sleep 1
done

# Generate blog content
echo "[2/4] Generating blog content..."
BLOG_PROMPT=$(cat configs/blog-prompt.md)
curl -sf -X POST "$NULLCLAW_URL/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg prompt "$BLOG_PROMPT" '{
    messages: [{role: "user", content: $prompt}],
    max_tokens: 4096
  }')" \
  | jq -r '.choices[0].message.content' > "$OUTPUT_DIR/blog/generated-article.md"
echo "  Blog saved to $OUTPUT_DIR/blog/generated-article.md"

# Generate video script
echo "[3/4] Generating video script..."
SCRIPT_PROMPT=$(cat configs/video-script-prompt.md)
curl -sf -X POST "$NULLCLAW_URL/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg prompt "$SCRIPT_PROMPT" '{
    messages: [{role: "user", content: $prompt}],
    max_tokens: 4096
  }')" \
  | jq -r '.choices[0].message.content' > "$OUTPUT_DIR/scripts/narration.json"
echo "  Script saved to $OUTPUT_DIR/scripts/narration.json"

echo "[4/4] Content generation complete!"
echo "  To render videos, run: docker compose --profile render up pipeline"
```

**Step 2: Create blog-prompt.md**

```markdown
Write a technical blog post about deploying NullClaw in Docker for automated content creation.

Cover:
1. Why containerize NullClaw (reproducibility, isolation, portability)
2. The two-container architecture (NullClaw gateway + content pipeline)
3. Security benefits of running in Docker vs bare metal
4. Step-by-step setup instructions
5. Practical use cases (blog generation, video scripts, TTS audio)

Format: Markdown with code blocks. Technical but accessible. ~1500 words.
```

**Step 3: Create video-script-prompt.md**

```markdown
Write a narration script for a 2-minute explainer video about NullClaw Docker deployment.

Format the output as JSON with this structure:
{
  "segments": [
    {"id": "seg-01", "text": "narration text here", "duration_hint": "10s"}
  ]
}

Cover: What is NullClaw, why Docker, the two-container setup, security, getting started.
Tone: Professional but approachable. Like a tech tutorial.
Target: 8-10 segments, each 10-20 seconds of speech.
```

**Step 4: Make script executable and commit**

```bash
chmod +x docker/scripts/generate-content.sh
git add docker/scripts/ docker/configs/blog-prompt.md docker/configs/video-script-prompt.md
git commit -m "feat(docker): add content generation script and prompts"
```

---

### Task 5: Test Docker Pipeline

**Step 1: Build containers**

Run: `cd docker && docker compose build`
Expected: Both images build successfully.

**Step 2: Start NullClaw gateway**

Run: `cd docker && cp .env.example .env && docker compose up nullclaw -d`
Expected: Container starts, health check passes after ~5s.

**Step 3: Test gateway health**

Run: `curl http://localhost:3000/health`
Expected: 200 OK response.

**Step 4: Stop and clean up**

Run: `docker compose down -v`

**Step 5: Commit any fixes**

```bash
git add -A docker/
git commit -m "fix(docker): adjustments from integration testing"
```

---

### Task 6: Docker Tutorial Page

**Files:**
- Create: `docker/index.html`

**Step 1: Create the tutorial page**

Build a full HTML page at `docker/index.html` with:
- Same dark theme as `index.html` (bg: #0a0a0f, Tailwind CDN, Inter + JetBrains Mono)
- Hero section: "Run NullClaw in Docker"
- Prerequisites section (Docker, API key)
- Architecture diagram (ASCII/CSS boxes showing NullClaw container <-> Pipeline container)
- Step-by-step setup guide with code blocks
- Configuration walkthrough (content-creator.json explained)
- Troubleshooting section
- Back link to main site

Use `@frontend-design:frontend-design` skill for this page.

**Step 2: Commit**

```bash
git add docker/index.html
git commit -m "feat(docker): add tutorial page for Docker content creation"
```

---

## Phase 2: Security Foundation (Tasks 7-9)

### Task 7: Security Configs and Profiles

**Files:**
- Create: `docker/security/seccomp-nullclaw.json`
- Create: `docker/security/apparmor-nullclaw.profile`

**Step 1: Create seccomp profile**

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64", "SCMP_ARCH_AARCH64"],
  "syscalls": [
    {
      "names": [
        "read", "write", "open", "close", "stat", "fstat", "lstat",
        "poll", "lseek", "mmap", "mprotect", "munmap", "brk",
        "ioctl", "access", "pipe", "select", "sched_yield",
        "dup", "dup2", "nanosleep", "getpid", "socket", "connect",
        "sendto", "recvfrom", "bind", "listen", "accept",
        "clone", "fork", "execve", "exit", "wait4", "kill",
        "fcntl", "flock", "fsync", "fdatasync", "getcwd",
        "readdir", "rename", "mkdir", "rmdir", "unlink",
        "sigaction", "sigreturn", "arch_prctl", "set_tid_address",
        "set_robust_list", "futex", "epoll_create", "epoll_ctl",
        "epoll_wait", "openat", "readlinkat", "newfstatat",
        "getrandom", "memfd_create", "eventfd2", "pipe2",
        "clock_gettime", "clock_nanosleep", "pread64", "pwrite64",
        "getdents64", "gettid", "tgkill", "rt_sigaction",
        "rt_sigprocmask", "rt_sigreturn", "exit_group",
        "epoll_create1", "accept4", "dup3", "prlimit64",
        "rseq", "clone3"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

**Step 2: Commit**

```bash
git add docker/security/
git commit -m "feat(security): add seccomp profile for NullClaw containers"
```

---

### Task 8: Encryption Utility for API Key Storage

**Files:**
- Create: `platform/api/src/lib/crypto.ts`
- Create: `platform/api/src/lib/crypto.test.ts`

**Step 1: Write the failing test**

```typescript
// platform/api/src/lib/crypto.test.ts
import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./crypto.js";

describe("crypto", () => {
  const key = "test-encryption-key-32-chars-ok!";

  it("encrypts and decrypts a string", () => {
    const plaintext = "sk-ant-api-key-12345";
    const encrypted = encrypt(plaintext, key);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toContain(":");
    const decrypted = decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext each time", () => {
    const plaintext = "same-input";
    const a = encrypt(plaintext, key);
    const b = encrypt(plaintext, key);
    expect(a).not.toBe(b);
  });

  it("throws on tampered ciphertext", () => {
    const encrypted = encrypt("test", key);
    const tampered = "AAAA" + encrypted.slice(4);
    expect(() => decrypt(tampered, key)).toThrow();
  });
});
```

**Step 2: Write implementation**

```typescript
// platform/api/src/lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function deriveKey(password: string): Buffer {
  return scryptSync(password, "nullclaw-saas-salt", 32);
}

export function encrypt(plaintext: string, password: string): string {
  const key = deriveKey(password);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), encrypted.toString("hex"), tag.toString("hex")].join(":");
}

export function decrypt(ciphertext: string, password: string): string {
  const key = deriveKey(password);
  const [ivHex, encHex, tagHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
```

**Step 3: Run tests**

Run: `cd platform/api && npx vitest run src/lib/crypto.test.ts`
Expected: 3 tests pass.

**Step 4: Commit**

```bash
git add platform/api/src/lib/crypto.ts platform/api/src/lib/crypto.test.ts
git commit -m "feat(security): add AES-256-GCM encryption for API key storage"
```

---

### Task 9: Security Guide Page

**Files:**
- Create: `security/index.html`

**Step 1: Create the security page**

Build `security/index.html` with same dark theme covering:
- Threat model overview (what attackers could target)
- Container security layer (non-root, read-only, capabilities, seccomp)
- Network security layer (isolation, Traefik, rate limiting)
- Application security layer (JWT, encryption, input validation)
- NullClaw-specific hardening (sandbox, allowlists, audit logging, pairing)
- Operational security (env files, image pinning, health checks)
- Checklist format for easy reference

Use `@frontend-design:frontend-design` skill for this page.

**Step 2: Commit**

```bash
git add security/index.html
git commit -m "feat(security): add security best practices guide page"
```

---

## Phase 3: SaaS Platform API (Tasks 10-17)

### Task 10: Platform API Scaffold

**Files:**
- Create: `platform/api/package.json`
- Create: `platform/api/tsconfig.json`
- Create: `platform/api/src/server.ts`

**Step 1: Create package.json**

```json
{
  "name": "aiceoclone-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "better-sqlite3": "^11.7.0",
    "cors": "^2.8.5",
    "dockerode": "^4.0.4",
    "express": "^5.1.0",
    "express-rate-limit": "^7.5.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/better-sqlite3": "^7.6.12",
    "@types/cors": "^2.8.17",
    "@types/dockerode": "^3.3.34",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create server.ts**

```typescript
// platform/api/src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth.js";
import { instancesRouter } from "./routes/instances.js";
import { packsRouter } from "./routes/packs.js";
import { logsRouter } from "./routes/logs.js";
import { initDb } from "./db/index.js";

const app = express();
const PORT = parseInt(process.env.PORT || "4000");

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/instances", instancesRouter);
app.use("/api/packs", packsRouter);
app.use("/api/logs", logsRouter);

initDb();

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export { app };
```

**Step 4: Install dependencies and commit**

```bash
cd platform/api && npm install
git add platform/api/package.json platform/api/package-lock.json platform/api/tsconfig.json platform/api/src/server.ts
git commit -m "feat(platform): scaffold Express API with security middleware"
```

---

### Task 11: Database Schema and Init

**Files:**
- Create: `platform/api/src/db/index.ts`
- Create: `platform/api/src/db/schema.sql`

**Step 1: Create schema.sql**

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS packs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  config_template TEXT NOT NULL,
  icon TEXT DEFAULT '📦'
);

CREATE TABLE IF NOT EXISTS instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  pack_id INTEGER REFERENCES packs(id),
  status TEXT DEFAULT 'stopped' CHECK(status IN ('running','stopped','error','creating')),
  container_id TEXT,
  port INTEGER,
  config_json TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instance_id INTEGER NOT NULL REFERENCES instances(id),
  event_type TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now')),
  metadata TEXT
);
```

**Step 2: Create db/index.ts**

```typescript
// platform/api/src/db/index.ts
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
```

**Step 3: Commit**

```bash
git add platform/api/src/db/
git commit -m "feat(platform): add SQLite schema and DB init"
```

---

### Task 12: Auth Routes (Register + Login)

**Files:**
- Create: `platform/api/src/routes/auth.ts`
- Create: `platform/api/src/middleware/auth.ts`
- Create: `platform/api/src/routes/auth.test.ts`

**Step 1: Write failing test**

```typescript
// platform/api/src/routes/auth.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../server.js";

describe("POST /api/auth/register", () => {
  it("creates a user and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "securepass123" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it("rejects duplicate emails", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "pass123" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "pass456" });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("returns a token for valid credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "login@example.com", password: "pass123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "pass123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "wrong" });
    expect(res.status).toBe(401);
  });
});
```

**Step 2: Implement auth routes**

```typescript
// platform/api/src/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { getDb } from "../db/index.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const hash = await bcrypt.hash(password, 12);

  try {
    const db = getDb();
    const result = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(email, hash);
    const token = jwt.sign({ userId: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: "24h" });
    res.status(201).json({ token, userId: result.lastInsertRowid });
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, userId: user.id });
});

export { router as authRouter };
```

**Step 3: Implement auth middleware**

```typescript
// platform/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export interface AuthRequest extends Request {
  userId?: number;
  email?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as any;
    req.userId = payload.userId;
    req.email = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

**Step 4: Run tests**

Run: `cd platform/api && npx vitest run src/routes/auth.test.ts`
Expected: All 4 tests pass.

**Step 5: Commit**

```bash
git add platform/api/src/routes/auth.ts platform/api/src/middleware/auth.ts platform/api/src/routes/auth.test.ts
git commit -m "feat(platform): add JWT auth routes with register/login"
```

---

### Task 13: Docker Service (dockerode)

**Files:**
- Create: `platform/api/src/services/docker.ts`

**Step 1: Implement Docker service**

```typescript
// platform/api/src/services/docker.ts
import Dockerode from "dockerode";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

export interface CreateInstanceOpts {
  instanceId: number;
  config: string;
  port: number;
  memoryMb?: number;
  cpus?: number;
}

export async function createContainer(opts: CreateInstanceOpts): Promise<string> {
  const container = await docker.createContainer({
    Image: "ghcr.io/homebrew/core/nullclaw:2026.3.3",
    name: `nullclaw-instance-${opts.instanceId}`,
    Cmd: ["nullclaw", "--gateway"],
    ExposedPorts: { "3000/tcp": {} },
    HostConfig: {
      PortBindings: { "3000/tcp": [{ HostPort: String(opts.port) }] },
      Memory: (opts.memoryMb || 256) * 1024 * 1024,
      NanoCpus: (opts.cpus || 0.5) * 1e9,
      ReadonlyRootfs: true,
      SecurityOpt: ["no-new-privileges:true"],
      CapDrop: ["ALL"],
      Tmpfs: { "/tmp": "size=64m" },
      Binds: [`nullclaw-data-${opts.instanceId}:/home/nullclaw/.nullclaw`],
    },
    Labels: {
      "traefik.enable": "true",
      [`traefik.http.routers.instance-${opts.instanceId}.rule`]: `Host(\`instance-${opts.instanceId}.localhost\`)`,
      [`traefik.http.services.instance-${opts.instanceId}.loadbalancer.server.port`]: "3000",
      "managed-by": "aiceoclone-platform",
    },
  });
  await container.start();
  return container.id;
}

export async function stopContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.stop();
}

export async function removeContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  try { await container.stop(); } catch { /* already stopped */ }
  await container.remove({ v: true });
}

export async function getContainerStatus(containerId: string): Promise<string> {
  const container = docker.getContainer(containerId);
  const info = await container.inspect();
  return info.State.Status;
}

export async function getContainerLogs(containerId: string, tail = 100): Promise<string> {
  const container = docker.getContainer(containerId);
  const logs = await container.logs({ stdout: true, stderr: true, tail, timestamps: true });
  return logs.toString();
}

export { docker };
```

**Step 2: Commit**

```bash
git add platform/api/src/services/docker.ts
git commit -m "feat(platform): add Docker service for container lifecycle management"
```

---

### Task 14: Instance Routes (CRUD)

**Files:**
- Create: `platform/api/src/routes/instances.ts`

**Step 1: Implement instance routes**

```typescript
// platform/api/src/routes/instances.ts
import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { getDb } from "../db/index.js";
import { encrypt } from "../lib/crypto.js";
import { createContainer, stopContainer, removeContainer, getContainerStatus } from "../services/docker.js";

const router = Router();
router.use(requireAuth);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "dev-key-32-chars-change-this!!!";
const BASE_PORT = 10000;

const createSchema = z.object({
  name: z.string().min(1).max(100),
  packId: z.number().int().positive(),
  apiKey: z.string().min(1),
});

// List instances for current user
router.get("/", (req: AuthRequest, res) => {
  const db = getDb();
  const instances = db.prepare(
    "SELECT id, name, pack_id, status, port, created_at FROM instances WHERE user_id = ?"
  ).all(req.userId);
  res.json(instances);
});

// Create instance
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

  const port = BASE_PORT + Math.floor(Math.random() * 5000);
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

// Stop instance
router.post("/:id/stop", async (req: AuthRequest, res) => {
  const db = getDb();
  const instance = db.prepare("SELECT * FROM instances WHERE id = ? AND user_id = ?").get(req.params.id, req.userId) as any;
  if (!instance) return res.status(404).json({ error: "Instance not found" });
  if (!instance.container_id) return res.status(400).json({ error: "No container" });

  await stopContainer(instance.container_id);
  db.prepare("UPDATE instances SET status = 'stopped' WHERE id = ?").run(instance.id);
  db.prepare("INSERT INTO usage_logs (instance_id, event_type) VALUES (?, 'stopped')").run(instance.id);
  res.json({ status: "stopped" });
});

// Start instance
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

// Delete instance
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
```

**Step 2: Commit**

```bash
git add platform/api/src/routes/instances.ts
git commit -m "feat(platform): add instance CRUD routes with Docker lifecycle"
```

---

### Task 15: Packs Routes + Seed Data

**Files:**
- Create: `platform/api/src/routes/packs.ts`
- Create: `platform/packs/content-creator.json`
- Create: `platform/packs/dev-team.json`
- Create: `platform/packs/research-analyst.json`
- Create: `platform/packs/ceo-clone.json`
- Create: `platform/api/src/db/seed.ts`

**Step 1: Implement packs route**

```typescript
// platform/api/src/routes/packs.ts
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
```

**Step 2: Create pack JSON configs** (one example shown, repeat pattern for others)

Create `platform/packs/content-creator.json`:
```json
{
  "name": "Content Creator",
  "description": "Generate blog posts, video scripts, and social media content",
  "category": "content",
  "icon": "✍️",
  "config": {
    "providers": {
      "default": { "name": "openrouter", "api_key_env": "API_KEY", "model": "google/gemini-2.5-flash" }
    },
    "autonomy": { "level": "supervised" },
    "sandbox": { "allowed_commands": ["echo", "cat", "ls", "mkdir"] }
  }
}
```

Create similar for `dev-team.json` (category: "development"), `research-analyst.json` (category: "research"), `ceo-clone.json` (category: "executive").

**Step 3: Create seed script**

```typescript
// platform/api/src/db/seed.ts
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
```

**Step 4: Commit**

```bash
git add platform/api/src/routes/packs.ts platform/api/src/db/seed.ts platform/packs/
git commit -m "feat(platform): add packs routes with seed data for 4 office packs"
```

---

### Task 16: Logs Route (Container Log Streaming)

**Files:**
- Create: `platform/api/src/routes/logs.ts`

**Step 1: Implement logs route**

```typescript
// platform/api/src/routes/logs.ts
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
```

**Step 2: Commit**

```bash
git add platform/api/src/routes/logs.ts
git commit -m "feat(platform): add container log streaming route"
```

---

### Task 17: API Dockerfile + Platform Compose

**Files:**
- Create: `platform/api/Dockerfile`
- Create: `platform/docker-compose.yml`
- Create: `platform/.env.example`

**Step 1: Create API Dockerfile**

```dockerfile
FROM node:22-slim
RUN groupadd -g 1000 api && useradd -u 1000 -g api -m api
WORKDIR /app
COPY --chown=api:api package.json package-lock.json ./
RUN npm ci --production
COPY --chown=api:api . .
RUN mkdir -p data && chown api:api data
USER api
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1
CMD ["node", "--loader", "tsx", "src/server.ts"]
```

**Step 2: Create platform docker-compose.yml**

```yaml
version: "3.9"

services:
  traefik:
    image: traefik:v3.3
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--api.insecure=true"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - platform-net

  api:
    build:
      context: api
    container_name: aiceoclone-api
    env_file: .env
    environment:
      - PORT=4000
      - DB_PATH=/app/data/platform.db
    ports:
      - "4000:4000"
    volumes:
      - api-data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - platform-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.localhost`)"
      - "traefik.http.services.api.loadbalancer.server.port=4000"
    depends_on:
      - traefik
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"

  dashboard:
    build:
      context: dashboard
    container_name: aiceoclone-dashboard
    ports:
      - "5173:80"
    networks:
      - platform-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`dashboard.localhost`)"
      - "traefik.http.services.dashboard.loadbalancer.server.port=80"
    depends_on:
      - api

volumes:
  api-data:

networks:
  platform-net:
    driver: bridge
```

**Step 3: Create .env.example**

```env
JWT_SECRET=change-this-to-a-random-64-char-string
ENCRYPTION_KEY=change-this-to-a-32-char-string!
CORS_ORIGIN=http://localhost:5173
```

**Step 4: Commit**

```bash
git add platform/api/Dockerfile platform/docker-compose.yml platform/.env.example
git commit -m "feat(platform): add API Dockerfile and platform compose with Traefik"
```

---

## Phase 4: Dashboard (Tasks 18-23)

### Task 18: Dashboard Scaffold (Vite + React + Tailwind)

**Files:**
- Create: `platform/dashboard/` (via Vite scaffold)

**Step 1: Scaffold with Vite**

```bash
cd platform && npm create vite@latest dashboard -- --template react-ts
cd dashboard && npm install
npm install react-router-dom@7 tailwindcss @tailwindcss/vite
```

**Step 2: Configure Tailwind via Vite plugin**

Update `vite.config.ts` to add Tailwind plugin and API proxy:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
```

**Step 3: Add Tailwind import to main CSS**

In `src/index.css`:
```css
@import "tailwindcss";
```

**Step 4: Commit**

```bash
git add platform/dashboard/
git commit -m "feat(dashboard): scaffold React + Vite + Tailwind app"
```

---

### Task 19: Auth Context + Login Page

**Files:**
- Create: `platform/dashboard/src/lib/api.ts`
- Create: `platform/dashboard/src/context/AuthContext.tsx`
- Create: `platform/dashboard/src/pages/Login.tsx`

**Step 1: Create API client**

```typescript
// platform/dashboard/src/lib/api.ts
const BASE = "/api";

async function request(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (email: string, password: string) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getInstances: () => request("/instances"),
  createInstance: (data: { name: string; packId: number; apiKey: string }) =>
    request("/instances", { method: "POST", body: JSON.stringify(data) }),
  stopInstance: (id: number) => request(`/instances/${id}/stop`, { method: "POST" }),
  startInstance: (id: number) => request(`/instances/${id}/start`, { method: "POST" }),
  deleteInstance: (id: number) => request(`/instances/${id}`, { method: "DELETE" }),
  getPacks: () => request("/packs"),
  getLogs: (instanceId: number, tail = 100) => request(`/logs/${instanceId}?tail=${tail}`),
};
```

**Step 2: Create AuthContext and Login page**

Implement standard React auth context with JWT stored in localStorage, login/register forms with the same dark theme (bg-[#0a0a0f], cyan/purple accents).

**Step 3: Commit**

```bash
git add platform/dashboard/src/
git commit -m "feat(dashboard): add auth context, API client, and login page"
```

---

### Task 20: Dashboard Page (Instance List)

**Files:**
- Create: `platform/dashboard/src/pages/Dashboard.tsx`
- Create: `platform/dashboard/src/components/InstanceCard.tsx`

**Step 1: Implement Dashboard page**

Shows a grid of InstanceCards with status indicator (green=running, gray=stopped, red=error), name, pack name, port, start/stop/delete buttons.

Use `@frontend-design:frontend-design` skill for the dashboard UI — same dark theme as main site.

**Step 2: Commit**

```bash
git add platform/dashboard/src/pages/Dashboard.tsx platform/dashboard/src/components/InstanceCard.tsx
git commit -m "feat(dashboard): add instance list dashboard page"
```

---

### Task 21: New Instance Wizard

**Files:**
- Create: `platform/dashboard/src/pages/NewInstance.tsx`
- Create: `platform/dashboard/src/components/PackCard.tsx`

**Step 1: Implement wizard**

3-step wizard:
1. Pick a pack (grid of PackCards with icon, name, description)
2. Enter API key (password input, never shown after entry)
3. Name the instance + confirm

Calls `api.createInstance()` on submit. Redirects to Dashboard on success.

**Step 2: Commit**

```bash
git add platform/dashboard/src/pages/NewInstance.tsx platform/dashboard/src/components/PackCard.tsx
git commit -m "feat(dashboard): add new instance wizard with pack selection"
```

---

### Task 22: Instance Detail Page (Logs + Config)

**Files:**
- Create: `platform/dashboard/src/pages/InstanceDetail.tsx`
- Create: `platform/dashboard/src/components/LogViewer.tsx`

**Step 1: Implement detail page**

Shows:
- Instance status, port, created time
- Log viewer (auto-refreshes every 5s, shows last 100 lines in monospace)
- Config JSON viewer (read-only code block)
- Action buttons (start/stop/delete)

**Step 2: Commit**

```bash
git add platform/dashboard/src/pages/InstanceDetail.tsx platform/dashboard/src/components/LogViewer.tsx
git commit -m "feat(dashboard): add instance detail page with log viewer"
```

---

### Task 23: Marketplace Page + Router Setup

**Files:**
- Create: `platform/dashboard/src/pages/Marketplace.tsx`
- Modify: `platform/dashboard/src/App.tsx` (add router)
- Create: `platform/dashboard/Dockerfile`

**Step 1: Implement Marketplace page**

Grid of all available packs with "Use this pack" button linking to NewInstance wizard with pack pre-selected.

**Step 2: Set up React Router**

```typescript
// platform/dashboard/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewInstance from "./pages/NewInstance";
import InstanceDetail from "./pages/InstanceDetail";
import Marketplace from "./pages/Marketplace";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/new" element={<ProtectedRoute><NewInstance /></ProtectedRoute>} />
          <Route path="/instance/:id" element={<ProtectedRoute><InstanceDetail /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

**Step 3: Create Dashboard Dockerfile**

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Step 4: Commit**

```bash
git add platform/dashboard/
git commit -m "feat(dashboard): add marketplace, router, and production Dockerfile"
```

---

## Phase 5: Site Updates (Tasks 24-26)

### Task 24: SaaS Guide Page

**Files:**
- Create: `saas/index.html`

**Step 1: Create the SaaS guide page**

Build `saas/index.html` with same dark theme covering:
- Platform architecture overview
- Multi-tenancy model (one container per instance)
- Instance lifecycle (create -> configure -> run -> monitor -> delete)
- API reference (endpoints, request/response examples)
- Scaling path (compose -> Swarm -> Kubernetes)
- Office packs explained

Use `@frontend-design:frontend-design` skill for this page.

**Step 2: Commit**

```bash
git add saas/index.html
git commit -m "feat(saas): add SaaS platform architecture guide page"
```

---

### Task 25: Update Landing Page

**Files:**
- Modify: `index.html`

**Step 1: Add new content cards**

Add 3 more cards to the content cards grid (after Sample Configs):
- Docker Guide card (links to `./docker/`, orange accent)
- SaaS Platform card (links to `./saas/`, cyan accent)
- Security Guide card (links to `./security/`, purple accent)

**Step 2: Update footer**

Add links to new pages in footer navigation.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(site): add Docker, SaaS, Security cards to landing page"
```

---

### Task 26: Final Integration Test + Push

**Step 1: Build Docker content pipeline**

```bash
cd docker && docker compose build
```
Expected: Both images build.

**Step 2: Build SaaS platform**

```bash
cd platform && docker compose build
```
Expected: API, Dashboard, Traefik all build.

**Step 3: Verify site pages render**

Open `index.html`, `docker/index.html`, `saas/index.html`, `security/index.html` in browser. Verify dark theme, links work, content renders.

**Step 4: Push to GitHub**

```bash
git push origin master
```

**Step 5: Verify GitHub Pages deployment**

Check that aiceoclone.amtocbot.com shows updated landing page with new cards and that `/docker/`, `/saas/`, `/security/` pages load correctly.
