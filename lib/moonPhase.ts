/**
 * Moon phase: synodic month ≈ 29.53 days. Uses noon UTC on the calendar day (almanac convention).
 */
const LUNAR_MONTH_DAYS = 29.530588853;
const NEW_MOON_JD = 2451550.1;

export function getJulianDateUTC(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Returns lunar age in [0, 1) for noon UTC on the given calendar day. */
export function getLunarAgePercent(calendarDate: Date): number {
  const y = calendarDate.getFullYear();
  const m = calendarDate.getMonth();
  const d = calendarDate.getDate();
  const noonUTC = new Date(Date.UTC(y, m, d, 12, 0, 0, 0));
  const jd = getJulianDateUTC(noonUTC);
  let v = (jd - NEW_MOON_JD) / LUNAR_MONTH_DAYS;
  v = v - Math.floor(v);
  if (v < 0) v += 1;
  return v;
}

export const MOON_PHASE_LABELS: Record<string, string> = {
  new: "New Moon",
  full: "Full Moon",
  "waxing-crescent": "Waxing Crescent",
  "first-quarter": "First Quarter",
  "waxing-gibbous": "Waxing Gibbous",
  "waning-gibbous": "Waning Gibbous",
  "last-quarter": "Last Quarter",
  "waning-crescent": "Waning Crescent",
};

export function getMoonPhaseNameFromKind(kind: string): string {
  return MOON_PHASE_LABELS[kind] ?? "New Moon";
}

export const INNER_R = 40; // 80px diameter for moon graphic

export type MoonPhaseShape = {
  kind: string;
  ellipseRx: number;
  semicircleLeft: boolean;
  ellipseWhite: boolean;
};

/** Returns shape for the inner 80px shadow (semicircle + ellipse). */
export function getMoonPhaseShape(phasePercent: number): MoonPhaseShape {
  if (phasePercent < 0.017 || phasePercent >= 0.983)
    return { kind: "new", ellipseRx: 0, semicircleLeft: true, ellipseWhite: true };
  if (phasePercent >= 0.49 && phasePercent < 0.54)
    return { kind: "full", ellipseRx: 0, semicircleLeft: true, ellipseWhite: true };
  if (phasePercent > 0 && phasePercent < 0.22) {
    const t = phasePercent / 0.22;
    return { kind: "waxing-crescent", ellipseRx: INNER_R * (1 - t), semicircleLeft: true, ellipseWhite: false };
  }
  if (phasePercent >= 0.22 && phasePercent < 0.28)
    return { kind: "first-quarter", ellipseRx: 0, semicircleLeft: true, ellipseWhite: true };
  if (phasePercent >= 0.28 && phasePercent < 0.49) {
    const t = (phasePercent - 0.28) / 0.21;
    return { kind: "waxing-gibbous", ellipseRx: INNER_R * t, semicircleLeft: true, ellipseWhite: true };
  }
  if (phasePercent >= 0.54 && phasePercent < 0.75) {
    const t = (phasePercent - 0.54) / 0.21;
    return { kind: "waning-gibbous", ellipseRx: INNER_R * (1 - t), semicircleLeft: false, ellipseWhite: true };
  }
  if (phasePercent >= 0.75 && phasePercent < 0.78)
    return { kind: "last-quarter", ellipseRx: 0, semicircleLeft: false, ellipseWhite: false };
  const t = (phasePercent - 0.78) / 0.22;
  return { kind: "waning-crescent", ellipseRx: INNER_R * Math.min(1, t), semicircleLeft: false, ellipseWhite: false };
}

export const LEFT_SEMICIRCLE = "M 50 50 L 50 10 A 40 40 0 0 0 50 90 Z";
export const RIGHT_SEMICIRCLE = "M 50 50 L 50 10 A 40 40 0 0 1 50 90 Z";
