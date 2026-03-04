import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../lib/constants";

interface TransitionSlideProps {
  text: string;
  subtitle?: string;
  color?: string;
}

export const TransitionSlide: React.FC<TransitionSlideProps> = ({
  text,
  subtitle,
  color = COLORS.primary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text scales from 0.5 to 1.0 with spring
  const textScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80, mass: 0.8 },
    from: 0.5,
    to: 1,
  });

  // Text fade in
  const textOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle appears after main text
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleSlideY = interpolate(frame, [20, 40], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background gradient pulse: oscillates between dark and slightly lighter
  const bgBrightness = interpolate(
    frame,
    [0, 30, 60],
    [0, 0.08, 0],
    {
      extrapolateRight: "extend",
    }
  );

  // Use a periodic pulse effect
  const pulsePhase = Math.sin((frame / 60) * Math.PI * 2);
  const bgAlpha = 0.04 + pulsePhase * 0.03;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background gradient pulse overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at center, ${color}${Math.round(
            Math.max(0, bgAlpha) * 255
          )
            .toString(16)
            .padStart(2, "0")} 0%, transparent 70%)`,
        }}
      />

      {/* Main text */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          fontFamily: FONTS.heading,
          color: COLORS.text,
          textAlign: "center",
          transform: `scale(${textScale})`,
          opacity: textOpacity,
          maxWidth: "80%",
          lineHeight: 1.2,
          zIndex: 1,
        }}
      >
        {text}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            fontWeight: 300,
            fontFamily: FONTS.body,
            color: COLORS.textMuted,
            textAlign: "center",
            marginTop: 24,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleSlideY}px)`,
            maxWidth: "70%",
            zIndex: 1,
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
