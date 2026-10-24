"use client";

// ─── /wedding — "The journey of an Indian wedding" ───────────────────────────
//
// Seven functions, told for someone who has never been to one. Phones get a
// horizontal snap carousel (one illustrated card per function, dots to jump);
// from 768px the art pins in a sticky stage on the left while the functions
// scroll past on the right and a red mauli thread fills as you go.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JOURNEY, type JourneyStep } from "./content";

function Scene({ s, eager = false }: { s: JourneyStep; eager?: boolean }) {
  return (
    <div className="whJScene" style={{ ["--tint" as string]: s.tint, ["--deep" as string]: s.deep }}>
      <span className="whJRing" aria-hidden />
      <span className="whJDeva" lang="hi" aria-hidden>{s.hindi.split(" · ")[0]}</span>
      {s.props.map((p, k) => (
        // eslint-disable-next-line @next/next/no-img-element -- placed prop art
        <img
          key={k}
          src={p.src}
          width={p.w}
          height={p.h}
          alt=""
          aria-hidden
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={`whJProp${p.cls ? ` ${p.cls}` : ""}${p.flip ? " flip" : ""}`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.width}%`, zIndex: p.z ?? 2 }}
        />
      ))}
      {s.couple && (
        // eslint-disable-next-line @next/next/no-img-element -- the couple for this function
        <img className="whJCouple" src={s.couple.src} width={s.couple.w} height={s.couple.h} alt={s.couple.alt} loading={eager ? "eager" : "lazy"} decoding="async" />
      )}
    </div>
  );
}

export default function HubJourney({ visible }: { visible: Set<string> }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const wide = window.matchMedia("(min-width: 768px)");
    let io: IntersectionObserver | null = null;
    const wire = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        }),
        wide.matches ? { rootMargin: "-48% 0px -48% 0px" } : { root: el, threshold: 0.6 },
      );
      el.querySelectorAll(".whJStep").forEach((n) => io!.observe(n));
    };
    wire();
    wide.addEventListener("change", wire);
    return () => { io?.disconnect(); wide.removeEventListener("change", wire); };
  }, []);

  const go = (i: number) => {
    const el = list.current;
    const card = el?.querySelectorAll<HTMLElement>(".whJStep")[i];
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };

  return (
    <section className="whBand whJourney" id="journey" aria-labelledby="wh-journey">
      <div className="whIn">
        <div className="whHead">
          <p className="whEyebrow">The journey of an Indian wedding</p>
          <h2 id="wh-journey" className="whH2">Seven celebrations, <em>one invitation</em></h2>
          <p className="whSub">Never been to an Indian wedding? Here is what happens over the days of celebration, and how one link invites your guests to every moment of it.</p>
        </div>

        <div className="whJ" style={{ ["--p" as string]: active / (JOURNEY.length - 1) }}>
          <div className="whJStage" aria-hidden>
            {JOURNEY.map((s, i) => (
              <div key={s.id} className={`whJFrame${i === active ? " is-on" : ""}`}>
                <Scene s={s} />
              </div>
            ))}
            <span className="whJCount"><b>{String(active + 1).padStart(2, "0")}</b> / {String(JOURNEY.length).padStart(2, "0")}</span>
          </div>

          <ol className="whJList" ref={list} data-no-swipe aria-label="The functions of an Indian wedding">
            <span className="whJThread" aria-hidden><i /></span>
            {JOURNEY.map((s, i) => {
              const href = visible.has(s.slug) ? `/${s.slug}` : "#designs";
              return (
                <li key={s.id} className={`whJStep${i === active ? " is-on" : ""}`} data-i={i} style={{ ["--deep" as string]: s.deep, ["--tint" as string]: s.tint }}>
                  <div className="whJCardArt"><Scene s={s} /></div>
                  <div className="whJText">
                    <span className="whJNum" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="whJName">{s.name} <span lang="hi">{s.hindi}</span></h3>
                    <p className="whJLine">{s.line}</p>
                    <p className="whJTip">{s.tip}</p>
                    <Link href={href} className="whJGo">{s.cta} <ArrowRight size={15} aria-hidden /></Link>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="whJDots" role="group" aria-label="Jump to a function">
            {JOURNEY.map((s, i) => (
              <button key={s.id} type="button" className={i === active ? "is-on" : ""} onClick={() => go(i)} aria-label={`Show ${s.name}`} aria-pressed={i === active}>
                <i />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
