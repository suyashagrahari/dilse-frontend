"use client";

// Scene 9 — YES: colour, fireworks, credits (WOW 2). At the drop's peak the colour floods out of the YES button
// (a clip-path circle over a full-colour copy of the world, "film-wipe" + "film-swell"), the letterbox bars slide
// away and heart-shaped fireworks volley over the velvet; the last one writes their initials in sparks. Then
// the end credits roll (hold to fast-forward, drag to scrub, Skip) with the bloopers ("Takes needed for YES: 4"),
// two seconds of black, a post-credits sting and the date plan (+ .ics), the sealed P.S. as a "deleted scene",
// the movie-poster keepsake, the reply box and the ending actions. Reduced motion: the colour fades in and
// the fireworks become a still, glowing initials card.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { downloadIcs, posterKeepsake, ReplyBox, saveOrSharePoster, SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { CroppedPhoto, EndingActions, useReducedMotion } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import Fireworks from "./Fireworks";
import { initial, planStart, type Film } from "./util";

type Phase = "yes" | "credits" | "black" | "post";

export interface FinaleProps {
  day: DayConfig;
  data: ValentineDayData;
  film: Film;
  takes: number;
  origin: { x: number; y: number };
  mode: "preview" | "live";
  yesSticker: ReactNode;
  creditsSticker: ReactNode;
  onComplete: () => void;
  onReplay: () => void;
}

export default function Finale({ day, data, film, takes, origin, mode, yesSticker, creditsSticker, onComplete, onReplay }: FinaleProps) {
  const { sfx, music, premium } = usePremium();
  const reduce = useReducedMotion();
  const [wiping, setWiping] = useState(true);
  const [phase, setPhase] = useState<Phase>("yes");
  const [canRoll, setCanRoll] = useState(false);
  const [psOpen, setPsOpen] = useState(false);
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const initials = `${initial(film.to)} ♥ ${initial(film.from)}`;

  // The flood itself (this mounts at the drop's peak).
  useEffect(() => {
    sfx("film-wipe");
    sfx("film-swell", { gain: 0.9 });
    window.scrollTo({ top: 0 });
    const a = window.setTimeout(() => setWiping(false), reduce ? 500 : 1350);
    const b = window.setTimeout(() => setCanRoll(true), 5200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [sfx, reduce]);

  useEffect(() => {
    if (phase !== "yes" || !canRoll) return;
    const t = window.setTimeout(() => setPhase("credits"), 6500);
    return () => window.clearTimeout(t);
  }, [phase, canRoll]);

  useEffect(() => {
    if (phase === "black") {
      const t = window.setTimeout(() => setPhase("post"), 2000);
      return () => window.clearTimeout(t);
    }
    if (phase === "post") {
      sfx("film-post");
      music?.fadeTo(0.3, 6000);
      onComplete();
      window.scrollTo({ top: 0 });
    }
    if (phase === "credits") window.scrollTo({ top: 0 });
  }, [phase, sfx, music, onComplete]);

  const poster = useCallback(() => {
    const layout = posterKeepsake(day, data, { title: film.title, tagline: film.tagline || undefined, dateLine: (data.endLine.trim() || "Now showing: forever").toUpperCase(), accent: "#FFD36E" });
    layout.items.push({ type: "rect", x: 1080 / 2 - 290, y: 56, w: 580, h: 66, radius: 12, fill: "rgba(0,0,0,0.55)", stroke: "rgba(255,211,110,0.6)", lineWidth: 2 });
    layout.items.push({ type: "text", text: `★  TAKES NEEDED FOR YES: ${takes + 1}  ★`, x: 1080 / 2, y: 76, size: 26, weight: 700, face: "ui", color: "#FFD36E" });
    return layout;
  }, [day, data, film.title, film.tagline, takes]);

  const savePoster = async () => {
    setSaving("busy");
    const r = await saveOrSharePoster(poster(), `${day.slug}-${data.recipientName}`, `${film.title} — now showing ✦`);
    setSaving(r === "failed" ? "failed" : "done");
    if (r !== "failed") sfx("sparkle");
  };

  const icsStart = planStart(film.dateOn, film.datePlan);
  const songTitle = music?.mode === "youtube" ? music.title : music?.mode === "melody" ? "“Our Film” (the house theme)" : null;

  if (phase === "yes") {
    return (
      <div className={wiping ? `fm-flood${reduce ? " is-fade" : ""}` : "fm-world"} style={{ ["--ox" as string]: `${origin.x}px`, ["--oy" as string]: `${origin.y}px` }}>
        {!reduce && <Fireworks text={initials} onLaunch={(pan) => sfx("film-launch", { pan, gain: 0.7 })} onBurst={(pan, big) => sfx("film-burst", { pan, gain: big ? 1.1 : 0.8 })} />}
        <div className="fm-yesTitle">
          <p className="fm-kick">Take {takes + 1} · Print it</p>
          <h2 className="fm-in">{film.to} said <em>YES</em></h2>
          <span className="fm-rise" style={{ animationDelay: ".8s" }}>{yesSticker}</span>
          {reduce && <p className="fm-initCard">{initials}</p>}
          {canRoll && <button type="button" className="fm-btn fm-rise" style={{ marginTop: "min(16vh, 150px)" }} onClick={() => setPhase("credits")}>Roll the credits ▸</button>}
        </div>
      </div>
    );
  }

  if (phase === "credits") {
    const lines: { k?: string; small: string; big: ReactNode }[] = [
      { k: "title", small: `${film.from} presents`, big: film.title },
      { small: "Directed by", big: film.from },
      { small: "Starring", big: film.star },
      ...(film.metPlace ? [{ small: "Filmed on location in", big: film.metPlace }] : []),
      ...(songTitle ? [{ small: "Original soundtrack", big: songTitle }] : []),
      ...(data.photos.length ? [{ small: "Scenes in the final cut", big: String(data.photos.filter((p) => p.url).length) }] : []),
      { small: "Takes needed for YES", big: takes === 0 ? "1 (a natural)" : String(takes + 1) },
      { small: "Catering", big: `Whatever was on ${film.from}'s plate` },
      { k: "fine", small: "", big: "No hearts were harmed in the making of this film." },
    ];
    return (
      <Credits onEnd={() => setPhase("black")} corner={<span className="fm-crSticker">{creditsSticker}</span>}>
        {lines.map((l, i) => (
          <div key={i} className={`fm-cr${l.k ? ` is-${l.k}` : ""}`}>
            {l.small && <small>{l.small}</small>}
            <b>{l.big}</b>
          </div>
        ))}
        <div className="fm-cr"><small>Bloopers</small></div>
        <div className="fm-blooper">
          {takes === 0 ? <span>None. Nailed it in one.</span> : film.takes.slice(0, takes).map((t, i) => <span key={i}>TAKE {i + 2} · {t}</span>)}
        </div>
        <div className="fm-cr is-fine"><b>Made with SubhSandesh ✦ Premium</b></div>
      </Credits>
    );
  }

  if (phase === "black") return <div className="fm-credits" aria-label="The credits have ended" />;

  return (
    <section className="fm-post" aria-label="After the credits">
      <p className="fm-kick">After the credits</p>
      <h2 className="fm-h fm-in"><em>One more thing…</em></h2>
      {film.datePlan ? (
        <>
          <div className="fm-plan fm-rise">
            <div className="fm-pMain">
              <small>Admit two · the sequel</small>
              <b>{film.datePlan}</b>
            </div>
            <div className="fm-pStub">PART II</div>
          </div>
          {icsStart && (
            <button type="button" className="fm-ghost" onClick={() => { sfx("chime"); downloadIcs({ title: `${film.title}: Part II`, start: icsStart, durationMin: 150, description: film.datePlan, location: film.datePlan }, "our-sequel"); }}>
              📅 Add to calendar
            </button>
          )}
        </>
      ) : (
        <p className="fm-sub">The sequel is already in production. You&apos;re in it.</p>
      )}
      {premium.psLetter && (
        <button type="button" className="fm-ps" aria-expanded={psOpen} onClick={() => { if (!psOpen) sfx("wax-crack"); setPsOpen(true); }}>
          <b>Deleted scene {psOpen ? "" : "· sealed"}</b>
          {psOpen ? premium.psLetter : `Never shown in cinemas. ${premium.psLetter.split("\n")[0].slice(0, 80)} — tap to break the seal.`}
        </button>
      )}
      <div className="fm-poster" aria-label={`Movie poster: ${film.title}`}>
        {data.photos[0]?.url && <div className="fm-pPhoto"><CroppedPhoto photo={data.photos[0]} alt="" /></div>}
        <span className="fm-pFade" />
        <span className="fm-laurel">★ TAKES NEEDED FOR YES: {takes + 1} ★</span>
        <div className="fm-pTxt">
          <small>{film.from} presents</small>
          <b>{film.title}</b>
          {film.tagline && <i>{film.tagline}</i>}
          <em>STARRING {film.star.toUpperCase()}</em>
          <small>{data.endLine.trim() || "Now showing: forever"}</small>
        </div>
      </div>
      <button type="button" className="fm-btn" onClick={savePoster} disabled={saving === "busy"} aria-live="polite">
        {saving === "busy" ? "Printing…" : saving === "done" ? "Saved ✦" : saving === "failed" ? "Try again" : "Save the poster ✦"}
      </button>
      <div className="fm-endWrap">
        <ReplyBox title={`Write back to ${film.from}`} placeholder="Your review: ★★★★★ …" accent="#A6751C" />
        <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={poster} replyLabel="💬 Send your review" />
        <p className="fm-made">Made with SubhSandesh ✦ Premium</p>
      </div>
    </section>
  );
}

function Credits({ children, onEnd, corner }: { children: ReactNode; onEnd: () => void; corner?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLDivElement>(null);
  const fast = useRef(false);
  const drag = useRef<number | null>(null);
  const off = useRef(0);
  const ended = useRef(false);
  const end = useCallback(() => {
    if (ended.current) return;
    ended.current = true;
    onEnd();
  }, [onEnd]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const H = box.current?.clientHeight ?? 600;
      const R = roll.current?.scrollHeight ?? 1000;
      if (document.visibilityState === "visible") off.current += dt * (fast.current ? 260 : 52);
      off.current = Math.max(0, off.current);
      if (roll.current) roll.current.style.transform = `translate3d(0, ${(H - off.current).toFixed(1)}px, 0)`;
      if (off.current > R + H * 0.15) {
        end();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);

  return (
    <div
      ref={box}
      className="fm-credits"
      onPointerDown={(e) => { fast.current = true; drag.current = e.clientY; }}
      onPointerMove={(e) => { if (drag.current !== null) { off.current += drag.current - e.clientY; drag.current = e.clientY; } }}
      onPointerUp={() => { fast.current = false; drag.current = null; }}
      onPointerCancel={() => { fast.current = false; drag.current = null; }}
      aria-label="End credits — hold to fast-forward"
    >
      <div ref={roll} className="fm-roll" style={{ transform: "translate3d(0, 100vh, 0)" }}>{children}</div>
      {corner}
      <SkipChip onSkip={end} label="Skip credits ▸" delay={1200} />
    </div>
  );
}
