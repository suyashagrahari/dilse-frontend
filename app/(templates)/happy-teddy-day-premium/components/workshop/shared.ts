import type { ReactNode } from "react";
import type { TeddyExtrasPremium } from "../../../_valentine/days/happy-teddy-day-premium";
import type { ValentineDayData } from "../../../_valentine/types";
import type { CueHandle, CueOptions } from "../../../_valentine/kit/premium";
import type { TeddyProps } from "./art";

/** Everything a scene needs, resolved once by the Experience. */
export interface SceneProps {
  data: ValentineDayData<TeddyExtrasPremium>;
  x: TeddyExtrasPremium;
  /** The teddy's name ("Golu", or "your teddy"). */
  name: string;
  lines: string[];
  look: Pick<TeddyProps, "fur" | "eyes" | "accessory" | "initial">;
  fluff: number;
  setFluff: (f: number) => void;
  reduced: boolean;
  preview: boolean;
  sfx: (id: string, o?: CueOptions) => CueHandle;
  sticker: (id: string, px: number) => ReactNode;
  next: () => void;
}

/** "{senderName}" / "{recipientName}" tokens in sender text. */
export const fill = (s: string, d: { senderName: string; recipientName: string }) =>
  s.replace(/\{senderName\}/g, d.senderName || "me").replace(/\{recipientName\}/g, d.recipientName || "you");
