"use client";

// The end credits (hold anywhere to pause them), then the lobby: the film poster to keep, a review for the
// director (the reply), the post-credits scene (the sealed P.S.) and "Watch again".

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CroppedPhoto, Sticker, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, ReplyBox, TiltCard, posterKeepsake, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { stamp, type Film } from "./util";

export interface CreditsProps {
  film: Film;
  day: DayConfig;
  data: ValentineDayData;
  premieredAt: Date | null;
  onArrive: () => void;
  onReplay: () => void;
}

const SPEED = 62; // px per second

export function Credits({ film, day, data, premieredAt, onArrive, onReplay }: CreditsProps) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"roll" | "end">(reduce ? "end" : "roll");
  const [held, setHeld] = useState(false);
  const roll = useRef<HTMLDivElement | null>(null);
  const arrived = useRef(false);
  const arriveRef = useRef(onArrive);
  useEffect(() => {
    arriveRef.current = onArrive;
  });

  useLayoutEffect(() => {
    // the roll's speed is constant: its duration follows the credits' height (set on the node, not in state)
    const el = roll.current;
    if (el) el.style.setProperty("--pr-roll-s", `${Math.max(18, Math.min(70, (el.offsetHeight + window.innerHeight) / SPEED))}s`);
  }, []);
  useEffect(() => {
    if (phase === "end" && !arrived.current) {
      arrived.current = true;
      arriveRef.current();
    }
  }, [phase]);

  const stills = film.photos.slice(0, 6);
  const still = (k: number) => {
    const p = stills[k];
    if (!p) return null;
    return (
      <div className="pr-cr-still" style={{ transform: `rotate(${k % 2 ? 2.2 : -2.4}deg)` }}>
        <figure>
          <div className="ph">
            <CroppedPhoto photo={p} alt={p.caption ?? ""} />
          </div>
          <figcaption>
            Scene {k + 1}
            {p.caption ? ` · ${p.caption}` : ""}
          </figcaption>
        </figure>
      </div>
    );
  };

  if (phase === "end") return <Lobby film={film} day={day} data={data} premieredAt={premieredAt} onReplay={onReplay} />;

  return (
    <div
      className={`pr-scene pr-credits${held ? " is-held" : ""}`}
      onPointerDown={() => setHeld(true)}
      onPointerUp={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
      onPointerLeave={() => setHeld(false)}
      aria-label="End credits. Hold to pause."
    >
      <div className="pr-roll" ref={roll} onAnimationEnd={() => setPhase("end")}>
        <div className="pr-cr-block" style={{ marginBottom: 90 }}>
          <span className="pr-display pr-it pr-foil" style={{ fontSize: "clamp(40px, 11vw, 84px)", lineHeight: 1 }}>
            {film.title}
          </span>
        </div>
        <div className="pr-cr-block">
          <span className="pr-cr-role">Starring</span>
          <span className="pr-cr-name">{film.to}</span>
          <span className="pr-cr-as">as the one who said yes</span>
        </div>
        <div className="pr-cr-block">
          <span className="pr-cr-role">and</span>
          <span className="pr-cr-name">{film.from}</span>
          <span className="pr-cr-as">as the one who asked</span>
        </div>
        {still(0)}
        {film.credits.map((c, i) => (
          <div className="pr-cr-row" key={i}>
            <span className="pr-cr-role">{c.role}</span>
            <span>{c.name}</span>
          </div>
        ))}
        {film.credits.length > 0 && <div style={{ height: 50 }} />}
        {still(1)}
        {film.location && (
          <div className="pr-cr-block">
            <span className="pr-cr-role">Filmed on location in</span>
            <span className="pr-cr-name" style={{ fontSize: "clamp(22px, 6vw, 32px)", fontStyle: "italic", maxWidth: "18ch" }}>
              {film.location}
            </span>
          </div>
        )}
        {still(2)}
        <div className="pr-cr-block">
          <span className="pr-cr-role">Written &amp; directed by</span>
          <span className="pr-cr-name">{film.from}</span>
        </div>
        {still(3)}
        {stills.slice(4).map((_, k) => (
          <div key={k}>{still(k + 4)}</div>
        ))}
        {data.endLine?.trim() && (
          <div className="pr-cr-block" style={{ maxWidth: "24ch" }}>
            <span className="pr-display pr-it" style={{ fontSize: "clamp(24px, 6.6vw, 38px)", lineHeight: 1.15 }}>
              {data.endLine.trim()}
            </span>
          </div>
        )}
        <div className="pr-cr-block">
          <span className="pr-cr-as" style={{ fontStyle: "normal", letterSpacing: ".08em" }}>
            Based on a true story. Still being written.
          </span>
        </div>
        <div className="pr-cr-block" style={{ marginBottom: "40svh", marginTop: 40 }}>
          <span className="pr-display pr-it pr-foil" style={{ fontSize: "clamp(46px, 13vw, 96px)", lineHeight: 1 }}>
            The Beginning
          </span>
          {premieredAt && <span className="pr-cr-role" style={{ marginTop: 12 }}>Premiered {stamp(premieredAt)}</span>}
        </div>
      </div>
      <button type="button" className="pr-link pr-skip" onPointerDown={(e) => e.stopPropagation()} onClick={() => setPhase("end")}>
        Skip credits ›
      </button>
    </div>
  );
}

function Lobby({ film, day, data, premieredAt, onReplay }: { film: Film; day: DayConfig; data: ValentineDayData; premieredAt: Date | null; onReplay: () => void }) {
  const { premium, sfx } = usePremium();
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const slot = day.gifSlots.find((g) => g.id === "pp5-yes");
  const gif = slot && data.gifs?.[slot.id] !== "none";
  const psText = premium.psLetter?.trim() ?? "";
  const [psHead, ...psRest] = psText.split("\n");
  const hasPs = !!psText || gif;

  const save = async () => {
    setSaving("busy");
    sfx("paper-rustle");
    const layout = posterKeepsake(day, data, {
      title: film.title,
      tagline: film.tagline || undefined,
      photoIndex: film.heroIndex,
      dateLine: premieredAt ? `PREMIERED ${stamp(premieredAt)}` : undefined,
      accent: "#D8B25A",
      bg: "#0B0B0D",
    });
    const r = await saveOrSharePoster(layout, `${film.title}-poster`);
    setSaving(r === "failed" ? "failed" : "done");
  };

  return (
    <div className="pr-scene pr-end">
      <div className="pr-endIn">
        <div className="pr-endHead pr-fade">
          <p className="pr-eyebrow" style={{ margin: 0 }}>
            {film.to} &amp; {film.from}
          </p>
          <h2 className="pr-display pr-it pr-foil" style={{ margin: "12px 0 0", fontSize: "clamp(44px, 12vw, 88px)" }}>
            The Beginning
          </h2>
        </div>

        <div className="pr-endPoster pr-fade" style={{ animationDelay: ".3s", display: "grid", gap: 18, justifyItems: "center" }}>
          <div className="pr-poster">
            <TiltCard radius={3} foil max={9}>
              <div className="pr-posterIn">
                {film.hero && <CroppedPhoto photo={film.hero} alt="" />}
                <span className="k">{film.from} presents</span>
                <div className="t">
                  <span className="pr-laurel">✦ Official selection ✦</span>
                  <b>{film.title}</b>
                  <small>Starring {film.to}</small>
                </div>
              </div>
            </TiltCard>
          </div>
          <PremiumCTA tone="gold" cue={null} className="pr-cta" onClick={() => void save()} disabled={saving === "busy"}>
            {saving === "busy" ? "Printing…" : saving === "done" ? "Saved ✓" : "Keep the poster"}
          </PremiumCTA>
          {saving === "failed" && <span className="pr-hint">Couldn&rsquo;t save. Try a screenshot?</span>}
        </div>

        <div className="pr-review pr-fade" style={{ animationDelay: ".5s" }}>
          <ReplyBox title={`Leave ${film.from} a review`} placeholder="★★★★★ Would say yes again…" accent="#D8B25A" />
        </div>

        {hasPs && (
          <div className="pr-ps pr-fade" style={{ animationDelay: ".7s" }}>
            {ps ? (
              <>
                <span className="pr-eyebrow">Post-credits scene</span>
                {psText && <h3>{psHead}</h3>}
                {psRest.join("\n").trim() && <p>{psRest.join("\n").trim()}</p>}
                {gif && slot && <Sticker slug={day.slug} slot={slot} value={data.gifs?.[slot.id]} size={96} alt="" />}
              </>
            ) : (
              <button type="button" className="pr-ghost" onClick={() => { setPs(true); sfx("pr-beep"); sfx("projector-loop", { gain: 0.3, dur: 1.2 }).stop(1400); }}>
                Stay for the post-credits scene
              </button>
            )}
          </div>
        )}

        <div className="pr-endFoot">
          <button type="button" className="pr-link" onClick={onReplay}>
            ↺ Watch again
          </button>
        </div>
      </div>
    </div>
  );
}
