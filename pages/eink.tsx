// pages/eink.tsx
import React from "react";
import Head from "next/head";
import { pixelPatternStyles } from "../lib/pixelPatterns";

export default function EInkCalendar() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>E-Ink Calendar</title>
      </Head>

      <div className="root">
        {/* <img src="/img2.png" className="w-full h-full absolute top-0 left-0 z-10" /> */}
        <div className="page" style={pixelPatternStyles.sprinkle}></div>
      </div>
    </>
  );
}