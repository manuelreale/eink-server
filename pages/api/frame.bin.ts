import type { NextApiRequest, NextApiResponse } from "next";

const WIDTH = 960;
const HEIGHT = 680;
const BYTES_PER_PLANE = (WIDTH * HEIGHT) / 8; // 652800 / 8 = 81600

// Helpers to set a pixel in the 1-bit planes
function setBlackPixel(black: Uint8Array, x: number, y: number) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const i = y * WIDTH + x;
  const byteIndex = i >> 3;
  const bitIndex = 7 - (i & 0x07);
  black[byteIndex] &= ~(1 << bitIndex);
}

function setRedPixel(red: Uint8Array, x: number, y: number) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const i = y * WIDTH + x;
  const byteIndex = i >> 3;
  const bitIndex = 7 - (i & 0x07);
  red[byteIndex] &= ~(1 << bitIndex);
}

// --- Simple 5x7 font for ASCII 32..127 (partial) ---
const font5x7: Record<string, number[]> = {
  A: [0x7C, 0x12, 0x11, 0x12, 0x7C],
  B: [0x7F, 0x49, 0x49, 0x49, 0x36],
  C: [0x3E, 0x41, 0x41, 0x41, 0x22],
  D: [0x7F, 0x41, 0x41, 0x22, 0x1C],
  E: [0x7F, 0x49, 0x49, 0x49, 0x41],
  F: [0x7F, 0x09, 0x09, 0x09, 0x01],
  G: [0x3E, 0x41, 0x49, 0x49, 0x7A],
  H: [0x7F, 0x08, 0x08, 0x08, 0x7F],
  I: [0x00, 0x41, 0x7F, 0x41, 0x00],
  L: [0x7F, 0x40, 0x40, 0x40, 0x40],
  O: [0x3E, 0x41, 0x41, 0x41, 0x3E],
  P: [0x7F, 0x09, 0x09, 0x09, 0x06],
  R: [0x7F, 0x09, 0x19, 0x29, 0x46],
  S: [0x46, 0x49, 0x49, 0x49, 0x31],
  T: [0x01, 0x01, 0x7F, 0x01, 0x01],
  U: [0x3F, 0x40, 0x40, 0x40, 0x3F],
  Y: [0x07, 0x08, 0x70, 0x08, 0x07],
  " ": [0x00, 0x00, 0x00, 0x00, 0x00],
  ":": [0x00, 0x36, 0x36, 0x00, 0x00],
  "0": [0x3E, 0x45, 0x49, 0x51, 0x3E],
  "1": [0x00, 0x21, 0x7F, 0x01, 0x00],
  "2": [0x23, 0x45, 0x49, 0x51, 0x21],
  "3": [0x22, 0x41, 0x49, 0x49, 0x36],
  "4": [0x0C, 0x14, 0x24, 0x7F, 0x04],
  "5": [0x72, 0x51, 0x51, 0x51, 0x4E],
  "6": [0x3E, 0x49, 0x49, 0x49, 0x26],
  "7": [0x40, 0x47, 0x48, 0x50, 0x60],
  "8": [0x36, 0x49, 0x49, 0x49, 0x36],
  "9": [0x32, 0x49, 0x49, 0x49, 0x3E],
};

// Draw a string (monospace 6px wide incl. spacing)
function drawText(
  text: string,
  plane: Uint8Array,
  x: number,
  y: number,
  color: "black" | "red"
) {
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    const glyph = font5x7[char] || font5x7[" "];
    for (let col = 0; col < 5; col++) {
      const colData = glyph[col];
      for (let row = 0; row < 7; row++) {
        if (colData & (1 << row)) {
          if (color === "black") setBlackPixel(plane, x + col, y + row);
          else if (color === "red") setRedPixel(plane, x + col, y + row);
        }
      }
    }
    x += 6; // spacing
  }
}

// === MAIN HANDLER ===
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const black = new Uint8Array(BYTES_PER_PLANE);
  const red = new Uint8Array(BYTES_PER_PLANE);
  black.fill(0xff);
  red.fill(0xff);

  // --- Background ---
  for (let y = 0; y < 80; y++) {
    for (let x = 0; x < WIDTH; x++) {
      setBlackPixel(black, x, y);
    }
  }

  // --- Red rectangle ---
  for (let y = 120; y < 320; y++) {
    for (let x = 40; x < 340; x++) {
      setRedPixel(red, x, y);
    }
  }

  // --- Text in black ---
  drawText("HELLO WORLD", black, 100, 100, "black");
  drawText("13.3INCH E-PAPER", black, 100, 380, "black");

  // --- Text in red ---
  drawText("STATUS: OK", red, 120, 200, "red");

  // Concatenate black + red planes
  const full = Buffer.alloc(BYTES_PER_PLANE * 2);
  Buffer.from(black).copy(full, 0);
  Buffer.from(red).copy(full, BYTES_PER_PLANE);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", full.length.toString());
  res.status(200).send(full);
}