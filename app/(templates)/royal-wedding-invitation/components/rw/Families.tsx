"use client";

// ─── The families: two arched palace windows joined by a gold mandala ───────
// "With the blessings of" sits on a maroon ribbon with gold ends; under it
// the two families, each in its own pointed-arch window of ivory sandstone
// with a pietra-dura band of maroon flowers along the arch, a gold chhatri
// finial, the side in gold caps and the names in display type, the city
// below. Between them a gold mandala medallion with "&" in script, and a
// caparisoned elephant stands guard at each outer foot. Phones stack the two
// windows with the medallion between them; laptops set them side by side.

import { Reveal, cdn } from "../../../_wedding";
import type { FamilySide } from "../../../_wedding/types";
import { A, img } from "../assets";

const hasDeva = (s: string | undefined) => !!s && /[ऀ-ॿ]/.test(s);
const langOf = (s: string | undefined) => (hasDeva(s) ? "hi" : undefined);

function Window({ side, delay }: { side: FamilySide; delay: number }) {
  return (
    <Reveal className="rw-fam-win" delay={delay}>
      <span className="rw-fam-finial" aria-hidden />
      <div className="rw-fam-in">
        {side.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="rw-fam-photo" src={side.photo} alt="" loading="lazy" decoding="async" />
        )}
        <p className="rw-fam-t" lang={langOf(side.title)}>
          {side.title}
        </p>
        <ul className="rw-fam-names">
          {side.names.filter(Boolean).map((n, k) => (
            <li key={k} lang={langOf(n)}>
              {n}
            </li>
          ))}
        </ul>
        {side.note && (
          <p className="rw-fam-note" lang={langOf(side.note)}>
            {side.note}
          </p>
        )}
      </div>
    </Reveal>
  );
}

export interface FamiliesProps {
  bride: FamilySide;
  groom: FamilySide;
  first: "bride" | "groom";
  blessingsOf: string;
  blessingsLabel: string;
  lang: "en" | "hi";
}

export default function Families({ bride, groom, first, blessingsOf, blessingsLabel, lang }: FamiliesProps) {
  const sides = (first === "bride" ? [bride, groom] : [groom, bride]).filter((s) => s.names.some(Boolean) || s.note);
  return (
    <div className="rw-fam">
      {blessingsOf && (
        <Reveal className="rw-fam-bless">
          <p className="rw-fam-ribbon" lang={lang}>
            {blessingsLabel}
          </p>
          <p className="rw-fam-elders">{blessingsOf}</p>
        </Reveal>
      )}
      {sides.length > 0 && (
        <div className={`rw-fam-row${sides.length === 1 ? " is-one" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="rw-fam-ele is-l" {...img(A.elephantL, { lazy: true })} aria-hidden />
          <Window side={sides[0]} delay={0} />
          {sides[1] && (
            <>
              <span className="rw-fam-knot" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cdn("/wedding-v3/classic/gold-mandala.webp")} width={480} height={480} alt="" loading="lazy" decoding="async" />
                <b>&amp;</b>
              </span>
              <Window side={sides[1]} delay={140} />
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="rw-fam-ele is-r" {...img(A.elephantR, { lazy: true })} aria-hidden />
        </div>
      )}
    </div>
  );
}
