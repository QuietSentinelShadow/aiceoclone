import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../lib/constants";

interface TitleSlideProps {
  title: string;
  subtitle?: string;
  color?: string;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({
  title,
  subtitle,
  color = COLORS.primary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title spring animation for scale
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
    from: 0.8,
    to: 1,
  });

  // Title fade-in
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle appears 15 frames after title
  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleTranslateY = interpolate(frame, [15, 35], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Accent bar animation
  const barWidth = interpolate(frame, [10, 40], [0, 300], {
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
      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          fontFamily: FONTS.heading,
          color: COLORS.text,
          textAlign: "center",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          maxWidth: "80%",
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: 32,
            fontWeight: 300,
            fontFamily: FONTS.body,
            color: COLORS.textMuted,
            textAlign: "center",
            marginTop: 24,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleTranslateY}px)`,
            maxWidth: "70%",
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Accent color bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          height: 4,
          width: barWidth,
          backgroundColor: color,
          borderRadius: 2,
          boxShadow: `0 0 20px ${color}40`,
        }}
      />
    </AbsoluteFill>
  );
};
