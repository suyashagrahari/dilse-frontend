import type { ReactNode } from "react";
import type { PromiseExtrasPremium } from "../../../_valentine/days/happy-promise-day-premium";
import type { ReactFn, ValentineDayData } from "../../../_valentine/types";
import type { CueHandle, CueOptions } from "../../../_valentine/kit/premium";

export interface SceneProps {
  data: ValentineDayData<PromiseExtrasPremium>;
  x: PromiseExtrasPremium;
  promises: string[];
  color: string;
  hi: string;
  reduced: boolean;
  preview: boolean;
  react: ReactFn;
  sfx: (id: string, o?: CueOptions) => CueHandle;
  sticker: (id: string, px: number) => ReactNode;
  next: () => void;
}
