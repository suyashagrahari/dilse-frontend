"use client";

// Between the strip and the voice note, only when they sent more than four
// photos: "the outtakes", every other photo as a big warm print on a
// swipeable contact sheet (scroll-snap; each print develops as it arrives).

import { CinematicPhoto, PremiumCTA } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_valentine/types";
import { clean } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

export default function OuttakesScene({ photos, onNext }: { photos: LovePhoto[]; onNext: () => void }) {
  return (
    <Scene label="The outtakes" className="pb-outs">
      <Eyebrow>The outtakes · {photos.length}</Eyebrow>
      <h2 className="pb-h pb-outsH">
        The ones that <em>didn&rsquo;t fit.</em>
      </h2>
      <div className="pb-outRow" role="list">
        {photos.map((p, i) => (
          <div key={i} className="pb-outItem" role="listitem">
            <CinematicPhoto photo={p} grade="warm" aspect="4 / 5" caption={clean(p.caption) || undefined} eager={i < 2} />
          </div>
        ))}
      </div>
      <p className="pb-eyebrow pb-outHint" aria-hidden>Swipe ›</p>
      <div className="pb-foot">
        <PremiumCTA style={CTA_STYLE} tone="pearl" onClick={onNext}>Next</PremiumCTA>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.pb-outsH { margin-top: 12px; font-size: clamp(34px, 9.6vw, 64px); max-width: 12ch; }
.pb-outRow { width: 100vw; max-width: 1180px; margin: 26px -24px 0; display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 8px 24px 20px; box-sizing: border-box;
  scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.pb-outRow::-webkit-scrollbar { display: none; }
.pb-outItem { flex: none; width: min(72vw, 340px, calc((100svh - 330px) * .72)); scroll-snap-align: center; }
.pb-outItem figure { box-shadow: 0 30px 50px -26px rgba(0,0,0,.9); }
.pb-outHint { margin-top: 6px; }
.pb-outItem figcaption { font-family: var(--pb-display) !important; font-style: normal !important; font-size: 17px !important; color: #2a1f20 !important; }
`;
