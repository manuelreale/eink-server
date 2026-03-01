// pages/eink.tsx
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { pixelPatternStyles } from "../lib/pixelPatterns";
import Card from "../components/Card";

const PATTERN_NAMES: Array<keyof typeof pixelPatternStyles> = [
  "grey5",
  "grey10",
  "grey20",
  "grey25",
  "grey40",
  "grey50",
  "grey60",
  "grey70",
  "grey80",
  "grey90",
  "diagonal",
];

export default function EInkCalendar() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Calculate next month
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  // Store holidays from API
  const [holidays, setHolidays] = useState<Set<string>>(new Set());
  
  // Fetch holidays from Nager.Date API (free, no API key needed)
  useEffect(() => {
    async function fetchHolidays() {
      try {
        // Fetch holidays for both Netherlands and Italy for the relevant year
        const year = nextMonthYear;
        const [nlResponse, itResponse] = await Promise.all([
          fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/NL`),
          fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IT`),
        ]);
        
        const nlHolidays = await nlResponse.json();
        const itHolidays = await itResponse.json();
        
        // Create a Set of holiday date strings (YYYY-MM-DD format)
        const holidaySet = new Set<string>();
        
        [...nlHolidays, ...itHolidays].forEach((holiday: { date: string }) => {
          holidaySet.add(holiday.date);
        });
        
        setHolidays(holidaySet);
      } catch (error) {
        console.error("Error fetching holidays:", error);
        // Fallback to empty set if API fails
        setHolidays(new Set());
      }
    }
    
    fetchHolidays();
  }, [nextMonthYear]);
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  
  const dayNamesJP = [
    "日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"
  ];
  
  const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];
  
  // Get today's day name
  const todayDayName = dayNames[today.getDay()];
  const todayDayNameJP = dayNamesJP[today.getDay()];
  const todayDayOfMonth = today.getDate();
  
  // Check if a date is a holiday using API data
  function isHoliday(date: Date): boolean {
    // Format date as YYYY-MM-DD to match API format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;
    
    return holidays.has(dateString);
  }
  
  // Calculate calendar grid for next month
  const firstDayOfMonth = new Date(nextMonthYear, nextMonth, 1);
  const mondayOffset = (firstDayOfMonth.getDay() + 6) % 7; // convert Sunday=0 to Monday=0
  const startDate = new Date(nextMonthYear, nextMonth, 1 - mondayOffset);
  
  const totalCells = 6 * 7;
  const allDays = Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);
    const jsDay = cellDate.getDay();
    const isWeekend = jsDay === 0 || jsDay === 6;
    const isHolidayDate = isHoliday(cellDate);
    return {
      date: cellDate,
      day: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === nextMonth,
      isWeekend,
      isHoliday: isHolidayDate,
    };
  });
  
  const weeks = Array.from({ length: 6 }, (_, weekIndex) =>
    allDays.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>E-Ink Calendar</title>
      </Head>

      <div className="w-[960px] h-[680px] absolute top-0 left-0 flex flex-row">
        {/* <img src="/img4.png" className="w-full h-full absolute top-0 left-0 z-10 opacity-100" style={{ imageRendering: "pixelated" }}/> */}
        <div className="pixel-corners-10px w-1/4 h-full relative p-[16px] gap-[16px] flex flex-col items-center justify-top">
          <div className="text-center font-noto-sans-jp leading-[1.02] font-bold text-[91px] w-[60%] h-[273px]">
            {todayDayNameJP}
          </div>
          <div className="text-center font-jersey25 text-[41px] h-[41px] w-[148px] leading-[41px] pl-[1px]">
            {todayDayName}
          </div>
          <div className="text-left font-jacquarda-bastarda-9 text-[13px] w-[148px] h-[150px] leading-[17px] mt-[8px]">
          December 1 is the 335th day of the year (336th in leap years) in the Gregorian calendar; 30 days remain until the end of the year.
          </div>
          <div className="pixel-corners-10px w-[160px] h-full my-[8px] py-[0px] pl-[14px] pr-[4px] flex flex-col">
            <div className="font-jersey10 text-[18.66px] text-center mb-[4px] mt-[4px] mr-[1px]">
              {monthNames[nextMonth]}
            </div>
            <div className="grid grid-cols-7 gap-0 flex-1">
              {/* Day headers */}
              {dayLetters.map((letter, idx) => (
                <div
                  key={idx}
                  className="font-silkscreen font-bold text-[8px] text-left"
                  style={{
                    letterSpacing: "-1px",
                    ...(idx >= 5 ? { color: "rgb(255, 0, 0)" } : {}),
                  }}
                >
                  {letter}
                </div>
              ))}
              {/* Calendar dates */}
              {weeks.map((week, weekIdx) =>
                week.map((day, dayIdx) => {
                  const cellKey = weekIdx * 7 + dayIdx;
                  return (
                    <div
                      key={cellKey}
                      className={`font-silkscreen text-[8px] text-left ${
                        day.isCurrentMonth
                          ? day.isWeekend || day.isHoliday
                            ? ""
                            : "text-black"
                          : "text-gray-300"
                      }`}
                      style={{
                        letterSpacing: "-1px",
                        fontWeight: day.isCurrentMonth && day.isHoliday ? "bold" : "normal",
                        ...(day.isCurrentMonth && (day.isWeekend || day.isHoliday)
                          ? { color: "rgb(255, 0, 0)" }
                          : {}),
                      }}
                    >
                      {day.isCurrentMonth ? day.day : ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div className="pixel-corners-10px w-1/2 h-full relative p-[20px] gap-[20px] flex flex-col items-center">
          <div 
            className="font-anybody font-extrabold text-[72px] h-[80px] leading-[80px]"
            style={{ fontVariationSettings: '"wdth" 150' }}
          >
            {currentYear}
          </div>
          <div className="font-calendar-numerals text-[450px] leading-[450px]">
            {todayDayOfMonth}
          </div>
        </div>
        <div className="pixel-corners-10px w-1/4 h-full relative p-8"></div>
      </div>
    </>
  );
}




{/* <div className="grid grid-rows-10 w-full h-full">
{PATTERN_NAMES.map((patternName) => (
  <Card
    key={patternName}
    patternStyle={pixelPatternStyles[patternName]}
    cornerSize="5px"
    cornerFill="black"
    className="p-4 flex items-center justify-center"
  >
    <p
      className="text-center text-black text-outline-white"
      style={{ fontFamily: "'Silkscreen', monospace", fontSize: "8px" }}
    >
      {patternName}
    </p>
  </Card>
))}
</div> */}