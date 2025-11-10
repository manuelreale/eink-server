// pages/eink.tsx
import React from "react";

export default function EInkCalendar() {
  return (
    <div className="root">
      <div className="page">

        {/* LEFT VERTICAL WEEKDAY COLUMN */}
        <div className="left-column">
          <div className="weekday-large">木曜日</div>
          <div className="weekday-en">[THU]</div>
          <div className="left-sub">
            <div>旧 11月13日</div>
            <div>大安</div>
          </div>
        </div>

        {/* CENTER BIG DAY + FLAGS */}
        <div className="center-column">
          <div className="top-year">2026</div>

          <div className="flags-row">
            <div className="flag flag-left" />
            <div className="big-day">1</div>
            <div className="flag flag-right" />
          </div>

          {/* Bottom main text block */}
          <div className="main-text-block">
            <div className="kanji-title">安心立命</div>
            <div className="reading">あんしんりつめい</div>
            <p className="description">
              すべてを尽くしたら天命に身を任せ、<br />
              迷うことのない心を育てること。<br />
              仏教での心の安らぎをいう。
            </p>
          </div>
        </div>

        {/* RIGHT MONTH / ERA COLUMN */}
        <div className="right-column">
          <div className="era">令和8年</div>
          <div className="era-sub">昭和101年</div>

          <div className="month-block">
            <div className="month-number">1</div>
            <div className="month-label">月</div>
          </div>

          <div className="new-year">元日</div>

          <div className="fortune-circle">
            <div className="fortune-text">大</div>
          </div>

          <div className="notes">
            <div>不省エネルギーの日で賀</div>
            <div>一粒万倍日</div>
          </div>
        </div>

        {/* BOTTOM FOOTER AREA */}
        <div className="footer">
          <div className="footer-left">
            <div className="footer-label">誕生花・花言葉</div>
            <div className="flower-name">梅（うめ）</div>
            <div className="flower-words">忠実・気品・高潔</div>
          </div>

          <div className="footer-right">
            <div className="today-events-title">今日の出来事</div>
            <ul className="events-list">
              <li>国産初のTVアニメ「鉄腕アトム」放送開始</li>
              <li>欧州連合（EU）単一通貨「ユーロ」導入</li>
              <li>○○地震発生 M7.6 死者244人</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .root {
          width: 960px;
          height: 680px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Helvetica",
            "Arial", "Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo",
            sans-serif;
        }

        .page {
          position: relative;
          width: 880px;
          height: 640px;
          border: 6px solid #000;
          padding: 24px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 160px 1fr 180px;
          grid-template-rows: 1fr auto;
          column-gap: 12px;
          row-gap: 16px;
        }

        .left-column {
          grid-row: 1 / span 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-right: 3px solid #000;
          padding-right: 10px;
        }

        .weekday-large {
          writing-mode: vertical-rl;
          text-orientation: upright;
          font-size: 52px;
          font-weight: 900;
          letter-spacing: 4px;
          margin-top: 4px;
        }

        .weekday-en {
          margin-top: 16px;
          font-size: 14px;
          font-weight: 600;
        }

        .left-sub {
          margin-top: auto;
          font-size: 14px;
          text-align: center;
          margin-bottom: 8px;
        }

        .center-column {
          grid-row: 1 / span 1;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .top-year {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 8px;
          margin-bottom: 4px;
        }

        .flags-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
        }

        .flag {
          width: 70px;
          height: 140px;
          border: 4px solid #c00000;
          border-radius: 4px;
          position: relative;
        }

        .flag::before {
          content: "";
          position: absolute;
          inset: 20px;
          border-radius: 999px;
          background: #c00000; /* red circle */
        }

        .flag-left {
          margin-right: 12px;
        }

        .flag-right {
          margin-left: 12px;
        }

        .big-day {
          font-size: 260px;
          font-weight: 900;
          line-height: 1;
        }

        .right-column {
          grid-row: 1 / span 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-left: 3px solid #000;
          padding-left: 10px;
        }

        .era {
          margin-top: 8px;
          font-size: 18px;
          font-weight: 700;
        }

        .era-sub {
          margin-top: 4px;
          font-size: 13px;
        }

        .month-block {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .month-number {
          font-size: 80px;
          font-weight: 900;
          line-height: 1;
        }

        .month-label {
          font-size: 36px;
          font-weight: 900;
          line-height: 1;
        }

        .new-year {
          margin-top: 6px;
          font-size: 18px;
          color: #c00000;
          font-weight: 700;
        }

        .fortune-circle {
          margin-top: 24px;
          width: 70px;
          height: 70px;
          border-radius: 999px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fortune-text {
          color: #fff;
          font-size: 32px;
          font-weight: 900;
        }

        .notes {
          margin-top: 18px;
          font-size: 12px;
          text-align: center;
        }

        .main-text-block {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px 16px 0 16px;
          border-top: 3px solid #000;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .kanji-title {
          font-size: 52px;
          font-weight: 900;
        }

        .reading {
          margin-top: 4px;
          font-size: 14px;
        }

        .description {
          margin-top: 6px;
          font-size: 13px;
          text-align: center;
        }

        .footer {
          grid-column: 2 / span 1;
          grid-row: 2 / span 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-top: 6px;
          border-top: 2px solid #000;
        }

        .footer-left {
          max-width: 40%;
          font-size: 12px;
        }

        .footer-label {
          font-weight: 700;
          border-left: 4px solid #000;
          padding-left: 6px;
          margin-bottom: 4px;
        }

        .flower-name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .flower-words {
          font-size: 12px;
        }

        .footer-right {
          max-width: 55%;
          font-size: 12px;
        }

        .today-events-title {
          font-weight: 700;
          border-left: 4px solid #000;
          padding-left: 6px;
          margin-bottom: 4px;
        }

        .events-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .events-list li {
          margin-bottom: 2px;
        }
      `}</style>
    </div>
  );
}