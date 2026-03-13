import type { NextApiRequest, NextApiResponse } from "next";

const DELFT_LAT = 52.0067;
const DELFT_LON = 4.3556;
const TIMEZONE = "Europe/Amsterdam";

type WeatherIcon = "sun" | "clouds" | "rain" | "snow";

/** Map WMO weather code to our icon. */
function weatherCodeToIcon(code: number): WeatherIcon {
  if (code === 0 || code === 1) return "sun";
  if (code >= 2 && code <= 3) return "clouds";
  if (code === 45 || code === 48) return "clouds";
  if (code >= 71 && code <= 77) return "snow";
  if (code === 85 || code === 86) return "snow";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 95) return "rain"; // thunderstorm
  return "clouds"; // 4-44, 49-50, 68-70, 78-79, 83-84, 87-94
}

const MOMENTS: { label: string; hourStart: number; hourEnd: number }[] = [
  { label: "Dawn", hourStart: 5, hourEnd: 8 },
  { label: "Morning", hourStart: 8, hourEnd: 12 },
  { label: "Noon", hourStart: 11, hourEnd: 14 },
  { label: "Afternoon", hourStart: 14, hourEnd: 18 },
  { label: "Evening", hourStart: 17, hourEnd: 21 },
  { label: "Night", hourStart: 21, hourEnd: 24 },
];

export type DayForecastResponse = {
  moments: { label: string; icon: WeatherIcon }[];
  max: number;
  min: number;
  avg: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(DELFT_LAT));
    url.searchParams.set("longitude", String(DELFT_LON));
    url.searchParams.set("timezone", TIMEZONE);
    url.searchParams.set("forecast_days", "1");
    url.searchParams.set("hourly", "temperature_2m,weathercode");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");

    const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) {
      const text = await response.text();
      console.error("Open-Meteo error:", response.status, text.slice(0, 200));
      return res.status(502).json({ error: "Weather API error", details: response.status });
    }

    const data = (await response.json()) as {
      hourly?: { time?: string[]; temperature_2m?: number[]; weathercode?: number[] };
      daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
    };

    const temps = data.hourly?.temperature_2m ?? [];
    const codes = data.hourly?.weathercode ?? [];
    const maxTemps = data.daily?.temperature_2m_max ?? [];
    const minTemps = data.daily?.temperature_2m_min ?? [];

    const max = maxTemps[0] ?? 0;
    const min = minTemps[0] ?? 0;
    const avg = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;

    // Representative hour index (0-23) for each of the 6 moments
    const hourIndices = [6, 10, 12, 15, 19, 22]; // dawn, morning, noon, afternoon, evening, night
    const moments = MOMENTS.map((m, i) => {
      const idx = hourIndices[i] ?? 12;
      const code = codes[Math.min(idx, codes.length - 1)] ?? 2;
      return { label: m.label, icon: weatherCodeToIcon(code) };
    });

    const result: DayForecastResponse = {
      moments,
      max: Math.round(max * 10) / 10,
      min: Math.round(min * 10) / 10,
      avg: Math.round(avg * 10) / 10,
    };

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json(result);
  } catch (err) {
    console.error("Weather forecast fetch failed:", err);
    return res.status(502).json({
      error: "Failed to fetch weather",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
