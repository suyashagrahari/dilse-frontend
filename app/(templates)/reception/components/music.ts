// The stored music choice → the shared DayMusic player's settings.
import type { DayMusicSettings } from "../../_valentine/music/DayMusic";
import { RECEPTION_TRACK, type MusicSetting } from "./types";

export function musicSettings(m: MusicSetting): DayMusicSettings {
  if (m.mode === "youtube" && m.youtubeId) return { musicMode: "youtube", musicYoutubeId: m.youtubeId, musicStart: m.start };
  if (m.mode === "off") return { musicMode: "off", musicYoutubeId: "", musicStart: 0 };
  // "" (a page from before music was a choice) and "track" play the waltz.
  return { musicMode: "track", musicYoutubeId: "", musicStart: 0 };
}

export const RECEPTION_DAY_TRACK = { url: RECEPTION_TRACK.url, title: RECEPTION_TRACK.title, artist: RECEPTION_TRACK.artist, hint: RECEPTION_TRACK.hint };
