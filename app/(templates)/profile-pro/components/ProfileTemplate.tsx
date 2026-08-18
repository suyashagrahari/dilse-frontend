"use client";

// ─── Endorsements — the composer ─────────────────────────────────────────────
//
// Every piece of this template is a dumb renderer that takes props. This file is
// the only thing that holds state, and it holds four small things: whether the
// Connect button has been pressed, which recommendations tab is showing, which
// skill row is mid-flash, and whether the toast is up. Nothing else in the
// template calls `useState` on anything the page's meaning depends on.
//
// ── DESKTOP IS NOT AN AFTERTHOUGHT HERE ──────────────────────────────────────
//
// Most of our templates are a card somebody opens on a phone. This one is a
// profile, and a profile is a thing people also open on a laptop at work with a
// straight face. So the column caps at 700px and CENTRES, with the page grey
// visible either side. Stretching the cards to 1440px would be the single
// fastest way to make it stop reading as the genre it is imitating — that layout
// exists nowhere in the category, and the whole gag is load-bearing on the frame
// looking unremarkable.
//
// ── THE QUEUE IS THE SENDER'S, AND ONLY THE SENDER'S ─────────────────────────
//
// `shareId` is the tell. The person who made the page has it in their URL; the
// person the page is about is looking at a rendered profile with no id attached.
// So the moderation card renders on `shareId` and nothing else. Getting this
// backwards would show the recipient the pile of things written about them
// before their partner had read any of it, which is the one failure this whole
// template is built to prevent.
//
// ── PENDING NEVER REACHES THE PAGE ───────────────────────────────────────────
//
// `Recommendations` is handed a list that has already been filtered to
// `published`. The filter lives here rather than inside that component so there
// is exactly one place in the codebase where an unapproved paragraph could
// possibly slip through, and it is four lines long and visible from the top of
// the file.
//
// ── CONNECT ──────────────────────────────────────────────────────────────────
//
// Press it and it says "Pending" for 1.2 seconds, then "Connected ✓", and a
// toast admits you have in fact already been connected since 2023. Under
// `prefers-reduced-motion: reduce` it lands on connected immediately — the beat
// is a joke about latency, and a joke is not worth a vestibular problem. Nothing
// on the page is gated on it either way.

import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";

import { EndorsementQueue } from "./EndorsementQueue";
import { ProfileCard } from "./ProfileCard";
import { Recommendations } from "./Recommendations";
import { AboutSection, CertificationsSection, EducationSection, ExperienceSection } from "./Sections";
import { Skills } from "./Skills";
import { TopBar } from "./TopBar";
import { PP } from "./theme";
import type { ProfileProData, ProfileSkill, RecommendationTab } from "./types";

/** The column cap. Wide enough for a two-column feel, narrow enough to read. */
const COLUMN = 700;
/** The gap between every section card, per the spec. */
const GAP = 12;
/** How long "Pending" holds before it gives up the act. */
const CONNECT_MS = 1200;
/** How long the toast stays before it removes itself. */
const TOAST_MS = 3200;
/** The flash on an endorsed row outlives the count-up by a hair. */
const FLASH_MS = 700;

const TOAST_CSS = `
@keyframes pp-toast-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.pp-toast { animation: pp-toast-in 220ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .pp-toast { animation: none; }
}
`;

/**
 * Starts `false` so the server render and the first client render agree, then
 * corrects itself in an effect. Same shape as the one in `Skills` — duplicated
 * rather than shared because a three-line hook in a `.ts` barrel is a file
 * everybody has to open to find out it does nothing surprising.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function ProfileTemplate(props: {
  data: ProfileProData;
  shareId?: string;
  capture?: boolean;
}): JSX.Element {
  const { data, shareId, capture = false } = props;
  const reduced = useReducedMotion();

  /* ── Connect ─────────────────────────────────────────────────────────────── */

  const [connectState, setConnectState] = useState<"idle" | "pending" | "connected">("idle");
  const [toast, setToast] = useState("");

  // Every timer this component can start, so an unmount mid-beat cannot land a
  // `setState` on a component that is gone.
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    },
    []
  );

  const after = useCallback((ms: number, run: () => void) => {
    const id = window.setTimeout(run, ms);
    timers.current.push(id);
  }, []);

  const showToast = useCallback(
    (text: string) => {
      setToast(text);
      after(TOAST_MS, () => setToast(""));
    },
    [after]
  );

  const onConnect = useCallback(() => {
    if (connectState !== "idle") return;

    const land = () => {
      setConnectState("connected");
      showToast("already connected. since 2023.");
    };

    if (reduced) {
      land();
      return;
    }

    setConnectState("pending");
    after(CONNECT_MS, land);
  }, [connectState, reduced, after, showToast]);

  /* ── Skills ──────────────────────────────────────────────────────────────── */

  // The counts are bumped locally so a tap has a visible consequence on this
  // screen. It is not a write — the real contribution loop is the endorse link,
  // and everything that comes back through it waits in the queue below.
  const [bumps, setBumps] = useState<Record<string, number>>({});
  const [justEndorsed, setJustEndorsed] = useState<string | null>(null);

  const skills = useMemo<ProfileSkill[]>(
    () =>
      data.skills.map((s) =>
        bumps[s.id] ? { ...s, endorsements: s.endorsements + bumps[s.id] } : s
      ),
    [data.skills, bumps]
  );

  const onEndorse = useCallback(
    (skillId: string) => {
      setBumps((prev) => ({ ...prev, [skillId]: (prev[skillId] ?? 0) + 1 }));
      setJustEndorsed(skillId);
      after(FLASH_MS, () => setJustEndorsed((cur) => (cur === skillId ? null : cur)));
    },
    [after]
  );

  /* ── Recommendations ─────────────────────────────────────────────────────── */

  const [tab, setTab] = useState<RecommendationTab>("received");

  // The one gate. Nothing unapproved is handed to a renderer.
  const published = useMemo(
    () => data.recommendations.filter((r) => r.status === "published"),
    [data.recommendations]
  );

  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div
      style={{
        minHeight: "100%",
        background: PP.page,
        fontFamily: PP.font,
        color: PP.ink,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: TOAST_CSS }} />

      <TopBar brandName={data.person.name} />

      <main
        style={{
          boxSizing: "border-box",
          width: "100%",
          maxWidth: COLUMN,
          // The centring that keeps the page grey visible at 1440px.
          margin: "0 auto",
          padding: "12px 12px 40px",
          display: "flex",
          flexDirection: "column",
          gap: GAP,
        }}
      >
        <ProfileCard person={data.person} onConnect={onConnect} connectState={connectState} />

        <AboutSection about={data.about} />

        <Skills skills={skills} onEndorse={onEndorse} justEndorsed={justEndorsed} />

        <ExperienceSection items={data.experience} />

        <EducationSection items={data.education} />

        {data.certifications && data.certifications.length > 0 ? (
          <CertificationsSection items={data.certifications} />
        ) : null}

        <Recommendations
          items={published}
          tab={tab}
          onTab={setTab}
          personName={data.person.name}
        />

        {/* The sender's own view. The recipient has no `shareId`, and so never
            sees a word of this. */}
        {shareId ? <EndorsementQueue shareId={shareId} /> : null}
      </main>

      {/* Suppressed under `capture` — a screenshot with a transient bar frozen
          into it looks like a rendering bug rather than a moment. */}
      {toast && !capture ? (
        <div
          role="status"
          aria-live="polite"
          className="pp-toast"
          style={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: 16,
            zIndex: 40,
            margin: "0 auto",
            maxWidth: 360,
            boxSizing: "border-box",
            padding: "12px 16px",
            borderRadius: 8,
            background: PP.accent,
            color: PP.accentInk,
            fontFamily: PP.font,
            fontSize: 14,
            lineHeight: "20px",
            fontWeight: 600,
            textAlign: "center",
            overflowWrap: "anywhere",
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

export default ProfileTemplate;
