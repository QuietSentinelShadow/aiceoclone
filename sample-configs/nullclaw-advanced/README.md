# NullClaw Advanced Mode — AI CEO Clone

Full autonomy configuration for running NullClaw as an always-on AI CEO.

## Features

- **Full autonomy**: Executes commands without confirmation
- **Multi-provider**: Anthropic (primary) + OpenRouter (fallback) + Ollama (local)
- **Multi-channel**: Telegram + Slack + Discord
- **Cron scheduling**: Morning briefings, weekly reports, health checks
- **Web search**: SearXNG integration for real-time information
- **Audit logging**: 30-day retention for accountability
- **Resource limits**: CPU, memory, and disk caps

## Setup

```bash
# Copy config
cp config.json ~/.nullclaw/config.json

# Edit with your API keys and tokens
nano ~/.nullclaw/config.json

# Start as daemon
nullclaw daemon

# Register as OS service (survives reboots)
nullclaw service install
nullclaw service start

# Verify
nullclaw doctor
nullclaw service status
```

## Cron Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| morning-briefing | 8:00 AM daily | Summarizes overnight messages |
| weekly-report | 5:00 PM Friday | Weekly status compilation |
| system-health | Every 30 min | System health check |

## Safety

- `risk_threshold: "medium"` — blocks high-risk operations
- `confirmation_required_for` — dangerous commands still need approval
- Audit logging tracks all actions for review
- Resource limits prevent runaway processes
