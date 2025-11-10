// pages/eink-preview.tsx
import React from "react";

export default function EinkPreview() {
  return (
    <div
      id="eink-root"
      style={{
        width: 960,
        height: 680,
        boxSizing: "border-box",
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Black header */}
      <div
        style={{
          height: 80,
          backgroundColor: "#000000",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        My E-Ink Dashboard
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: 40,
          display: "flex",
          gap: 40,
        }}
      >
        {/* Red card */}
        <div
          style={{
            width: 300,
            height: 200,
            backgroundColor: "#cc0000",
            color: "#ffffff",
            padding: 20,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600 }}>Status</div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>OK</div>
        </div>

        {/* Text column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 600 }}>Next Event</div>
          <div style={{ fontSize: 18 }}>
            Meeting with <strong>Team</strong> at <strong>10:30</strong>.
          </div>
          <div style={{ fontSize: 18 }}>
            Weather: <strong>Cloudy</strong>, 18°C.
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div
        style={{
          height: 60,
          backgroundColor: "#000000",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          fontSize: 18,
        }}
      >
        Last updated from Vercel · {new Date().toISOString().slice(0, 16).replace("T", " ")}
      </div>
    </div>
  );
}