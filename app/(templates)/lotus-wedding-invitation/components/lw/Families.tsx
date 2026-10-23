"use client";

// ─── The two families, under the elders' blessings ───────────────────────────
// "With the blessings of" in a small gold band, then the bride's and the
// groom's side as two rounded cards (each with its framed photo when there is
// one, drawn with the sender's focal point and zoom), a gold lotus bud between
// them on wide screens. The order follows the couple's name order.

import { Reveal, photoImgStyle } from "../../../_wedding";
import { img } from "./art";
import type { LwFamily } from "./model";

function Side({ fam, title, i }: { fam: LwFamily; title: string; i: number }) {
  return (
    <Reveal className="lw-fam" delay={i * 140} effect="rise">
      {fam.photo ? (
        <span className="lw-fam-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fam.photo.url} alt="" loading="lazy" decoding="async" style={photoImgStyle(fam.photo)} />
        </span>
      ) : (
        <span className="lw-fam-icon" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(i ? "podA" : "budA", { lazy: true })} />
        </span>
      )}
      <p className="lw-fam-t">{title}</p>
      {fam.names && <p className="lw-fam-n">{fam.names}</p>}
      {fam.note && <p className="lw-fam-note">{fam.note}</p>}
    </Reveal>
  );
}

export default function Families({ bride, groom, first, blessingsOf, labels }: { bride: LwFamily; groom: LwFamily; first: "bride" | "groom"; blessingsOf: string; labels: { blessingsOf: string; brideSide: string; groomSide: string } }) {
  const sides = first === "bride" ? [{ f: bride, t: labels.brideSide }, { f: groom, t: labels.groomSide }] : [{ f: groom, t: labels.groomSide }, { f: bride, t: labels.brideSide }];
  const shown = sides.filter((x) => x.f.names || x.f.note || x.f.photo);
  return (
    <div className="lw-families">
      {blessingsOf && (
        <Reveal className="lw-elders" effect="fade">
          <p className="lw-eyebrow">{labels.blessingsOf}</p>
          <p className="lw-elders-n">{blessingsOf}</p>
        </Reveal>
      )}
      {shown.length > 0 && (
        <div className={`lw-fam-grid${shown.length === 1 ? " is-one" : ""}`}>
          {shown.map((x, i) => (
            <Side key={x.t} fam={x.f} title={x.t} i={i} />
          ))}
          {shown.length === 2 && (
            <span className="lw-fam-mid" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("bloomOpen", { lazy: true })} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
