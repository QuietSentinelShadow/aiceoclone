import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../lib/constants";

interface ComparisonTableProps {
  headers: string[];
  rows: { cells: string[]; highlight?: boolean }[];
  title?: string;
  colors?: string[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  headers,
  rows,
  title,
  colors = [COLORS.primary, COLORS.secondary, COLORS.accent],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fade-in
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Header row animation
  const headerOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerSlide = interpolate(frame, [10, 25], [-30, 0], {
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
        padding: 80,
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
            textAlign: "center",
          }}
        >
          {title}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          width: "100%",
          maxWidth: 1500,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: COLORS.card,
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            opacity: headerOpacity,
            transform: `translateY(${headerSlide}px)`,
          }}
        >
          {headers.map((header, colIndex) => (
            <div
              key={colIndex}
              style={{
                flex: 1,
                padding: "20px 28px",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: FONTS.heading,
                color: COLORS.text,
                backgroundColor: colors[colIndex % colors.length] + "30",
                borderBottom: `2px solid ${colors[colIndex % colors.length]}`,
                textAlign: "center",
              }}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((row, rowIndex) => {
          const rowDelay = 25 + rowIndex * 12;

          const rowOpacity = interpolate(
            frame,
            [rowDelay, rowDelay + 15],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const rowSlideX = interpolate(
            frame,
            [rowDelay, rowDelay + 15],
            [-60, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          return (
            <div
              key={rowIndex}
              style={{
                display: "flex",
                opacity: rowOpacity,
                transform: `translateX(${rowSlideX}px)`,
                borderBottom:
                  rowIndex < rows.length - 1
                    ? `1px solid ${COLORS.cardBorder}`
                    : "none",
                borderLeft: row.highlight
                  ? `3px solid ${COLORS.primary}`
                  : "3px solid transparent",
                backgroundColor: row.highlight
                  ? `${COLORS.primary}08`
                  : "transparent",
              }}
            >
              {row.cells.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  style={{
                    flex: 1,
                    padding: "18px 28px",
                    fontSize: 20,
                    fontFamily: FONTS.body,
                    color:
                      colIndex === 0 ? COLORS.text : COLORS.textMuted,
                    fontWeight: colIndex === 0 ? 600 : 400,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
