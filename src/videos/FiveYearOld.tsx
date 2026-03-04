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
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame - delay, [0, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
  );
};

const EmojiPop: React.FC<{
  emoji: string;
  delay?: number;
  x: number;
  y: number;
  size?: number;
}> = ({ emoji, delay = 0, x, y, size = 80 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 8 } });
  if (frame < delay) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontSize: size,
        transform: `scale(${scale})`,
      }}
    >
      {emoji}
    </div>
  );
};

const ColorBox: React.FC<{
  color: string;
  label: string;
  delay?: number;
  width?: number;
}> = ({ color, label, delay = 0, width = 300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 10 } });
  if (frame < delay) return null;
  return (
    <div
      style={{
        width,
        padding: "30px 20px",
        backgroundColor: color,
        borderRadius: 24,
        textAlign: "center",
        fontFamily: FONTS.heading,
        fontSize: 28,
        fontWeight: 700,
        color: "#fff",
        transform: `scale(${scale})`,
        boxShadow: `0 8px 32px ${color}44`,
      }}
    >
      {label}
    </div>
  );
};

// --- SCENES ---

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleScale = spring({ frame, fps, config: { damping: 12 } });
  return (
    <Section bg="#0d0d1a">
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 120,
            transform: `scale(${titleScale})`,
            marginBottom: 20,
          }}
        >
          🤖
        </div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.primary,
            transform: `scale(${titleScale})`,
            textShadow: `0 0 40px ${COLORS.primary}66`,
          }}
        >
          NullClaw
        </div>
        <FadeIn delay={20}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 36,
              color: COLORS.textMuted,
              marginTop: 20,
            }}
          >
            Explained for Kids! 🎉
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

const TinyRobotScene: React.FC = () => (
  <Section bg="#0a0a1a">
    <div style={{ textAlign: "center" }}>
      <FadeIn>
        <div style={{ fontSize: 100, marginBottom: 30 }}>🧱</div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 20,
          }}
        >
          Imagine a tiny robot...
        </div>
      </FadeIn>
      <FadeIn delay={30}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 36,
            color: COLORS.textMuted,
            lineHeight: 1.6,
          }}
        >
          So tiny it fits inside a{" "}
          <span style={{ color: COLORS.primary, fontWeight: 700 }}>
            single Lego brick!
          </span>
        </div>
      </FadeIn>
      <FadeIn delay={60}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 32,
            color: COLORS.accent,
            marginTop: 30,
          }}
        >
          Only 678 KB — tinier than a phone photo! 📱
        </div>
      </FadeIn>
      <EmojiPop emoji="🤏" delay={40} x={200} y={100} />
      <EmojiPop emoji="✨" delay={70} x={1500} y={150} />
    </div>
  </Section>
);

const FastScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boltScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 6, mass: 0.5 },
  });
  return (
    <Section bg="#0a0a1a">
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 120,
            transform: `scale(${boltScale})`,
            marginBottom: 20,
          }}
        >
          ⚡
        </div>
        <FadeIn delay={15}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 52,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 20,
            }}
          >
            Wakes up in{" "}
            <span style={{ color: COLORS.primary }}>2 milliseconds!</span>
          </div>
        </FadeIn>
        <FadeIn delay={40}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 36,
              color: COLORS.textMuted,
            }}
          >
            That's faster than you can blink! 👁️
          </div>
        </FadeIn>
        <EmojiPop emoji="💨" delay={50} x={300} y={200} />
        <EmojiPop emoji="🏎️" delay={60} x={1400} y={300} />
      </div>
    </Section>
  );
};

const TalksScene: React.FC = () => (
  <Section bg="#0a0a1a">
    <div style={{ textAlign: "center" }}>
      <FadeIn>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 40,
          }}
        >
          Talks to ALL your friends! 💬
        </div>
      </FadeIn>
      <div
        style={{
          display: "flex",
          gap: 30,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <ColorBox color="#0088cc" label="📱 Telegram" delay={20} />
        <ColorBox color="#5865F2" label="🎮 Discord" delay={35} />
        <ColorBox color="#4A154B" label="💼 Slack" delay={50} />
        <ColorBox color="#25D366" label="📲 WhatsApp" delay={65} />
      </div>
      <FadeIn delay={80}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 32,
            color: COLORS.primary,
            marginTop: 40,
          }}
        >
          + 14 more channels! 🌍
        </div>
      </FadeIn>
    </div>
  </Section>
);

const RemembersScene: React.FC = () => (
  <Section bg="#0a0a1a">
    <div style={{ textAlign: "center" }}>
      <FadeIn>
        <div style={{ fontSize: 100, marginBottom: 20 }}>🧠</div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 20,
          }}
        >
          Remembers Everything!
        </div>
      </FadeIn>
      <FadeIn delay={30}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 34,
            color: COLORS.textMuted,
            lineHeight: 1.6,
            maxWidth: 900,
          }}
        >
          Like having a{" "}
          <span style={{ color: COLORS.secondary }}>library catalog</span> AND a{" "}
          <span style={{ color: COLORS.primary }}>super search engine</span> in
          its brain!
        </div>
      </FadeIn>
      <EmojiPop emoji="📚" delay={40} x={300} y={150} />
      <EmojiPop emoji="🔍" delay={55} x={1400} y={200} />
    </div>
  </Section>
);

const ComparisonScene: React.FC = () => (
  <Section bg="#0a0a1a">
    <div style={{ textAlign: "center" }}>
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
          Meet the Robot Family! 🤖🤖🤖
        </div>
      </FadeIn>
      <div
        style={{
          display: "flex",
          gap: 40,
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        <FadeIn delay={20}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 80, marginBottom: 10 }}>🏢</div>
            <ColorBox
              color={COLORS.openclaw}
              label="OpenClaw"
              delay={20}
              width={280}
            />
            <div
              style={{
                color: COLORS.textMuted,
                fontSize: 24,
                marginTop: 10,
                fontFamily: FONTS.body,
              }}
            >
              HUGE robot
              <br />
              Needs a whole room!
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={40}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 60, marginBottom: 10 }}>🏠</div>
            <ColorBox
              color={COLORS.zeroclaw}
              label="ZeroClaw"
              delay={40}
              width={280}
            />
            <div
              style={{
                color: COLORS.textMuted,
                fontSize: 24,
                marginTop: 10,
                fontFamily: FONTS.body,
              }}
            >
              Medium robot
              <br />
              Pretty fast!
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={60}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🧱</div>
            <ColorBox
              color={COLORS.nullclaw}
              label="NullClaw"
              delay={60}
              width={280}
            />
            <div
              style={{
                color: COLORS.primary,
                fontSize: 24,
                fontWeight: 700,
                marginTop: 10,
                fontFamily: FONTS.body,
              }}
            >
              Tiniest AND fastest! ⚡
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  </Section>
);

const CeoScene: React.FC = () => (
  <Section bg="#0d0d1a">
    <div style={{ textAlign: "center" }}>
      <FadeIn>
        <div style={{ fontSize: 100, marginBottom: 20 }}>🍋</div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 20,
          }}
        >
          Your AI Lemonade Stand Boss!
        </div>
      </FadeIn>
      <FadeIn delay={30}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 34,
            color: COLORS.textMuted,
            lineHeight: 1.8,
            maxWidth: 1000,
          }}
        >
          NullClaw can be your{" "}
          <span style={{ color: COLORS.accent, fontWeight: 700 }}>
            AI CEO
          </span>
          !
          <br />
          It checks on things, makes decisions,
          <br />
          and tells other robots what to do.
          <br />
          <span style={{ color: COLORS.primary }}>All by itself!</span>{" "}
          <span style={{ color: COLORS.secondary }}>While you're sleeping!</span>
        </div>
      </FadeIn>
      <EmojiPop emoji="👔" delay={50} x={250} y={120} />
      <EmojiPop emoji="📊" delay={65} x={1500} y={180} />
      <EmojiPop emoji="😴" delay={80} x={1400} y={600} />
    </div>
  </Section>
);

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 10 } });
  return (
    <Section bg="#0d0d1a">
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 100,
            transform: `scale(${scale})`,
            marginBottom: 20,
          }}
        >
          🌟
        </div>
        <FadeIn delay={15}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.primary,
              marginBottom: 20,
              textShadow: `0 0 30px ${COLORS.primary}44`,
            }}
          >
            NullClaw is Super Cool!
          </div>
        </FadeIn>
        <FadeIn delay={35}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 30,
              color: COLORS.textMuted,
              lineHeight: 1.8,
            }}
          >
            ✨ Teeny tiny &nbsp; ⚡ Super fast &nbsp; 💬 Talks to everyone
            <br />
            🧠 Remembers everything &nbsp; 👔 Runs your pretend company
          </div>
        </FadeIn>
        <FadeIn delay={60}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 36,
              color: COLORS.accent,
              marginTop: 40,
            }}
          >
            Thanks for watching! 🎉
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};

// --- MAIN COMPOSITION ---

export const FiveYearOld: React.FC = () => {
  const sceneDuration = 5 * FPS; // 5 seconds per scene

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={0} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/five-year-old/fyo-01-intro.mp3")} />
        <IntroScene />
      </Sequence>
      <Sequence from={sceneDuration} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/five-year-old/fyo-02-tiny.mp3")} />
        <TinyRobotScene />
      </Sequence>
      <Sequence from={sceneDuration * 2} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/five-year-old/fyo-03-fast.mp3")} />
        <FastScene />
      </Sequence>
      <Sequence from={sceneDuration * 3} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/five-year-old/fyo-04-talks.mp3")} />
        <TalksScene />
      </Sequence>
      <Sequence from={sceneDuration * 4} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/five-year-old/fyo-05-remembers.mp3")} />
        <RemembersScene />
      </Sequence>
      <Sequence from={sceneDuration * 5} durationInFrames={sceneDuration}>
        <Audio
          src={staticFile("audio/five-year-old/fyo-06-comparison.mp3")}
        />
        <ComparisonScene />
      </Sequence>
      <Sequence from={sceneDuration * 6} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/five-year-old/fyo-07-ceo.mp3")} />
        <CeoScene />
      </Sequence>
      <Sequence from={sceneDuration * 7} durationInFrames={sceneDuration}>
        <Audio src={staticFile("audio/five-year-old/fyo-08-outro.mp3")} />
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
