// pages/eink.tsx
import React from "react";
import Head from "next/head";
import { pixelPatternStyles } from "../lib/pixelPatterns";

export default function EInkCalendar() {
  const sprinklePattern = React.useMemo<React.CSSProperties>(
    () => ({
      ...pixelPatternStyles.sprinkle,
    }),
    []
  );

  const checkerPattern = React.useMemo<React.CSSProperties>(
    () => ({
      ...pixelPatternStyles.checker,
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
          className="pixel-corners-10px--wrapper absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        >
          <div
            className="pixel-corners-10px w-full h-full relative"
          >
            <div className="flex items-center justify-center w-full h-full">
              <div
                className="pixel-corners-5px--wrapper pixel-corner-fill-white"
                style={{ width: "60%", maxWidth: 400 }}
              >
                <div
                  className="pixel-corners-5px w-full h-full p-6"
                  style={sprinklePattern}
                >
                  <p className="text-sm tracking-wide uppercase">
                    Nested box using the 5px corner style
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}