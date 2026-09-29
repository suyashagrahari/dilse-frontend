// The one bag of state and actions every screen of the parody app reads.
// Built once per render in SnapApp; screens stay dumb.

import type { Person, Side, StreakView } from "../types";
import type { TodayView } from "../streakStore";
import type { StreakPageData } from "../skin";
import type { LovePhoto } from "../../../_love/types";

export type Tab = "map" | "chat" | "camera" | "stories" | "spotlight";

export interface ViewerItem {
  photo?: LovePhoto;
  /** Background when there is no photo. */
  bg?: string;
  caption?: string;
  sub?: string;
  /** A sealed note the viewer has not earned yet. */
  locked?: boolean;
  /** Seconds on screen. */
  secs?: number;
}

export interface ViewerSpec {
  kind: "snap" | "story" | "memory";
  from: Side;
  time: string;
  items: ViewerItem[];
  start?: number;
}

export interface Ctx {
  data: StreakPageData;
  me: Side;
  them: Side;
  meP: Person;
  themP: Person;
  meAvatar: string;
  themAvatar: string;
  meHandle: string;
  themHandle: string;
  today: string;
  todayView: TodayView;
  view: StreakView;
  now: number;
  photos: LovePhoto[];
  bff: { emoji: string; label: string };
  /** Today isn't complete yet and there is a streak to carry. */
  hourglass: boolean;
  /** I've opened their snap today. */
  openedToday: boolean;
  wide: boolean;
  reduced: boolean;
  mode: "demo" | "live";
  go: (tab: Tab) => void;
  openConvo: () => void;
  openProfile: () => void;
  openTodaySnap: () => void;
  openViewer: (v: ViewerSpec) => void;
  openMemories: () => void;
  openCompose: (photoIndex: number, lens: number) => void;
  send: (word: string, note: string, photoUrl?: string) => void;
  toast: (msg: string) => void;
  openLetter: () => void;
  openMilestone: (atDay: number) => void;
  restore: () => void;
}
