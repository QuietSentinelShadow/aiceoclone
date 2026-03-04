import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../lib/constants";

interface BigTextProps {
  text: string;
  color?: string;
  fontSize?: number;
  subtitle?: string;
}

export const BigText: React.FC<BigTextProps> = ({
  text,
  color = COLORS.primary,
  fontSize = 120,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slam-zoom: scale from 2.0 to 1.0 with spring
  const textScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100, mass: 0.6 },
    from: 2.0,
    to: 1.0,
  });

  // Opacity: 0 to 1
  const textOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle fades in after main text settles
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleSlideY = interpolate(frame, [20, 40], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      {/* Glow effect behind text */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${color}20 0%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: textOpacity,
        }}
      />

      {/* Main text */}
      <div
        style={{
          fontSize,
          fontWeight: 900,
          fontFamily: FONTS.heading,
          color,
          textAlign: "center",
          transform: `scale(${textScale})`,
          opacity: textOpacity,
          lineHeight: 1.1,
          maxWidth: "90%",
          textShadow: `0 0 40px ${color}40`,
          zIndex: 1,
        }}
      >
        {text}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            fontFamily: FONTS.body,
            color: COLORS.textMuted,
            textAlign: "center",
            marginTop: 32,
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
