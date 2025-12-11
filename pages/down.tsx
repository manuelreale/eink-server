import React from "react";
import Head from "next/head";
import { pixelPatternStyles } from "../lib/pixelPatterns";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const jerseyFontStyle = {
  fontFamily: "'Jersey 10', 'Silkscreen', sans-serif",
  fontSize: "18.66px",
};

type CalendarEvent = {
  dateISO: string; // e.g. "2025-01-09"
  title: string;
  pattern?: keyof typeof pixelPatternStyles;
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

  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        if (mounted && Array.isArray(data.events)) {
          setEvents(
            data.events.map((ev: any) => ({
              dateISO: ev.dateISO,
              title: ev.title,
              pattern: ev.pattern as keyof typeof pixelPatternStyles | undefined,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Group events by ISO date for quick lookup per cell.
  const eventsByISO = React.useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      if (!map[event.dateISO]) map[event.dateISO] = [];
      map[event.dateISO].push(event);
    });
    return map;
  }, [events]);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>E-Ink Calendar</title>
      </Head>

      <div className="w-[960px] h-[680px] absolute top-0 left-0 px-[3px] py-[2px]">
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
                  "px-[8px]",
                  "py-[8px]",
                  "calendar-cell--top",
                  "calendar-cell--solid",
                ];
                if (index === 0) headerClasses.push("calendar-cell--left");

                return (
                  <div key={label} className={headerClasses.join(" ")} style={cellStyle}>
                    <div
                      className="calendar-fill"
                      style={isWeekend ? pixelPatternStyles.red10 : pixelPatternStyles.grey10}
                    />
                    <div className="relative z-[1]">
                      {label}
                    </div>
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
                  const patternStyle: React.CSSProperties = day.isWeekend
                    ? pixelPatternStyles.red1
                    : {};
                  const textShadowStyle: React.CSSProperties = {
                    textShadow:
                      "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
                  };

                  const cellClasses = [
                    "calendar-cell",
                    "box-border",
                    "px-[8px]",
                    "py-[2px]",
                    "pb-[8px]",
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
                        ...(day.isToday ? { border: "2px solid red" } : {}),
                        ["--calendar-line-color" as any]: "#000",
                      }}
                    >
                      <div className="calendar-fill" style={patternStyle} />
                      <div
                        className="relative z-[1] flex h-full flex-col gap-[2px]"
                        style={textShadowStyle}
                      >
                        <span
                          className={`block ${
                            day.isWeekend ? "text-red-600" : "text-black"
                          } ${day.isCurrentMonth ? "" : "opacity-0"}`}
                          style={jerseyFontStyle}
                        >
                          {day.date.getDate()}
                        </span>
                        <div className="mt-auto flex flex-col gap-[2px]">
                          {(eventsByISO[day.iso] ?? []).map((event, idx) => {
                            const pattern =
                              (event.pattern && pixelPatternStyles[event.pattern]) ||
                              pixelPatternStyles.grey25;
                            return (
                              <div
                                key={`${event.dateISO}-${idx}`}
                                className="pixel-corners-5px calendar-pill"
                                style={pattern}
                              >
                                {event.title}
                              </div>
                            );
                          })}
                        </div>
                      </div>
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