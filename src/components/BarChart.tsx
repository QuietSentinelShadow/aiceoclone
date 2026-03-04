import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../lib/constants";

interface BarDef {
  label: string;
  value: number;
  color?: string;
  displayValue?: string;
}

interface BarChartProps {
  bars: BarDef[];
  title?: string;
  maxValue?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  bars,
  title,
  maxValue: maxValueProp,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue =
    maxValueProp || Math.max(...bars.map((b) => b.value), 1);

  // Title fade-in
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const barAreaMaxWidth = 900;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 120px",
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: FONTS.heading,
            color: COLORS.text,
            marginBottom: 56,
            opacity: titleOpacity,
            textAlign: "center",
          }}
        >
          {title}
        </div>
      )}

      {/* Bars */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
          maxWidth: 1400,
        }}
      >
        {bars.map((bar, index) => {
          const barDelay = 15 + index * 20;
          const barColor = bar.color || COLORS.primary;

          // Bar width animates from 0 to proportional size
          const barProgress = spring({
            frame: Math.max(0, frame - barDelay),
            fps,
            config: { damping: 15, stiffness: 60, mass: 0.8 },
            from: 0,
            to: 1,
          });

          const proportion = bar.value / maxValue;
          const barWidth = proportion * barAreaMaxWidth * barProgress;

          // Fade in the entire row
          const rowOpacity = interpolate(
            frame,
            [barDelay, barDelay + 10],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          // Value text fades in after bar fills
          const valueOpacity = interpolate(
            frame,
            [barDelay + 15, barDelay + 25],
            [0, 1],
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
                gap: 20,
                opacity: rowOpacity,
              }}
            >
              {/* Label */}
              <div
                style={{
                  width: 220,
                  fontSize: 22,
                  fontFamily: FONTS.body,
                  color: COLORS.text,
                  textAlign: "right",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {bar.label}
              </div>

              {/* Bar track */}
              <div
                style={{
                  flex: 1,
                  height: 40,
                  backgroundColor: `${COLORS.cardBorder}50`,
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                  maxWidth: barAreaMaxWidth,
                }}
              >
                {/* Filled bar */}
                <div
                  style={{
                    height: "100%",
                    width: barWidth,
                    backgroundColor: barColor,
                    borderRadius: "8px 20px 20px 8px",
                    boxShadow: `0 0 15px ${barColor}40`,
                    transition: "none",
                  }}
                />
              </div>

              {/* Value */}
              <div
                style={{
                  width: 120,
                  fontSize: 22,
                  fontFamily: FONTS.mono,
                  color: barColor,
                  fontWeight: 600,
                  opacity: valueOpacity,
                  flexShrink: 0,
                }}
              >
                {bar.displayValue || bar.value.toString()}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
