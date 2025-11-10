// pages/api/frame.bin.ts
import type { NextApiRequest, NextApiResponse } from "next";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const WIDTH = 960;
const HEIGHT = 680;
const BYTES_PER_PLANE = (WIDTH * HEIGHT) / 8;

// ---- plane helpers ----
function setBlackPixel(black: Uint8Array, x: number, y: number) {
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  const mask = 1 << bitIndex;
  black[byteIndex] &= ~mask; // 0 = black
}

function setRedPixel(red: Uint8Array, x: number, y: number) {
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  const mask = 1 << bitIndex;
  red[byteIndex] &= ~mask; // 0 = red
}

function classifyPixel(
  r: number,
  g: number,
  b: number
): "white" | "black" | "red" {
  if (r > 160 && g < 80 && b < 80) return "red";
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 128 ? "black" : "white";
}

async function getBrowser() {
  const executablePath = await chromium.executablePath();
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
    },
    executablePath: executablePath || undefined,
    headless: true,
  });
}

// ---- API handler ----
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let browser: puppeteer.Browser | null = null;

  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    const proto =
      (req.headers["x-forwarded-proto"] as string | undefined) || "https";
    const host = req.headers.host;
    const pageUrl = `${proto}://${host}/eink`;

    await page.goto(pageUrl, { waitUntil: "networkidle0" });

    // screenshot as PNG
    const pngBuffer = (await page.screenshot({
      type: "png",
    })) as Buffer;

    // Debug view in browser: /api/frame.bin?debug=1
    if (req.query.debug === "1") {
      res.setHeader("Content-Type", "image/png");
      res.status(200).send(pngBuffer);
      return;
    }

    // PNG → raw RGBA
    const { data, info } = await sharp(pngBuffer)
      .resize(WIDTH, HEIGHT, { fit: "cover" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const blackPlane = new Uint8Array(BYTES_PER_PLANE);
    const redPlane = new Uint8Array(BYTES_PER_PLANE);
    blackPlane.fill(0xff);
    redPlane.fill(0xff);

    let idx = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        idx += 4;

        const color = classifyPixel(r, g, b);
        if (color === "black") setBlackPixel(blackPlane, x, y);
        else if (color === "red") setRedPixel(redPlane, x, y);
      }
    }

    const full = Buffer.alloc(BYTES_PER_PLANE * 2);
    Buffer.from(blackPlane).copy(full, 0);
    Buffer.from(redPlane).copy(full, BYTES_PER_PLANE);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", full.length.toString());
    res.status(200).send(full);
  } catch (err: any) {
    console.error("frame.bin error:", err);
    res
      .status(500)
      .json({ error: err?.message || "Unknown error while rendering frame" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}