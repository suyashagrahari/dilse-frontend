"use client";
import { type ReactNode } from "react";

export default function DarlingBg({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100svh",
      width: "100%",
      position: "relative",
      background: `radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(8,4,18,0.55) 100%), url(/love/image18.webp) center / cover no-repeat`,
      backgroundAttachment: "fixed",
    }}>
      {children}
    </div>
  );
}
