import type { NextApiRequest, NextApiResponse } from "next";

type Holiday = {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
};

type HolidayResponse = {
  holidays: Holiday[];
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

async function fetchHolidaysForCountry(
  year: number,
  country: string
): Promise<Holiday[]> {
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;
  const apiRes = await fetch(url, { cache: "no-store" });
  if (!apiRes.ok) {
    const text = await apiRes.text();
    throw new Error(`Holiday fetch failed for ${country}: ${apiRes.status} ${text}`);
  }
  return (await apiRes.json()) as Holiday[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HolidayResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const countryEnv = requiredEnv("HOLIDAYS_COUNTRY_CODES"); // e.g., "NL,IT"
    const countries = countryEnv
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const year = new Date().getFullYear();
    const results = await Promise.all(
      countries.map((code) => fetchHolidaysForCountry(year, code))
    );

    // Merge and de-duplicate by date (keep first name)
    const merged: Record<string, Holiday> = {};
    results.flat().forEach((h) => {
      if (!merged[h.date]) merged[h.date] = h;
    });

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=86400");
    return res.status(200).json({ holidays: Object.values(merged) });
  } catch (error: any) {
    console.error("Holidays API error:", error);
    return res.status(500).json({ error: "Failed to load holidays" });
  }
}

