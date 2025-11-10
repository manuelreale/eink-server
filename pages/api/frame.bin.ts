import type { NextApiRequest, NextApiResponse } from "next";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const WIDTH = 960;
const HEIGHT = 680;
const BYTES_PER_PLANE = (WIDTH * HEIGHT) / 8;

// ---------- Bitplane helpers ----------
function setBlackPixel(black: Uint8Array, x: number, y: number) {
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  const mask = 1 << bitIndex;
  black[byteIndex] &= ~mask;
}

function setRedPixel(red: Uint8Array, x: number, y: number) {
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  const mask = 1 << bitIndex;
  red[byteIndex] &= ~mask;
}

function classifyPixel(
  r: number,
  g: number,
  b: number
): "white" | "black" | "red" {
  // very red-ish → red plane
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
    executablePath,
    headless: true,
  });
}

// ---------- API handler ----------
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Inline HTML with Japanese font
    const html = `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <!-- Load Japanese-capable font -->
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&display=swap"
      rel="stylesheet"
    />
    <style>
      * { box-sizing: border-box; }

      body {
        margin: 0;
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        font-family: "Noto Serif JP", system-ui, -apple-system,
          BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .page {
        position: relative;
        width: 880px;
        height: 640px;
        border: 6px solid #000;
        padding: 24px;
        display: grid;
        grid-template-columns: 150px 1fr 150px;
        grid-template-rows: 1fr auto;
        column-gap: 12px;
        row-gap: 16px;
      }

      .left {
        border-right: 3px solid #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-right: 8px;
      }

      .weekday {
        writing-mode: vertical-rl;
        text-orientation: upright;
        font-size: 52px;
        font-weight: 900;
        letter-spacing: 4px;
      }

      .weekday-en {
        margin-top: 12px;
        font-size: 14px;
        font-weight: 600;
      }

      .center {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .year {
        font-size: 40px;
        font-weight: 900;
        letter-spacing: 6px;
      }

      .bigday {
        font-size: 260px;
        font-weight: 900;
        line-height: 1;
      }

      .right {
        border-left: 3px solid #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-left: 8px;
      }

      .month-num {
        font-size: 80px;
        font-weight: 900;
        line-height: 1;
      }

      .month-label {
        font-size: 36px;
        font-weight: 900;
      }

      .red {
        color: #c00000;
        font-size: 24px;
        margin-top: 8px;
      }

      .fortune {
        margin-top: 24px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: #000;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: 900;
      }

      .kanji {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 60px;
        font-weight: 900;
        border-top: 3px solid #000;
        padding-top: 6px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="left">
        <div class="weekday">木曜日</div>
        <div class="weekday-en">[THU]</div>
      </div>

      <div class="center">
        <div class="year">2026</div>
        <div class="bigday">1</div>
      </div>

      <div class="right">
        <div class="month-num">1</div>
        <div class="month-label">月</div>
        <div class="red">元日</div>
        <div class="fortune">大</div>
      </div>

      <div class="kanji">安心立命</div>
    </div>
  </body>
</html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });
    const pngBuffer = (await page.screenshot({ type: "png" })) as Buffer;
    await browser.close();

    // Optional debug mode: /api/frame.bin?debug=1 → see the PNG directly in browser
    if (req.query.debug === "1") {
      res.setHeader("Content-Type", "image/png");
      res.status(200).send(pngBuffer);
      return;
    }

    // Convert PNG → black / red planes
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
    console.error("Render error:", err);
    res
      .status(500)
      .json({ error: err?.message || "Unknown error while rendering frame" });
  }
}