import type { ReactNode } from "react";
import type { ChocolateExtrasPremium, TruffleFlavour } from "../../../_valentine/days/happy-chocolate-day-premium";
import type { ValentineDayData } from "../../../_valentine/types";
import type { CueHandle, CueOptions } from "../../../_valentine/kit/premium";

export interface Truf {
  flavour: TruffleFlavour;
  reason: string;
}

/** Everything a scene needs, resolved once by the Experience. */
export interface SceneProps {
  data: ValentineDayData<ChocolateExtrasPremium>;
  x: ChocolateExtrasPremium;
  truffles: Truf[];
  marks: string[];
  word: string;
  reduced: boolean;
  preview: boolean;
  sfx: (id: string, o?: CueOptions) => CueHandle;
  sticker: (id: string, px: number) => ReactNode;
  next: () => void;
}
