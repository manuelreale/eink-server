import type { NextApiRequest, NextApiResponse } from "next";

type CalendarEvent = {
  dateISO: string;
  title: string;
  pattern?: string;
  /** Start time for timed events (not all-day), e.g. "14:30" in nl-NL / Amsterdam for UTC Z. */
  timeLabel?: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

function getWindow() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return {
    timeMin: start.toISOString().split("T")[0],
    timeMax: end.toISOString().split("T")[0],
  };
}

function parseICSDate(value: string): string | null {
  // Take the first 8 digits as the calendar day and avoid timezone shifts.
  const datePart = value.slice(0, 8);
  if (!/^\d{8}$/.test(datePart)) return null;
  const year = datePart.slice(0, 4);
  const month = datePart.slice(4, 6);
  const day = datePart.slice(6, 8);
  return `${year}-${month}-${day}`;
}

/** Human-readable start time from DTSTART; omit for all-day. */
function formatIcsEventTime(dtParams: string, dtValue: string): string | undefined {
  if (/VALUE=DATE/i.test(dtParams)) return undefined;
  const v = dtValue.trim();
  const m = v.match(/^(\d{8})T(\d{2})(\d{2})(?:(\d{2}))?(Z)?/i);
  if (!m) return undefined;
  const ymd = m[1];
  const hh = m[2];
  const mm = m[3];
  const ss = m[4] ?? "00";
  const isUtc = !!m[5];
  const y = Number(ymd.slice(0, 4));
  const mo = Number(ymd.slice(4, 6));
  const da = Number(ymd.slice(6, 8));
  if (isUtc) {
    const d = new Date(Date.UTC(y, mo - 1, da, Number(hh), Number(mm), Number(ss)));
    return new Intl.DateTimeFormat("nl-NL", {
      timeZone: "Europe/Amsterdam",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  }
  return `${hh}:${mm}`;
}

function parseICS(ics: string, windowStart: string, windowEnd: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const blocks = ics.split("BEGIN:VEVENT").slice(1);
  for (const block of blocks) {
    const section = "BEGIN:VEVENT" + block;
    const summaryMatch = section.match(/^SUMMARY:(.+)$/m);
    const dtStartHeader = section.match(/^DTSTART([^:\r\n]*):([^\r\n]+)$/im);
    if (!dtStartHeader) continue;
    const dtParams = dtStartHeader[1] ?? "";
    const dtValue = dtStartHeader[2].trim();
    const dateISO = parseICSDate(dtValue);
    if (!dateISO) continue;

    // Apply window filter
    if (dateISO < windowStart || dateISO > windowEnd) continue;

    const title = summaryMatch ? summaryMatch[1].trim() : "Untitled";
    const timeLabel = formatIcsEventTime(dtParams, dtValue);
    events.push({
      dateISO,
      title,
      ...(timeLabel ? { timeLabel } : {}),
    });
  }
  return events;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const icsUrl = requiredEnv("GOOGLE_CALENDAR_ICS_URL");
    const { timeMin, timeMax } = getWindow();

    const icsRes = await fetch(icsUrl, { cache: "no-store" });
    if (!icsRes.ok) {
      const text = await icsRes.text();
      throw new Error(`ICS fetch failed: ${icsRes.status} ${text}`);
    }
    const icsText = await icsRes.text();

    const events = parseICS(icsText, timeMin, timeMax);

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );
    return res.status(200).json({ events });
  } catch (error: any) {
    console.error("Events API error:", error);
    return res.status(500).json({ error: "Failed to load events" });
  }
}

