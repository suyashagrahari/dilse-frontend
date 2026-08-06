"use client";

// Screen 1. One job: get them to tap. That tap is also the user gesture the
// browser requires before an AudioContext will run, so unlockAudio() lives on
// the START handler and nowhere else.

import { templateMedia } from "@/lib/templateMedia";
import { ACCENT, INK, INK_SOFT } from "./catchTheme";
import FaceCircle from "./FaceCircle";
import { useMediaQuery } from "./useMediaQuery";

export interface IntroScreenProps {
  senderName: string;
  recipientName: string;
  faceUrl: string;
  onStart: () => void;
  onJustRead: () => void;
}

export default function IntroScreen({
  senderName,
  recipientName,
  faceUrl,
  onStart,
  onJustRead,
}: IntroScreenProps) {
  const coarse = useMediaQuery("(pointer: coarse)");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center">
      <FaceCircle url={faceUrl} name={recipientName} size={104} />

      <p
        className="max-w-[19rem] text-[17px] leading-snug"
        style={{ color: INK, fontFamily: "var(--font-tinos), Georgia, serif" }}
      >
        <span style={{ color: ACCENT }}>{senderName}</span> wrote you something.
        <br />
        It&apos;s in pieces. Catch it.
      </p>

      {/* DOM overlay, never drawn into the canvas. */}
      <video
        src={templateMedia("catch", "ready.webm")}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        className="pointer-events-none h-[112px] w-[112px] object-contain"
      />

      <button
        type="button"
        onClick={onStart}
        className="min-h-[48px] rounded-xl px-9 text-[13px] font-semibold uppercase tracking-[0.22em] transition-transform active:scale-[0.97]"
        style={{
          color: INK,
          background: "rgba(255,253,247,0.9)",
          border: `1.5px solid ${INK}`,
          fontFamily: "var(--font-outfit), system-ui, sans-serif",
        }}
      >
        Start
      </button>

      <p className="text-[11.5px]" style={{ color: INK_SOFT, fontFamily: "var(--font-outfit), system-ui, sans-serif" }}>
        {coarse ? "drag to move" : "arrow keys, or drag"}
      </p>

      <button
        type="button"
        onClick={onJustRead}
        className="mt-1 text-[11.5px] underline underline-offset-4"
        style={{ color: INK_SOFT, fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
      >
        just read it →
      </button>
    </div>
  );
}
