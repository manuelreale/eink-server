import React, { useState, useEffect } from "react";
import Head from "next/head";
import { getLunarAgePercent } from "../lib/moonPhase";
import CalendarColumn from "../components/CalendarColumn";
import YearGrid from "../components/YearGrid";
import RightColumn from "../components/RightColumn";
import PixelPerfectText from "../components/PixelPerfectText";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const DAY_NAMES_JP = [
  "日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日",
];

export default function EInkCalendar() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const [holidays, setHolidays] = useState<Set<string>>(new Set());
  const [rokuyo, setRokuyo] = useState<{
    nameDisplay: string;
    kanji: string;
    meaning: string;
  } | null>(null);
  const [factOfTheDay, setFactOfTheDay] = useState<string | null>(null);
  const [dayForecast, setDayForecast] = useState<{
    moments: { label: string; icon: "sun" | "clouds" | "rain" | "snow" }[];
    max: number;
    min: number;
    avg: number;
  } | null>(null);
  const [moonDebugDaysOffset, setMoonDebugDaysOffset] = useState(0);
  const [moonPhaseApi, setMoonPhaseApi] = useState<{
    date: string;
    phasePercent: number;
    source?: "api" | "fallback";
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/weather-forecast")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Weather API error"))))
      .then((data: { moments: { label: string; icon: "sun" | "clouds" | "rain" | "snow" }[]; max: number; min: number; avg: number }) => {
        if (!cancelled) setDayForecast({ moments: data.moments, max: data.max, min: data.min, avg: data.avg });
      })
      .catch(() => { if (!cancelled) setDayForecast(null); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const viewDate = new Date();
    viewDate.setDate(viewDate.getDate() + moonDebugDaysOffset);
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(viewDate.getDate()).padStart(2, "0")}`;
    let cancelled = false;
    fetch(`/api/moonphase?date=${encodeURIComponent(dateStr)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Moon phase API error"))))
      .then((data: { phasePercent: number; source?: "api" | "fallback"; errorDetails?: string }) => {
        if (!cancelled) {
          if (data.source === "fallback" && data.errorDetails) {
            console.error("Moon phase fallback (API failed):", data.errorDetails);
          }
          setMoonPhaseApi({ date: dateStr, phasePercent: data.phasePercent, source: data.source });
        }
      })
      .catch(() => { if (!cancelled) setMoonPhaseApi(null); });
    return () => { cancelled = true; };
  }, [moonDebugDaysOffset]);

  useEffect(() => {
    async function fetchRokuyo() {
      try {
        const res = await fetch("/api/rokuyo");
        if (res.ok) {
          const data = await res.json();
          setRokuyo({ nameDisplay: data.nameDisplay, kanji: data.kanji, meaning: data.meaning });
        }
      } catch (error) {
        console.error("Error fetching Rokuyō:", error);
      }
    }
    fetchRokuyo();
  }, []);

  useEffect(() => {
    async function fetchFactOfTheDay() {
      try {
        const res = await fetch("/api/factoftheday");
        if (res.ok) {
          const data = await res.json();
          setFactOfTheDay(data.fact ?? null);
        }
      } catch (error) {
        console.error("Error fetching fact of the day:", error);
      }
    }
    fetchFactOfTheDay();
  }, []);

  useEffect(() => {
    const years = [currentYear, nextMonthYear].filter((y, i, a) => a.indexOf(y) === i);
    Promise.all(
      years.flatMap((year) => [
        fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/NL`),
        fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IT`),
      ])
    )
      .then((responses) => Promise.all(responses.map((r) => r.json())))
      .then((results) => {
        const set = new Set<string>();
        results.flat().forEach((h: { date: string }) => set.add(h.date));
        setHolidays(set);
      })
      .catch(() => setHolidays(new Set()));
  }, [currentYear, nextMonthYear]);

  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);
  const msPerDay = 86400000;
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / msPerDay) + 1;
  const daysUntilEndOfYear = Math.floor((endOfYear.getTime() - today.getTime()) / msPerDay);

  const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const showRedCircle = today.getDate() === 1 || holidays.has(todayStr);

  const moonViewDate = new Date(today);
  moonViewDate.setDate(today.getDate() + moonDebugDaysOffset);
  const moonViewDateStr = `${moonViewDate.getFullYear()}-${String(moonViewDate.getMonth() + 1).padStart(2, "0")}-${String(moonViewDate.getDate()).padStart(2, "0")}`;
  const moonPhasePercent = Math.round(
    (moonPhaseApi?.date === moonViewDateStr ? moonPhaseApi.phasePercent : getLunarAgePercent(moonViewDate)) * 10000
  ) / 10000;

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>E-Ink Calendar</title>
      </Head>

      <div className="w-[960px] h-[680px] absolute top-0 left-0 flex flex-row">
        <CalendarColumn
          displayMonth={currentMonth}
          displayMonthYear={currentYear}
          monthNames={MONTH_NAMES}
          todayDayName={DAY_NAMES[today.getDay()]}
          todayDayNameJP={DAY_NAMES_JP[today.getDay()]}
          rokuyo={rokuyo}
          holidays={holidays}
        />

        <div className=" w-1/2 h-full relative px-[4px] py-[12px] gap-[20px] flex flex-col items-left">
          <div
            className="text-[72px] h-[80px] leading-[80px] text-center"
            style={{
              fontFamily: '"Anybody Variable", sans-serif',
              fontWeight: 800,
              fontVariationSettings: '"wdth" 150',
            }}
          >
            {currentYear}
          </div>
          <div className="relative flex items-center justify-center">
            {showRedCircle && (
              <div
                className="absolute rounded-full bg-red-500 w-[400px] h-[400px]"
                aria-hidden
              />
            )}
            <div className="font-calendar-numerals text-[410px] leading-[419px] relative z-10">
              {today.getDate()}
            </div>
          </div>
          <div className="w-[489px] mt-[12px] ml-[-12px]">
            <PixelPerfectText
              lineHeight={17}
              width={489}
              centerAlignPixelPerfect
              className="text-center font-jacquarda-bastarda-9 text-[13px]"
            >
              {`Today is day ${dayOfYear} of the year, ${daysUntilEndOfYear} days remaining this year - ${(dayOfYear / 365 * 100).toFixed(1)}% complete`}
            </PixelPerfectText>
            <YearGrid currentYear={currentYear} today={today} />
          </div>
        </div>

        <RightColumn
          moonPhasePercent={moonPhasePercent}
          moonViewDate={moonViewDate}
          moonDebugDaysOffset={moonDebugDaysOffset}
          setMoonDebugDaysOffset={setMoonDebugDaysOffset}
          factOfTheDay={factOfTheDay}
          dayForecast={dayForecast}
          nextMonth={nextMonth}
          nextMonthYear={nextMonthYear}
          holidays={holidays}
          monthNames={MONTH_NAMES}
        />
      </div>
    </>
  );
}
