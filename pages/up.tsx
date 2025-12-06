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
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>E-Ink Calendar</title>
      </Head>

      <div className="w-[960px] h-[680px] absolute top-0 left-0 flex flex-row">
        <img src="/top2.png" className="w-full h-full absolute top-0 left-0 z-10 opacity-10" style={{ imageRendering: "pixelated" }}/>
        <div className="pixel-corners-10px w-1/4 h-full relative p-[16px] gap-[16px] flex flex-col items-center justify-top">
          <div className="text-center font-noto-sans-jp leading-[1.02] font-bold text-[91px] w-[60%] h-[273px]">
            土曜日
          </div>
          <div className="text-center font-jersey25 text-[41px] h-[41px]">
            Sunday
          </div>
          <div className="text-left font-jacquarda-bastarda-9 text-[13px] w-[148px] h-[150px] leading-[17px] mt-[8px]">
          December 1 is the 335th day of the year (336th in leap years) in the Gregorian calendar; 30 days remain until the end of the year.
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