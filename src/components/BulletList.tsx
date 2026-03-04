import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLORS, FONTS, TIMING } from "../lib/constants";

interface BulletListProps {
  items: string[];
  title?: string;
  icon?: string;
  color?: string;
}

export const BulletList: React.FC<BulletListProps> = ({
  items,
  title,
  icon,
  color = COLORS.primary,
}) => {
  const frame = useCurrentFrame();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleSlideY = interpolate(frame, [0, 20], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 140px",
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
            marginBottom: 48,
            opacity: titleOpacity,
            transform: `translateY(${titleSlideY}px)`,
          }}
        >
          {title}
        </div>
      )}

      {/* Bullet items */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {items.map((item, index) => {
          const itemDelay = 20 + index * TIMING.bulletDelay;

          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + 15],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const itemSlideX = interpolate(
            frame,
            [itemDelay, itemDelay + 15],
            [-50, 0],
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
                opacity: itemOpacity,
                transform: `translateX(${itemSlideX}px)`,
              }}
            >
              {/* Bullet icon */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: color,
                  flexShrink: 0,
                  boxShadow: `0 0 12px ${color}60`,
                }}
              >
                {icon && (
                  <span
                    style={{
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {icon}
                  </span>
                )}
              </div>

              {/* Text */}
              <div
                style={{
                  fontSize: 28,
                  fontFamily: FONTS.body,
                  color: COLORS.text,
                  lineHeight: 1.4,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
