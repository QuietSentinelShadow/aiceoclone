# Claw-Empire — AI CEO Company Simulator

Full organizational orchestration layer on top of NullClaw.

## What is Claw-Empire?

A local-first AI agent office simulator where you are the CEO and AI agents are employees. Features a pixel-art office view, Kanban board, KPI dashboard, and multi-agent orchestration.

## Prerequisites

- Node.js 22+
- pnpm
- git
- NullClaw (as runtime backbone)

## Setup

```bash
# Clone
git clone https://github.com/GreenSheep01201/claw-empire.git
cd claw-empire

# Install
bash install.sh     # macOS/Linux
# or PowerShell on Windows

# Configure
cp .env.example .env
nano .env           # Add your API keys

# Start
pnpm dev
```

## Office Packs

| Pack | Departments | Use Case |
|------|-------------|----------|
| development | Planning, Dev, Design, QA, DevSecOps, Ops | Software engineering |
| report | Editorial, Research, Design, Review | Document production |
| web_research_report | Research Strategy, Crawler, Fact Check | Research & validation |
| novel | Worldbuilding, Narrative, Character Art, Tone QA | Creative writing |
| video_preprod | Pre-production, Scene, Art & Camera, Cut QA | Video planning |
| roleplay | Character Planning, Dialogue, Stage Art, QA | Interactive fiction |

## CEO Directives

Use `$` prefix to issue directives:
```
$ prioritize the authentication refactor
$ schedule a team standup for tomorrow 9am
$ generate weekly performance report
```

## Architecture

- **Frontend**: React 19 + Vite 7 + Tailwind CSS 4 + PixiJS 8
- **Backend**: Express 5 + SQLite
- **Real-time**: WebSocket for live updates
- **Security**: AES-256-GCM encrypted tokens, local-first data
