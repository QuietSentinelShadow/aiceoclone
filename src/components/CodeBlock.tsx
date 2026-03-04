import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLORS, FONTS, TIMING } from "../lib/constants";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  typingSpeed?: number;
}

// Basic syntax highlighting: returns an array of styled spans
const highlightSyntax = (text: string): React.ReactNode[] => {
  const keywords =
    /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|new|this|async|await|try|catch|throw|typeof|interface|type|enum|extends|implements|default|switch|case|break|continue|do|in|of|void|null|undefined|true|false)\b/g;
  const strings = /(["'`])(?:(?!\1|\\).|\\.)*\1/g;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;

  // Tokenize the text
  interface Token {
    start: number;
    end: number;
    type: "keyword" | "string" | "number" | "comment";
    text: string;
  }

  const tokens: Token[] = [];
  let match: RegExpExecArray | null;

  // Find comments first (highest priority)
  const commentRegex = new RegExp(comments.source, "gm");
  while ((match = commentRegex.exec(text)) !== null) {
    tokens.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "comment",
      text: match[0],
    });
  }

  // Find strings
  const stringRegex = new RegExp(strings.source, "g");
  while ((match = stringRegex.exec(text)) !== null) {
    const overlaps = tokens.some(
      (t) => match!.index < t.end && match!.index + match![0].length > t.start
    );
    if (!overlaps) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "string",
        text: match[0],
      });
    }
  }

  // Find keywords
  const keywordRegex = new RegExp(keywords.source, "g");
  while ((match = keywordRegex.exec(text)) !== null) {
    const overlaps = tokens.some(
      (t) => match!.index < t.end && match!.index + match![0].length > t.start
    );
    if (!overlaps) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "keyword",
        text: match[0],
      });
    }
  }

  // Find numbers
  const numberRegex = new RegExp(numbers.source, "g");
  while ((match = numberRegex.exec(text)) !== null) {
    const overlaps = tokens.some(
      (t) => match!.index < t.end && match!.index + match![0].length > t.start
    );
    if (!overlaps) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "number",
        text: match[0],
      });
    }
  }

  // Sort tokens by position
  tokens.sort((a, b) => a.start - b.start);

  const colorMap: Record<string, string> = {
    keyword: COLORS.secondary,
    string: COLORS.success,
    number: COLORS.accent,
    comment: COLORS.textDim,
  };

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  tokens.forEach((token, i) => {
    // Add plain text before this token
    if (token.start > lastIndex) {
      result.push(
        <span key={`plain-${i}`} style={{ color: COLORS.text }}>
          {text.slice(lastIndex, token.start)}
        </span>
      );
    }
    // Add the highlighted token
    result.push(
      <span
        key={`token-${i}`}
        style={{
          color: colorMap[token.type],
          fontStyle: token.type === "comment" ? "italic" : undefined,
        }}
      >
        {token.text}
      </span>
    );
    lastIndex = token.end;
  });

  // Add remaining plain text
  if (lastIndex < text.length) {
    result.push(
      <span key="plain-end" style={{ color: COLORS.text }}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return result;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "typescript",
  title,
  typingSpeed = TIMING.codeTypingSpeed,
}) => {
  const frame = useCurrentFrame();

  // Card fade-in
  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Number of visible characters based on frame
  const charsVisible = Math.floor(frame / typingSpeed);
  const visibleCode = code.slice(0, charsVisible);

  // Blinking cursor (blinks every 15 frames)
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1600,
          opacity: cardOpacity,
          backgroundColor: COLORS.card,
          borderRadius: 16,
          border: `1px solid ${COLORS.cardBorder}`,
          overflow: "hidden",
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5)`,
        }}
      >
        {/* Title bar with dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            gap: 8,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: COLORS.danger,
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: COLORS.accent,
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: COLORS.success,
            }}
          />
          {title && (
            <div
              style={{
                marginLeft: 16,
                fontSize: 14,
                fontFamily: FONTS.mono,
                color: COLORS.textDim,
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              marginLeft: "auto",
              fontSize: 12,
              fontFamily: FONTS.mono,
              color: COLORS.textDim,
            }}
          >
            {language}
          </div>
        </div>

        {/* Code content */}
        <div
          style={{
            padding: "32px 32px",
            fontFamily: FONTS.mono,
            fontSize: 22,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            minHeight: 200,
          }}
        >
          {highlightSyntax(visibleCode)}
          {charsVisible < code.length && cursorVisible && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: "1.2em",
                backgroundColor: COLORS.primary,
                marginLeft: 2,
                verticalAlign: "text-bottom",
              }}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
