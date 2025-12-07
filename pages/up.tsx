// pages/eink.tsx
import React from "react";
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
    return {
      date: cellDate,
      day: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === nextMonth,
      isWeekend,
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
        <img src="/top2.png" className="w-full h-full absolute top-0 left-0 z-10 opacity-0" style={{ imageRendering: "pixelated" }}/>
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
          <div className="pixel-corners-10px w-[160px] h-full my-[8px] py-[0px] pl-[15px] pr-[5px] flex flex-col">
            <div className="font-jersey10 text-[18.66px] text-center mb-2">
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
                          ? day.isWeekend
                            ? ""
                            : "text-black"
                          : "text-gray-300"
                      }`}
                      style={{
                        letterSpacing: "-1px",
                        ...(day.isCurrentMonth && day.isWeekend
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
        <div className="pixel-corners-10px w-1/2 h-full relative p-8"></div>
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