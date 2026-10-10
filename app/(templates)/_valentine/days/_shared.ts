// Small helpers the eight day files share. Not a day.

import { DEMO_PHOTOS, type LovePhoto } from "../../_love/types";
import { DAY_META, type DaySlug } from "./slugs";

/** The four couple demo photos with this day's captions + notes laid over them. */
export function demoPhotos(lines: readonly (readonly [caption: string, note: string])[]): LovePhoto[] {
  return DEMO_PHOTOS.map((p, i) => ({ ...p, caption: lines[i]?.[0] ?? p.caption, note: lines[i]?.[1] ?? p.note }));
}

/** Every slot starts on the template's own sticker. */
export function defaultGifs(ids: readonly string[]): Record<string, string> {
  return Object.fromEntries(ids.map((id) => [id, ""]));
}

/** name / emoji / date / month (the week from lib/wishlist/valentine.ts, plus the occasions). */
export const meta = (slug: DaySlug) => DAY_META[slug];

/** Every day's demo starts on its own built-in melody (no YouTube song). */
export const MUSIC_DEMO = { music: true, musicMode: "melody", musicYoutubeId: "", musicStart: 0 } as const;
/** A demo that plays the day's own track (DayConfig.music.track); withDemoSong keeps it. */
export const TRACK_DEMO = { music: true, musicMode: "track", musicYoutubeId: "", musicStart: 0 } as const;
