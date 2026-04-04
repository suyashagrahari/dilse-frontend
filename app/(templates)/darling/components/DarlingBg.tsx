"use client";
import { type ReactNode } from "react";

export default function DarlingBg({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100svh",
      width: "100%",
      position: "relative",
      background: "#0d0b18",
    }}>
      {children}
    </div>
  );
}
