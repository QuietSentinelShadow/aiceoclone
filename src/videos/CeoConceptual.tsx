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

// --- SHARED COMPONENTS ---

const Section: React.FC<{
  children: React.ReactNode;
  bg?: string;
}> = ({ children, bg = COLORS.bg }) => (
  <AbsoluteFill
    style={{
      backgroundColor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
    }}
  >
    {children}
  </AbsoluteFill>
);

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
  const y = interpolate(frame - delay, [0, duration], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
  );
};

const GlowCard: React.FC<{
  emoji: string;
  title: string;
  description: string;
  delay?: number;
  glowColor?: string;
}> = ({
  emoji,
  title,
  description,
  delay = 0,
  glowColor = COLORS.primary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        width: 460,
        padding: "40px 32px",
        backgroundColor: COLORS.card,
        borderRadius: 20,
        border: `1px solid ${COLORS.cardBorder}`,
        boxShadow: `0 0 30px ${glowColor}22, 0 8px 32px rgba(0,0,0,0.4)`,
        transform: `scale(${scale})`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>{emoji}</div>
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 30,
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 22,
          color: COLORS.textMuted,
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
};

const NumberedItem: React.FC<{
  number: number;
  emoji: string;
  title: string;
  description: string;
  delay?: number;
  accentColor?: string;
}> = ({
  number,
  emoji,
  title,
  description,
  delay = 0,
  accentColor = COLORS.primary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-60, 0])}px)`,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONTS.heading,
          fontSize: 26,
          fontWeight: 800,
          color: "#fff",
          flexShrink: 0,
          boxShadow: `0 0 20px ${accentColor}44`,
        }}
      >
        {number}
      </div>
      <div style={{ fontSize: 40, flexShrink: 0 }}>{emoji}</div>
      <div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 4,
          }}
        >
          {title}
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

const FlowBox: React.FC<{
  label: string;
  sublabel?: string;
  delay?: number;
  color?: string;
  width?: number;
}> = ({
  label,
  sublabel,
  delay = 0,
  color = COLORS.primary,
  width = 280,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        width,
        padding: "28px 20px",
        backgroundColor: COLORS.card,
        borderRadius: 16,
        border: `2px solid ${color}`,
        boxShadow: `0 0 24px ${color}33`,
        textAlign: "center",
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: sublabel ? 8 : 0,
        }}
      >
        {label}
      </div>
      {sublabel && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 16,
            color: COLORS.textMuted,
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
};

const FlowArrow: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        fontSize: 40,
        color: COLORS.primary,
        opacity,
        display: "flex",
        alignItems: "center",
      }}
    >
      &#10132;
    </div>
  );
};

// --- SCENES ---

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emojiScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 80 },
  });

  const titleOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [15, 40], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [40, 80], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Section>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${COLORS.secondary}15 0%, ${COLORS.bg} 70%)`,
        }}
      />
      <div
        style={{
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 120,
            transform: `scale(${emojiScale})`,
            marginBottom: 30,
          }}
        >
          🤔
        </div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.text,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 16,
          }}
        >
          What is an{" "}
          <span
            style={{
              color: COLORS.primary,
              textShadow: `0 0 40px ${COLORS.primary}55`,
            }}
          >
            AI CEO Clone
          </span>
          ?
        </div>
        <div
          style={{
            width: lineWidth,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
            margin: "0 auto",
            marginBottom: 24,
          }}
        />
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 36,
            color: COLORS.textMuted,
            opacity: subtitleOpacity,
            letterSpacing: 1,
          }}
        >
          The Future of Autonomous Leadership
        </div>
      </div>
    </Section>
  );
};

const DefinitionScene: React.FC = () => {
  return (
    <Section bg={COLORS.bg}>
      <div
        style={{
          textAlign: "center",
          width: "100%",
        }}
      >
        <FadeIn delay={0}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 48,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 16,
            }}
          >
            An{" "}
            <span style={{ color: COLORS.primary }}>AI CEO Clone</span> is...
          </div>
        </FadeIn>
        <FadeIn delay={15}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 28,
              color: COLORS.textMuted,
              marginBottom: 50,
            }}
          >
            A digital executive that runs your business autonomously
          </div>
        </FadeIn>
        <div
          style={{
            display: "flex",
            gap: 36,
            justifyContent: "center",
          }}
        >
          <GlowCard
            emoji="🤖"
            title="Autonomous Agent"
            description="Operates independently on your behalf"
            delay={40}
            glowColor={COLORS.primary}
          />
          <GlowCard
            emoji="📊"
            title="Decision Maker"
            description="Monitors, analyzes, and acts"
            delay={70}
            glowColor={COLORS.secondary}
          />
          <GlowCard
            emoji="💬"
            title="Communicator"
            description="Manages team interactions 24/7"
            delay={100}
            glowColor={COLORS.accent}
          />
        </div>
      </div>
    </Section>
  );
};

const WhyNullClawScene: React.FC = () => {
  return (
    <Section bg="#0a0a1a">
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <FadeIn delay={0}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 56,
              fontWeight: 800,
              color: COLORS.text,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Why{" "}
            <span
              style={{
                color: COLORS.primary,
                textShadow: `0 0 30px ${COLORS.primary}44`,
              }}
            >
              NullClaw
            </span>
            ?
          </div>
        </FadeIn>
        <FadeIn delay={10}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 26,
              color: COLORS.textMuted,
              textAlign: "center",
              marginBottom: 50,
            }}
          >
            Built from the ground up for autonomous CEO operations
          </div>
        </FadeIn>
        <div style={{ paddingLeft: 120 }}>
          <NumberedItem
            number={1}
            emoji="🌙"
            title="Always On"
            description="Daemon mode, 1MB RAM, never stops"
            delay={35}
            accentColor={COLORS.primary}
          />
          <NumberedItem
            number={2}
            emoji="🕐"
            title="Built-in Scheduling"
            description="Cron system for recurring CEO tasks"
            delay={70}
            accentColor={COLORS.secondary}
          />
          <NumberedItem
            number={3}
            emoji="🧠"
            title="Persistent Memory"
            description="Hybrid search remembers all context"
            delay={105}
            accentColor={COLORS.accent}
          />
        </div>
      </div>
    </Section>
  );
};

const HowItWorksScene: React.FC = () => {
  const frame = useCurrentFrame();

  const diagramTitleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Section bg={COLORS.bg}>
      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 52,
            fontWeight: 800,
            color: COLORS.text,
            marginBottom: 60,
            opacity: diagramTitleOpacity,
          }}
        >
          How It{" "}
          <span style={{ color: COLORS.primary }}>Works</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <FlowBox
            label="Messages In"
            sublabel="Email, Slack, Telegram"
            delay={25}
            color={COLORS.accent}
            width={260}
          />
          <FlowArrow delay={45} />
          <FlowBox
            label="NullClaw"
            sublabel="AI Provider"
            delay={55}
            color={COLORS.primary}
            width={260}
          />
          <FlowArrow delay={75} />
          <FlowBox
            label="Process & Decide"
            sublabel="Analyze context"
            delay={85}
            color={COLORS.secondary}
            width={260}
          />
          <FlowArrow delay={105} />
          <FlowBox
            label="Take Action"
            sublabel="Reply, delegate, schedule"
            delay={115}
            color={COLORS.success}
            width={260}
          />
        </div>
        <FadeIn delay={140}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: COLORS.textMuted,
              marginTop: 50,
              letterSpacing: 0.5,
            }}
          >
            Continuous loop &mdash; no human intervention required
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const UseCasesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const useCases = [
    "Email triage & auto-response",
    "Meeting scheduling & follow-ups",
    "Task delegation via Slack/Telegram",
    "Daily status report generation",
    "System health monitoring",
    "Customer inquiry routing",
  ];

  const staggerDelay = 25;

  return (
    <Section bg="#0a0a1a">
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <FadeIn delay={0}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.text,
              textAlign: "center",
              marginBottom: 50,
            }}
          >
            CEO{" "}
            <span style={{ color: COLORS.accent }}>Use Cases</span>
          </div>
        </FadeIn>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px 60px",
            paddingLeft: 80,
          }}
        >
          {useCases.map((useCase, index) => {
            const itemDelay = 20 + index * staggerDelay;
            const itemOpacity = interpolate(
              frame - itemDelay,
              [0, 18],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            const itemX = interpolate(
              frame - itemDelay,
              [0, 18],
              [40, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: COLORS.primary,
                    flexShrink: 0,
                    boxShadow: `0 0 12px ${COLORS.primary}66`,
                  }}
                />
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 30,
                    color: COLORS.text,
                    lineHeight: 1.6,
                  }}
                >
                  {useCase}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrowX = interpolate(frame, [60, 200], [0, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const arrowLoop = Math.sin(frame / 12) * 8;

  const ctaScale = spring({
    frame,
    fps,
    config: { damping: 10 },
  });

  return (
    <Section>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${COLORS.primary}12 0%, ${COLORS.bg} 70%)`,
        }}
      />
      <div
        style={{
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 80,
            transform: `scale(${ctaScale})`,
            marginBottom: 30,
          }}
        >
          🚀
        </div>
        <FadeIn delay={15}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 56,
              fontWeight: 800,
              color: COLORS.text,
              marginBottom: 20,
            }}
          >
            Next:{" "}
            <span style={{ color: COLORS.primary }}>
              Step-by-step setup
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={35}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 30,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 60,
                color: COLORS.primary,
                transform: `translateX(${arrowX + arrowLoop}px)`,
                textShadow: `0 0 30px ${COLORS.primary}66`,
              }}
            >
              &#10132;
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={55}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 36,
              color: COLORS.textMuted,
              marginTop: 10,
            }}
          >
            Let's build your{" "}
            <span
              style={{
                color: COLORS.accent,
                fontWeight: 700,
              }}
            >
              AI CEO
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={75}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: COLORS.textMuted,
              marginTop: 40,
              opacity: 0.6,
            }}
          >
            Powered by NullClaw
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

// --- MAIN COMPOSITION ---

export const CeoConceptual: React.FC = () => {
  const sceneDuration = 250;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Title */}
      <Sequence from={0} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/ceo-conceptual/ceo-c-01-intro.mp3")} />
        <TitleScene />
      </Sequence>

      {/* Scene 2: Definition */}
      <Sequence from={sceneDuration} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-conceptual/ceo-c-02-definition.mp3")}
        />
        <DefinitionScene />
      </Sequence>

      {/* Scene 3: Why NullClaw */}
      <Sequence from={sceneDuration * 2} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-conceptual/ceo-c-03-why-nullclaw.mp3")}
        />
        <WhyNullClawScene />
      </Sequence>

      {/* Scene 4: How It Works */}
      <Sequence from={sceneDuration * 3} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-conceptual/ceo-c-04-how-it-works.mp3")}
        />
        <HowItWorksScene />
      </Sequence>

      {/* Scene 5: Use Cases */}
      <Sequence from={sceneDuration * 4} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/ceo-conceptual/ceo-c-05-use-cases.mp3")}
        />
        <UseCasesScene />
      </Sequence>

      {/* Scene 6: Outro */}
      <Sequence from={sceneDuration * 5} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/ceo-conceptual/ceo-c-06-outro.mp3")} />
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
