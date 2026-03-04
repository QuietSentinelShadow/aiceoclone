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
import audioDurations from "../audio-durations.json";

const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame - delay, [0, 20], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
  );
};

const PopIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10 },
  });
  if (frame < delay) return null;
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
      {children}
    </div>
  );
};

const DeptCard: React.FC<{
  name: string;
  icon: string;
  color: string;
  delay?: number;
}> = ({ name, icon, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12 },
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        backgroundColor: COLORS.card,
        border: `2px solid ${color}`,
        borderRadius: 16,
        padding: "20px 24px",
        textAlign: "center",
        transform: `scale(${scale})`,
        width: 200,
        boxShadow: `0 4px 20px ${color}22`,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 18,
          fontWeight: 700,
          color,
        }}
      >
        {name}
      </div>
    </div>
  );
};

const PackRow: React.FC<{
  name: string;
  departments: string;
  delay?: number;
  color?: string;
}> = ({ name, departments, delay = 0, color = COLORS.primary }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame - delay, [0, 15], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        marginBottom: 16,
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 22,
          fontWeight: 700,
          color,
          minWidth: 240,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 20,
          color: COLORS.textMuted,
        }}
      >
        {departments}
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
            fontSize: 60,
            fontWeight: 800,
            color: COLORS.accent,
            transform: `scale(${titleScale})`,
            textShadow: `0 0 40px ${COLORS.accent}55`,
            marginBottom: 16,
          }}
        >
          Claw-Empire
        </div>
        <FadeIn delay={15}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 36,
              color: COLORS.text,
            }}
          >
            + NullClaw = Your AI Company
          </div>
        </FadeIn>
        <FadeIn delay={35}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: COLORS.textMuted,
              marginTop: 20,
            }}
          >
            Virtual AI agent office simulator with CEO orchestration
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

const WhatScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ textAlign: "center", maxWidth: 1200 }}>
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
          What is Claw-Empire?
        </div>
      </FadeIn>
      <div
        style={{
          display: "flex",
          gap: 30,
          justifyContent: "center",
        }}
      >
        <PopIn delay={15}>
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.primary}44`,
              borderRadius: 20,
              padding: 30,
              width: 320,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>👔</div>
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.primary,
                marginBottom: 8,
              }}
            >
              You are the CEO
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 18,
                color: COLORS.textMuted,
              }}
            >
              Send directives, approve work, track KPIs
            </div>
          </div>
        </PopIn>
        <PopIn delay={30}>
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.secondary}44`,
              borderRadius: 20,
              padding: 30,
              width: 320,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.secondary,
                marginBottom: 8,
              }}
            >
              AI Agents = Employees
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 18,
                color: COLORS.textMuted,
              }}
            >
              Work in departments, complete tasks, level up
            </div>
          </div>
        </PopIn>
        <PopIn delay={45}>
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.accent}44`,
              borderRadius: 20,
              padding: 30,
              width: 320,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.accent,
                marginBottom: 8,
              }}
            >
              Pixel-Art Office
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 18,
                color: COLORS.textMuted,
              }}
            >
              Real-time visualization of your AI company
            </div>
          </div>
        </PopIn>
      </div>
    </div>
  </AbsoluteFill>
);

const SetupScene: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    <div style={{ width: "100%", maxWidth: 1100 }}>
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
          Setup Claw-Empire
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
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#ffbd2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#28c840" }} />
        </div>
        {[
          { text: "# Prerequisites: Node.js 22+, pnpm, git", delay: 10, color: COLORS.textDim, prompt: "#" },
          { text: "git clone https://github.com/GreenSheep01201/claw-empire.git", delay: 25 },
          { text: "cd claw-empire && bash install.sh", delay: 50 },
          { text: "cp .env.example .env && nano .env", delay: 70 },
          { text: "pnpm dev", delay: 90 },
        ].map((line, i) => {
          const frame = useCurrentFrame();
          const charsVisible = Math.max(0, Math.floor((frame - line.delay) / 1.5));
          if (frame < line.delay) return null;
          const displayed = line.text.slice(0, charsVisible);
          return (
            <div
              key={i}
              style={{
                fontFamily: FONTS.mono,
                fontSize: 24,
                color: COLORS.text,
                marginBottom: 10,
              }}
            >
              <span style={{ color: line.color || COLORS.success }}>
                {line.prompt || "$"}{" "}
              </span>
              {displayed}
              {charsVisible < line.text.length && (
                <span
                  style={{
                    backgroundColor: COLORS.primary,
                    width: 10,
                    height: 24,
                    display: "inline-block",
                    marginLeft: 2,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  </AbsoluteFill>
);

const DirectivesScene: React.FC = () => (
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
            marginBottom: 16,
          }}
        >
          CEO Directives
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 24,
            color: COLORS.textMuted,
            marginBottom: 40,
          }}
        >
          Use the <span style={{ color: COLORS.accent, fontWeight: 700 }}>$</span> prefix to command your AI company
        </div>
      </FadeIn>
      {[
        { cmd: "$ prioritize the authentication refactor", delay: 20, desc: "Routes to Development department" },
        { cmd: "$ schedule team standup for tomorrow 9am", delay: 40, desc: "Creates meeting with all leads" },
        { cmd: "$ generate weekly performance report", delay: 60, desc: "Compiles KPIs and agent rankings" },
      ].map((item, i) => (
        <FadeIn key={i} delay={item.delay}>
          <div
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.accent}33`,
              borderRadius: 12,
              padding: "16px 24px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 24,
                color: COLORS.accent,
                marginBottom: 4,
              }}
            >
              {item.cmd}
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 18,
                color: COLORS.textDim,
              }}
            >
              → {item.desc}
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  </AbsoluteFill>
);

const OfficePacksScene: React.FC = () => (
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
          Office Packs
        </div>
      </FadeIn>
      <PackRow
        name="💻 development"
        departments="Planning → Dev → Design → QA → DevSecOps → Ops"
        delay={15}
        color={COLORS.primary}
      />
      <PackRow
        name="📝 report"
        departments="Editorial → Research → Design → Review"
        delay={30}
        color={COLORS.secondary}
      />
      <PackRow
        name="🔍 web_research"
        departments="Research Strategy → Crawler → Fact Check"
        delay={45}
        color={COLORS.success}
      />
      <PackRow
        name="📖 novel"
        departments="Worldbuilding → Narrative → Character Art → Tone QA"
        delay={60}
        color={COLORS.accent}
      />
      <PackRow
        name="🎬 video_preprod"
        departments="Pre-production → Scene → Art & Camera → Cut QA"
        delay={75}
        color="#e91e63"
      />
      <PackRow
        name="🎭 roleplay"
        departments="Character Planning → Dialogue → Stage Art → QA"
        delay={90}
        color="#9c27b0"
      />
    </div>
  </AbsoluteFill>
);

const DashboardScene: React.FC = () => (
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
          Real-Time Dashboard
        </div>
      </FadeIn>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { icon: "🏢", label: "Pixel-Art Office", desc: "Animated agents at desks", color: COLORS.primary, delay: 15 },
          { icon: "📋", label: "Kanban Board", desc: "Drag-and-drop task flow", color: COLORS.secondary, delay: 25 },
          { icon: "📊", label: "KPI Dashboard", desc: "Metrics & agent rankings", color: COLORS.accent, delay: 35 },
          { icon: "⭐", label: "XP System", desc: "Agents level up from tasks", color: COLORS.success, delay: 45 },
          { icon: "🛠️", label: "600+ Skills", desc: "Categorized skill library", color: "#e91e63", delay: 55 },
          { icon: "📝", label: "Meeting Minutes", desc: "AI-generated summaries", color: "#9c27b0", delay: 65 },
        ].map((item) => (
          <PopIn key={item.label} delay={item.delay}>
            <div
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${item.color}33`,
                borderRadius: 16,
                padding: "20px 24px",
                width: 320,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 22,
                  fontWeight: 700,
                  color: item.color,
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 16,
                  color: COLORS.textDim,
                }}
              >
                {item.desc}
              </div>
            </div>
          </PopIn>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

const MessengerScene: React.FC = () => (
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
          Messenger Integration
        </div>
      </FadeIn>
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          { name: "Telegram", color: "#0088cc", delay: 10 },
          { name: "Discord", color: "#5865F2", delay: 20 },
          { name: "Slack", color: "#4A154B", delay: 30 },
          { name: "WhatsApp", color: "#25D366", delay: 40 },
          { name: "Google Chat", color: "#1a73e8", delay: 50 },
          { name: "Signal", color: "#3a76f0", delay: 60 },
          { name: "iMessage", color: "#34c759", delay: 70 },
        ].map((ch) => (
          <PopIn key={ch.name} delay={ch.delay}>
            <div
              style={{
                backgroundColor: ch.color + "22",
                border: `2px solid ${ch.color}`,
                borderRadius: 12,
                padding: "12px 24px",
                fontFamily: FONTS.heading,
                fontSize: 20,
                fontWeight: 600,
                color: ch.color,
              }}
            >
              {ch.name}
            </div>
          </PopIn>
        ))}
      </div>
      <FadeIn delay={80}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            color: COLORS.textDim,
            marginTop: 30,
          }}
        >
          AES-256-GCM encrypted tokens • Sessions persist in SQLite
        </div>
      </FadeIn>
    </div>
  </AbsoluteFill>
);

const WorkflowScene: React.FC = () => {
  const steps = [
    { label: "CEO Directive", icon: "👔", color: COLORS.accent },
    { label: "Route to Dept", icon: "🔀", color: COLORS.secondary },
    { label: "Break into Tasks", icon: "📋", color: COLORS.primary },
    { label: "Agents Execute", icon: "🤖", color: COLORS.success },
    { label: "CEO Approves", icon: "✅", color: COLORS.accent },
  ];

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
      <div style={{ textAlign: "center", width: "100%", maxWidth: 1400 }}>
        <FadeIn>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 60,
            }}
          >
            The Full Workflow
          </div>
        </FadeIn>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <PopIn delay={15 + i * 15}>
                <div
                  style={{
                    backgroundColor: COLORS.card,
                    border: `2px solid ${step.color}`,
                    borderRadius: 16,
                    padding: "20px 24px",
                    textAlign: "center",
                    width: 180,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>
                    {step.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 17,
                      fontWeight: 700,
                      color: step.color,
                    }}
                  >
                    {step.label}
                  </div>
                </div>
              </PopIn>
              {i < steps.length - 1 && (
                <FadeIn delay={25 + i * 15}>
                  <div
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 28,
                      color: COLORS.textDim,
                    }}
                  >
                    →
                  </div>
                </FadeIn>
              )}
            </React.Fragment>
          ))}
        </div>
        <FadeIn delay={100}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 22,
              color: COLORS.textMuted,
              marginTop: 40,
            }}
          >
            Agents work in isolated git branches • Merged only on CEO approval
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

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
            color: COLORS.primary,
            transform: `scale(${scale})`,
            textShadow: `0 0 40px ${COLORS.primary}55`,
            marginBottom: 20,
          }}
        >
          The Complete AI CEO Stack
        </div>
        <FadeIn delay={20}>
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              marginTop: 30,
            }}
          >
            <div
              style={{
                backgroundColor: COLORS.primary + "22",
                border: `2px solid ${COLORS.primary}`,
                borderRadius: 12,
                padding: "16px 32px",
                fontFamily: FONTS.heading,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.primary,
              }}
            >
              NullClaw (Runtime)
            </div>
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 28,
                color: COLORS.textDim,
                display: "flex",
                alignItems: "center",
              }}
            >
              +
            </div>
            <div
              style={{
                backgroundColor: COLORS.accent + "22",
                border: `2px solid ${COLORS.accent}`,
                borderRadius: 12,
                padding: "16px 32px",
                fontFamily: FONTS.heading,
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.accent,
              }}
            >
              Claw-Empire (Orchestration)
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={50}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: COLORS.textMuted,
              marginTop: 40,
            }}
          >
            github.com/nullclaw/nullclaw
            <br />
            github.com/GreenSheep01201/claw-empire
          </div>
        </FadeIn>
        <FadeIn delay={70}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 28,
              color: COLORS.success,
              marginTop: 30,
            }}
          >
            Your fully autonomous AI company awaits!
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ---- MAIN COMPOSITION ----

export const CeoClawEmpire: React.FC = () => {
  const d = audioDurations.durations["ceo-claw-empire"] as Record<string, { durationFrames: number }>;
  const scenes = [
    { key: "ceo-e-01-intro", Scene: TitleScene },
    { key: "ceo-e-02-what", Scene: WhatScene },
    { key: "ceo-e-03-install", Scene: SetupScene },
    { key: "ceo-e-04-setup", Scene: DirectivesScene },
    { key: "ceo-e-05-directives", Scene: OfficePacksScene },
    { key: "ceo-e-06-packs", Scene: DashboardScene },
    { key: "ceo-e-07-features", Scene: MessengerScene },
    { key: "ceo-e-08-messenger", Scene: WorkflowScene },
    { key: "ceo-e-09-workflow", Scene: OutroScene },
    { key: "ceo-e-10-outro", Scene: OutroScene },
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {scenes.map(({ key, Scene }, index) => {
        const frames = d[key]?.durationFrames ?? 300;
        const from = offset;
        offset += frames;
        return (
          <Sequence key={key} from={from} durationInFrames={frames}>
            <Audio src={staticFile(`audio/ceo-claw-empire/${key}.mp3`)} />
            <Scene />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
