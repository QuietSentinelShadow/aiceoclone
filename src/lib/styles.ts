import { CSSProperties } from "react";
import { COLORS, FONTS } from "./constants";

export const centerFlex: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const fullScreen: CSSProperties = {
  ...centerFlex,
  backgroundColor: COLORS.bg,
  padding: 80,
};

export const heading: CSSProperties = {
  fontFamily: FONTS.heading,
  fontWeight: 700,
  color: COLORS.text,
};

export const body: CSSProperties = {
  fontFamily: FONTS.body,
  color: COLORS.textMuted,
};

export const mono: CSSProperties = {
  fontFamily: FONTS.mono,
  color: COLORS.text,
};

export const card: CSSProperties = {
  backgroundColor: COLORS.card,
  border: `1px solid ${COLORS.cardBorder}`,
  borderRadius: 16,
  padding: 32,
};

export const glowShadow = (color: string, size = 30) =>
  `0 0 ${size}px ${color}44`;
