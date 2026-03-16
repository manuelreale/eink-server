import React, { useRef, useLayoutEffect, useState } from "react";

/**
 * Wraps text so it sits on integer pixel boundaries (pixel-perfect for pixel fonts).
 * - Uses integer lineHeight so each line starts at integer y (0, lineHeight, 2*lineHeight, …).
 * - When width and parentWidth are set, centers with integer margins so the block starts at integer x.
 * - When centerAlignPixelPerfect is true, measures position with getBoundingClientRect(), then applies
 *   a translate correction so the content snaps to Math.round() in both x and y (no fractional pixels).
 * - For multiline string content, each line is rendered in a fixed-height block (height = lineHeight).
 */
type PixelPerfectTextProps = {
  /** Integer line height in px. Each line will start at integer y. */
  lineHeight: number;
  /** Optional integer width in px. Use with parentWidth for centered integer positioning. */
  width?: number;
  /** When set with width, marginLeft/Right = (parentWidth - width) / 2. Use same parity as width. */
  parentWidth?: number;
  /** When true, measure position and apply a translate so content snaps to integer pixels (no half/fraction pixels). */
  centerAlignPixelPerfect?: boolean;
  /** When true and `text` is provided, split by \n and render each line in a fixed-height block. */
  multiline?: boolean;
  /** String content (optional). If multiline, split by \n. */
  text?: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  /** HTML element to render. Default "div". */
  as?: "div" | "span";
};

export default function PixelPerfectText({
  lineHeight,
  width,
  parentWidth,
  centerAlignPixelPerfect = false,
  multiline = false,
  text,
  className = "",
  children,
  style = {},
  as: Tag = "div",
}: PixelPerfectTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLElement>(null);
  const [correction, setCorrection] = useState<{ x: number; y: number } | null>(null);

  const lineHeightPx = `${lineHeight}px`;
  const lines = text !== undefined && multiline ? text.split("\n") : null;

  const content =
    text !== undefined ? (
      multiline && !(centerAlignPixelPerfect && lines) ? (
        (lines ?? text.split("\n")).map((line, i) => (
          <div
            key={i}
            className="leading-none"
            style={{ height: lineHeightPx, lineHeight: lineHeightPx }}
          >
            {line || "\u00A0"}
          </div>
        ))
      ) : !multiline ? (
        <>{text}</>
      ) : null
    ) : (
      children
    );

  useLayoutEffect(() => {
    if (!centerAlignPixelPerfect || !measureRef.current) return;
    const rect = measureRef.current.getBoundingClientRect();
    setCorrection({
      x: Math.round(rect.left) - rect.left,
      y: Math.round(rect.top) - rect.top,
    });
  }, [centerAlignPixelPerfect, text, children]);

  const baseStyle: React.CSSProperties = {
    lineHeight: lineHeightPx,
    paddingTop: 0,
    paddingBottom: 0,
    boxSizing: "content-box",
    ...style,
  };

  if (width !== undefined) {
    baseStyle.width = width;
  }
  if (parentWidth !== undefined && width !== undefined) {
    const margin = (parentWidth - width) / 2;
    baseStyle.marginLeft = margin;
    baseStyle.marginRight = margin;
  }

  if (centerAlignPixelPerfect) {
    baseStyle.display = "flex";
    baseStyle.justifyContent = "center";
    if (correction === null) {
      baseStyle.visibility = "hidden";
    }
  }

  const inner = centerAlignPixelPerfect ? (
    multiline && lines ? (
      <div
        ref={measureRef as React.RefObject<HTMLDivElement>}
        data-pixel-perfect-inner
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          ...(correction != null
            ? { transform: `translate3d(${correction.x}px, ${correction.y}px, 0)` }
            : {}),
        }}
      >
        {lines.map((line, i) => (
          <span
            key={i}
            className="leading-none"
            style={{
              display: "block",
              width: "max-content",
              height: lineHeightPx,
              lineHeight: lineHeightPx,
            }}
          >
            {line || "\u00A0"}
          </span>
        ))}
      </div>
    ) : (
      <span
        ref={measureRef as React.RefObject<HTMLSpanElement>}
        data-pixel-perfect-inner
        style={{
          display: "inline-block",
          ...(correction != null
            ? { transform: `translate3d(${correction.x}px, ${correction.y}px, 0)` }
            : {}),
        }}
      >
        {content}
      </span>
    )
  ) : (
    content
  );

  return (
    <Tag ref={containerRef as React.RefObject<HTMLDivElement & HTMLSpanElement>} className={className} style={baseStyle}>
      {inner}
    </Tag>
  );
}
