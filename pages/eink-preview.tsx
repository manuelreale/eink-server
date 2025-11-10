import type { NextApiRequest, NextApiResponse } from "next";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const WIDTH = 960;
const HEIGHT = 680;
const BYTES_PER_PLANE = (WIDTH * HEIGHT) / 8;

// ------------------ BIT HELPERS ------------------

function setBlackPixel(black: Uint8Array, x: number, y: number) {
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  black[byteIndex] &= ~(1 << bitIndex); // 0 = black
}

function setRedPixel(red: Uint8Array, x: number, y: number) {
  const pixelIndex = y * WIDTH + x;
  const byteIndex = pixelIndex >> 3;
  const bitIndex = 7 - (pixelIndex & 0x07);
  red[byteIndex] &= ~(1 << bitIndex); // 0 = red
}

function classifyPixel(r: number, g: number, b: number): "white" | "black" | "red" {
  // Red-ish → red
  if (r > 160 && g < 80 && b < 80) return "red";
  // Otherwise, check brightness
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 128 ? "black" : "white";
}

// ------------------ BROWSER SETUP ------------------

async function getBrowser() {
  const executablePath = await chromium.executablePath();
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
    executablePath,
    headless: true, // ✅ important
  });
}

// ------------------ API HANDLER ------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // --- HTML TEMPLATE (inlined) ---
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet">

  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Noto Sans JP", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .page {
      position: relative;
      width: 880px;
      height: 640px;
      border: 6px solid black;
      padding: 24px;
      display: grid;
      grid-template-columns: 160px 1fr 180px;
      grid-template-rows: 1fr auto;
      column-gap: 12px;
      row-gap: 16px;
    }
    .left {
      border-right: 3px solid black;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding-right: 10px;
    }
    .weekday {
      writing-mode: vertical-rl;
      text-orientation: upright;
      font-size: 52px;
      font-weight: 900;
      letter-spacing: 4px;
    }
    .weekday-en {
      font-size: 16px;
      font-weight: 600;
      margin-top: 10px;
    }
    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .year {
      font-size: 40px;
      font-weight: 900;
    }
    .bigday {
      font-size: 260px;
      font-weight: 900;
      line-height: 1;
      margin: 0;
    }
    .right {
      border-left: 3px solid black;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-left: 10px;
    }
    .month-num {
      font-size: 80px;
      font-weight: 900;
    }
    .month-label {
      font-size: 36px;
      font-weight: 900;
    }
    .red {
      color: #c00000;
      font-weight: 700;
      font-size: 20px;
    }
    .fortune {
      margin-top: 24px;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: black;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 900;
    }
    .kanji {
      position: absolute;
      bottom: 10px;
      left: 0; right: 0;
      text-align: center;
      font-size: 52px;
      font-weight: 900;
      border-top: 3px solid black;
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

    // --- Convert to e-ink bitplanes ---
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
    res.status(500).json({ error: err?.message || String(err) });
  }
}