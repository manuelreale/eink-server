import React from "react";
import MonthCalendarGrid from "./MonthCalendarGrid";

type Rokuyo = { nameDisplay: string; kanji: string; meaning: string } | null;

type CalendarColumnProps = {
  /** Current month for header and calendar grid. 0–11 */
  displayMonth: number;
  displayMonthYear: number;
  monthNames: string[];
  todayDayName: string;
  todayDayNameJP: string;
  rokuyo: Rokuyo;
  holidays: Set<string>;
};

export default function CalendarColumn({
  displayMonth,
  displayMonthYear,
  monthNames,
  todayDayName,
  todayDayNameJP,
  rokuyo,
  holidays,
}: CalendarColumnProps) {
  return (
    <div className="w-1/4 h-full relative px-[4px] py-[24px] gap-[16px] flex flex-col items-center justify-top">
      <div className="text-center font-calendar-numerals leading-[1.02] font-bold text-[105.5px] w-[80%] h-[100px]">
        {displayMonth + 1}
      </div>
      <div className="text-center font-jersey25 text-[41px] h-[41px] w-[148px] leading-[41px] pl-[1px]">
        {monthNames[displayMonth]}
      </div>
      <div className="bg-black w-[150px] h-[1px] my-[8px]"> </div>
      <div className="text-center font-noto-sans-jp leading-[1.02] font-bold text-[44.5px] w-[80%] h-[32px]">
        {todayDayNameJP}
      </div>
      <div className="text-center font-jersey25 text-[41px] h-[41px] w-[148px] leading-[41px] pl-[1px]">
        {todayDayName}
      </div>
      <div className="bg-black w-[150px] h-[1px] my-[8px]"> </div>
      <div className="flex flex-col items-center w-[148px] mt-[8px]">
        <div className="font-tiny5 text-[8px] text-center w-full">
          {rokuyo?.nameDisplay ?? "Rokuyō"}
        </div>
        <div className="pixel-corners-5px w-[84px] h-[44px] flex flex-col items-center justify-center pb-[4px] my-[4px]">
          <span className="font-noto-sans-jp font-bold text-[33.5px] leading-none">
            {rokuyo?.kanji ?? "—"}
          </span>
        </div>
        <div className="text-center font-jacquarda-bastarda-9 text-[13px] w-full leading-[17px]">
          {rokuyo?.meaning != null
            ? rokuyo.meaning.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))
            : "—"}
        </div>
      </div>
      <MonthCalendarGrid
        month={displayMonth}
        year={displayMonthYear}
        holidays={holidays}
        title={monthNames[displayMonth]}
        className="my-[8px]"
      />
    </div>
  );
}
