"use client";

// PLACEHOLDER — replaced by the build branch.

import type { DateInvitationTemplateProps } from "./types";

export default function DateInvitationTemplate({ data }: DateInvitationTemplateProps) {
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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>The Invitation</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>for {data.recipientName}</p>
      </div>
    </div>
  );
}
