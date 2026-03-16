import React from "react";
import PixelPerfectText from "./PixelPerfectText";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function isHoliday(date: Date, holidays: Set<string>): boolean {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return holidays.has(`${year}-${month}-${day}`);
}

type MonthCalendarGridProps = {
  /** Month to display. 0–11 */
  month: number;
  year: number;
  holidays: Set<string>;
  title: string;
  className?: string;
};

export default function MonthCalendarGrid({
  month,
  year,
  holidays,
  title,
  className = "",
}: MonthCalendarGridProps) {
  const firstDayOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - mondayOffset);

  const totalCells = 6 * 7;
  const allDays = Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);
    const jsDay = cellDate.getDay();
    const isWeekend = jsDay === 0 || jsDay === 6;
    return {
      date: cellDate,
      day: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === month,
      isWeekend,
      isHoliday: isHoliday(cellDate, holidays),
    };
  });

  const weeks = Array.from({ length: 6 }, (_, weekIndex) =>
    allDays.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  return (
    <div className={`pixel-corners-10px w-[160px] h-[152px] py-[0px] pl-[14px] pr-[4px] flex flex-col ${className}`}>
      <PixelPerfectText lineHeight={19} width={142} centerAlignPixelPerfect className="font-jersey10 text-[18.66px] text-center mb-[2px] mt-[0px] mr-[1px]">
        {title}
      </PixelPerfectText>
      <div className="grid grid-cols-7 gap-0 flex-1">
        {DAY_LETTERS.map((letter, idx) => (
          <div
            key={idx}
            className="font-silkscreen font-bold text-[8px] text-left"
            style={{
              letterSpacing: "-1px",
              lineHeight: "8px",
              height: 8,
              padding: 0,
              ...(idx >= 5 ? { color: "rgb(255, 0, 0)" } : {}),
            }}
          >
            {letter}
          </div>
        ))}
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const cellKey = weekIdx * 7 + dayIdx;
            return (
              <div
                key={cellKey}
                className={`font-silkscreen text-[8px] text-left ${
                  day.isCurrentMonth ? (day.isWeekend || day.isHoliday ? "" : "text-black") : "text-gray-300"
                }`}
                style={{
                  letterSpacing: "-1px",
                  lineHeight: "8px",
                  minHeight: 8,
                  padding: 0,
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
  );
}
