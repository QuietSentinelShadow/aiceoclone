# AI CEO Clone

> Build your own AI CEO using [NullClaw](https://github.com/nullclaw/nullclaw) - the 678 KB autonomous AI assistant.

[![Deploy to GitHub Pages](https://github.com/QuietSentinelShadow/aiceoclone/actions/workflows/deploy.yml/badge.svg)](https://github.com/QuietSentinelShadow/aiceoclone/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live site:** [aiceoclone.amtocbot.com](http://aiceoclone.amtocbot.com)

## What is this?

A comprehensive content suite and working platform for deploying NullClaw as an autonomous AI CEO clone. Includes:

- **Landing page** with embedded YouTube explainer videos
- **Blog article** covering NullClaw setup, competitor comparison, and advanced configuration
- **Reveal.js slideshow** for presentations
- **6 Remotion videos** targeting different audiences (5-year-old, professional, influencer, CEO clone tutorials)
- **Docker pipeline** for containerized NullClaw content creation
- **SaaS platform MVP** with Express API, React dashboard, and multi-instance management
- **Security guide** with hardening checklists and best practices

## Project Structure

```
amtocbot-videos/
├── index.html                  # Landing page
├── blog/                       # Tailwind CSS article
├── slideshow/                  # Reveal.js presentation
├── src/                        # Remotion video compositions
│   ├── videos/                 # 6 video compositions
│   ├── components/             # Reusable video components
│   └── lib/                    # Constants, styles, TTS helpers
├── scripts/                    # Audio generation & render scripts
├── docker/                     # Docker content creation pipeline
│   ├── Dockerfile.nullclaw     # NullClaw container
│   ├── Dockerfile.content-pipeline
│   ├── docker-compose.yml      # Orchestration
│   ├── configs/                # NullClaw configs
│   ├── security/               # Seccomp profiles
│   └── index.html              # Docker tutorial page
├── platform/                   # SaaS platform MVP
│   ├── api/                    # Express v5 REST API
│   │   └── src/
│   │       ├── routes/         # Auth, instances, packs, logs
│   │       ├── services/       # Docker container management
│   │       ├── middleware/     # JWT auth
│   │       ├── lib/            # AES-256-GCM crypto
│   │       └── db/             # SQLite schema & seeds
│   ├── dashboard/              # React + Vite + Tailwind SPA
│   ├── docker-compose.yml      # Traefik + API + Dashboard
│   └── packs/                  # Instance pack definitions
├── security/                   # Security best practices guide
├── saas/                       # SaaS architecture guide
├── sample-configs/             # Working NullClaw configurations
│   ├── nullclaw-basic/
│   ├── nullclaw-advanced/
│   └── claw-empire/
└── out/                        # Rendered videos (gitignored)
```

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | 18+ | Video rendering, API server, dashboard |
| [Python](https://www.python.org/) | 3.8+ | TTS audio generation (`edge-tts`) |
| [Docker](https://www.docker.com/) | 24+ | Container pipeline & SaaS platform |
| [NullClaw](https://github.com/nullclaw/nullclaw) | 2026.3+ | AI assistant framework (optional for local dev) |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/QuietSentinelShadow/aiceoclone.git
cd aiceoclone
npm install
```

### 2. View the site locally

Open `index.html` in your browser, or use any static server:

```bash
npx serve .
```

### 3. Generate TTS audio (for videos)

```bash
pip install edge-tts
npm run generate-audio
```

### 4. Preview videos in Remotion Studio

```bash
npm run preview
```

### 5. Render all videos

```bash
npm run render-all
```

Videos are output to `out/` as MP4 files.

## Docker Content Pipeline

Create blog posts and video scripts using NullClaw inside Docker containers.

```bash
cd docker
cp .env.example .env
# Edit .env with your API key (OpenRouter, OpenAI, etc.)

docker compose build
docker compose up -d

# Generate content
docker compose exec pipeline bash /app/scripts/generate-content.sh

# Render a video
docker compose --profile render run --rm pipeline npx remotion render
```

See the [Docker tutorial](http://aiceoclone.amtocbot.com/docker/) for the full walkthrough.

## SaaS Platform

Multi-tenant NullClaw instance management with a React dashboard.

### Run locally with Docker Compose

```bash
cd platform
cp .env.example .env  # If available, or set env vars manually

# Required environment variables:
export JWT_SECRET="your-secret-key-min-32-chars"
export ENCRYPTION_KEY="your-encryption-key-32-chars!!"

docker compose up -d
```

- **Dashboard:** http://localhost (via Traefik)
- **API:** http://localhost/api
- **Traefik dashboard:** http://localhost:8080

### Run the API standalone (development)

```bash
cd platform/api
npm install
npm run dev
```

### Run the dashboard standalone (development)

```bash
cd platform/dashboard
npm install
npm run dev
```

See the [SaaS architecture guide](http://aiceoclone.amtocbot.com/saas/) for API reference and deployment details.

## Security

This project follows container security best practices:

- Non-root containers (UID 1000)
- Read-only root filesystems
- Dropped Linux capabilities (only NET_BIND_SERVICE retained)
- Custom seccomp profiles restricting syscalls
- AES-256-GCM encryption for stored API keys
- bcrypt (cost 12) password hashing
- Helmet security headers + rate limiting
- No `--privileged`, no `SYS_ADMIN`

See the [security guide](http://aiceoclone.amtocbot.com/security/) for the full 21-item hardening checklist.

## Available Scripts

### Root (video rendering)

| Script | Command | Description |
|--------|---------|-------------|
| Preview | `npm run preview` | Open Remotion Studio |
| Render | `npm run render-all` | Render all 6 videos to `out/` |
| Audio | `npm run generate-audio` | Generate TTS narration audio |

### Platform API (`platform/api/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start API with hot reload |
| Test | `npm test` | Run vitest test suite |
| Build | `npm run build` | TypeScript compilation |

### Dashboard (`platform/dashboard/`)

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start Vite dev server |
| Build | `npm run build` | Production build |
| Lint | `npm run lint` | ESLint check |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Videos | [Remotion](https://remotion.dev/) (React video framework) |
| TTS | [edge-tts](https://pypi.org/project/edge-tts/) (Microsoft Edge TTS) |
| Blog/Docs | HTML + [Tailwind CSS](https://tailwindcss.com/) (CDN) |
| Slideshow | [Reveal.js](https://revealjs.com/) |
| API | [Express v5](https://expressjs.com/) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Dashboard | [React 19](https://react.dev/) + [Vite](https://vite.dev/) + [Tailwind v4](https://tailwindcss.com/) |
| Containers | Docker + Docker Compose |
| Reverse Proxy | [Traefik v3](https://traefik.io/) |
| CI/CD | GitHub Actions + GitHub Pages |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
