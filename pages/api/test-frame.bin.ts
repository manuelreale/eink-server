import type { NextApiRequest, NextApiResponse } from "next";

const WIDTH = 960;
const HEIGHT = 680;
const BYTES_PER_PLANE = (WIDTH * HEIGHT) / 8; // 81600

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // All-black test frame:
  // black plane = 0x00 (bits 0 → black)
  // red plane   = 0xFF (no red)
  const black = new Uint8Array(BYTES_PER_PLANE);
  const red = new Uint8Array(BYTES_PER_PLANE);

  black.fill(0x00); // every pixel black
  red.fill(0xff);   // no red pixels

  const full = Buffer.alloc(BYTES_PER_PLANE * 2);
  Buffer.from(black).copy(full, 0);
  Buffer.from(red).copy(full, BYTES_PER_PLANE);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", full.length.toString());
  res.status(200).send(full);
}