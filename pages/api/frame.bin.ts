import type { NextApiRequest, NextApiResponse } from "next";
import { createCanvas, registerFont } from "canvas";
import path from "path";

const WIDTH = 960;
const HEIGHT = 680;
const BYTES_PER_PLANE = (WIDTH * HEIGHT) / 8; // 652800 / 8 = 81600

// ---- BITPLANE HELPERS ----
function setBlackPixel(black: Uint8Array, x: number, y: number) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  black[byteIndex] &= ~(1 << bitIndex); // 0 = black
}

function setRedPixel(red: Uint8Array, x: number, y: number) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  red[byteIndex] &= ~(1 << bitIndex); // 0 = red
}

// Classify an RGBA pixel as "white" | "black" | "red"
function classifyPixel(r: number, g: number, b: number, a: number) {
  if (a < 128) {
    return "white";
  }

  // Tweak these thresholds if needed based on what you draw
  const isBlack = r < 80 && g < 80 && b < 80;
  const isRed   = r > 150 && g < 80 && b < 80;
  if (isBlack) return "black";
  if (isRed) return "red";
  return "white";
}

// Register a custom font once
let fontRegistered = false;
function ensureFont() {
  if (fontRegistered) return;
  const fontPath = path.join(process.cwd(), "public", "fonts", "Inter-Regular.ttf");
  registerFont(fontPath, { family: "Inter" });
  fontRegistered = true;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  ensureFont();

  // ---- 1) Render pretty stuff into an RGBA canvas ----
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background white
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Black header bar
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, 80);

  // Red rectangle
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(40, 120, 300, 200);

  // Text in header (white text over black bar)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "48px Inter";
  ctx.textBaseline = "middle";
  ctx.fillText("My E-Ink Dashboard", 40, 40); // y = 40 is center of 0..80

  // Black text below
  ctx.fillStyle = "#000000";
  ctx.font = "36px Inter";
  ctx.fillText("Next.js → ESP32 → Waveshare", 40, 370);

  // Red text inside red box (use white or black for contrast as you prefer)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "32px Inter";
  ctx.fillText("STATUS: OK", 60, 220);

  // ---- 2) Convert RGBA image → black/red bitplanes ----
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imageData.data; // [r,g,b,a, r,g,b,a, ...]

  const blackPlane = new Uint8Array(BYTES_PER_PLANE);
  const redPlane   = new Uint8Array(BYTES_PER_PLANE);
  blackPlane.fill(0xff); // all white
  redPlane.fill(0xff);   // all white

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const idx = (y * WIDTH + x) * 4;
      const r = data[idx + 0];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const cls = classifyPixel(r, g, b, a);
      if (cls === "black") {
        setBlackPixel(blackPlane, x, y);
      } else if (cls === "red") {
        setRedPixel(redPlane, x, y);
      }
      // white = leave both planes = 1
    }
  }

  // ---- 3) Concatenate black + red planes and respond ----
  const full = Buffer.alloc(BYTES_PER_PLANE * 2);
  Buffer.from(blackPlane).copy(full, 0);
  Buffer.from(redPlane).copy(full, BYTES_PER_PLANE);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", full.length.toString());
  res.status(200).send(full);
}