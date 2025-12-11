import type { NextApiRequest, NextApiResponse } from "next";

type CalendarEvent = {
  dateISO: string;
  title: string;
  pattern?: string;
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
  // DATE (all-day): YYYYMMDD
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const d = new Date(Date.UTC(year, month, day));
    return d.toISOString().split("T")[0];
  }
  // DATE-TIME: YYYYMMDDTHHMMSSZ (we only need the date part)
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const d = new Date(Date.UTC(year, month, day));
    return d.toISOString().split("T")[0];
  }
  return null;
}

function parseICS(ics: string, windowStart: string, windowEnd: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const blocks = ics.split("BEGIN:VEVENT").slice(1);
  for (const block of blocks) {
    const section = "BEGIN:VEVENT" + block;
    const summaryMatch = section.match(/^SUMMARY:(.+)$/m);
    const dtStartMatch = section.match(/^DTSTART[^:]*:(.+)$/m);
    if (!dtStartMatch) continue;
    const dateISO = parseICSDate(dtStartMatch[1]);
    if (!dateISO) continue;

    // Apply window filter
    if (dateISO < windowStart || dateISO > windowEnd) continue;

    const title = summaryMatch ? summaryMatch[1].trim() : "Untitled";
    events.push({ dateISO, title });
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

