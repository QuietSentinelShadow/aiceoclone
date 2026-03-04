import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../lib/constants";

interface BoxDef {
  label: string;
  x: number;
  y: number;
  color?: string;
  width?: number;
  height?: number;
}

interface ArrowDef {
  from: number;
  to: number;
}

interface DiagramSlideProps {
  boxes: BoxDef[];
  arrows?: ArrowDef[];
  title?: string;
}

export const DiagramSlide: React.FC<DiagramSlideProps> = ({
  boxes,
  arrows = [],
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 48,
            fontWeight: 700,
            fontFamily: FONTS.heading,
            color: COLORS.text,
            opacity: titleOpacity,
            zIndex: 10,
          }}
        >
          {title}
        </div>
      )}

      {/* SVG layer for arrows */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={COLORS.primary}
            />
          </marker>
        </defs>

        {arrows.map((arrow, index) => {
          const fromBox = boxes[arrow.from];
          const toBox = boxes[arrow.to];
          if (!fromBox || !toBox) return null;

          const fromW = fromBox.width || 200;
          const fromH = fromBox.height || 80;
          const toW = toBox.width || 200;
          const toH = toBox.height || 80;

          // Center points of boxes
          const fromCx = fromBox.x + fromW / 2;
          const fromCy = fromBox.y + fromH / 2;
          const toCx = toBox.x + toW / 2;
          const toCy = toBox.y + toH / 2;

          // Calculate edge intersection points
          const dx = toCx - fromCx;
          const dy = toCy - fromCy;
          const angle = Math.atan2(dy, dx);

          // Start from the edge of the source box
          const startX =
            fromCx + (fromW / 2) * Math.cos(angle);
          const startY =
            fromCy + (fromH / 2) * Math.sin(angle);

          // End at the edge of the target box
          const endX =
            toCx - (toW / 2) * Math.cos(angle);
          const endY =
            toCy - (toH / 2) * Math.sin(angle);

          // Arrow appears after both boxes
          const arrowDelay = 20 + Math.max(arrow.from, arrow.to) * 15 + 10;
          const arrowOpacity = interpolate(
            frame,
            [arrowDelay, arrowDelay + 15],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          return (
            <line
              key={`arrow-${index}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={COLORS.primary}
              strokeWidth={2.5}
              markerEnd="url(#arrowhead)"
              opacity={arrowOpacity}
              strokeDasharray="none"
            />
          );
        })}
      </svg>

      {/* Boxes */}
      {boxes.map((box, index) => {
        const boxDelay = 15 + index * 15;
        const boxColor = box.color || COLORS.primary;
        const boxWidth = box.width || 200;
        const boxHeight = box.height || 80;

        const boxScale = spring({
          frame: Math.max(0, frame - boxDelay),
          fps,
          config: { damping: 12, stiffness: 120, mass: 0.6 },
          from: 0,
          to: 1,
        });

        const boxOpacity = interpolate(
          frame,
          [boxDelay, boxDelay + 10],
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
              position: "absolute",
              left: box.x,
              top: box.y,
              width: boxWidth,
              height: boxHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${boxColor}15`,
              border: `2px solid ${boxColor}`,
              borderRadius: 12,
              boxShadow: `0 0 20px ${boxColor}30, inset 0 0 20px ${boxColor}08`,
              opacity: boxOpacity,
              transform: `scale(${boxScale})`,
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                fontFamily: FONTS.heading,
                color: COLORS.text,
                textAlign: "center",
                padding: "8px 16px",
              }}
            >
              {box.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
