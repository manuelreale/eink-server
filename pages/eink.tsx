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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="w-[960px] h-[680px] absolute top-0 left-0">
        {/* <img src="/img2.png" className="w-full h-full absolute top-0 left-0 z-10" /> */}
        <div
          className="pixel-corners-10px--wrapper absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        >
          <div className="pixel-corners-10px w-full h-full relative p-8">
            <div className="grid grid-rows-10 w-full h-full">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}