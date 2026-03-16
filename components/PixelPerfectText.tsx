import React, { useRef, useLayoutEffect, useState } from "react";

/**
 * Wraps text so it sits on integer pixel boundaries (pixel-perfect for pixel fonts).
 * - Uses integer lineHeight so each line starts at integer y (0, lineHeight, 2*lineHeight, …).
 * - When width and parentWidth are set, centers with integer margins so the block starts at integer x.
 * - When centerAlignPixelPerfect is true, measures content width and uses integer paddingLeft/Right so
 *   center-aligned content never starts on a half pixel (avoids (width - lineWidth) / 2 being fractional).
 * - For multiline string content, each line is rendered in a fixed-height block (height = lineHeight).
 */
type PixelPerfectTextProps = {
  /** Integer line height in px. Each line will start at integer y. */
  lineHeight: number;
  /** Optional integer width in px. Use with parentWidth for centered integer positioning. */
  width?: number;
  /** When set with width, marginLeft/Right = (parentWidth - width) / 2. Use same parity as width. */
  parentWidth?: number;
  /** When true, measure content and set integer padding so the content block starts at an integer x (pixel-perfect center). Requires width. */
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
  const measureRef = useRef<HTMLSpanElement>(null);
  const [padding, setPadding] = useState<{ left: number; right: number } | null>(
    centerAlignPixelPerfect && width !== undefined ? null : { left: 0, right: 0 }
  );

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
    if (!centerAlignPixelPerfect || width === undefined || !measureRef.current) return;
    const contentWidth = measureRef.current.offsetWidth;
    const remainder = width - contentWidth;
    const left = Math.floor(remainder / 2);
    const right = remainder - left;
    setPadding({ left: left >= 0 ? left : 0, right: right >= 0 ? right : 0 });
  }, [centerAlignPixelPerfect, width, text, children]);

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

  if (centerAlignPixelPerfect && width !== undefined) {
    if (padding !== null) {
      baseStyle.paddingLeft = padding.left;
      baseStyle.paddingRight = padding.right;
    } else {
      baseStyle.visibility = "hidden";
    }
  }

  const inner =
    centerAlignPixelPerfect && width !== undefined ? (
      <span ref={measureRef} style={{ display: "inline-block" }}>
        {content}
      </span>
    ) : (
      content
    );

  return (
    <Tag className={className} style={baseStyle}>
      {inner}
    </Tag>
  );
}
