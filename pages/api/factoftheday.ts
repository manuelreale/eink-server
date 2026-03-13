import type { NextApiRequest, NextApiResponse } from "next";

type FactItem = { fact: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FactItem | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.API_NINJAS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_NINJAS_API_KEY not configured" });
  }

  try {
    const response = await fetch("https://api.api-ninjas.com/v1/factoftheday", {
      headers: { "X-Api-Key": apiKey },
    });
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Fact of the day request failed" });
    }
    const data = (await response.json()) as FactItem[];
    const fact = Array.isArray(data) && data[0]?.fact ? data[0] : { fact: "" };
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=86400");
    return res.status(200).json(fact);
  } catch (error) {
    console.error("Fact of the day API error:", error);
    return res.status(500).json({ error: "Failed to load fact of the day" });
  }
}
