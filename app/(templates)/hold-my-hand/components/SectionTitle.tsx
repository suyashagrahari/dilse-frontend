import type { ReactNode } from "react";
import { HMH, LOVE } from "./types";

/** Script heading between two fading hairlines. */
export default function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex items-center gap-3">
      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,209,224,.4))" }} />
      <span style={{ fontFamily: HMH.script, fontSize: 26, color: LOVE.blush, lineHeight: 1 }}>{children}</span>
      <span className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(255,209,224,.4))" }} />
    </div>
  );
}
