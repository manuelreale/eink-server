import React from "react";
import Head from "next/head";
import { pixelPatternStyles } from "../lib/pixelPatterns";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const jerseyFontStyle = {
  fontFamily: "'Jersey 10', 'Silkscreen', sans-serif",
  fontSize: "18.66px",
};

type DayCell = {
  date: Date;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
};

export default function DownCalendar() {
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const mondayOffset = (firstDayOfMonth.getDay() + 6) % 7; // convert Sunday=0 to Monday=0
  const startDate = new Date(currentYear, currentMonth, 1 - mondayOffset);

  const totalCells = 6 * 7;
  const allDays: DayCell[] = Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);
    const iso = cellDate.toISOString().split("T")[0];
    const jsDay = cellDate.getDay();
    const isWeekend = jsDay === 0 || jsDay === 6;
    return {
      date: cellDate,
      iso,
      isCurrentMonth: cellDate.getMonth() === currentMonth,
      isToday: iso === todayISO,
      isWeekend,
    };
  });

  const weeks: DayCell[][] = Array.from({ length: 6 }, (_, weekIndex) =>
    allDays.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  const MAX_ROWS = 5;
  const visibleWeeks = weeks.slice(0, MAX_ROWS);
  const currentWeekIndex = visibleWeeks.findIndex((week) =>
    week.some((day) => day.isToday)
  );
  const activeWeekIndex =
    currentWeekIndex === -1 ? visibleWeeks.length - 1 : currentWeekIndex;
  const rowHeights = visibleWeeks.map((_, index) =>
    index === activeWeekIndex ? "3fr" : "1fr"
  );
  const gridTemplateRows = rowHeights.join(" ");

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>E-Ink Calendar</title>
      </Head>

      <div className="w-[960px] h-[680px] absolute top-0 left-0">
        <div
          className="pixel-corners-10px--wrapper absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        >
          <div
            className="pixel-corners-10px w-full h-full overflow-hidden"
            style={{
              display: "grid",
              gridTemplateRows: "auto 1fr",
            }}
          >
            <div className="grid grid-cols-7">
              {WEEKDAY_LABELS.map((label, index) => {
                const isWeekend = index >= 5;
                const cellStyle: React.CSSProperties = {
                  ...(isWeekend ? pixelPatternStyles.red10 : pixelPatternStyles.grey10),
                  ...jerseyFontStyle,
                  color: isWeekend ? "#cc0000" : "#000",
                  textShadow:
                    "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
                };
                (cellStyle as any)["--calendar-line-color"] = "#000";

                const headerClasses = [
                  "calendar-cell",
                  "text-left",
                  "p-[8px]",
                  "calendar-cell--top",
                ];
                if (index === 0) headerClasses.push("calendar-cell--left");

                return (
                  <div key={label} className={headerClasses.join(" ")} style={cellStyle}>
                    {label}
                  </div>
                );
              })}
            </div>

            <div
              className="grid w-full h-full min-h-0"
              style={{
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gridTemplateRows,
              }}
            >
              {visibleWeeks.map((week, rowIndex) =>
                week.map((day, colIndex) => {
                  const weekendStyle: React.CSSProperties = {
                    ...(day.isWeekend ? pixelPatternStyles.red1 : {}),
                    textShadow:
                      "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
                  };
                  (weekendStyle as any)["--calendar-line-color"] = "#000";

                  const cellClasses = [
                    "calendar-cell",
                    "box-border",
                    "p-[8px]",
                    "flex",
                    "flex-col",
                    "justify-start",
                  ];
                  if (colIndex === 0) cellClasses.push("calendar-cell--left");

                  return (
                    <div
                      key={day.iso}
                      className={cellClasses.join(" ")}
                      style={{
                        ...weekendStyle,
                        ...(day.isToday ? { border: "2px solid red" } : {}),
                      }}
                    >
                      <span
                        className={`block ${
                          day.isWeekend ? "text-red-600" : "text-black"
                        } ${day.isCurrentMonth ? "" : "opacity-0"}`}
                        style={jerseyFontStyle}
                      >
                        {day.date.getDate()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}