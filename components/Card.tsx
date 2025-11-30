import React from "react";
import { CSSProperties } from "react";

type CornerSize = "5px" | "10px";
type CornerFill = "black" | "white";

interface CardProps {
  children: React.ReactNode;
  patternStyle?: CSSProperties;
  cornerSize?: CornerSize;
  cornerFill?: CornerFill;
  className?: string;
  style?: CSSProperties;
}

export default function Card({
  children,
  patternStyle,
  cornerSize = "5px",
  cornerFill = "black",
  className = "",
  style,
}: CardProps) {
  const wrapperClass = `pixel-corners-${cornerSize}--wrapper pixel-corner-fill-${cornerFill}`;
  const innerClass = `pixel-corners-${cornerSize}`;

  return (
    <div className={wrapperClass} style={style}>
      <div className={`${innerClass} w-full h-full ${className}`} style={patternStyle}>
        {children}
      </div>
    </div>
  );
}

