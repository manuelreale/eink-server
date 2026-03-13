import React from "react";

/**
 * Wraps text so it sits on integer pixel boundaries (pixel-perfect for pixel fonts).
 * - Uses integer lineHeight so each line starts at integer y (0, lineHeight, 2*lineHeight, …).
 * - When width and parentWidth are set, centers with integer margins so the block starts at integer x.
 * - For multiline string content, each line is rendered in a fixed-height block (height = lineHeight).
 * - Use integer lineHeight; for centering, use same parity for width and parentWidth (both even or both odd).
 */
type PixelPerfectTextProps = {
  /** Integer line height in px. Each line will start at integer y. */
  lineHeight: number;
  /** Optional integer width in px. Use with parentWidth for centered integer positioning. */
  width?: number;
  /** When set with width, marginLeft/Right = (parentWidth - width) / 2. Use same parity as width. */
  parentWidth?: number;
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
  multiline = false,
  text,
  className = "",
  children,
  style = {},
  as: Tag = "div",
}: PixelPerfectTextProps) {
  const lineHeightPx = `${lineHeight}px`;
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

  return (
    <Tag className={className} style={baseStyle}>
      {content}
    </Tag>
  );
}
