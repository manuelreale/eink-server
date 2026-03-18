import { CSSProperties } from "react";

export type PixelValue = string | 0;
export type PixelMap = PixelValue[][];

type PatternConfig = {
  map: PixelMap;
  zoom?: number;
};

const pixelPatternToDataURL = (map: PixelMap) => {
  const rects: string[] = [];

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const value = map[y][x];
      if (!value) continue;
      const color = typeof value === "string" ? value : "#000";
      rects.push(
        `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`
      );
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${map[0].length}" height="${map.length}" shape-rendering="crispEdges">${rects.join(
    ""
  )}</svg>`;
  const encoded = encodeURIComponent(svg).replace(/%20/g, " ");
  return `url("data:image/svg+xml,${encoded}")`;
};

const PATTERNS: Record<string, PatternConfig> = {
  // Grey patterns ordered from lightest to darkest (10% to 90%)
  grey5: {
    map: [
      [0, 0, 0, 0],
      [0, 0, "#000", 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  red5: {
    map: [
      [0, "#ff0000", 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, "#ff0000"],
      [0, 0, 0, 0],
    ],
  },
  grey10: {
    map: [
      [0, "#000", 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, "#000"],
      [0, 0, 0, 0],
    ],
  },
  red10: {
    map: [
      [0, "#ff0000", 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, "#ff0000"],
      [0, 0, 0, 0],
    ],
  },
  red1: {
    map: [
      [0, "#ff0000", 0, 0,0,0,0,0],
      [0, 0, 0, 0,0,0,0,0],
      [0, 0, 0, 0,0,0,0,0],
      [0, 0, 0, 0,0,0,0,0],
      [0, 0, 0, 0,0,"#ff0000",0,0],
      [0, 0, 0, 0,0,0,0,0],
      [0, 0, 0, 0,0,0,0,0],
      [0, 0, 0, 0,0,0,0,0]
    ],
  },
  grey20: {
    map: [
      [0, "#000", 0, "#000"],
      [0, 0, 0, 0],
      [0, 0, 0, "#000"],
      [0, 0, 0, 0],
    ],
  },
  red20: {
    map: [
      [0, "#ff0000", 0, "#ff0000"],
      [0, 0, 0, 0],
      [0,0, "#ff0000", 0],
      [0, 0, 0, 0]
    ],
  },
  grey25h: {
    map: [
      [0, "#000", 0, "#000"],
      [0, 0, 0, 0],
      [0, "#000", 0, "#000"],
      [0, 0, 0, 0],
    ],
  },
  grey25: {
    map: [
      [0, "#000", 0, 0],
      [0, 0, 0, "#000"],
      [0, "#000", 0, 0],
      [0, 0, 0, "#000"],
    ],
  },
  grey40: {
    map: [
      ["#000", 0, "#000", 0],
      [0, "#000", 0, "#000"],
      ["#000", 0, "#000", 0],
      [0, 0, 0, 0],
    ],
  },
  grey50: {
    map: [
      ["#000", 0],
      [0, "#000"],
    ],
    zoom: 1,
  },
  grey60: {
    map: [
      ["#000", 0, "#000", 0],
      [0, "#000", "#000", "#000"],
      ["#000", 0, "#000", 0],
      ["#000", "#000", 0, "#000"],
    ],
  },
  grey70: {
    map: [
      ["#000", 0, "#000", "#000"],
      ["#000", "#000", "#000", 0],
      ["#000", 0, "#000", "#000"],
      ["#000", "#000", "#000", 0],
    ],
  },
  grey80: {
    map: [
      ["#000", "#000", "#000", 0],
      ["#000", "#000", "#000", "#000"],
      ["#000", 0, "#000", "#000"],
      ["#000", "#000", "#000", "#000"],
    ],
  },
  grey90: {
    map: [
      ["#000", 0, "#000", "#000"],
      ["#000", "#000", "#000", "#000"],
      ["#000", "#000", "#000", "#000"],
      ["#000", "#000", "#000", "#000"],
    ],
  },
  // Non-grey patterns
  diagonal: {
    map: [
      ["#000", 0, 0],
      [0, "#000", 0],
      [0, 0, "#000"],
    ],
    zoom: 1,
  },
};

export const pixelPatternStyles: Record<string, CSSProperties> =
  Object.fromEntries(
    Object.entries(PATTERNS).map(([name, { map, zoom = 1 }]) => {
      const baseWidth = map[0].length;
      const baseHeight = map.length;

      return [
        name,
        {
          backgroundImage: pixelPatternToDataURL(map),
          backgroundSize: `${baseWidth * zoom}px ${baseHeight * zoom}px`,
          backgroundRepeat: "repeat",
          imageRendering: "pixelated",
        } satisfies CSSProperties,
      ];
    })
  );

export type PixelPatternName = keyof typeof pixelPatternStyles;

