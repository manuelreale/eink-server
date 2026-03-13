import type { NextApiRequest, NextApiResponse } from "next";

const LUNAR_MONTH_DAYS = 29.530588853;
const NEW_MOON_JD = 2451550.1;

export type MoonPhaseResponse = {
  phasePercent: number;
  phaseName: string;
  illumination: number;
  daysSinceNew: number;
  source?: "api" | "fallback";
  /** Present when source is "fallback"; actual API failure reason for console.error. */
  errorDetails?: string;
};

function getJulianDateUTC(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Phase in [0, 1) for noon UTC on the given date (same formula as up.tsx). */
function getLunarAgePercentFallback(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const noonUTC = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0));
  const jd = getJulianDateUTC(noonUTC);
  let v = (jd - NEW_MOON_JD) / LUNAR_MONTH_DAYS;
  v = v - Math.floor(v);
  if (v < 0) v += 1;
  return Math.round(v * 10000) / 10000;
}

/** ViewBits: GET ?startdate=YYYY-MM-DD returns 7 days (3 before, day, 3 after). No key, 5 req/30s. */
async function tryViewBits(dateStr: string, errors: string[]): Promise<MoonPhaseResponse | null> {
  const res = await fetch(`https://api.viewbits.com/v1/moonphase?startdate=${dateStr}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    const msg = `ViewBits ${res.status} ${res.statusText}${body ? `: ${body.slice(0, 150)}` : ""}`;
    errors.push(msg);
    console.error("Moon phase", msg);
    return null;
  }
  const arr = (await res.json()) as Array<{ date: string; phase?: string; moon_age?: string; illumination?: string }>;
  const day = Array.isArray(arr) ? arr.find((o) => o.date === dateStr) : null;
  if (!day || typeof day.moon_age !== "string") return null;
  const daysSinceNew = parseFloat(day.moon_age.replace(/\s*days?$/i, "").trim());
  if (Number.isNaN(daysSinceNew)) return null;
  let phasePercent = (daysSinceNew % LUNAR_MONTH_DAYS) / LUNAR_MONTH_DAYS;
  if (phasePercent < 0) phasePercent += 1;
  const illumStr = typeof day.illumination === "string" ? day.illumination.replace(/%/, "") : "";
  const illumination = Number.isNaN(Number(illumStr)) ? 0 : Number(illumStr);
  return {
    phasePercent: Math.round(phasePercent * 10000) / 10000,
    phaseName: typeof day.phase === "string" ? day.phase : "Unknown",
    illumination,
    daysSinceNew,
    source: "api",
  };
}

/** PhaseOfTheMoonToday: GET /v1/date/YYYY-MM-DD. Often returns 503. */
async function tryPhaseOfTheMoonToday(dateStr: string, errors: string[]): Promise<MoonPhaseResponse | null> {
  const res = await fetch(`https://api.phaseofthemoontoday.com/v1/date/${dateStr}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    const msg = `PhaseOfTheMoonToday ${res.status} ${res.statusText}${body ? `: ${body.slice(0, 150)}` : ""}`;
    errors.push(msg);
    console.error("Moon phase", msg);
    return null;
  }
  const data = (await res.json()) as { phase?: string; illumination?: number; days_since_new?: number };
  const daysSinceNew = typeof data.days_since_new === "number" ? data.days_since_new : 0;
  let phasePercent = (daysSinceNew % LUNAR_MONTH_DAYS) / LUNAR_MONTH_DAYS;
  if (phasePercent < 0) phasePercent += 1;
  return {
    phasePercent: Math.round(phasePercent * 10000) / 10000,
    phaseName: typeof data.phase === "string" ? data.phase : "Unknown",
    illumination: typeof data.illumination === "number" ? data.illumination : 0,
    daysSinceNew,
    source: "api",
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const dateParam = req.query.date as string | undefined;
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return res.status(400).json({ error: "Query 'date' must be YYYY-MM-DD" });
  }

  // Try ViewBits first; then PhaseOfTheMoonToday; then formula. Collect errors for client.
  const errors: string[] = [];
  let result: MoonPhaseResponse | null = null;

  try {
    result = await tryViewBits(dateParam, errors);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`ViewBits: ${msg}`);
    console.error("Moon phase ViewBits fetch failed:", err);
  }
  if (!result) {
    try {
      result = await tryPhaseOfTheMoonToday(dateParam, errors);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`PhaseOfTheMoonToday: ${msg}`);
      console.error("Moon phase PhaseOfTheMoonToday fetch failed:", err);
    }
  }

  if (result) {
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json(result);
  }

  const phasePercent = getLunarAgePercentFallback(dateParam);
  const errorDetails = errors.length > 0 ? errors.join("; ") : "Both APIs failed";
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  return res.status(200).json({
    phasePercent,
    phaseName: "Unknown",
    illumination: 0,
    daysSinceNew: phasePercent * LUNAR_MONTH_DAYS,
    source: "fallback",
    errorDetails,
  } satisfies MoonPhaseResponse);
}
