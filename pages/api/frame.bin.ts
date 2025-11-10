import type { NextApiRequest, NextApiResponse } from "next";
import { createCanvas } from "canvas";

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

// Very simple classifier: decide if a pixel is black, red or white
function classifyPixel(r: number, g: number, b: number, a: number): "black" | "red" | "white" {
  if (a < 128) return "white";

  const isBlack = r < 80 && g < 80 && b < 80;
  const isRed = r > 150 && g < 80 && b < 80;

  if (isBlack) return "black";
  if (isRed) return "red";
  return "white";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ---- 1) Render the layout into a canvas (using a normal web-like font) ----

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background white
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Black header bar
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, 80);

  // Header text (white on black)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "48px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("My E-Ink Dashboard", 40, 40);

  // Red rectangle in the main area
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(40, 120, 300, 200);

  // Text inside red box (white)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "32px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("STATUS: OK", 60, 220);

  // Black text lower down
  ctx.fillStyle = "#000000";
  ctx.font = "36px sans-serif";
  ctx.fillText("Next.js → ESP32 → Waveshare", 40, 380);

  // ---- 2) Convert RGBA canvas → black/red bitplanes ----

  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imageData.data; // [r,g,b,a, r,g,b,a, ...]

  const blackPlane = new Uint8Array(BYTES_PER_PLANE);
  const redPlane = new Uint8Array(BYTES_PER_PLANE);
  blackPlane.fill(0xff); // 1 = not black
  redPlane.fill(0xff);   // 1 = not red

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const idx = (y * WIDTH + x) * 4;
      const r = data[idx + 0];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const c = classifyPixel(r, g, b, a);
      if (c === "black") {
        setBlackPixel(blackPlane, x, y);
      } else if (c === "red") {
        setRedPixel(redPlane, x, y);
      }
      // white = leave both as 1
    }
  }

  // ---- 3) Concatenate planes and send response ----

  const full = Buffer.alloc(BYTES_PER_PLANE * 2);
  Buffer.from(blackPlane).copy(full, 0);
  Buffer.from(redPlane).copy(full, BYTES_PER_PLANE);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", full.length.toString());
  res.status(200).send(full);
}