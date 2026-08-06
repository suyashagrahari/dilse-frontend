"use client";

// PLACEHOLDER — replaced by the build branch.

import type { PhotoPuzzleTemplateProps } from "./types";

export default function PhotoPuzzleTemplate({ data }: PhotoPuzzleTemplateProps) {
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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>The Last Piece</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>for {data.recipientName}</p>
      </div>
    </div>
  );
}
