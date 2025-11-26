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
  sprinkle: {
    map: [
      [0, "#000", 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, "#000"],
      [0, 0, 0, 0],
    ],
  },
  checker: {
    map: [
      ["#000", 0, "#000", 0],
      [0, "#000", 0, "#000"],
      ["#000", 0, "#000", 0],
      [0, "#000", 0, "#000"],
    ],
    zoom: 4,
  },
  diagonal: {
    map: [
      ["#000", 0, 0],
      [0, "#000", 0],
      [0, 0, "#000"],
    ],
    zoom: 3,
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

