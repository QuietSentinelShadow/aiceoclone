import { execSync } from "child_process";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const AUDIO_DIR = join(__dirname, "..", "src", "audio");

interface NarrationSegment {
  id: string;
  text: string;
  voice: string;
  rate?: string;
  pitch?: string;
}

interface VideoNarration {
  videoId: string;
  segments: NarrationSegment[];
}

// Voice presets
const VOICES = {
  friendly: "en-US-JennyNeural",       // 5-year-old: warm, friendly
  professional: "en-US-GuyNeural",      // Professional: clear, authoritative
  energetic: "en-US-AriaNeural",        // Influencer: energetic
  narrator: "en-US-DavisNeural",        // CEO conceptual: calm narrator
  tutorial: "en-US-JasonNeural",        // Tutorial: step-by-step
};

const allVideos: VideoNarration[] = [
  // === VIDEO 1: Five-Year-Old ===
  {
    videoId: "five-year-old",
    segments: [
      {
        id: "fyo-01-intro",
        text: "Hey there! Today we're going to learn about something super cool called NullClaw!",
        voice: VOICES.friendly,
        rate: "-15%",
      },
      {
        id: "fyo-02-tiny",
        text: "Imagine you have a tiny tiny robot helper. So tiny it can fit inside a single Lego brick! That's how small NullClaw is. It's only six hundred and seventy eight kilobytes. That's tinier than a single photo on your phone!",
        voice: VOICES.friendly,
        rate: "-15%",
      },
      {
        id: "fyo-03-fast",
        text: "And guess what? This tiny robot wakes up in just two milliseconds. That's faster than you can blink your eyes! Way way faster!",
        voice: VOICES.friendly,
        rate: "-15%",
      },
      {
        id: "fyo-04-talks",
        text: "The coolest part? This robot can talk to ALL your friends! It can send messages on Telegram, Discord, Slack, and even WhatsApp. That's like having a friend who speaks every language in the world!",
        voice: VOICES.friendly,
        rate: "-15%",
      },
      {
        id: "fyo-05-remembers",
        text: "And it remembers everything! If you tell it something today, it'll remember it tomorrow. It has a special memory that uses two different ways to find things, like having both a library catalog AND a super search engine in its brain.",
        voice: VOICES.friendly,
        rate: "-15%",
      },
      {
        id: "fyo-06-comparison",
        text: "Now, there are other robot helpers too. OpenClaw is like a HUGE robot that needs a whole room to itself and takes forever to wake up. ZeroClaw is medium-sized and pretty fast. But NullClaw? It's the tiniest AND the fastest!",
        voice: VOICES.friendly,
        rate: "-15%",
      },
      {
        id: "fyo-07-ceo",
        text: "Now here's the really fun part. You can make NullClaw run your very own lemonade stand! Well, not really, but kind of! You can set it up to be like a little boss, your own AI CEO! It can check on things, make decisions, and tell other robots what to do. All by itself! While you're sleeping!",
        voice: VOICES.friendly,
        rate: "-15%",
      },
      {
        id: "fyo-08-outro",
        text: "So remember, NullClaw is a teeny tiny super fast robot helper that can talk to everyone, remember everything, and even run your pretend company. Pretty cool, right? Thanks for watching!",
        voice: VOICES.friendly,
        rate: "-15%",
      },
    ],
  },

  // === VIDEO 2: Software Professional ===
  {
    videoId: "professional",
    segments: [
      {
        id: "pro-01-intro",
        text: "NullClaw is a fully autonomous AI assistant infrastructure written in Zig. It compiles to a single six hundred seventy-eight kilobyte static binary, uses approximately one megabyte of RAM, and boots in under two milliseconds on modern hardware.",
        voice: VOICES.professional,
      },
      {
        id: "pro-02-arch",
        text: "The architecture is vtable-driven. Every subsystem, providers, channels, tools, memory backends, and runtimes, implements a vtable interface. This means you can swap any component without code changes, purely through configuration.",
        voice: VOICES.professional,
      },
      {
        id: "pro-03-setup",
        text: "Installation is straightforward. Either brew install nullclaw, or clone the repo and build with zig build dash D optimize equals Release Small. Onboarding takes a single command: nullclaw onboard dash dash interactive. This configures your provider, model, memory, tunnel, autonomy level, and channel.",
        voice: VOICES.professional,
      },
      {
        id: "pro-04-providers",
        text: "NullClaw supports twenty-two plus API providers out of the box: OpenRouter, Anthropic, OpenAI, Ollama, Groq, Mistral, x AI, DeepSeek, and any OpenAI-compatible endpoint. Provider switching is a config change, no code modifications needed.",
        voice: VOICES.professional,
      },
      {
        id: "pro-05-memory",
        text: "The memory system uses SQLite with a hybrid search approach. It combines FTS5 keyword matching via BM25 scoring with cosine similarity vector retrieval. Default weights are zero point seven for vector and zero point three for keyword. Embeddings are stored as BLOBs with automatic hygiene and snapshot export.",
        voice: VOICES.professional,
      },
      {
        id: "pro-06-security",
        text: "Security is defense-in-depth. API keys are encrypted with ChaCha20 Poly1305. Sandboxing auto-detects the best backend: Landlock, Firejail, Bubblewrap, or Docker. The gateway binds to localhost by default and refuses zero dot zero dot zero dot zero without a tunnel. Pairing uses six-digit one-time codes with bearer token exchange.",
        voice: VOICES.professional,
      },
      {
        id: "pro-07-comparison",
        text: "Compared to the competition: OpenClaw is TypeScript based, four hundred thirty thousand lines, one gigabyte plus RAM, multi-second startup, and had a critical RCE vulnerability, CVE 2026 25253. ZeroClaw is Rust, three point four megabytes, under five megabytes RAM, ten millisecond startup, with the most sophisticated memory system. NullClaw wins on size and speed but ZeroClaw edges ahead on production-grade features.",
        voice: VOICES.professional,
      },
      {
        id: "pro-08-advanced",
        text: "For advanced mode, you configure the autonomy section in config dot json. Set level to full, allowed commands to wildcard, and allowed paths to wildcard. Then run nullclaw daemon for always-on background operation. The built-in cron scheduler uses JSON persistence for recurring task automation. Combined with the service install command, you get OS-managed autonomous operation.",
        voice: VOICES.professional,
      },
      {
        id: "pro-09-ceo",
        text: "To build an AI CEO clone, combine full autonomy mode with daemon operation, cron scheduling for periodic check-ins, multi-channel communication via Telegram or Slack, and the hybrid memory system for persistent context. Layer Claw-Empire on top for full organizational orchestration with department-based task delegation.",
        voice: VOICES.professional,
      },
      {
        id: "pro-10-outro",
        text: "NullClaw represents a paradigm shift: enterprise-grade AI assistant capabilities in a sub-megabyte footprint. Check the GitHub repo and documentation for the complete API reference.",
        voice: VOICES.professional,
      },
    ],
  },

  // === VIDEO 3: Influencer ===
  {
    videoId: "influencer",
    segments: [
      {
        id: "inf-01-hook",
        text: "Six hundred and seventy eight kilobytes. That's SMALLER than a single JPEG photo. And it's a FULL AI assistant. I'm not joking.",
        voice: VOICES.energetic,
        rate: "+10%",
      },
      {
        id: "inf-02-speed",
        text: "It boots in TWO milliseconds. TWO! While OpenClaw is still loading, NullClaw has already answered your question, sent a message, and gone back to sleep.",
        voice: VOICES.energetic,
        rate: "+10%",
      },
      {
        id: "inf-03-board",
        text: "Oh, and it runs on a five dollar ARM board. A FIVE DOLLAR board. You could literally run your own AI assistant on something cheaper than a cup of coffee.",
        voice: VOICES.energetic,
        rate: "+10%",
      },
      {
        id: "inf-04-channels",
        text: "Telegram, Discord, Slack, WhatsApp, Signal, even IRC. This thing connects to EIGHTEEN different channels. It's everywhere you are!",
        voice: VOICES.energetic,
        rate: "+10%",
      },
      {
        id: "inf-05-comparison",
        text: "Let's talk numbers. OpenClaw uses ONE GIGABYTE of RAM. ZeroClaw uses five megabytes. NullClaw? ONE megabyte. ONE. That's a thousand times less than OpenClaw. A THOUSAND times!",
        voice: VOICES.energetic,
        rate: "+10%",
      },
      {
        id: "inf-06-ceo",
        text: "But here's the REAL game changer. You can set this up as your own AI CEO. It runs twenty four seven, makes decisions, schedules tasks, sends messages on your behalf. Your own personal AI boss clone. FOR FREE.",
        voice: VOICES.energetic,
        rate: "+10%",
      },
      {
        id: "inf-07-cta",
        text: "Link in the description. Go set this up RIGHT NOW. You'll thank me later. Drop a comment if you do. Let's go!",
        voice: VOICES.energetic,
        rate: "+10%",
      },
    ],
  },

  // === VIDEO 4: CEO Clone Conceptual ===
  {
    videoId: "ceo-conceptual",
    segments: [
      {
        id: "ceo-c-01-intro",
        text: "What if you could clone yourself as a CEO? Not literally, of course, but what if an AI could handle your decision-making, communication, and task management, twenty-four seven, without getting tired?",
        voice: VOICES.narrator,
      },
      {
        id: "ceo-c-02-what",
        text: "An AI CEO clone is an autonomous agent that operates on your behalf. It monitors incoming messages, makes decisions based on your preferences and past behavior, delegates tasks, schedules meetings, and communicates with your team. All while you focus on what matters most.",
        voice: VOICES.narrator,
      },
      {
        id: "ceo-c-03-why-nullclaw",
        text: "Why NullClaw for this? Three reasons. First, it's always on. The daemon mode means it runs in the background, twenty-four seven, consuming just one megabyte of RAM. Second, it has built-in scheduling. The cron system handles recurring tasks like daily standups or weekly reports. Third, the hybrid memory system means it remembers context across sessions, just like a real CEO would.",
        voice: VOICES.narrator,
      },
      {
        id: "ceo-c-04-how",
        text: "The concept works like this. You configure NullClaw with full autonomy mode. It connects to your communication channels, Telegram, Slack, Discord. It receives messages, processes them using your chosen AI provider, and responds or takes action based on configurable rules and risk thresholds.",
        voice: VOICES.narrator,
      },
      {
        id: "ceo-c-05-usecases",
        text: "Use cases are powerful. Automated email triage and response. Meeting scheduling and follow-ups. Task delegation to team members via chat. Daily status report generation. System health monitoring and alerts. Customer inquiry routing. All running autonomously.",
        voice: VOICES.narrator,
      },
      {
        id: "ceo-c-06-outro",
        text: "In the next video, we'll walk through the actual setup step by step, configuring NullClaw's advanced mode to build your own AI CEO clone.",
        voice: VOICES.narrator,
      },
    ],
  },

  // === VIDEO 5: CEO Clone NullClaw Advanced ===
  {
    videoId: "ceo-nullclaw-advanced",
    segments: [
      {
        id: "ceo-a-01-intro",
        text: "Let's build an AI CEO clone using NullClaw's advanced mode. We'll configure daemon operation, full autonomy, cron scheduling, and multi-channel communication step by step.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-02-install",
        text: "First, install NullClaw. Clone the repository from GitHub, then build with zig build dash D optimize equals Release Small. Or simply brew install nullclaw if you're on macOS.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-03-onboard",
        text: "Run nullclaw onboard dash dash interactive. Select your AI provider, I recommend OpenRouter for flexibility. Choose your model. Configure memory persistence as enabled. Set the autonomy level to full. This means NullClaw will execute commands without asking for confirmation.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-04-config",
        text: "Now let's edit the config dot json file. In the autonomy section, set level to full, allowed commands to wildcard, and allowed paths to wildcard. Set the risk threshold to medium. This gives your AI CEO broad permissions while still having safety guardrails for high-risk operations.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-05-channels",
        text: "Configure your communication channels. Add Telegram with your bot token from BotFather. Add Slack with your workspace webhook. Set the allow from list to your user IDs. These are the channels your AI CEO will use to communicate.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-06-memory",
        text: "The memory system is crucial for a CEO clone. Enable the SQLite backend. Set the embedding provider to your AI provider. Configure the search weights: zero point seven for vector similarity and zero point three for keyword matching. This ensures your AI CEO can recall past conversations and decisions accurately.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-07-cron",
        text: "Set up recurring tasks with the cron scheduler. Define a daily morning briefing that summarizes overnight messages. A weekly report generator that compiles project status. A heartbeat check every thirty minutes that monitors system health. All persisted in JSON and surviving restarts.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-08-daemon",
        text: "Now launch the daemon. Run nullclaw daemon to start background operation. Then run nullclaw service install to register it as an OS-managed service. Your AI CEO is now running twenty-four seven, surviving reboots, with automatic restart on failure via exponential backoff.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-09-verify",
        text: "Verify everything works. Run nullclaw doctor to check system health. Send a test message via Telegram. Check that the cron tasks are scheduled with nullclaw service status. Your AI CEO clone is now live and operational.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-a-10-outro",
        text: "That's NullClaw's advanced mode configured as an AI CEO. In the next video, we'll layer Claw-Empire on top for full organizational orchestration with departments, task boards, and team management.",
        voice: VOICES.tutorial,
      },
    ],
  },

  // === VIDEO 6: CEO Clone with Claw-Empire ===
  {
    videoId: "ceo-claw-empire",
    segments: [
      {
        id: "ceo-e-01-intro",
        text: "Now let's take our AI CEO clone to the next level with Claw-Empire, a virtual AI company simulator that orchestrates multiple AI agents as a full organization.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-02-what",
        text: "Claw-Empire turns your AI assistants into a virtual software company. You are the CEO. Your AI agents are the employees. They work in departments, receive directives, complete tasks, and report back. All visualized through a pixel-art office interface with real-time dashboards.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-03-install",
        text: "Prerequisites: Node.js 22 or higher, pnpm, and git. Clone the Claw-Empire repository from GitHub. Run bash install dot sh on Mac or Linux, or the PowerShell equivalent on Windows. This creates your environment file and initializes the database.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-04-setup",
        text: "Configure your company in the settings panel. Set your company name and CEO name. Add your AI providers: Claude Code, Codex CLI, Gemini CLI, or any compatible agent. Each agent connects via CLI, OAuth, or direct API key. NullClaw serves as the lightweight runtime backbone.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-05-directives",
        text: "CEO directives use the dollar sign prefix. Type dollar sign followed by your command to delegate tasks to department leads. For example, dollar sign prioritize the authentication refactor. The system routes this to the appropriate department, breaks it into subtasks, and assigns agents. Meeting minutes are auto-generated.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-06-packs",
        text: "Choose an office pack to define your company structure. The development pack gives you Planning, Development, Design, QA, DevSecOps, and Operations departments. The report pack creates Editorial, Research, Design, and Review teams. There's also packs for web research, novel writing, video pre-production, and roleplay scenarios.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-07-features",
        text: "The real-time dashboard shows everything. A pixel-art office view with animated agents at their desks. A Kanban board with drag-and-drop task management. KPI metrics and agent rankings based on XP earned from completed tasks. Over six hundred categorized skills with custom upload support.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-08-messenger",
        text: "Connect external messengers for CEO communication. Telegram, Discord, Slack, WhatsApp, Google Chat, Signal, and iMessage are all supported. Configure each in Settings, Channel Messages. Tokens are encrypted at rest with AES 256 GCM.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-09-workflow",
        text: "Here's the full workflow. You send a CEO directive via chat. Claw-Empire routes it to the right department. The department lead, powered by NullClaw, breaks it into tasks. Agents work in isolated git branches. Work is merged only on CEO approval. Results flow back through the dashboard and messenger channels.",
        voice: VOICES.tutorial,
      },
      {
        id: "ceo-e-10-outro",
        text: "And that's the complete AI CEO clone stack. NullClaw provides the lightweight, always-on runtime. Claw-Empire provides the organizational layer. Together, you have a fully autonomous AI company at your fingertips. Check the links in the description to get started.",
        voice: VOICES.tutorial,
      },
    ],
  },
];

function generateAudio(segment: NarrationSegment, outputDir: string): void {
  const outputPath = join(outputDir, `${segment.id}.mp3`);
  if (existsSync(outputPath)) {
    console.log(`  [skip] ${segment.id} (already exists)`);
    return;
  }

  let cmd = `edge-tts --voice "${segment.voice}" --text "${segment.text.replace(/"/g, '\\"')}"`;
  if (segment.rate) cmd += ` --rate="${segment.rate}"`;
  if (segment.pitch) cmd += ` --pitch="${segment.pitch}"`;
  cmd += ` --write-media "${outputPath}"`;

  try {
    execSync(cmd, { stdio: "pipe" });
    console.log(`  [done] ${segment.id}`);
  } catch (err) {
    console.error(`  [FAIL] ${segment.id}: ${err}`);
  }
}

async function main() {
  mkdirSync(AUDIO_DIR, { recursive: true });

  for (const video of allVideos) {
    const videoDir = join(AUDIO_DIR, video.videoId);
    mkdirSync(videoDir, { recursive: true });
    console.log(`\nGenerating audio for: ${video.videoId}`);

    for (const segment of video.segments) {
      generateAudio(segment, videoDir);
    }
  }

  console.log("\nAll audio generation complete!");
}

main().catch(console.error);
