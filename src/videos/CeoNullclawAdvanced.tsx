import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS, FPS } from "../lib/constants";

const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 20 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame - delay, [0, duration], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
  );
};

const TerminalLine: React.FC<{
  text: string;
  delay?: number;
  prompt?: string;
  color?: string;
}> = ({ text, delay = 0, prompt = "$", color = COLORS.success }) => {
  const frame = useCurrentFrame();
  const charsVisible = Math.max(
    0,
    Math.floor((frame - delay) / 1.5)
  );
  if (frame < delay) return null;
  const displayed = text.slice(0, charsVisible);
  const showCursor = charsVisible < text.length;
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 26,
        color: COLORS.text,
        marginBottom: 12,
        lineHeight: 1.6,
      }}
    >
      <span style={{ color }}>{prompt} </span>
      <span>{displayed}</span>
      {showCursor && (
        <span
          style={{
            backgroundColor: COLORS.primary,
            width: 10,
            height: 26,
            display: "inline-block",
            marginLeft: 2,
          }}
        />
      )}
    </div>
  );
};

const ConfigHighlight: React.FC<{
  keyName: string;
  value: string;
  delay?: number;
  indent?: number;
}> = ({ keyName, value, delay = 0, indent = 2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15 },
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 24,
        marginBottom: 8,
        paddingLeft: indent * 20,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
      }}
    >
      <span style={{ color: COLORS.primary }}>"{keyName}"</span>
      <span style={{ color: COLORS.textMuted }}>: </span>
      <span style={{ color: COLORS.accent }}>{value}</span>
    </div>
  );
};

const StepCard: React.FC<{
  step: number;
  title: string;
  description: string;
  delay?: number;
  icon?: string;
}> = ({ step, title, description, delay = 0, icon = "▸" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12 },
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        marginBottom: 24,
        opacity: progress,
        transform: `translateX(${(1 - progress) * 40}px)`,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: COLORS.primary + "22",
          border: `2px solid ${COLORS.primary}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONTS.heading,
          fontSize: 22,
          fontWeight: 700,
          color: COLORS.primary,
          flexShrink: 0,
        }}
      >
        {step}
      </div>
      <div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 4,
          }}
        >
          {icon} {title}
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            color: COLORS.textMuted,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

// ---- SCENES ----

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleScale = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 64,
            fontWeight: 800,
            color: COLORS.primary,
            transform: `scale(${titleScale})`,
            textShadow: `0 0 40px ${COLORS.primary}55`,
            marginBottom: 20,
          }}
        >
          AI CEO Clone: NullClaw Advanced
        </div>
        <FadeIn delay={20}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 32,
              color: COLORS.textMuted,
            }}
          >
            Step-by-Step Tutorial
          </div>
        </FadeIn>
        <FadeIn delay={40}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 20,
              color: COLORS.textDim,
              marginTop: 30,
              padding: "10px 24px",
              backgroundColor: COLORS.card,
              borderRadius: 8,
              display: "inline-block",
            }}
          >
            daemon + cron + full autonomy + memory
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

const InstallScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1200 }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 40,
          }}
        >
          Step 1: Install NullClaw
        </div>
      </FadeIn>
      <div
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: 40,
          border: `1px solid ${COLORS.cardBorder}`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#ff5f57",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#ffbd2e",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#28c840",
            }}
          />
        </div>
        <TerminalLine
          text="git clone https://github.com/nullclaw/nullclaw.git"
          delay={15}
        />
        <TerminalLine
          text="cd nullclaw"
          delay={50}
        />
        <TerminalLine
          text="zig build -Doptimize=ReleaseSmall"
          delay={70}
        />
        <TerminalLine
          text="# Or simply: brew install nullclaw"
          delay={100}
          prompt="#"
          color={COLORS.textDim}
        />
      </div>
    </div>
  </AbsoluteFill>
);

const OnboardScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1200 }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 40,
          }}
        >
          Step 2: Interactive Onboarding
        </div>
      </FadeIn>
      <div
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: 40,
          border: `1px solid ${COLORS.cardBorder}`,
        }}
      >
        <TerminalLine text="nullclaw onboard --interactive" delay={10} />
        <FadeIn delay={40}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 22,
              color: COLORS.textMuted,
              marginTop: 20,
              lineHeight: 2,
            }}
          >
            <div>
              ? Select provider:{" "}
              <span style={{ color: COLORS.primary }}>OpenRouter</span>
            </div>
            <div>
              ? Select model:{" "}
              <span style={{ color: COLORS.primary }}>
                claude-sonnet-4-6
              </span>
            </div>
            <div>
              ? Memory persistence:{" "}
              <span style={{ color: COLORS.success }}>Enabled</span>
            </div>
            <div>
              ? Autonomy level:{" "}
              <span style={{ color: COLORS.accent }}>Full</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  </AbsoluteFill>
);

const ConfigScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1200 }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 10,
          }}
        >
          Step 3: Autonomy Configuration
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 20,
            color: COLORS.textDim,
            marginBottom: 30,
          }}
        >
          ~/.nullclaw/config.json
        </div>
      </FadeIn>
      <div
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: 40,
          border: `1px solid ${COLORS.cardBorder}`,
        }}
      >
        <ConfigHighlight keyName="autonomy" value="{" delay={15} indent={0} />
        <ConfigHighlight
          keyName="level"
          value='"full"'
          delay={30}
          indent={1}
        />
        <ConfigHighlight
          keyName="allowed_commands"
          value='["*"]'
          delay={45}
          indent={1}
        />
        <ConfigHighlight
          keyName="allowed_paths"
          value='["*"]'
          delay={60}
          indent={1}
        />
        <ConfigHighlight
          keyName="risk_threshold"
          value='"medium"'
          delay={75}
          indent={1}
        />
        <ConfigHighlight
          keyName="confirmation_required_for"
          value='["rm", "shutdown"]'
          delay={90}
          indent={1}
        />
        <FadeIn delay={100}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 24,
              color: COLORS.textMuted,
            }}
          >
            {"}"}
          </div>
        </FadeIn>
      </div>
    </div>
  </AbsoluteFill>
);

const ChannelsScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1200 }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 40,
          }}
        >
          Step 4: Communication Channels
        </div>
      </FadeIn>
      <div
        style={{ display: "flex", gap: 30, justifyContent: "center" }}
      >
        {[
          { name: "Telegram", color: "#0088cc", icon: "📱", delay: 15 },
          { name: "Slack", color: "#4A154B", icon: "💬", delay: 30 },
          { name: "Discord", color: "#5865F2", icon: "🎮", delay: 45 },
        ].map((ch) => {
          const frame = useCurrentFrame();
          const { fps } = useVideoConfig();
          const scale = spring({
            frame: frame - ch.delay,
            fps,
            config: { damping: 10 },
          });
          return (
            <div
              key={ch.name}
              style={{
                backgroundColor: COLORS.card,
                border: `2px solid ${ch.color}`,
                borderRadius: 20,
                padding: "30px 40px",
                textAlign: "center",
                transform: `scale(${Math.max(0, scale)})`,
                width: 280,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 10 }}>{ch.icon}</div>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 28,
                  fontWeight: 700,
                  color: ch.color,
                }}
              >
                {ch.name}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 16,
                  color: COLORS.textDim,
                  marginTop: 8,
                }}
              >
                bot_token + allow_from
              </div>
            </div>
          );
        })}
      </div>
      <FadeIn delay={70}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 24,
            color: COLORS.textMuted,
            textAlign: "center",
            marginTop: 30,
          }}
        >
          Your AI CEO communicates on the channels your team already uses
        </div>
      </FadeIn>
    </div>
  </AbsoluteFill>
);

const MemoryScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1200, textAlign: "center" }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 50,
          }}
        >
          Step 5: Memory Configuration
        </div>
      </FadeIn>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
        }}
      >
        <FadeIn delay={15}>
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `2px solid ${COLORS.secondary}`,
              borderRadius: 16,
              padding: "24px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.secondary,
              }}
            >
              Vector Search
            </div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 40,
                fontWeight: 800,
                color: COLORS.primary,
                marginTop: 8,
              }}
            >
              0.7
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 18,
                color: COLORS.textDim,
              }}
            >
              cosine similarity
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={30}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 36,
              color: COLORS.textDim,
            }}
          >
            +
          </div>
        </FadeIn>
        <FadeIn delay={40}>
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `2px solid ${COLORS.accent}`,
              borderRadius: 16,
              padding: "24px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.accent,
              }}
            >
              Keyword Search
            </div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 40,
                fontWeight: 800,
                color: COLORS.primary,
                marginTop: 8,
              }}
            >
              0.3
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 18,
                color: COLORS.textDim,
              }}
            >
              FTS5 + BM25
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={55}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 36,
              color: COLORS.textDim,
            }}
          >
            =
          </div>
        </FadeIn>
        <FadeIn delay={65}>
          <div
            style={{
              backgroundColor: COLORS.primary + "22",
              border: `2px solid ${COLORS.primary}`,
              borderRadius: 16,
              padding: "24px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.primary,
              }}
            >
              Hybrid Memory
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 18,
                color: COLORS.textMuted,
                marginTop: 8,
              }}
            >
              CEO never forgets
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  </AbsoluteFill>
);

const CronScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1200 }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 40,
          }}
        >
          Step 6: Cron Scheduling
        </div>
      </FadeIn>
      <StepCard
        step={1}
        title="Morning Briefing"
        description='Every day at 8 AM — "0 8 * * *" — Summarize overnight messages'
        delay={15}
        icon="🌅"
      />
      <StepCard
        step={2}
        title="Weekly Report"
        description='Friday 5 PM — "0 17 * * 5" — Compile project status report'
        delay={35}
        icon="📊"
      />
      <StepCard
        step={3}
        title="System Health"
        description='Every 30 min — "*/30 * * * *" — Check system & report issues'
        delay={55}
        icon="🏥"
      />
      <FadeIn delay={80}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 20,
            color: COLORS.textDim,
            marginTop: 20,
            textAlign: "center",
          }}
        >
          All tasks persist in JSON and survive restarts
        </div>
      </FadeIn>
    </div>
  </AbsoluteFill>
);

const DaemonScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1200 }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 40,
          }}
        >
          Step 7: Launch the Daemon
        </div>
      </FadeIn>
      <div
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: 40,
          border: `1px solid ${COLORS.cardBorder}`,
          marginBottom: 30,
        }}
      >
        <TerminalLine text="nullclaw daemon" delay={10} />
        <TerminalLine
          text="nullclaw service install"
          delay={40}
        />
        <TerminalLine
          text="nullclaw service start"
          delay={65}
        />
      </div>
      <FadeIn delay={85}>
        <div
          style={{
            display: "flex",
            gap: 30,
            justifyContent: "center",
          }}
        >
          {[
            { label: "24/7 Operation", icon: "🔄" },
            { label: "Survives Reboots", icon: "💪" },
            { label: "Auto-Restart", icon: "♻️" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.primary}33`,
                borderRadius: 12,
                padding: "16px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 20,
                  color: COLORS.textMuted,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  </AbsoluteFill>
);

const VerifyScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1200 }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 40,
          }}
        >
          Step 8: Verify Everything
        </div>
      </FadeIn>
      <div
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: 40,
          border: `1px solid ${COLORS.cardBorder}`,
        }}
      >
        <TerminalLine text="nullclaw doctor" delay={10} />
        <FadeIn delay={35}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 22,
              color: COLORS.success,
              marginTop: 10,
              marginBottom: 20,
              marginLeft: 28,
            }}
          >
            ✓ Provider connected &nbsp; ✓ Channels active &nbsp; ✓ Memory
            initialized
            <br />✓ Cron scheduled &nbsp; ✓ Daemon running &nbsp; ✓ Service
            registered
          </div>
        </FadeIn>
        <TerminalLine
          text="nullclaw service status"
          delay={60}
        />
        <FadeIn delay={80}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 22,
              color: COLORS.primary,
              marginLeft: 28,
              marginTop: 10,
            }}
          >
            Status: <span style={{ color: COLORS.success }}>RUNNING</span>{" "}
            &nbsp;|&nbsp; Uptime: 0d 0h 2m &nbsp;|&nbsp; RAM: 0.9 MB
          </div>
        </FadeIn>
      </div>
    </div>
  </AbsoluteFill>
);

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 52,
            fontWeight: 800,
            color: COLORS.success,
            transform: `scale(${scale})`,
            marginBottom: 20,
          }}
        >
          Your AI CEO is Live! ✅
        </div>
        <FadeIn delay={20}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 28,
              color: COLORS.textMuted,
              lineHeight: 1.8,
            }}
          >
            Daemon running 24/7 &nbsp;•&nbsp; Cron tasks scheduled
            <br />
            Channels connected &nbsp;•&nbsp; Memory active
          </div>
        </FadeIn>
        <FadeIn delay={50}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 32,
              color: COLORS.primary,
              marginTop: 40,
            }}
          >
            Next: Add Claw-Empire for full orchestration →
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ---- MAIN COMPOSITION ----

export const CeoNullclawAdvanced: React.FC = () => {
  const sceneDuration = 7 * FPS; // 7 seconds per scene

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={0} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-01-intro.mp3")}
        />
        <TitleScene />
      </Sequence>
      <Sequence from={sceneDuration} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-02-install.mp3")}
        />
        <InstallScene />
      </Sequence>
      <Sequence from={sceneDuration * 2} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-03-onboard.mp3")}
        />
        <OnboardScene />
      </Sequence>
      <Sequence from={sceneDuration * 3} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-04-config.mp3")}
        />
        <ConfigScene />
      </Sequence>
      <Sequence from={sceneDuration * 4} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile(
            "audio/ceo-nullclaw-advanced/ceo-a-05-channels.mp3"
          )}
        />
        <ChannelsScene />
      </Sequence>
      <Sequence from={sceneDuration * 5} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-06-memory.mp3")}
        />
        <MemoryScene />
      </Sequence>
      <Sequence from={sceneDuration * 6} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-07-cron.mp3")}
        />
        <CronScene />
      </Sequence>
      <Sequence from={sceneDuration * 7} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-08-daemon.mp3")}
        />
        <DaemonScene />
      </Sequence>
      <Sequence from={sceneDuration * 8} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-09-verify.mp3")}
        />
        <VerifyScene />
      </Sequence>
      <Sequence from={sceneDuration * 9} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-nullclaw-advanced/ceo-a-10-outro.mp3")}
        />
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
