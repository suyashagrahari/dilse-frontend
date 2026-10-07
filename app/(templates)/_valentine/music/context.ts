"use client";

// The page shell's music, shared with whatever is inside it.
//
// ValentineDayEditorPage and ValentineDayViewer mount <DayMusicProvider>; the
// eight day Experiences keep calling `useSynthMusic()` / `<MusicToggle>` and
// those delegate here, so the sender's choice (off · melody · YouTube) plays in
// the live page AND in the editor preview without touching any day file.
// Kept in its own module (no imports from the kit) to avoid an import cycle.

import { createContext, useContext } from "react";
import type { MusicMode } from "../types";

export interface DayMusicApi {
  mode: MusicMode;
  /** Something is actually audible right now. */
  playing: boolean;
  /** Music is on for this page (mode !== "off"). */
  available: boolean;
  /** YouTube: the player is still loading / buffering. */
  loading: boolean;
  /** YouTube: the song refused to play (removed, region-locked, embedding off). */
  error: string | null;
  /** YouTube: the video's own title once the player knows it. */
  title: string | null;
  toggle: () => void;
  /** Call from inside a tap/click handler — that is what browsers allow. */
  start: () => void;
  stop: () => void;
  /**
   * A day's <MusicToggle> registers while mounted, so the shell knows not to
   * draw its own button on top of it. Returns the unregister function.
   */
  registerToggle: () => () => void;
}

export const DayMusicContext = createContext<DayMusicApi | null>(null);

export const useDayMusic = () => useContext(DayMusicContext);
