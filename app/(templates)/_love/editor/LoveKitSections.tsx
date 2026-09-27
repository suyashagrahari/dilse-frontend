"use client";

// ─── Love kit — the shared form sections ─────────────────────────────────────
//
// Every love-kit form has the same four blocks: pick a vibe (theme) at the top,
// and at the bottom photos-with-letters, GIFs and the main letter. They are
// identical across templates so a sender who has made one knows them all;
// only the copy changes.

import type { ReactNode } from "react";

import type { LoveTheme } from "../theme";
import { MAX_LETTER_LEN, MAX_LOCK_ANSWER_LEN, MAX_LOCK_QUESTION_LEN, type GifTag, type LoveKitData } from "../types";
import GifPicker from "./GifPicker";
import PhotosEditor from "./PhotosEditor";
import ThemePicker from "./ThemePicker";

/** A section header with a little emoji badge — the form reads as steps. */
export function FormSection({ emoji, title, note, children }: { emoji: string; title: string; note?: string; children?: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5 pt-2">
        <span className="w-9 h-9 rounded-xl grid place-items-center text-lg shrink-0" style={{ background: "linear-gradient(135deg,#ffe3ec,#efe6ff)" }} aria-hidden>
          {emoji}
        </span>
        <div className="min-w-0">
          <h4 className="text-[15px] font-bold leading-tight">{title}</h4>
          {note && <p className="text-[11.5px] text-muted-foreground leading-snug">{note}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function ThemeSection({ themes, value, onChange }: { themes: readonly LoveTheme[]; value: string; onChange: (id: string) => void }) {
  return (
    <FormSection emoji="🎨" title="Pick your vibe" note="The whole page changes colour — this is exactly what they'll see.">
      <ThemePicker themes={themes} value={value} onChange={onChange} />
    </FormSection>
  );
}

type Update = <K extends keyof LoveKitData>(key: K, val: LoveKitData[K]) => void;

export function MemoriesSections({
  data,
  update,
  gifTags,
  copy = {},
}: {
  data: LoveKitData;
  update: Update;
  gifTags?: GifTag[];
  copy?: {
    photosTitle?: string;
    photosNote?: string;
    captionHint?: string;
    noteHint?: string;
    gifsTitle?: string;
    letterTitle?: string;
    letterNote?: string;
    letterHint?: string;
    /** The template's default lock question / answer, shown as placeholders. */
    lockQuestion?: string;
    lockAnswer?: string;
  };
}) {
  return (
    <>
      <FormSection
        emoji="📸"
        title={copy.photosTitle ?? "Your photos + little letters"}
        note={copy.photosNote ?? "Up to 8. Tap a photo to zoom & reposition it, then write a tiny note that opens with it."}
      >
        <PhotosEditor photos={data.photos} onChange={(v) => update("photos", v)} captionHint={copy.captionHint} noteHint={copy.noteHint} />
      </FormSection>

      <FormSection emoji="🎞️" title={copy.gifsTitle ?? "GIFs"}>
        <GifPicker gifs={data.gifs} onChange={(v) => update("gifs", v)} tags={gifTags} />
      </FormSection>

      <FormSection emoji="💌" title={copy.letterTitle ?? "Your main letter"} note={copy.letterNote ?? "The big one — locked in an envelope until they answer your question."}>
        <textarea
          value={data.letter}
          onChange={(e) => update("letter", e.target.value.slice(0, MAX_LETTER_LEN))}
          placeholder={copy.letterHint ?? "Write it like they're reading it at 2am…"}
          aria-label={copy.letterTitle ?? "Your main letter"}
          rows={7}
          className="w-full px-3.5 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none resize-y"
          style={{ fontSize: 16, minHeight: 160 }}
        />
        <p className="text-right text-[10px] text-muted-foreground tabular-nums -mt-2">
          {data.letter.length}/{MAX_LETTER_LEN}
        </p>
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5">
          <p className="text-[13px] font-bold">🔒 Lock it with a question</p>
          <p className="text-[11.5px] text-muted-foreground -mt-1.5 leading-snug">
            They have to answer before the envelope opens. The &ldquo;no&rdquo; button runs away 😈
          </p>
          <input
            value={data.lockQuestion}
            onChange={(e) => update("lockQuestion", e.target.value.slice(0, MAX_LOCK_QUESTION_LEN))}
            placeholder={copy.lockQuestion ?? "Promise you'll read this with a smile?"}
            aria-label="Lock question"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/60 focus:outline-none"
            style={{ fontSize: 16 }}
          />
          <input
            value={data.lockAnswer}
            onChange={(e) => update("lockAnswer", e.target.value.slice(0, MAX_LOCK_ANSWER_LEN))}
            placeholder={copy.lockAnswer ?? "yes, obviously 💖"}
            aria-label="Answer button"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/60 focus:outline-none"
            style={{ fontSize: 16 }}
          />
        </div>
      </FormSection>
    </>
  );
}
