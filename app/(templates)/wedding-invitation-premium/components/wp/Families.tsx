"use client";

// ─── The two families, under the elders' blessings ───────────────────────────
// "With the blessings of" in a small gold band, then the bride's and the
// groom's side as two ivory cards (rounded on all four corners) with a
// watercolour sprig each, the pink gazebo between them on wide screens. The
// order follows the couple's name order.

import { Reveal } from "../../../_wedding";
import { img, type ArtKey } from "./art";
import type { WpFamily } from "./model";

function Side({ fam, title, i, art }: { fam: WpFamily; title: string; i: number; art: ArtKey }) {
  return (
    <Reveal className="wp-fam" delay={i * 140} effect="rise">
      <span className="wp-fam-icon" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(art, { lazy: true })} />
      </span>
      <p className="wp-fam-t">{title}</p>
      {fam.names && <p className="wp-fam-n">{fam.names}</p>}
      {fam.note && <p className="wp-fam-note">{fam.note}</p>}
    </Reveal>
  );
}

export default function Families({ bride, groom, first, blessingsOf, labels }: { bride: WpFamily; groom: WpFamily; first: "bride" | "groom"; blessingsOf: string; labels: { blessingsOf: string; brideSide: string; groomSide: string } }) {
  const sides = first === "bride" ? [{ f: bride, t: labels.brideSide }, { f: groom, t: labels.groomSide }] : [{ f: groom, t: labels.groomSide }, { f: bride, t: labels.brideSide }];
  const shown = sides.filter((x) => x.f.names || x.f.note);
  return (
    <div className="wp-families">
      {blessingsOf && (
        <Reveal className="wp-elders" effect="fade">
          <p className="wp-eyebrow">{labels.blessingsOf}</p>
          <p className="wp-elders-n">{blessingsOf}</p>
        </Reveal>
      )}
      {shown.length > 0 && (
        <div className={`wp-fam-grid${shown.length === 1 ? " is-one" : ""}`}>
          {shown.map((x, i) => (
            <Side key={x.t} fam={x.f} title={x.t} i={i} art={i ? "lotus" : "anthurium"} />
          ))}
          {shown.length === 2 && (
            <span className="wp-fam-mid" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("gazebo", { lazy: true })} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
