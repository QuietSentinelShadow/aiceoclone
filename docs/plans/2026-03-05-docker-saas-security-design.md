# Design: NullClaw Docker + SaaS Platform + Security Hardening

**Date:** 2026-03-05
**Approach:** Monorepo Extension (Approach A)
**Status:** Approved

## Overview

Three pillars added to the existing `amtocbot-videos` repo:

1. **Docker-based NullClaw Content Creation** — working containers + tutorial page
2. **Multi-Instance SaaS Platform** — Node.js/React MVP with Docker orchestration
3. **Security Best Practices** — hardening across all layers + guide page

Each pillar produces both working code and a new page on the site (`/docker/`, `/saas/`, `/security/`).

---

## Pillar 1: Docker Content Creation

### Goal

Working Docker setup that runs NullClaw to generate blog posts, TTS audio, and Remotion videos inside containers. Plus a tutorial page at `/docker/`.

### File structure

```
docker/
  Dockerfile.nullclaw           # NullClaw binary + config + content tools
  Dockerfile.content-pipeline   # Node.js + Remotion + edge-tts for rendering
  docker-compose.yml            # Orchestrates both containers
  configs/
    content-creator.json        # NullClaw config tuned for content generation
    blog-prompt.md              # System prompt for blog writing
    video-script-prompt.md      # System prompt for video script generation
  scripts/
    generate-content.sh         # Chains: prompt NullClaw -> run pipeline -> output
  .env.example                  # Placeholder API keys
  index.html                    # Tutorial page (site: /docker/)
```

### Architecture

1. **NullClaw container** — `ghcr.io/homebrew/core/nullclaw` image, gateway mode on port 3000, mounts config connecting to user's AI provider.
2. **Content Pipeline container** — Node.js 22 with Remotion, edge-tts (Python), ffmpeg. Receives scripts from NullClaw output, runs audio generation and video rendering.
3. **Orchestration** — `docker compose up` starts both. `generate-content.sh` chains the steps.

### Security

- Non-root user in all containers
- Read-only root filesystem, writable only `/output` and `/tmp`
- Network isolation: only NullClaw reaches external AI APIs
- API keys via `.env` (gitignored)
- Memory/CPU limits in compose

### Site page: `/docker/index.html`

- Step-by-step guide matching the working setup
- Prerequisites, architecture diagram, config walkthrough
- Troubleshooting section
- Same dark theme as existing site

---

## Pillar 2: Multi-Instance SaaS Platform

### Goal

Full working MVP: users spin up NullClaw instances on-demand, choose office packs, manage via React dashboard. Runs locally via `docker compose up`.

### File structure

```
platform/
  api/
    src/
      server.ts                 # Express app entry
      routes/
        auth.ts                 # JWT auth (register/login)
        instances.ts            # CRUD NullClaw instances
        packs.ts                # List/apply office packs
        logs.ts                 # Stream container logs
      services/
        docker.ts               # Docker Engine API via dockerode
        instance-manager.ts     # Lifecycle: provision, configure, health-check
        billing.ts              # Usage tracking
      db/
        schema.sql              # SQLite schema
    package.json
    Dockerfile                  # API container
  dashboard/
    src/
      pages/
        Login.tsx
        Dashboard.tsx           # Instance list, status, quick actions
        NewInstance.tsx          # Wizard: pick pack, set API key, configure
        InstanceDetail.tsx      # Logs, config editor, usage stats
        Marketplace.tsx         # Browse office packs
      components/
        InstanceCard.tsx
        PackCard.tsx
        LogViewer.tsx
        UsageChart.tsx
    package.json
    Dockerfile                  # Nginx serving built React app
  packs/
    content-creator.json
    dev-team.json
    research-analyst.json
    ceo-clone.json
    custom-template.json
  docker-compose.yml            # API + Dashboard + Traefik
  .env.example
```

### Data model (SQLite)

- **users** — id, email, password_hash, created_at
- **instances** — id, user_id, name, pack_id, status, container_id, port, config_json, created_at
- **packs** — id, name, description, category, config_template, icon
- **usage_logs** — id, instance_id, event_type, timestamp, metadata

### How it works

1. User registers/logs into dashboard
2. "New Instance" — picks office pack, enters AI provider API key
3. API key encrypted with AES-256-GCM, stored in SQLite
4. `dockerode` spins up NullClaw container with pack config, maps unique port
5. Traefik routes `instance-{id}.localhost` to container
6. Dashboard shows status, log streams, usage metrics
7. User can start/stop/delete instances, edit config, switch packs

### Instance isolation

- Separate Docker container per instance
- Separate network per instance (no cross-talk)
- Unique port mapping + Traefik routing
- Per-instance volume for persistence
- Resource limits: 256 MB RAM, 0.5 CPU default

### Tech stack

- **API:** Express.js, TypeScript, SQLite (better-sqlite3), dockerode, jsonwebtoken, bcrypt, zod
- **Dashboard:** React 18, Vite, Tailwind CSS, React Router
- **Proxy:** Traefik v3 (auto-discovery via Docker labels)

### Site page: `/saas/index.html`

- Architecture overview with diagrams
- Multi-tenancy explanation
- Scaling considerations
- API reference
- Same dark theme

---

## Pillar 3: Security Best Practices

### Goal

Comprehensive security across Docker and SaaS layers. Plus a `/security/` guide page.

### Container-level

- All containers non-root (`USER 1000:1000`)
- Read-only root filesystems
- Drop all capabilities (`cap_drop: ALL`), add back only needed
- `no-new-privileges: true`
- Seccomp/AppArmor profiles for NullClaw containers
- Resource limits on every container

### Network-level

- Internal Docker networks per tenant
- Traefik as sole ingress, no direct port exposure
- Rate limiting on API (express-rate-limit)
- CORS locked to dashboard origin

### Application-level

- JWT auth, bcrypt (cost 12)
- API keys encrypted at rest (AES-256-GCM)
- Input validation (zod schemas)
- Parameterized queries
- Helmet.js security headers
- CSRF protection

### NullClaw-specific

- Built-in sandbox: Landlock > Bubblewrap > Docker
- Workspace scoping per instance
- ChaCha20-Poly1305 encrypted secrets
- Explicit command allowlists per pack
- Audit logging (30-day retention)
- Gateway pairing (6-digit OTP)

### Operational

- `.env` gitignored, `.env.example` committed
- Docker image pinning (no `latest`)
- Health checks on all containers
- Log rotation
- Compose profiles (dev vs prod)

### Site page: `/security/index.html`

- Threat model overview
- Layer-by-layer walkthrough
- NullClaw hardening checklist
- Common mistakes
- Same dark theme

---

## Site updates

### New pages

- `/docker/index.html` — Docker content creation guide
- `/saas/index.html` — SaaS platform architecture guide
- `/security/index.html` — Security best practices guide

### Landing page updates

- Add cards for Docker, SaaS, Security pages to the content cards grid
- Update navigation/footer with links to new pages

### Design consistency

- All pages use same dark theme (bg: #0a0a0f, primary: #00e5ff, secondary: #7c4dff)
- Tailwind CSS via CDN, Inter + JetBrains Mono fonts
- Same card hover effects, glow borders, animation patterns

---

## Implementation order

1. Pillar 1: Docker content creation (foundation for Pillar 2)
2. Pillar 3: Security hardening (applies to Pillar 2 from the start)
3. Pillar 2: SaaS platform (builds on Docker + security)
4. Site pages and landing page updates (document as we build)
