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

// --- HELPER COMPONENTS ---

const Section: React.FC<{
  children: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties;
}> = ({ children, bg = COLORS.bg, style = {} }) => (
  <AbsoluteFill
    style={{
      backgroundColor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

const SlamIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  damping?: number;
  mass?: number;
}> = ({ children, delay = 0, damping = 6, mass = 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping, mass },
    from: 3,
    to: 1,
  });
  const opacity = interpolate(frame - delay, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;
  return (
    <div style={{ transform: `scale(${scale})`, opacity }}>{children}</div>
  );
};

const SlideUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}> = ({ children, delay = 0, distance = 200 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.6 },
  });
  const y = interpolate(progress, [0, 1], [distance, 0]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;
  return (
    <div style={{ transform: `translateY(${y}px)`, opacity }}>{children}</div>
  );
};

const SlideIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  from?: "left" | "right" | "top" | "bottom";
  distance?: number;
}> = ({ children, delay = 0, from = "left", distance = 400 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, mass: 0.5 },
  });
  const dirs: Record<string, [string, number]> = {
    left: ["translateX", -distance],
    right: ["translateX", distance],
    top: ["translateY", -distance],
    bottom: ["translateY", distance],
  };
  const [transform, start] = dirs[from];
  const val = interpolate(progress, [0, 1], [start, 0]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;
  return (
    <div style={{ transform: `${transform}(${val}px)`, opacity }}>
      {children}
    </div>
  );
};

const Pulse: React.FC<{
  children: React.ReactNode;
  speed?: number;
  intensity?: number;
}> = ({ children, speed = 0.15, intensity = 0.08 }) => {
  const frame = useCurrentFrame();
  const scale = 1 + Math.sin(frame * speed) * intensity;
  return <div style={{ transform: `scale(${scale})` }}>{children}</div>;
};

const Shake: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 20 }) => {
  const frame = useCurrentFrame();
  const active = frame >= delay && frame < delay + duration;
  const intensity = active
    ? interpolate(frame - delay, [0, duration], [8, 0], {
        extrapolateRight: "clamp",
      })
    : 0;
  const x = active ? Math.sin((frame - delay) * 3) * intensity : 0;
  const y = active ? Math.cos((frame - delay) * 4) * intensity * 0.5 : 0;
  return (
    <div style={{ transform: `translate(${x}px, ${y}px)` }}>{children}</div>
  );
};

const GlowText: React.FC<{
  children: React.ReactNode;
  color: string;
  fontSize: number;
  fontWeight?: number;
  style?: React.CSSProperties;
}> = ({ children, color, fontSize, fontWeight = 900, style = {} }) => (
  <div
    style={{
      fontFamily: FONTS.heading,
      fontSize,
      fontWeight,
      color,
      textShadow: `0 0 20px ${color}88, 0 0 60px ${color}44, 0 0 100px ${color}22`,
      ...style,
    }}
  >
    {children}
  </div>
);

const ChannelBox: React.FC<{
  label: string;
  color: string;
  delay?: number;
  from?: "left" | "right" | "top" | "bottom";
}> = ({ label, color, delay = 0, from = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 7, mass: 0.6 },
  });
  if (frame < delay) return null;
  return (
    <div
      style={{
        padding: "18px 36px",
        backgroundColor: color,
        borderRadius: 16,
        fontFamily: FONTS.heading,
        fontSize: 32,
        fontWeight: 800,
        color: "#ffffff",
        transform: `scale(${scale})`,
        boxShadow: `0 4px 30px ${color}66, 0 0 60px ${color}33`,
        textTransform: "uppercase",
        letterSpacing: 2,
      }}
    >
      {label}
    </div>
  );
};

// --- SCENE 1: HOOK ---

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainScale = spring({
    frame,
    fps,
    config: { damping: 5, mass: 1.2 },
    from: 3,
    to: 1,
  });

  const glowOpacity = interpolate(frame, [0, 15, 30], [0, 1, 0.7], {
    extrapolateRight: "clamp",
  });

  return (
    <Section>
      {/* Cyan glow background circle */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}22 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <Shake delay={0} duration={15}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 140,
              fontWeight: 900,
              color: COLORS.primary,
              transform: `scale(${mainScale})`,
              textShadow: `0 0 40px ${COLORS.primary}88, 0 0 80px ${COLORS.primary}44`,
              letterSpacing: -4,
            }}
          >
            678 KB
          </div>
        </Shake>

        <SlideUp delay={25} distance={300}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 56,
              fontWeight: 800,
              color: COLORS.text,
              marginTop: 20,
            }}
          >
            SMALLER than a{" "}
            <span
              style={{
                color: COLORS.accent,
                textShadow: `0 0 20px ${COLORS.accent}66`,
              }}
            >
              JPEG
            </span>
          </div>
        </SlideUp>

        <SlideUp delay={50}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 32,
              color: COLORS.textMuted,
              marginTop: 24,
            }}
          >
            This is an entire AI assistant.
          </div>
        </SlideUp>
      </div>
    </Section>
  );
};

// --- SCENE 2: SPEED ---

const SpeedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainScale = spring({
    frame,
    fps,
    config: { damping: 5, mass: 0.8 },
    from: 0.2,
    to: 1,
  });

  const spinnerRotation = frame * 8;

  return (
    <Section>
      {/* Purple glow */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.secondary}18 0%, transparent 60%)`,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <Shake delay={0} duration={25}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 120,
              fontWeight: 900,
              color: COLORS.primary,
              transform: `scale(${mainScale})`,
              textShadow: `0 0 40px ${COLORS.primary}88, 0 0 80px ${COLORS.primary}44`,
              letterSpacing: -3,
            }}
          >
            2 MILLISECONDS
          </div>
        </Shake>

        <SlideUp delay={40}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 36,
              color: COLORS.textMuted,
              marginTop: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <span>While</span>
            <span
              style={{
                color: COLORS.openclaw,
                fontWeight: 700,
                fontFamily: FONTS.heading,
              }}
            >
              OpenClaw
            </span>
            <span>is still loading...</span>
            <span
              style={{
                display: "inline-block",
                transform: `rotate(${spinnerRotation}deg)`,
                fontSize: 40,
              }}
            >
              {"\u23F3"}
            </span>
          </div>
        </SlideUp>
      </div>
    </Section>
  );
};

// --- SCENE 3: DOLLAR ---

const DollarScene: React.FC = () => {
  const frame = useCurrentFrame();

  const bgGlow = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.05, 0.15],
  );

  return (
    <Section>
      {/* Orange glow background */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}${Math.round(bgGlow * 255).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <SlamIn delay={0} damping={5} mass={1}>
          <GlowText color={COLORS.accent} fontSize={140} style={{ letterSpacing: -4 }}>
            $5 BOARD
          </GlowText>
        </SlamIn>

        <SlideIn delay={30} from="right" distance={600}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.text,
              marginTop: 40,
              lineHeight: 1.4,
            }}
          >
            Run your own AI assistant on
            <br />
            something{" "}
            <span style={{ color: COLORS.accent }}>cheaper than coffee</span>
          </div>
        </SlideIn>

        <SlideUp delay={60}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 30,
              color: COLORS.textMuted,
              marginTop: 20,
            }}
          >
            {"No cloud. No subscription. Just yours."}
          </div>
        </SlideUp>
      </div>
    </Section>
  );
};

// --- SCENE 4: CHANNELS ---

const ChannelsScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Section>
      {/* Multi-color glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}15 0%, ${COLORS.secondary}10 40%, transparent 70%)`,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <SlamIn delay={0} damping={4} mass={1.2}>
          <GlowText color={COLORS.primary} fontSize={120} style={{ letterSpacing: -2 }}>
            18 CHANNELS
          </GlowText>
        </SlamIn>

        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 60,
            maxWidth: 1200,
          }}
        >
          <SlideIn delay={25} from="left" distance={500}>
            <ChannelBox label="Telegram" color="#0088cc" delay={25} from="left" />
          </SlideIn>
          <SlideIn delay={35} from="top" distance={500}>
            <ChannelBox label="Discord" color="#5865F2" delay={35} from="top" />
          </SlideIn>
          <SlideIn delay={45} from="bottom" distance={500}>
            <ChannelBox label="Slack" color="#4A154B" delay={45} from="bottom" />
          </SlideIn>
          <SlideIn delay={55} from="right" distance={500}>
            <ChannelBox label="WhatsApp" color="#25D366" delay={55} from="right" />
          </SlideIn>
          <SlideIn delay={65} from="top" distance={500}>
            <ChannelBox label="Signal" color="#3A76F0" delay={65} from="top" />
          </SlideIn>
        </div>

        <SlideUp delay={85}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 28,
              color: COLORS.textMuted,
              marginTop: 40,
            }}
          >
            + 13 more platforms. One bot to rule them all.
          </div>
        </SlideUp>
      </div>
    </Section>
  );
};

// --- SCENE 5: NUMBERS (COMPARISON) ---

const NumbersScene: React.FC = () => {
  const frame = useCurrentFrame();

  const pulseGlow = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [0.6, 1],
  );

  return (
    <Section>
      <div style={{ textAlign: "center", zIndex: 1, width: "100%" }}>
        <SlamIn delay={0} damping={6}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 48,
              fontWeight: 800,
              color: COLORS.text,
              marginBottom: 60,
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            Size Comparison
          </div>
        </SlamIn>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 80,
          }}
        >
          {/* OpenClaw side */}
          <SlamIn delay={10} damping={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 36,
                  fontWeight: 700,
                  color: COLORS.openclaw,
                  marginBottom: 20,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                }}
              >
                OpenClaw
              </div>
              <GlowText
                color={COLORS.openclaw}
                fontSize={100}
                style={{ lineHeight: 1 }}
              >
                1 GB
              </GlowText>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 24,
                  color: COLORS.textMuted,
                  marginTop: 16,
                }}
              >
                Heavy. Bloated.
              </div>
            </div>
          </SlamIn>

          {/* VS */}
          <SlamIn delay={25} damping={5} mass={1.5}>
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 64,
                fontWeight: 900,
                color: COLORS.secondary,
                textShadow: `0 0 30px ${COLORS.secondary}66`,
              }}
            >
              VS
            </div>
          </SlamIn>

          {/* NullClaw side */}
          <SlamIn delay={15} damping={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 36,
                  fontWeight: 700,
                  color: COLORS.nullclaw,
                  marginBottom: 20,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                }}
              >
                NullClaw
              </div>
              <GlowText
                color={COLORS.nullclaw}
                fontSize={130}
                style={{ lineHeight: 1 }}
              >
                1 MB
              </GlowText>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 24,
                  color: COLORS.textMuted,
                  marginTop: 16,
                }}
              >
                Lean. Lethal.
              </div>
            </div>
          </SlamIn>
        </div>

        {/* 1000x LESS pulsing text */}
        <SlamIn delay={50} damping={4} mass={1}>
          <Pulse speed={0.2} intensity={0.1}>
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 90,
                fontWeight: 900,
                color: COLORS.primary,
                marginTop: 50,
                textShadow: `0 0 30px ${COLORS.primary}${Math.round(pulseGlow * 255).toString(16).padStart(2, "0")}, 0 0 80px ${COLORS.primary}44`,
                letterSpacing: -2,
              }}
            >
              1000x LESS
            </div>
          </Pulse>
        </SlamIn>
      </div>
    </Section>
  );
};

// --- SCENE 6: CEO ---

const CeoScene: React.FC = () => {
  const frame = useCurrentFrame();

  const bullets = [
    { text: "Runs 24/7", delay: 30 },
    { text: "Makes Decisions", delay: 50 },
    { text: "Sends Messages", delay: 70 },
    { text: "FOR FREE", delay: 90 },
  ];

  return (
    <Section>
      {/* Warm glow */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}12 0%, ${COLORS.secondary}08 50%, transparent 70%)`,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <SlamIn delay={0} damping={5} mass={1}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 100,
              fontWeight: 900,
              color: COLORS.text,
              textShadow: `0 0 40px ${COLORS.accent}44`,
              letterSpacing: -2,
            }}
          >
            {"YOUR OWN AI CEO"}
          </div>
        </SlamIn>

        <SlamIn delay={10}>
          <div style={{ fontSize: 60, marginTop: 10 }}>
            {"\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25"}
          </div>
        </SlamIn>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            marginTop: 50,
          }}
        >
          {bullets.map((bullet, i) => (
            <SlamIn key={i} delay={bullet.delay} damping={8}>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: bullet.text === "FOR FREE" ? 56 : 44,
                  fontWeight: 800,
                  color:
                    bullet.text === "FOR FREE"
                      ? COLORS.primary
                      : COLORS.text,
                  textShadow:
                    bullet.text === "FOR FREE"
                      ? `0 0 30px ${COLORS.primary}66`
                      : "none",
                  padding: "4px 32px",
                  borderLeft:
                    bullet.text === "FOR FREE"
                      ? `6px solid ${COLORS.primary}`
                      : `4px solid ${COLORS.accent}`,
                  textAlign: "left",
                }}
              >
                {bullet.text}
              </div>
            </SlamIn>
          ))}
        </div>
      </div>
    </Section>
  );
};

// --- SCENE 7: CTA ---

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bounce = Math.sin(frame * 0.15) * 12;

  const linkScale = spring({
    frame,
    fps,
    config: { damping: 4, mass: 1.5 },
    from: 4,
    to: 1,
  });

  const arrowBounce = Math.sin(frame * 0.3) * 8;

  return (
    <Section>
      {/* Multi glow */}
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}15 0%, ${COLORS.accent}10 30%, ${COLORS.secondary}08 60%, transparent 80%)`,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <Shake delay={0} duration={20}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 110,
              fontWeight: 900,
              color: COLORS.primary,
              transform: `scale(${linkScale}) translateY(${bounce}px)`,
              textShadow: `0 0 40px ${COLORS.primary}88, 0 0 80px ${COLORS.primary}44, 0 0 120px ${COLORS.primary}22`,
              letterSpacing: -2,
            }}
          >
            LINK IN DESCRIPTION
          </div>
        </Shake>

        <SlideUp delay={30} distance={200}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.text,
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateX(${arrowBounce}px)`,
                fontSize: 50,
              }}
            >
              {"\uD83D\uDC49"}
            </span>
            Set this up{" "}
            <span
              style={{
                color: COLORS.accent,
                textShadow: `0 0 20px ${COLORS.accent}66`,
              }}
            >
              RIGHT NOW
            </span>
          </div>
        </SlideUp>

        <SlideUp delay={60} distance={150}>
          <Pulse speed={0.25} intensity={0.06}>
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 46,
                fontWeight: 800,
                color: COLORS.secondary,
                marginTop: 40,
                textShadow: `0 0 20px ${COLORS.secondary}44`,
              }}
            >
              Drop a comment! Let's GO!
            </div>
          </Pulse>
        </SlideUp>

        <SlideUp delay={80}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 28,
              color: COLORS.textMuted,
              marginTop: 30,
            }}
          >
            NullClaw - The AI that fits anywhere
          </div>
        </SlideUp>
      </div>
    </Section>
  );
};

// --- MAIN COMPOSITION ---

export const Influencer: React.FC = () => {
  const sceneDuration = 5 * FPS; // 150 frames = 5 seconds

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Hook */}
      <Sequence from={0} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/influencer/inf-01-hook.mp3")} />
        <HookScene />
      </Sequence>

      {/* Scene 2: Speed */}
      <Sequence from={sceneDuration} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/influencer/inf-02-speed.mp3")} />
        <SpeedScene />
      </Sequence>

      {/* Scene 3: Dollar */}
      <Sequence from={sceneDuration * 2} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/influencer/inf-03-board.mp3")} />
        <DollarScene />
      </Sequence>

      {/* Scene 4: Channels */}
      <Sequence from={sceneDuration * 3} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/influencer/inf-04-channels.mp3")} />
        <ChannelsScene />
      </Sequence>

      {/* Scene 5: Numbers */}
      <Sequence from={sceneDuration * 4} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/influencer/inf-05-comparison.mp3")} />
        <NumbersScene />
      </Sequence>

      {/* Scene 6: CEO */}
      <Sequence from={sceneDuration * 5} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/influencer/inf-06-ceo.mp3")} />
        <CeoScene />
      </Sequence>

      {/* Scene 7: CTA */}
      <Sequence from={sceneDuration * 6} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/influencer/inf-07-cta.mp3")} />
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};
