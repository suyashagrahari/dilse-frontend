"use client";

// Scene 7 — Chapter IV: By the Numbers. Dark cards; numeric values roll in on slot-machine digit reels when a
// card comes into view ("film-tick" per digit, "film-clack" as the last lands, "film-ding" as the card settles).
// From togetherSince: days together (with a live h:m:s counter), heartbeats shared (≈ days × 24 × 60 × 70,
// "approximately, mine skips"), sunsets, Valentine's Days. Then the sender's own stats, then the last card:
// "Favourite person in every scene: you." Swipe on phones, a grid on desktop.

import { useEffect, useRef, useState } from "react";
import { usePremium } from "../../../_valentine/kit/premium";
import { useReducedMotion } from "../../../_valentine/kit";
import { daysBetween, fmt, valentinesBetween, type Film } from "./util";

function Reel({ value, go, reduce }: { value: string; go: boolean; reduce: boolean }) {
  const chars = Array.from(value);
  return (
    <span className="fm-reelNum" aria-label={value}>
      {chars.map((ch, k) => {
        const d = /\d/.test(ch) ? Number(ch) : -1;
        if (d < 0) return <span key={k} aria-hidden>{ch}</span>;
        const turns = go ? d + 10 : 0;
        return (
          <span key={k} className="fm-digit" aria-hidden>
            <span style={{ transform: `translateY(-${turns}em)`, transitionDelay: reduce ? "0s" : `${k * 90}ms` }}>
              {Array.from({ length: 20 }, (_, i) => <i key={i}>{i % 10}</i>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function Live({ since }: { since: Date }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const ms = Math.max(0, now - since.getTime());
  const h = Math.floor(ms / 36e5) % 24;
  const m = Math.floor(ms / 6e4) % 60;
  const s = Math.floor(ms / 1e3) % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return <span className="fm-live" aria-live="off">+ {p(h)}h {p(m)}m {p(s)}s and counting</span>;
}

type StatCard = { label: string; value: string; note?: string; numeric: boolean; live?: boolean; final?: boolean };

function Card({ c, since, root }: { c: StatCard; since: Date | null; root: React.RefObject<HTMLDivElement | null> }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || go) return;
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting && e.intersectionRatio > 0.6)) return;
        io.disconnect();
        setGo(true);
        const digits = Array.from(c.value).filter((x) => /\d/.test(x)).length;
        if (c.numeric) {
          for (let k = 0; k < Math.min(digits, 9); k++) sfx("film-tick", { at: 0.08 + k * 0.09 + Math.random() * 0.02 });
          sfx("film-clack", { at: 0.15 + digits * 0.09 + 1.1 });
        }
        sfx("film-ding", { at: c.numeric ? 1.5 + digits * 0.09 : 0.25, gain: c.final ? 1.2 : 0.8 });
      },
      { threshold: [0.6], root: window.matchMedia("(min-width: 900px)").matches ? null : root.current },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [c, go, sfx, root]);

  return (
    <div ref={ref} className={`fm-stat${c.final ? " is-final" : ""}${go ? " fm-rise" : ""}`} style={go ? undefined : { opacity: 0.35 }}>
      <small>{c.label}</small>
      <span className={`fm-val${c.numeric ? "" : " is-text"}`}>
        {c.numeric ? <Reel value={c.value} go={go} reduce={reduce} /> : go ? c.value : "…"}
      </span>
      {c.live && since && <Live since={since} />}
      {c.note && <p>{c.note}</p>}
    </div>
  );
}

export default function Numbers({ film, onDone }: { film: Film; onDone: () => void }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const cards: StatCard[] = [];
  if (film.since) {
    const now = new Date();
    const days = daysBetween(film.since, now);
    cards.push({ label: "Days together", value: fmt(days), numeric: true, live: true });
    cards.push({ label: "Heartbeats shared", value: fmt(days * 24 * 60 * 70), note: "approximately. Mine skips.", numeric: true });
    cards.push({ label: "Sunsets together", value: fmt(days), note: "and not one of them was the best view.", numeric: true });
    cards.push({ label: "Valentine's Days together", value: fmt(valentinesBetween(film.since, now) || 1), note: "this one included.", numeric: true });
  }
  for (const s of film.stats) cards.push({ label: s.label, value: s.value, numeric: /^[\d,.\s]+$/.test(s.value) });
  cards.push({ label: "Favourite person in every scene", value: "you.", numeric: false, final: true });

  return (
    <section className="fm-scene" aria-label="Chapter four: by the numbers">
      <div className="fm-col" style={{ width: "100%", maxWidth: "none" }}>
        <p className="fm-kick">Chapter IV</p>
        <h2 className="fm-h">By the <em>Numbers</em></h2>
        <p className="fm-sub">{film.since ? `${film.to} & ${film.from}, since ${film.since.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}.` : `${film.to} & ${film.from}, in figures.`}</p>
        <div className="fm-cards" ref={rowRef}>
          {cards.map((c, k) => <Card key={k} c={c} since={film.since} root={rowRef} />)}
        </div>
        <p className="fm-hint fm-swipeHint" style={{ opacity: 0.6 }}>swipe the cards</p>
        <button type="button" className="fm-btn" onClick={onDone}>The final scene ▸</button>
      </div>
    </section>
  );
}
