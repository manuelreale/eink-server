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
  const measureRef = useRef<HTMLSpanElement>(null);
  const [correction, setCorrection] = useState<{ x: number; y: number } | null>(null);

  const lineHeightPx = `${lineHeight}px`;
  const content =
    text !== undefined ? (
      multiline ? (
        text.split("\n").map((line, i) => (
          <div
            key={i}
            className="leading-none"
            style={{ height: lineHeightPx, lineHeight: lineHeightPx }}
          >
            {line || "\u00A0"}
          </div>
        ))
      ) : (
        <>{text}</>
      )
    ) : (
      children
    );

  useLayoutEffect(() => {
    if (!centerAlignPixelPerfect || !containerRef.current || !measureRef.current) return;
    const outer = containerRef.current.getBoundingClientRect();
    const inner = measureRef.current.getBoundingClientRect();
    const leftRel = inner.left - outer.left;
    const topRel = inner.top - outer.top;
    setCorrection({
      x: Math.round(leftRel) - leftRel,
      y: Math.round(topRel) - topRel,
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
    if (correction === null) {
      baseStyle.visibility = "hidden";
    }
  }

  const inner =
    centerAlignPixelPerfect ? (
      <span
        ref={measureRef}
        style={{
          // inline-block so the span shrinks to the text size; we measure this box, not the full container
          display: "inline-block",
          ...(correction !== null
            ? { transform: `translate(${correction.x}px, ${correction.y}px)` }
            : {}),
        }}
      >
        {content}
      </span>
    ) : (
      content
    );

  return (
    <Tag ref={containerRef as React.RefObject<HTMLDivElement & HTMLSpanElement>} className={className} style={baseStyle}>
      {inner}
    </Tag>
  );
}
