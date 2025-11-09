import type { NextApiRequest, NextApiResponse } from "next";

const WIDTH = 960;
const HEIGHT = 680;
const BYTES_PER_PLANE = (WIDTH * HEIGHT) / 8; // 652800 / 8 = 81600

// Helpers to set a pixel in the 1-bit planes
function setBlackPixel(black: Uint8Array, x: number, y: number) {
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  const mask = 1 << bitIndex;
  // black = 0, so clear that bit
  black[byteIndex] &= ~mask;
}

function setRedPixel(red: Uint8Array, x: number, y: number) {
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  const mask = 1 << bitIndex;
  // red = 0, so clear that bit
  red[byteIndex] &= ~mask;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Start with everything = white
  const black = new Uint8Array(BYTES_PER_PLANE);
  const red = new Uint8Array(BYTES_PER_PLANE);
  black.fill(0xff); // 1 = not black
  red.fill(0xff);   // 1 = not red

  // === SIMPLE "UI" LAYOUT ===
  // Background stays white everywhere.

  // 1) Black header bar at the top (0..79)
  for (let y = 0; y < 80; y++) {
    for (let x = 0; x < WIDTH; x++) {
      setBlackPixel(black, x, y);
    }
  }

  // 2) Red rectangle in the main area
  //    x: 40..339, y: 120..319
  for (let y = 120; y < 320; y++) {
    for (let x = 40; x < 340; x++) {
      setRedPixel(red, x, y);
    }
  }

  // 3) Black "text bar" (fake text) lower down
  //    x: 40..600, y: 380..399
  for (let y = 380; y < 400; y++) {
    for (let x = 40; x < 600; x++) {
      setBlackPixel(black, x, y);
    }
  }

  // You can add more shapes here as you like:
  //  - other black rectangles
  //  - red lines, etc.

  // 4) Concatenate black + red planes into one buffer
  const full = Buffer.alloc(BYTES_PER_PLANE * 2);
  Buffer.from(black).copy(full, 0);
  Buffer.from(red).copy(full, BYTES_PER_PLANE);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", full.length.toString());
  res.status(200).send(full);
}