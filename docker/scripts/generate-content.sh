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
