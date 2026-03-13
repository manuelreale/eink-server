import type { NextApiRequest, NextApiResponse } from "next";
import { Solar } from "lunar-javascript";

export type RokuyoItem = {
  id: string;
  name: string; // romanized, e.g. "Sasimake"
  nameDisplay: string; // e.g. "Rokuyō - Sasimake"
  kanji: string; // e.g. "先負"
  meaning: string; // e.g. "Unlucky morning,\nlucky afternoon"
};

// All six Rokuyō days. Map key = lunar-javascript getLiuYao() output (simplified Chinese).
const ROKUYO_BY_LIUYAO: Record<string, RokuyoItem> = {
  大安: {
    id: "taian",
    name: "Taian",
    nameDisplay: "Rokuyō - Taian",
    kanji: "大安",
    meaning: "Most auspicious",
  },
  赤口: {
    id: "shakko",
    name: "Shakkō",
    nameDisplay: "Rokuyō - Shakkō",
    kanji: "赤口",
    meaning: "Unlucky except noon",
  },
  先胜: {
    id: "sensho",
    name: "Senshō",
    nameDisplay: "Rokuyō - Senshō",
    kanji: "先勝",
    meaning: "Lucky morning,\nunlucky afternoon",
  },
  友引: {
    id: "tomobiki",
    name: "Tomobiki",
    nameDisplay: "Rokuyō - Tomobiki",
    kanji: "友引",
    meaning: "Unlucky at noon",
  },
  先负: {
    id: "sasimake",
    name: "Sasimake",
    nameDisplay: "Rokuyō - Sasimake",
    kanji: "先負",
    meaning: "Unlucky morning,\nlucky afternoon",
  },
  佛灭: {
    id: "butsumetsu",
    name: "Butsumetsu",
    nameDisplay: "Rokuyō - Butsumetsu",
    kanji: "仏滅",
    meaning: "Most inauspicious",
  },
};

/**
 * Rokuyō is derived from the lunar calendar: (lunar month + lunar day) mod 6.
 * We use lunar-javascript so the result is correct for any date (no fixed anchor).
 */
function getRokuyoForDate(d: Date): RokuyoItem | null {
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-based for Solar.fromYmd
  const day = d.getDate();
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const liuYao = lunar.getLiuYao(); // e.g. "先胜", "大安", "赤口"
  return ROKUYO_BY_LIUYAO[liuYao] ?? null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RokuyoItem | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const dateParam = req.query.date as string | undefined;
    const d = dateParam ? new Date(dateParam) : new Date();
    if (isNaN(d.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }
    const rokuyo = getRokuyoForDate(d);
    if (!rokuyo) {
      return res.status(500).json({ error: "Failed to get Rokuyō for date" });
    }
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(rokuyo);
  } catch (error) {
    console.error("Rokuyo API error:", error);
    return res.status(500).json({ error: "Failed to get Rokuyō" });
  }
}
