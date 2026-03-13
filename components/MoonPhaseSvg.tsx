import React from "react";
import {
  getMoonPhaseShape,
  INNER_R,
  LEFT_SEMICIRCLE,
  RIGHT_SEMICIRCLE,
} from "../lib/moonPhase";

export default function MoonPhaseSvg({ phasePercent }: { phasePercent: number }) {
  const shape = getMoonPhaseShape(phasePercent);
  const cx = 50;
  const cy = 50;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full block" style={{ background: "black" }}>
      <defs>
        <clipPath id="moon-inner-clip">
          <circle cx={cx} cy={cy} r={INNER_R} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r="45" fill="white" />
      <g clipPath="url(#moon-inner-clip)">
        {shape.kind === "new" && <circle cx={cx} cy={cy} r={INNER_R} fill="black" />}
        {shape.kind !== "full" && shape.kind !== "new" && (
          <>
            <path d={shape.semicircleLeft ? LEFT_SEMICIRCLE : RIGHT_SEMICIRCLE} fill="black" />
            {shape.ellipseRx > 0 && (
              <ellipse
                cx={cx}
                cy={cy}
                rx={Math.round(shape.ellipseRx * 100) / 100}
                ry={INNER_R}
                fill={shape.ellipseWhite ? "white" : "black"}
              />
            )}
          </>
        )}
      </g>
    </svg>
  );
}
