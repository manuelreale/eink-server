// pages/eink.tsx
import React from "react";
import Head from "next/head";
import { pixelPatternStyles } from "../lib/pixelPatterns";

const CORNER_VARIANTS = {
  large: {
    wrapper: "pixel-corners--wrapper",
    inner: "pixel-corners",
  },
  small: {
    wrapper: "pixel-corners-5--wrapper",
    inner: "pixel-corners-5",
  },
} as const;

type CornerVariant = keyof typeof CORNER_VARIANTS;

export default function EInkCalendar() {
  const sprinklePattern = React.useMemo<React.CSSProperties>(
    () => ({
      ...pixelPatternStyles.sprinkle,
      "--pixel-corner-fill": "#f5f5f5",
    }),
    []
  );

  const checkerPattern = React.useMemo<React.CSSProperties>(
    () => ({
      ...pixelPatternStyles.checker,
      "--pixel-corner-fill": "#111111",
    }),
    []
  );

  const cornerVariant: CornerVariant = "large";
  const { wrapper, inner } = CORNER_VARIANTS[cornerVariant];

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>E-Ink Calendar</title>
      </Head>

      <div className="w-full h-full absolute top-0 left-0">
        {/* <img src="/img2.png" className="w-full h-full absolute top-0 left-0 z-10" /> */}
        <div
          className={`${wrapper} absolute inset-0`}
          style={{ width: "100%", height: "100%" }}
        >
          <div
            className={`${inner} w-full h-full relative`}
            style={sprinklePattern}
          >
            <div className="flex items-center justify-center w-full h-full">
              <div
                className="pixel-corners-5--wrapper"
                style={{ width: "60%", maxWidth: 400 }}
              >
                <div
                  className="pixel-corners-5 w-full h-full p-6"
                  style={checkerPattern}
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