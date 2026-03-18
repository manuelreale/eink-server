import React from "react";
import Head from "next/head";
import { pixelPatternStyles } from "../lib/pixelPatterns";
import PixelPerfectText from "../components/PixelPerfectText";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const jerseyFontStyle = {
  fontFamily: "'Jersey 10', 'Silkscreen', sans-serif",
  fontSize: "18.66px",
};

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  isHoliday?: boolean;
};

export default function DownCalendar() {
  // Use client-side date so "today" is correct on Vercel (static build would otherwise freeze to build date).
  const [today, setToday] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setToday(new Date());
  }, []);

  const effectiveDate = today ?? new Date();
  const todayISO = today ? formatDate(today) : "";
  const currentYear = effectiveDate.getFullYear();
  const currentMonth = effectiveDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const mondayOffset = (firstDayOfMonth.getDay() + 6) % 7; // convert Sunday=0 to Monday=0
  const startDate = new Date(currentYear, currentMonth, 1 - mondayOffset);

  const totalCells = 6 * 7;
  const allDays: DayCell[] = Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);
    const iso = formatDate(cellDate);
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
  const [holidays, setHolidays] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  // Mark holidays
  weeks.forEach((week) =>
    week.forEach((day) => {
      if (holidays[day.iso]) {
        day.isHoliday = true;
      }
    })
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [eventsRes, holidaysRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/holidays"),
        ]);
        if (!eventsRes.ok) throw new Error("Failed to load events");
        if (!holidaysRes.ok) throw new Error("Failed to load holidays");

        const eventsData = await eventsRes.json();
        const holidaysData = await holidaysRes.json();

        if (mounted && Array.isArray(eventsData.events)) {
          setEvents(
            eventsData.events.map((ev: any) => ({
              dateISO: ev.dateISO,
              title: ev.title,
              pattern: ev.pattern as keyof typeof pixelPatternStyles | undefined,
            }))
          );
        }

        if (mounted && Array.isArray(holidaysData.holidays)) {
          const holidayMap: Record<string, string> = {};
          holidaysData.holidays.forEach((h: any) => {
            if (h.date) holidayMap[h.date] = h.name || h.localName || "Holiday";
          });
          setHolidays(holidayMap);
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
                  ...(isWeekend ? pixelPatternStyles.red20 : pixelPatternStyles.grey10),
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
                      style={isWeekend ? pixelPatternStyles.red20 : pixelPatternStyles.grey10}
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
                  const isFestive = day.isWeekend || day.isHoliday;
                  const patternStyle: React.CSSProperties = isFestive
                    ? pixelPatternStyles.red5
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
                            day.isWeekend || day.isHoliday ? "text-red-600" : "text-black"
                          } ${day.isCurrentMonth ? "" : "opacity-0"}`}
                          style={jerseyFontStyle}
                        >
                          {day.date.getDate()}
                        </span>
                        <div className="mt-auto flex flex-col gap-[2px]">
                          {day.isHoliday && holidays[day.iso] && (
                            <div
                              className="pixel-corners-5px pixel-corner-fill-red calendar-pill"
                              style={{
                                ...pixelPatternStyles.red20,
                                color: "#cc0000",
                              }}
                            >
                              <PixelPerfectText
                                lineHeight={10}
                                snapToIntegerPixels
                                as="span"
                                className="bg-white px-[1px]"
                                style={jerseyFontStyle}
                              >
                                {holidays[day.iso]}
                              </PixelPerfectText>
                            </div>
                          )}
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
                                <PixelPerfectText
                                  lineHeight={10}
                                  snapToIntegerPixels
                                  as="span"
                                  className="bg-white px-[1px]"
                                  style={jerseyFontStyle}
                                >
                                  {event.title}
                                </PixelPerfectText>
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