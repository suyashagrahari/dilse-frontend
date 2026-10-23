"use client";

// ─── Our story: chapters along a rose-gold thread ───────────────────────────
// A thin rose-gold line runs down the page with a petal at every chapter. Each
// chapter: the year in caps, a title in script, a line or two, and its photo in
// a rounded rectangle (all four corners equal) with a double hairline border.
// Phones: photo above text. ≥ 760 px: photo and text side by side, alternating.

import { Reveal } from "../../../_wedding";
import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import { A } from "./assets";
import type { CwChapter } from "./model";

export default function Story({ chapters }: { chapters: CwChapter[] }) {
  if (!chapters.length) return null;
  return (
    <ol className="cw-story">
      {chapters.map((c, i) => (
        <li key={i} className={`cw-ch${c.photo ? " has-photo" : ""}${i % 2 ? " is-alt" : ""}`}>
          <span className="cw-ch-dot" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={A.petal.src} alt="" width={22} height={22} loading="lazy" decoding="async" />
          </span>
          {c.photo && (
            <Reveal effect="zoom" className="cw-ch-photo">
              <CroppedPhoto photo={c.photo} alt={c.title || c.when} />
            </Reveal>
          )}
          <Reveal className="cw-ch-text" delay={120}>
            {c.when && <p className="cw-ch-when">{c.when}</p>}
            {c.title && <h3 className="cw-ch-title">{c.title}</h3>}
            {c.line && <p className="cw-ch-line">{c.line}</p>}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
