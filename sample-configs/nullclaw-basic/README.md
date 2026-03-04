# NullClaw Basic Setup

Minimal configuration for getting started with NullClaw.

## Quick Start

```bash
# Install
brew install nullclaw
# OR build from source
git clone https://github.com/nullclaw/nullclaw.git
cd nullclaw && zig build -Doptimize=ReleaseSmall

# Onboard (interactive wizard)
nullclaw onboard --interactive

# Or use this config
cp config.json ~/.nullclaw/config.json

# Start
nullclaw agent -m "Hello, NullClaw!"
```

## What This Config Does

- **Provider**: OpenRouter with Gemini 2.5 Flash (cost-effective)
- **Channel**: Telegram bot (replace token and user ID)
- **Memory**: SQLite with hybrid vector+keyword search
- **Autonomy**: Interactive (asks before executing commands)
- **Security**: Auto-detected sandbox, workspace-scoped

## Configuration

1. Replace `sk-or-YOUR_KEY_HERE` with your OpenRouter API key
2. Replace `YOUR_TELEGRAM_BOT_TOKEN` with your Telegram bot token from @BotFather
3. Replace `123456789` with your numeric Telegram user ID
