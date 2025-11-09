export const dynamic = "force-dynamic"; // avoid any weird caching while debugging

export async function GET() {
  const WIDTH = 960;
  const HEIGHT = 680;
  const FRAME_BYTES = (WIDTH * HEIGHT) / 8; // 81600

  // All-black screen test:
  const blackPlane = Buffer.alloc(FRAME_BYTES, 0x00); // bits 0 = black
  const redPlane   = Buffer.alloc(FRAME_BYTES, 0xFF); // bits 1 = no red

  const combined = Buffer.concat([blackPlane, redPlane]);

  return new Response(combined, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": combined.length.toString(),
      "Cache-Control": "no-store",
    },
  });
}