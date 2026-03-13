import React from "react";
import MoonPhaseSvg from "./MoonPhaseSvg";
import MonthCalendarGrid from "./MonthCalendarGrid";
import { getMoonPhaseNameFromKind, getMoonPhaseShape } from "../lib/moonPhase";

type DayForecast = {
  moments: { label: string; icon: "sun" | "clouds" | "rain" | "snow" }[];
  max: number;
  min: number;
  avg: number;
} | null;

const DEFAULT_MOMENTS = [
  { label: "Dawn", icon: "rain" as const },
  { label: "Morning", icon: "rain" as const },
  { label: "Noon", icon: "sun" as const },
  { label: "Afternoon", icon: "sun" as const },
  { label: "Evening", icon: "rain" as const },
  { label: "Night", icon: "rain" as const },
];

type RightColumnProps = {
  moonPhasePercent: number;
  moonViewDate: Date;
  moonDebugDaysOffset: number;
  setMoonDebugDaysOffset: (fn: (d: number) => number) => void;
  factOfTheDay: string | null;
  dayForecast: DayForecast;
  nextMonth: number;
  nextMonthYear: number;
  holidays: Set<string>;
  monthNames: string[];
};

export default function RightColumn({
  moonPhasePercent,
  moonViewDate,
  moonDebugDaysOffset,
  setMoonDebugDaysOffset,
  factOfTheDay,
  dayForecast,
  nextMonth,
  nextMonthYear,
  holidays,
  monthNames,
}: RightColumnProps) {
  const handleMoonClick = () => {
    const shape = getMoonPhaseShape(moonPhasePercent);
    console.log("phase percent:", moonPhasePercent, "phase name:", shape.kind, "ellipse r:", shape.ellipseRx);
    setMoonDebugDaysOffset((d) => d + 1);
  };

  return (
    <div className="w-1/4 h-full relative px-[4px] py-[24px] flex flex-col items-center">
      <div
        className="w-[100px] h-[100px] flex-shrink-0 cursor-pointer select-none"
        role="button"
        tabIndex={0}
        onClick={handleMoonClick}
        onKeyDown={(e) => e.key === "Enter" && handleMoonClick()}
        title="Debug: click to advance one day"
      >
        <MoonPhaseSvg phasePercent={moonPhasePercent} />
      </div>
      {moonDebugDaysOffset !== 0 && (
        <>
          <div className="font-silkscreen text-[8px] text-center">
            {String(moonViewDate.getDate()).padStart(2, "0")}/{String(moonViewDate.getMonth() + 1).padStart(2, "0")}
          </div>
          <div className="font-silkscreen text-[8px] text-center text-gray-500">
            +{moonDebugDaysOffset} Day{moonDebugDaysOffset !== 1 ? "s" : ""}
          </div>
        </>
      )}
      <div className="font-jersey10 text-[18.66px] text-center">
        {getMoonPhaseNameFromKind(getMoonPhaseShape(moonPhasePercent).kind)}
      </div>
      <div className="bg-black w-[150px] h-[1px] my-[16px]"> </div>
      <div className="font-silkscreen text-[8px] font-bold text-left overflow-hidden w-[150px] ">
        Fact of the day:
      </div>
      <div className="font-silkscreen text-[8px] text-left overflow-hidden w-[150px] h-[50px]">
        {factOfTheDay ?? "—"}
      </div>

      <div className="bg-black w-[150px] h-[1px] my-[8px]"> </div>

      <div className="w-[150px] flex flex-col items-center my-[16px] mb-[24px]">
        <div className="font-jersey10 text-[18.66px] text-center w-[100px]">Day Forecast</div>
        <div className="grid grid-cols-3 grid-rows-2 gap-x-[8px] gap-y-[8px] w-[150px] mt-[0px] justify-items-left">
          {(dayForecast?.moments ?? DEFAULT_MOMENTS).map(({ label, icon }) => {
            const iconFile = { sun: "Sun", clouds: "Clouds", rain: "Rain", snow: "Snow" }[icon] ?? "Rain";
            return (
              <div key={label} className="flex flex-col items-left w-[45px]">
                <span className="font-tiny5 text-[8px]">{label}</span>
                <div className="flex items-center justify-left bg-white">
                  <img
                    src={`/${iconFile}.png`}
                    alt=""
                    className="w-[45px] h-[45px] object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="font-silkscreen text-[8px] flex justify-center mt-[8px] gap-[8px] w-[150px]">
          <span><b>MAX:</b> {dayForecast?.max ?? "—"}°C</span>
          <span><b>AVG:</b> {dayForecast?.avg ?? "—"}°C</span>
          <span><b>MIN:</b> {dayForecast?.min ?? "—"}°C</span>
        </div>
      </div>

      <div className="mt-[8px]">
        <MonthCalendarGrid
          month={nextMonth}
          year={nextMonthYear}
          holidays={holidays}
          title={monthNames[nextMonth]}
        />
      </div>
    </div>
  );
}
