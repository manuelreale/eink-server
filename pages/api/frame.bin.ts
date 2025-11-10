// pages/api/frame.bin.ts
import type { NextApiRequest, NextApiResponse } from "next";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const WIDTH = 960;
const HEIGHT = 680;
const BYTES_PER_PLANE = (WIDTH * HEIGHT) / 8; // 652800 / 8 = 81600

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "512kb",
  },
};

// ---- Bitplane helpers ----

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

// Very simple classifier: RGB -> white / black / red
function classifyPixel(r: number, g: number, b: number): "white" | "black" | "red" {
  // Red-ish
  if (r > 160 && g < 80 && b < 80) {
    return "red";
  }

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  if (luminance < 128) {
    return "black";
  }

  return "white";
}

// ---- Puppeteer launcher ----

async function getBrowser() {
  const executablePath = await chromium.executablePath();

return puppeteer.launch({
  args: chromium.args,
  defaultViewport: {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
  },
  executablePath,
  headless: true, // ✅ fixed here
});
}

// ---- API handler ----

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const host = req.headers.host;
    const protocol = process.env.VERCEL ? "https" : "http";
    const url = `${protocol}://${host}/eink-preview`;

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle0" });

    const root = await page.$("#eink-root");
    let pngBuffer: Buffer;

    if (root) {
      pngBuffer = (await root.screenshot({ type: "png" })) as Buffer;
    } else {
      pngBuffer = (await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
      })) as Buffer;
    }

    await browser.close();

    // Convert PNG to raw RGBA
    const { data, info } = await sharp(pngBuffer)
      .resize(WIDTH, HEIGHT, { fit: "cover" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const blackPlane = new Uint8Array(BYTES_PER_PLANE);
    const redPlane = new Uint8Array(BYTES_PER_PLANE);
    blackPlane.fill(0xff); // start as white
    redPlane.fill(0xff);

    let idx = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        // const a = data[idx + 3]; // unused
        idx += 4;

        const kind = classifyPixel(r, g, b);
        if (kind === "black") {
          setBlackPixel(blackPlane, x, y);
        } else if (kind === "red") {
          setRedPixel(redPlane, x, y);
        }
      }
    }

    const full = Buffer.alloc(BYTES_PER_PLANE * 2);
    Buffer.from(blackPlane).copy(full, 0);
    Buffer.from(redPlane).copy(full, BYTES_PER_PLANE);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", full.length.toString());
    res.status(200).send(full);
  } catch (err: any) {
    console.error("Error in /api/frame.bin:", err);
    res
      .status(500)
      .json({ error: "Failed to render frame", detail: String(err?.message || err) });
  }
}