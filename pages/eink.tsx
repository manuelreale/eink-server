// pages/eink.tsx
import React from "react";
import Head from "next/head";
import { pixelPatternStyles } from "../lib/pixelPatterns";

export default function EInkCalendar() {
  const sprinklePattern = React.useMemo<React.CSSProperties>(
    () => ({
      ...pixelPatternStyles.sprinkle,
      "--pixel-corner-fill": "#f5f5f5",
    }),
    []
  );

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>E-Ink Calendar</title>
      </Head>

      <div className="w-full h-full absolute top-0 left-0">
        {/* <img src="/img2.png" className="w-full h-full absolute top-0 left-0 z-10" /> */}
        <div
          className="pixel-corners--wrapper absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        >
          <div
            className="pixel-corners w-full h-full"
            style={sprinklePattern}
          ></div>
        </div>
      </div>
    </>
  );
}