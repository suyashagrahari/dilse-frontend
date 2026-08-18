"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { RS, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { sisterWord, type SisterData } from "./types";
import { useNow } from "./useNow";
import { Rangoli, Marigold, ThreadRule } from "./Ornaments";
import Stage, { useIsDesktop } from "./Stage";
import UserImage from "./UserImage";

// ─── Screen 1 ────────────────────────────────────────────────────────────────
//
// Her name is the largest thing on the page, because the page is addressed to her
// and the first thing she should recognise is herself and not the festival. His
// name appears once, small, at the very bottom — the return address on an
// envelope, which is where a sender belongs on something he sent.
//
// ── THE COUNTDOWN IS NOT A GATE, AND THAT IS STRUCTURAL ─────────────────────
//
// There is no branch anywhere in this file where a muhurat phase changes what the
// button does or says. `muhuratLine` returns three things — a string, a note and a
// colour — and nothing else reads it. Somebody opening this at 3am in November
// presses exactly the same button as somebody opening it at 6:04am on the 28th of
// August, and gets exactly the same screen behind it.
//
// That sounds obvious until you notice how many festival pages ship a locked CTA,
// and why: a countdown is the most natural place in the world to put a gate, and a
// gate is the one thing that guarantees the page is never seen at all. Most of
// these links are opened once, late, by a sister on a bus.
//
// ── NO PETALS HERE ──────────────────────────────────────────────────────────
//
// The brother template opens with a petal burst. This one deliberately does not:
// petals are the payoff of the tie, three screens' worth of anticipation later,
// and spending them on arrival is spending the only visual reward the ritual has.
// The cover is still — a rangoli turning at one revolution every two minutes and a
// marigold on the corner of the frame, and that is all.

/** IST is UTC+5:30 and never observes DST, so one constant is the whole timezone. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * The 2026 muhurat, in IST.
 *
 * Raksha Bandhan 2026 falls on Friday 28 August, and the auspicious window that
 * morning runs roughly 05:57 to 09:48 — it closes early because the bhadra period
 * takes the rest of the day. These are the panchang's hours and not ours, which is
 * why they are stated as a constant with a date beside them rather than derived:
 * the window moves every year and is not a function of anything we can compute.
 *
 * The date itself comes from `data.festivalDate` so a page written for a different
 * year still counts down to the right day; only the window's hours are fixed here.
 */
const MUHURAT = { fromH: 5, fromM: 57, toH: 9, toM: 48 } as const;
const MUHURAT_HOURS = "5:57–9:48 am";

type MuhuratTone = "wait" | "live" | "passed";

interface MuhuratLine {
  label: string;
  /** The quiet second line. Always optional, never an instruction. */
  note: string;
  tone: MuhuratTone;
}

/**
 * What the clock says, as words.
 *
 * Returns `null` until the clock is known (`useNow` reports 0 on the first render
 * so that nothing impure is read during render) and also for a `festivalDate` that
 * does not parse — a malformed date is a field somebody typed into, and "NaN din
 * baaki" is worse than no line at all. The caller reserves the height either way,
 * so resolving on the client does not shift the CTA underneath her thumb.
 */
function muhuratLine(now: number, festivalDate: string): MuhuratLine | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(festivalDate);
  if (!now || !parts) return null;

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // `Date.UTC` then subtract the offset: building the instant in UTC and shifting
  // it is the only way to name an IST wall-clock time from a browser that is in
  // some other timezone. `new Date("2026-08-28T05:57")` would be parsed in the
  // reader's local zone, so a sister in London would be told the muhurat is live
  // five and a half hours late.
  const ist = (h: number, m: number) => Date.UTC(year, month - 1, day, h, m) - IST_OFFSET_MS;

  const dayStart = ist(0, 0);
  const dayEnd = dayStart + 864e5;
  const opens = ist(MUHURAT.fromH, MUHURAT.fromM);
  const closes = ist(MUHURAT.toH, MUHURAT.toM);

  // The day is over. She is reading this in September, which happens more often
  // than anybody building a festival page wants to believe, and the page has to be
  // gracious about it rather than telling her she is late.
  if (now >= dayEnd) {
    return { label: "Muhurat nikal gaya", note: "Koi baat nahi. Baandh do.", tone: "passed" };
  }

  // Still the 28th, but the window shut at 9:48. Also the single most likely state
  // for this page to actually be opened in.
  if (now >= closes) {
    return {
      label: "Muhurat 9:48 pe khatam",
      note: "Mummy ko batane ki zarurat nahi.",
      tone: "passed",
    };
  }

  // The one place in this template — apart from the vow's seal — that mehendi
  // green is allowed. Two uses, no label on either, and that is what lets both of
  // them mean something.
  if (now >= opens) {
    return { label: "Muhurat chal raha hai", note: `${MUHURAT_HOURS}. Abhi.`, tone: "live" };
  }

  const left = opens - now;

  if (left >= 864e5) {
    const days = Math.floor(left / 864e5);
    return {
      label: days === 1 ? "Kal hai" : `${days} din baaki`,
      note: `Muhurat ${MUHURAT_HOURS}`,
      tone: "wait",
    };
  }

  const hours = Math.floor(left / 36e5);
  const mins = Math.floor((left % 36e5) / 6e4);

  if (hours > 0) {
    return {
      label: `${hours} ghante ${mins} min baaki`,
      note: `Muhurat ${MUHURAT_HOURS}`,
      tone: "wait",
    };
  }

  return { label: `${mins} min mein muhurat`, note: "Alarm laga lo.", tone: "wait" };
}

const TONE_COLOUR: Record<MuhuratTone, string> = {
  wait: RS.brass,
  live: RS.mehendi,
  passed: RS.muted,
};

/**
 * What sits in the frame when he did not add a photograph.
 *
 * ── WHY THIS IS A COMPOSITION AND NOT A PLACEHOLDER ─────────────────────────
 *
 * The default for a missing image is a grey box with an icon in it, and on a
 * screen whose entire job is to say "this was made for you" a grey box says the
 * opposite: nobody finished this. An empty `photoUrl` is not an error state — a
 * brother filling this form on his phone at 11pm very often has no square photo of
 * the two of them to hand, and that page still has to arrive looking made.
 *
 * So the empty case is drawn rather than apologised for: the rangoli at full
 * strength (it is a texture at 6% behind text, but here it is the picture), a
 * marigold cluster with the one rani bloom off-centre, and the festival's name in
 * Devanagari under a length of thread. It reads as a printed card, which is what a
 * page with no photograph should look like.
 */
function PhotoFallback({ size }: { size: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: `radial-gradient(circle at 50% 42%, ${RS.surface} 0%, ${RS.paperDeep} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* Still, and larger than its box: a mandala cropped by the frame reads as a
          bigger drawing behind a window, where a whole one centred in a square
          reads as a sticker. */}
      <div style={{ position: "absolute", opacity: 0.55 }}>
        <Rangoli size={Math.round(size * 1.06)} opacity={0.5} petals={16} />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: Math.round(size * 0.045),
        }}
      >
        {/* Three blooms, not one — a single centred flower is a logo. The rani one
            is the tallest and slightly right of centre so the cluster has a front
            and a back instead of being a row. */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: Math.round(size * 0.02),
          }}
        >
          <Marigold size={Math.round(size * 0.17)} />
          <Marigold size={Math.round(size * 0.29)} tone="rani" />
          <Marigold size={Math.round(size * 0.2)} />
        </div>

        <ThreadRule width={Math.round(size * 0.52)} knot={false} />

        <p
          className="rs-deva"
          style={{
            margin: 0,
            fontSize: Math.max(13, Math.round(size * 0.082)),
            color: RS.raniDeep,
          }}
        >
          रक्षाबंधन
        </p>
      </div>
    </div>
  );
}

export default function CoverScreen({
  data,
  onBegin,
}: {
  data: SisterData;
  onBegin: () => void;
}) {
  const now = useNow();
  const muhurat = useMemo(() => muhuratLine(now, data.festivalDate), [now, data.festivalDate]);
  const isDesktop = useIsDesktop();

  // The photograph is a 216px badge beside her name on a phone and the whole left
  // column on a laptop, where it stops being an ornament and becomes the first
  // thing you look at. Square at both sizes — a circular mask crops the corners
  // off a photo nobody framed for one, and on a family shot that is whoever was
  // standing at the edge.
  const frame = isDesktop ? 392 : 216;

  const line = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  // Never "your sister": the page is addressed to her, and a page that does not
  // know her name should say the word he would have used out loud instead.
  const name = data.sisterName || sisterWord(data);

  return (
    <Stage
      className="rs-cover"
      behind={
        <div
          style={{
            position: "absolute",
            top: "16%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        >
          <Rangoli size={isDesktop ? 640 : 380} opacity={0.06} />
        </div>
      }
      head={
        <>
          {/* Didi or Behna, in Devanagari, and the only Devanagari on this screen.
              It forks on birth order through `sisterWord` rather than being
              hardcoded — see the note on `sisterIsElder` in types.ts for why
              getting this wrong is the tell that a page was generated. */}
          <motion.p
            className="rs-deva"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              margin: 0,
              fontSize: 16,
              color: RS.brass,
            }}
          >
            {data.sisterIsElder ? "दीदी" : "बहना"}
          </motion.p>

          <motion.h1
            className="rs-display rs-name"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            style={{
              // vw on a phone, where the text column IS the viewport; a fixed size
              // on desktop, where the same clamp would measure her name against a
              // 1440px window and blow it out of a 520px column.
              fontSize: isDesktop ? 60 : "clamp(32px, 10.5vw, 46px)",
              lineHeight: 1.04,
              fontWeight: 700,
              color: RS.rani,
              margin: "4px 0 0",
              textShadow: "0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            {name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.46, duration: 0.6 }}
            style={{
              margin: "8px 0 0",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: 3.4,
              textTransform: "uppercase",
              color: RS.muted,
            }}
          >
            Happy Raksha Bandhan
          </motion.p>
        </>
      }
      art={
        /* Brass-and-rani frame, the house's double-rule move: a metal border, a
           hairline inset a few pixels in, and the photo rounded rather than square
           inside it. A hard corner against a brass rule reads as a placeholder;
           the 22px radius is what makes it read as something hung on a wall. */
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            padding: 10,
            borderRadius: 30,
            background: `linear-gradient(145deg, ${RS.brassSoft} 0%, ${RS.brass} 40%, ${RS.raniSoft} 74%, ${RS.brassSoft} 100%)`,
            boxShadow: "0 16px 40px rgba(51,32,43,0.2)",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 4,
              borderRadius: 26,
              border: "1px solid rgba(255,253,248,0.6)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          <div
            style={{
              position: "relative",
              width: frame,
              height: frame,
              borderRadius: 22,
              overflow: "hidden",
              background: RS.surface,
              display: "grid",
              placeItems: "center",
            }}
          >
            {data.photoUrl ? (
              <UserImage
                src={data.photoUrl}
                alt={`${name} and ${data.brotherName || "her brother"}`}
                priority
                sizes={`${frame}px`}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <PhotoFallback size={frame} />
            )}
          </div>

          {/* One marigold hung off the corner, turning slowly. The brother
              template hangs the rakhi here; this page cannot, because the rakhi
              has not been chosen yet — she chooses it on the next screen, and
              showing one now would answer the only question this page asks her. */}
          <div
            style={{
              position: "absolute",
              right: -13,
              bottom: -13,
              zIndex: 3,
              filter: "drop-shadow(0 4px 8px rgba(51,32,43,0.26))",
            }}
          >
            <Marigold size={isDesktop ? 74 : 54} tone="rani" spin />
          </div>
        </motion.div>
      }
      body={
        <>
          <motion.div
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <ThreadRule width={isDesktop ? 300 : 200} />
          </motion.div>

          {/* ── His lines, one at a time ──
           *
           * Staggered rather than shown together, because they are written as
           * three beats with a turn in the last one and arriving as a paragraph
           * flattens all three into one. 0.5s apart is roughly reading speed for a
           * line this short.
           *
           * On paper, not on the page ground: his voice is quoted here, and the
           * sheet is what marks the difference between what he wrote and what the
           * template says. */}
          {data.greeting.length > 0 && (
            <motion.div
              initial="hidden"
              animate="show"
              transition={{ staggerChildren: 0.5, delayChildren: 0.6 }}
              style={{
                width: "100%",
                maxWidth: isDesktop ? "100%" : 330,
                padding: isDesktop ? "20px 24px" : "16px 19px",
                borderRadius: 16,
                background: "rgba(255,253,248,0.8)",
                border: `1px solid ${RS.hairline}`,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {data.greeting.map((l, i) => (
                <motion.p
                  key={i}
                  variants={line}
                  transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontSize: isDesktop ? 17.5 : 15.5,
                    lineHeight: 1.56,
                    color: RS.ink,
                    margin: 0,
                  }}
                >
                  {l}
                </motion.p>
              ))}
            </motion.div>
          )}

          {/* ── The clock. Information, in a pill, and nothing else ──
           *
           * The height is reserved whether or not there is a line to put in it,
           * because the clock only resolves on the client (see `useNow`) and a pill
           * appearing after hydration would shove the CTA down by 50px at exactly
           * the moment her thumb is arriving at it. */}
          <div
            style={{
              minHeight: 62,
              display: "grid",
              placeItems: isDesktop ? "center start" : "center",
              width: "100%",
            }}
          >
            {muhurat && (
              <div
                className="rs-rise"
                style={{ display: "grid", gap: 5, justifyItems: isDesktop ? "start" : "center" }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 15px",
                    borderRadius: 999,
                    border: `1px solid ${TONE_COLOUR[muhurat.tone]}`,
                    background: "rgba(255,253,248,0.86)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: TONE_COLOUR[muhurat.tone],
                    boxShadow: "0 3px 10px rgba(51,32,43,0.07)",
                  }}
                >
                  {/* A bloom rather than a dot: the marigold is this template's
                      unit of "the festival is happening", and it is already on the
                      frame and in the toran. `spin` only while the window is
                      actually open, which is the whole of the colour's job said a
                      second way. */}
                  <Marigold size={18} tone={muhurat.tone === "live" ? "rani" : "haldi"} spin={muhurat.tone === "live"} />
                  {muhurat.label}
                </span>

                <span style={{ fontSize: 11.5, color: RS.muted }}>{muhurat.note}</span>
              </div>
            )}
          </div>

          {/* The CTA names the next screen honestly. It is not "begin" and it is
              not "tie the rakhi" — the next thing that happens is a tray of five
              rakhis and a choice, and a button that promised the tying would be
              lying about one tap. */}
          <motion.button
            onClick={onBegin}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="rs-display rs-sheen rs-nudge"
            style={{
              position: "relative",
              overflow: "hidden",
              marginTop: 2,
              padding: "16px 40px",
              minHeight: 56,
              borderRadius: 999,
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              fontSize: 17.5,
              fontWeight: 700,
              letterSpacing: 0.3,
              cursor: "pointer",
            }}
          >
            Rakhi chuno
          </motion.button>

          {data.brotherName && (
            <p style={{ fontSize: 12.5, color: RS.muted, margin: 0 }}>
              from {data.brotherName}
            </p>
          )}
        </>
      }
    />
  );
}
