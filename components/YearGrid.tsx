import React from "react";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_ABBREV = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR_GRID_DAY_LETTERS_WIDTH = 12;

type YearGridProps = { currentYear: number; today: Date };

export default function YearGrid({ currentYear, today }: YearGridProps) {
  const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeap(currentYear) ? 366 : 365;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const yearDays = Array.from({ length: daysInYear }, (_, i) => {
    const date = new Date(currentYear, 0, 1 + i);
    const weekday = (date.getDay() + 6) % 7;
    const isFirstOfMonth = date.getDate() === 1;
    const t = date.getTime();
    const state = t < todayStart ? "Past" : t > todayStart ? "Before" : "Today";
    return { weekday, isFirstOfMonth, state } as const;
  });

  const daysPerMonth = Array.from({ length: 12 }, (_, m) => new Date(currentYear, m + 1, 0).getDate());
  const firstDayOfMonthDayIndex = Array.from({ length: 12 }, (_, m) =>
    m === 0 ? 0 : daysPerMonth.slice(0, m).reduce((a, d) => a + d, 0)
  );

  const cellSize = 9;
  const numWeeks = Math.ceil((daysInYear + 6) / 7);
  const gridWidth = numWeeks * cellSize;

  const monthLabelLeftPx = firstDayOfMonthDayIndex.map((dayIndex, m) => {
    const date = new Date(currentYear, m, 1);
    const weekday = (date.getDay() + 6) % 7;
    const weekCol = Math.floor((dayIndex - weekday + 6) / 7) + 1;
    return (weekCol - 1) * cellSize;
  });

  return (
    <div className="w-[489px] flex flex-col items-left mt-[6px]">
      <div className="flex items-start shrink-0" style={{ minWidth: YEAR_GRID_DAY_LETTERS_WIDTH + gridWidth }}>
        <div
          className="flex flex-col justify-around text-left font-tiny5 text-[8px] shrink-0"
          style={{ width: YEAR_GRID_DAY_LETTERS_WIDTH, height: 7 * cellSize, paddingRight: 4 }}
        >
          {DAY_LETTERS.map((letter, rowIndex) => (
            <span key={rowIndex} className="leading-none">
              {letter}
            </span>
          ))}
        </div>
        <div
          className="shrink-0 bg-white"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${numWeeks}, ${cellSize}px)`,
            gridTemplateRows: `repeat(7, ${cellSize}px)`,
            gap: 0,
            rowGap: 0,
            columnGap: 0,
            width: gridWidth,
            height: 7 * cellSize,
          }}
        >
          {yearDays.map((day, dayIndex) => {
            const weekStart = dayIndex - day.weekday;
            const weekCol = Math.floor((weekStart + 6) / 7) + 1;
            const option = day.isFirstOfMonth ? "First" : "Default";
            const svgName = `${option}_${day.state}.svg`;
            return (
              <div
                key={dayIndex}
                className="flex items-center justify-center p-0 m-0 min-w-0 min-h-0"
                style={{ gridColumn: weekCol, gridRow: day.weekday + 1, margin: 0, padding: 0 }}
              >
                <img
                  src={`/${svgName}`}
                  alt=""
                  width={cellSize}
                  height={cellSize}
                  className="object-contain block p-0 m-0"
                  style={{ imageRendering: "pixelated", display: "block", margin: 0, padding: 0 }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div
        className="relative mt-[0px] font-tiny5 text-[8px] shrink-0 h-[6px]"
        style={{ width: gridWidth, minWidth: gridWidth, marginLeft: YEAR_GRID_DAY_LETTERS_WIDTH }}
      >
        {monthLabelLeftPx.map((leftPx, m) => (
          <span key={m} className="absolute text-left whitespace-nowrap" style={{ left: leftPx + 1 }}>
            {MONTH_ABBREV[m]}
          </span>
        ))}
      </div>
    </div>
  );
}
