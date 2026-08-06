"use client";

// PLACEHOLDER — replaced by the build branch.

import type { RewindTemplateProps } from "./types";

export default function RewindTemplate({ data }: RewindTemplateProps) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Rewind</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>for {data.recipientName}</p>
      </div>
    </div>
  );
}
