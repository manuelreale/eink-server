import React from "react";
import MoonPhaseSvg from "./MoonPhaseSvg";
import MonthCalendarGrid from "./MonthCalendarGrid";
import PixelPerfectText from "./PixelPerfectText";
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
          <PixelPerfectText lineHeight={8} width={150} parentWidth={150} centerAlignPixelPerfect className="font-silkscreen text-[8px] text-center">
            {String(moonViewDate.getDate()).padStart(2, "0")}/{String(moonViewDate.getMonth() + 1).padStart(2, "0")}
          </PixelPerfectText>
          <PixelPerfectText lineHeight={8} width={150} parentWidth={150} centerAlignPixelPerfect className="font-silkscreen text-[8px] text-center text-gray-500">
            +{moonDebugDaysOffset} Day{moonDebugDaysOffset !== 1 ? "s" : ""}
          </PixelPerfectText>
        </>
      )}
      <PixelPerfectText lineHeight={19} width={150} parentWidth={150} centerAlignPixelPerfect className="font-jersey10 text-[18.66px] text-center mb-[24px] mt-[8px]">
        {getMoonPhaseNameFromKind(getMoonPhaseShape(moonPhasePercent).kind)}
      </PixelPerfectText>
      <div className="bg-black w-[150px] h-[1px] my-[12px]"> </div>
      <PixelPerfectText lineHeight={8} width={150} parentWidth={150} className="font-silkscreen text-[8px] font-bold text-left overflow-hidden mb-[4px]">
        Fact of the day:
      </PixelPerfectText>
      <PixelPerfectText lineHeight={8} width={150} className="font-silkscreen text-[8px] text-left overflow-hidden" style={{ minHeight: 50 }}>
        {factOfTheDay ?? "—"}
      </PixelPerfectText>

      <div className="bg-black w-[150px] h-[1px] my-[8px]"> </div>

      <div className="w-[150px] flex flex-col items-start my-[16px] mb-[24px]">
        <PixelPerfectText lineHeight={19} width={100} parentWidth={150} centerAlignPixelPerfect className="font-jersey10 text-[18.66px] text-center w-full mb-[6px]">
          Day Forecast
        </PixelPerfectText>
        <div className="grid grid-cols-3 grid-rows-2 gap-x-[8px] gap-y-[8px] w-[150px] mt-[0px] justify-items-left">
          {(dayForecast?.moments ?? DEFAULT_MOMENTS).map(({ label, icon }) => {
            const iconFile = { sun: "Sun", clouds: "Clouds", rain: "Rain", snow: "Snow" }[icon] ?? "Rain";
            return (
              <div key={label} className="flex flex-col items-left w-[45px]">
                <PixelPerfectText lineHeight={8} className="font-tiny5 text-[8px] mb-[2px]">
                  {label}
                </PixelPerfectText>
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
        <div className="grid grid-cols-3 gap-x-[8px] w-[150px] mt-[8px] justify-items-left">
          <div className="flex flex-col w-[45px] font-silkscreen text-[8px]">
            <span className="font-bold">MAX:</span>
            <span>{dayForecast?.max ?? "—"}°C</span>
          </div>
          <div className="flex flex-col w-[45px] font-silkscreen text-[8px]">
            <span className="font-bold">AVG:</span>
            <span>{dayForecast?.avg ?? "—"}°C</span>
          </div>
          <div className="flex flex-col w-[45px] font-silkscreen text-[8px]">
            <span className="font-bold">MIN:</span>
            <span>{dayForecast?.min ?? "—"}°C</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0" />
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
