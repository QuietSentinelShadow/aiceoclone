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

// --- REUSABLE HELPER COMPONENTS ---

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
  const y = interpolate(frame - delay, [0, duration], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
  );
};

const TypedText: React.FC<{
  text: string;
  delay?: number;
  speed?: number;
  color?: string;
  fontSize?: number;
}> = ({ text, delay = 0, speed = 2, color = COLORS.success, fontSize = 28 }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - delay);
  const charsToShow = Math.min(Math.floor(elapsed / speed), text.length);
  const showCursor = elapsed % 16 < 10;

  return (
    <span
      style={{
        fontFamily: FONTS.mono,
        fontSize,
        color,
        whiteSpace: "pre",
      }}
    >
      {text.slice(0, charsToShow)}
      {charsToShow < text.length && showCursor && (
        <span style={{ color: COLORS.primary, opacity: 0.8 }}>|</span>
      )}
    </span>
  );
};

const GlowText: React.FC<{
  children: React.ReactNode;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
}> = ({ children, color = COLORS.primary, fontSize = 64, fontWeight = 800 }) => (
  <div
    style={{
      fontFamily: FONTS.heading,
      fontSize,
      fontWeight,
      color,
      textShadow: `0 0 40px ${color}66, 0 0 80px ${color}33`,
    }}
  >
    {children}
  </div>
);

const ArchBox: React.FC<{
  label: string;
  delay?: number;
  color?: string;
  width?: number;
  height?: number;
}> = ({ label, delay = 0, color = COLORS.primary, width = 200, height = 70 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  if (frame < delay) return null;
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.card,
        border: `2px solid ${color}`,
        borderRadius: 12,
        fontFamily: FONTS.mono,
        fontSize: 20,
        fontWeight: 600,
        color,
        transform: `scale(${scale})`,
        boxShadow: `0 0 20px ${color}22`,
      }}
    >
      {label}
    </div>
  );
};

const Arrow: React.FC<{
  direction?: "down" | "right" | "left";
  delay?: number;
  color?: string;
  length?: number;
}> = ({ direction = "down", delay = 0, color = COLORS.textDim, length = 40 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < delay) return null;

  const isVertical = direction === "down";
  const isLeft = direction === "left";

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: isVertical ? "column" : "row",
      }}
    >
      <div
        style={{
          width: isVertical ? 2 : length,
          height: isVertical ? length : 2,
          backgroundColor: color,
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: isVertical
            ? "8px solid transparent"
            : isLeft
              ? `12px solid ${color}`
              : "none",
          borderRight: isVertical
            ? "8px solid transparent"
            : isLeft
              ? "none"
              : `12px solid ${color}`,
          borderTop: isVertical
            ? `12px solid ${color}`
            : "8px solid transparent",
          borderBottom: isVertical
            ? "none"
            : "8px solid transparent",
        }}
      />
    </div>
  );
};

const TerminalWindow: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title = "terminal" }) => (
  <div
    style={{
      width: "100%",
      maxWidth: 1200,
      backgroundColor: "#0c0c14",
      borderRadius: 16,
      border: `1px solid ${COLORS.cardBorder}`,
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 20px",
        backgroundColor: "#161625",
        borderBottom: `1px solid ${COLORS.cardBorder}`,
      }}
    >
      <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
      <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#febc2e" }} />
      <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#28c840" }} />
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 14,
          color: COLORS.textDim,
          marginLeft: 12,
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ padding: "30px 40px" }}>{children}</div>
  </div>
);

const HBar: React.FC<{
  label: string;
  value: string;
  maxWidth: number;
  widthPercent: number;
  color: string;
  delay?: number;
}> = ({ label, value, maxWidth, widthPercent, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: 160,
          fontFamily: FONTS.mono,
          fontSize: 18,
          color: COLORS.textMuted,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 32,
          backgroundColor: COLORS.card,
          borderRadius: 6,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${widthPercent * progress}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 6,
            boxShadow: `0 0 16px ${color}44`,
            transition: "none",
          }}
        />
      </div>
      <div
        style={{
          width: 120,
          fontFamily: FONTS.mono,
          fontSize: 18,
          fontWeight: 700,
          color,
          flexShrink: 0,
        }}
      >
        {progress > 0.5 ? value : ""}
      </div>
    </div>
  );
};

const BulletItem: React.FC<{
  text: string;
  delay?: number;
  icon?: string;
}> = ({ text, delay = 0, icon = ">" }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame - delay, [0, 15], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 20,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 22,
          color: COLORS.primary,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontFamily: FONTS.body,
          fontSize: 26,
          color: COLORS.text,
          lineHeight: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// --- SCENES ---

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleScale = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [40, 80], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Section bg="#07070d">
      <div style={{ textAlign: "center" }}>
        <div style={{ transform: `scale(${titleScale})` }}>
          <GlowText fontSize={88} fontWeight={800}>
            NullClaw
          </GlowText>
        </div>
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: COLORS.primary,
            margin: "24px auto",
            boxShadow: `0 0 20px ${COLORS.primary}66`,
          }}
        />
        <FadeIn delay={35}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 42,
              fontWeight: 600,
              color: COLORS.text,
              opacity: subtitleOpacity,
              letterSpacing: 2,
            }}
          >
            Technical Deep Dive
          </div>
        </FadeIn>
        <FadeIn delay={55}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 22,
              color: COLORS.textDim,
              marginTop: 24,
              letterSpacing: 4,
            }}
          >
            FOR SOFTWARE PROFESSIONALS
          </div>
        </FadeIn>
        <FadeIn delay={75}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: COLORS.textDim,
              marginTop: 60,
              opacity: 0.5,
            }}
          >
            v0.1.0 // zig + sqlite // 678KB binary
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const ArchitectureScene: React.FC = () => {
  return (
    <Section bg={COLORS.bg}>
      <div style={{ textAlign: "center", width: "100%" }}>
        <FadeIn>
          <GlowText fontSize={48}>vtable-Driven Architecture</GlowText>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.textDim,
              marginTop: 12,
              marginBottom: 50,
            }}
          >
            Pluggable interface design in Zig -- comptime polymorphism, zero overhead
          </div>
        </FadeIn>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            marginBottom: 30,
          }}
        >
          <ArchBox label="Providers" delay={20} color={COLORS.primary} width={180} />
          <Arrow direction="right" delay={30} color={COLORS.textDim} length={30} />
          <ArchBox label="Channels" delay={25} color={COLORS.secondary} width={180} />
          <Arrow direction="right" delay={35} color={COLORS.textDim} length={30} />
          <ArchBox label="Tools" delay={30} color={COLORS.accent} width={180} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 200,
            marginBottom: 10,
          }}
        >
          <Arrow direction="down" delay={40} color={COLORS.textDim} length={30} />
          <Arrow direction="down" delay={45} color={COLORS.textDim} length={30} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 100,
          }}
        >
          <ArchBox label="Memory" delay={50} color={COLORS.success} width={200} />
          <ArchBox label="Runtimes" delay={55} color={COLORS.danger} width={200} />
        </div>

        <FadeIn delay={70}>
          <div
            style={{
              marginTop: 40,
              padding: "16px 32px",
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 12,
              display: "inline-block",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 18,
                color: COLORS.textMuted,
              }}
            >
              Each module implements a{" "}
              <span style={{ color: COLORS.primary }}>vtable interface</span> --
              swap providers, channels, or tools at runtime without recompilation
            </span>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const SetupScene: React.FC = () => {
  const line1 = "$ brew install nullclaw";
  const line2 = "$ nullclaw onboard --interactive";
  const line3 = "$ nullclaw gateway --port 3000";

  const line1Start = 10;
  const line2Start = line1Start + line1.length * 2 + 15;
  const line3Start = line2Start + line2.length * 2 + 15;

  return (
    <Section bg="#07070d">
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <FadeIn>
          <GlowText fontSize={44}>Quick Setup</GlowText>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: COLORS.textDim,
              marginTop: 8,
              marginBottom: 40,
            }}
          >
            Three commands to production-ready AI gateway
          </div>
        </FadeIn>

        <FadeIn delay={5}>
          <TerminalWindow title="~ / nullclaw-setup">
            <div style={{ lineHeight: 2.4 }}>
              <div>
                <TypedText text={line1} delay={line1Start} speed={2} color={COLORS.success} fontSize={26} />
              </div>
              <div>
                <TypedText text={line2} delay={line2Start} speed={2} color={COLORS.success} fontSize={26} />
              </div>
              <div>
                <TypedText text={line3} delay={line3Start} speed={2} color={COLORS.success} fontSize={26} />
              </div>
            </div>
          </TerminalWindow>
        </FadeIn>

        <FadeIn delay={line3Start + line3.length * 2 + 10}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: COLORS.textDim,
              marginTop: 24,
              textAlign: "center",
            }}
          >
            Also available: curl installer, nix, docker, cargo-binstall
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const ProviderGridScene: React.FC = () => {
  const providers = [
    "OpenRouter",
    "Anthropic",
    "OpenAI",
    "Ollama",
    "Groq",
    "Mistral",
    "xAI",
    "DeepSeek",
  ];

  return (
    <Section bg={COLORS.bg}>
      <div style={{ textAlign: "center", width: "100%" }}>
        <FadeIn>
          <GlowText fontSize={48}>22+ AI Providers</GlowText>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.textDim,
              marginTop: 12,
              marginBottom: 50,
            }}
          >
            Unified interface -- switch providers with a single config change
          </div>
        </FadeIn>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 24,
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          {providers.map((name, i) => (
            <ArchBox
              key={name}
              label={name}
              delay={20 + i * 12}
              color={
                i % 3 === 0
                  ? COLORS.primary
                  : i % 3 === 1
                    ? COLORS.secondary
                    : COLORS.accent
              }
              width={220}
              height={64}
            />
          ))}
        </div>

        <FadeIn delay={130}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 20,
              color: COLORS.textMuted,
              marginTop: 40,
            }}
          >
            + 14 more via OpenRouter aggregation
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const MemoryScene: React.FC = () => {
  return (
    <Section bg={COLORS.bg}>
      <div style={{ textAlign: "center", width: "100%" }}>
        <FadeIn>
          <GlowText fontSize={44}>Hybrid Memory Architecture</GlowText>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.textDim,
              marginTop: 12,
              marginBottom: 50,
            }}
          >
            SQLite-backed dual-path retrieval -- FTS5 + vector cosine similarity
          </div>
        </FadeIn>

        {/* Top: SQLite */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <ArchBox label="SQLite Store" delay={20} color={COLORS.primary} width={260} height={70} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <Arrow direction="down" delay={30} color={COLORS.textDim} length={30} />
        </div>

        {/* Middle: Two paths */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 60,
            marginBottom: 10,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <ArchBox label="FTS5 Search" delay={40} color={COLORS.accent} width={240} height={65} />
            <FadeIn delay={55}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 20,
                  color: COLORS.accent,
                  marginTop: 10,
                  fontWeight: 700,
                }}
              >
                0.3 weight
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={45}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 28,
                color: COLORS.textDim,
              }}
            >
              +
            </div>
          </FadeIn>

          <div style={{ textAlign: "center" }}>
            <ArchBox
              label="Vector Cosine"
              delay={45}
              color={COLORS.secondary}
              width={240}
              height={65}
            />
            <FadeIn delay={60}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 20,
                  color: COLORS.secondary,
                  marginTop: 10,
                  fontWeight: 700,
                }}
              >
                0.7 weight
              </div>
            </FadeIn>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, marginTop: 10 }}>
          <Arrow direction="down" delay={65} color={COLORS.textDim} length={30} />
        </div>

        {/* Bottom: Results */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ArchBox label="Ranked Results" delay={70} color={COLORS.success} width={260} height={70} />
        </div>

        <FadeIn delay={85}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: COLORS.textDim,
              marginTop: 30,
              maxWidth: 800,
              margin: "30px auto 0",
              lineHeight: 1.6,
            }}
          >
            Semantic understanding via embeddings combined with exact keyword matching.
            <br />
            All stored locally in a single SQLite database -- zero external dependencies.
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const SecurityScene: React.FC = () => {
  const items = [
    "ChaCha20-Poly1305 encryption for all stored credentials",
    "Landlock / Firejail / Bubblewrap / Docker sandboxing",
    "localhost-only gateway binding -- no external exposure",
    "6-digit OTP pairing for client authentication",
    "Workspace-scoped isolation per project context",
  ];

  return (
    <Section bg={COLORS.bg}>
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <FadeIn>
          <GlowText fontSize={48} color={COLORS.danger}>
            Defense-in-Depth Security
          </GlowText>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.textDim,
              marginTop: 12,
              marginBottom: 50,
            }}
          >
            Multiple independent security layers -- no single point of failure
          </div>
        </FadeIn>

        <div style={{ paddingLeft: 40 }}>
          {items.map((text, i) => (
            <BulletItem key={i} text={text} delay={25 + i * 25} icon="[+]" />
          ))}
        </div>

        <FadeIn delay={160}>
          <div
            style={{
              marginTop: 30,
              padding: "14px 28px",
              backgroundColor: `${COLORS.danger}11`,
              border: `1px solid ${COLORS.danger}33`,
              borderRadius: 10,
              display: "inline-block",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 16,
                color: COLORS.danger,
              }}
            >
              Zero trust architecture -- every request authenticated and sandboxed
            </span>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const BenchmarkScene: React.FC = () => {
  return (
    <Section bg={COLORS.bg}>
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <FadeIn>
          <GlowText fontSize={44}>Benchmark Comparison</GlowText>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.textDim,
              marginTop: 12,
              marginBottom: 40,
            }}
          >
            NullClaw vs ZeroClaw vs OpenClaw -- measured on identical hardware
          </div>
        </FadeIn>

        {/* Binary Size */}
        <FadeIn delay={15}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 12,
              marginTop: 10,
            }}
          >
            Binary Size
          </div>
        </FadeIn>
        <HBar label="NullClaw" value="678 KB" maxWidth={800} widthPercent={8} color={COLORS.nullclaw} delay={20} />
        <HBar label="ZeroClaw" value="3.4 MB" maxWidth={800} widthPercent={30} color={COLORS.zeroclaw} delay={28} />
        <HBar label="OpenClaw" value="28 MB" maxWidth={800} widthPercent={100} color={COLORS.openclaw} delay={36} />

        {/* RAM Usage */}
        <FadeIn delay={50}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 12,
              marginTop: 28,
            }}
          >
            RAM Usage (idle)
          </div>
        </FadeIn>
        <HBar label="NullClaw" value="1 MB" maxWidth={800} widthPercent={5} color={COLORS.nullclaw} delay={55} />
        <HBar label="ZeroClaw" value="5 MB" maxWidth={800} widthPercent={12} color={COLORS.zeroclaw} delay={63} />
        <HBar label="OpenClaw" value="1 GB+" maxWidth={800} widthPercent={100} color={COLORS.openclaw} delay={71} />

        {/* Startup */}
        <FadeIn delay={85}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 12,
              marginTop: 28,
            }}
          >
            Cold Startup
          </div>
        </FadeIn>
        <HBar label="NullClaw" value="2 ms" maxWidth={800} widthPercent={4} color={COLORS.nullclaw} delay={90} />
        <HBar label="ZeroClaw" value="10 ms" maxWidth={800} widthPercent={15} color={COLORS.zeroclaw} delay={98} />
        <HBar label="OpenClaw" value="seconds" maxWidth={800} widthPercent={100} color={COLORS.openclaw} delay={106} />
      </div>
    </Section>
  );
};

const ConfigScene: React.FC = () => {
  const jsonLines = [
    '{',
    '  "autonomy": {',
    '    "level": "full",',
    '    "allowed_commands": ["*"]',
    '  },',
    '  "cron": {',
    '    "tasks": [{',
    '      "name": "morning-briefing",',
    '      "schedule": "0 8 * * *"',
    '    }]',
    '  }',
    '}',
  ];

  return (
    <Section bg="#07070d">
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <FadeIn>
          <GlowText fontSize={44}>Advanced Configuration</GlowText>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: COLORS.textDim,
              marginTop: 8,
              marginBottom: 40,
            }}
          >
            Autonomy levels, cron scheduling, and workspace scoping
          </div>
        </FadeIn>

        <FadeIn delay={10}>
          <TerminalWindow title="nullclaw.json">
            <div style={{ lineHeight: 2 }}>
              {jsonLines.map((line, i) => {
                const delay = 15 + i * 10;
                return (
                  <div key={i}>
                    <TypedText
                      text={line}
                      delay={delay}
                      speed={1}
                      color={
                        line.includes('"')
                          ? line.includes(':')
                            ? COLORS.primary
                            : COLORS.accent
                          : COLORS.textMuted
                      }
                      fontSize={24}
                    />
                  </div>
                );
              })}
            </div>
          </TerminalWindow>
        </FadeIn>

        <FadeIn delay={160}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: COLORS.textDim,
              marginTop: 24,
              textAlign: "center",
            }}
          >
            Full autonomy mode: execute commands, manage files, interact with APIs -- all on schedule
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const CeoCloneScene: React.FC = () => {
  return (
    <Section bg={COLORS.bg}>
      <div style={{ textAlign: "center", width: "100%" }}>
        <FadeIn>
          <GlowText fontSize={44} color={COLORS.accent}>
            AI CEO Architecture
          </GlowText>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.textDim,
              marginTop: 12,
              marginBottom: 50,
            }}
          >
            Autonomous agent stack -- delegate, schedule, execute
          </div>
        </FadeIn>

        {/* Top: Claw-Empire */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <ArchBox label="Claw-Empire" delay={20} color={COLORS.accent} width={320} height={80} />
        </div>
        <FadeIn delay={25}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.textDim,
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            Orchestration layer -- task planning, delegation, monitoring
          </div>
        </FadeIn>

        <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}>
          <Arrow direction="down" delay={30} color={COLORS.accent} length={35} />
        </div>

        {/* Middle: NullClaw Daemon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <ArchBox label="NullClaw Daemon" delay={40} color={COLORS.primary} width={320} height={80} />
        </div>
        <FadeIn delay={45}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.textDim,
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            Persistent runtime -- memory, tools, sandboxed execution
          </div>
        </FadeIn>

        <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}>
          <Arrow direction="down" delay={50} color={COLORS.primary} length={35} />
        </div>

        {/* Bottom: AI Provider */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <ArchBox label="AI Provider" delay={60} color={COLORS.secondary} width={320} height={80} />
        </div>
        <FadeIn delay={65}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.textDim,
              textAlign: "center",
            }}
          >
            LLM inference -- reasoning, generation, tool-use decisions
          </div>
        </FadeIn>

        <FadeIn delay={85}>
          <div
            style={{
              marginTop: 35,
              padding: "14px 28px",
              backgroundColor: `${COLORS.accent}11`,
              border: `1px solid ${COLORS.accent}33`,
              borderRadius: 10,
              display: "inline-block",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 16,
                color: COLORS.accent,
              }}
            >
              Data flows bidirectionally -- feedback loops enable self-correcting autonomous behavior
            </span>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const cursorBlink = frame % 30 < 18;

  return (
    <Section bg="#07070d">
      <div style={{ textAlign: "center" }}>
        <div style={{ transform: `scale(${scale})` }}>
          <GlowText fontSize={64}>Get Started</GlowText>
        </div>

        <div
          style={{
            width: 300,
            height: 2,
            backgroundColor: COLORS.primary,
            margin: "30px auto",
            boxShadow: `0 0 20px ${COLORS.primary}66`,
          }}
        />

        <FadeIn delay={25}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 28,
              color: COLORS.text,
              marginBottom: 16,
            }}
          >
            <span style={{ color: COLORS.textDim }}>$ </span>
            <span style={{ color: COLORS.success }}>brew install nullclaw</span>
            {cursorBlink && (
              <span style={{ color: COLORS.primary, marginLeft: 2 }}>|</span>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={45}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 24,
              color: COLORS.primary,
              marginBottom: 12,
              marginTop: 30,
            }}
          >
            github.com/nullclaw/nullclaw
          </div>
        </FadeIn>
        <FadeIn delay={60}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 24,
              color: COLORS.secondary,
              marginBottom: 40,
            }}
          >
            nullclaw.org
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div
            style={{
              display: "flex",
              gap: 40,
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            {["678KB binary", "2ms startup", "1MB RAM", "22+ providers"].map(
              (stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: COLORS.card,
                    border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 8,
                    fontFamily: FONTS.mono,
                    fontSize: 16,
                    color: COLORS.textMuted,
                  }}
                >
                  {stat}
                </div>
              )
            )}
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.textDim,
              marginTop: 50,
              opacity: 0.5,
            }}
          >
            MIT Licensed // Written in Zig // Zero runtime dependencies
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

// --- MAIN COMPOSITION ---

export const Professional: React.FC = () => {
  const d = audioDurations.durations["professional"] as Record<string, { durationFrames: number }>;
  const scenes: { key: string; component: React.FC }[] = [
    { key: "pro-01-intro", component: TitleScene },
    { key: "pro-02-arch", component: ArchitectureScene },
    { key: "pro-03-setup", component: SetupScene },
    { key: "pro-04-providers", component: ProviderGridScene },
    { key: "pro-05-memory", component: MemoryScene },
    { key: "pro-06-security", component: SecurityScene },
    { key: "pro-07-comparison", component: BenchmarkScene },
    { key: "pro-08-advanced", component: ConfigScene },
    { key: "pro-09-ceo", component: CeoCloneScene },
    { key: "pro-10-outro", component: OutroScene },
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {scenes.map(({ key, component: SceneComponent }) => {
        const frames = d[key]?.durationFrames ?? 300;
        const from = offset;
        offset += frames;
        return (
          <Sequence key={key} from={from} durationInFrames={frames}>
            <Audio src={staticFile(`audio/professional/${key}.mp3`)} />
            <SceneComponent />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
