"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Music, Heart, Sparkles, Flame, Trophy, RotateCw, Lock, Star, Smile,
  Sprout, Check, Pause, Play, X, HandHeart, Mic, ChevronLeft, ChevronRight, Download, Fingerprint,
} from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { ApologyData, SignAgreementBody } from "./types";
import { MUSIC_PAUSE_EVENT, MUSIC_RESUME_EVENT } from "./types";

// ─── design tokens (from the mockup) ─────────────────────────────────────────
const ROSE = "#ff5f8a";
const ROSE_DEEP = "#e64072";
const INK = "#3a2233";
const DISPLAY = "var(--font-fredoka), 'Fredoka', system-ui, sans-serif";
const BODY = "var(--font-inter), 'Inter', system-ui, sans-serif";

const HINTS = [
  { max: 15, txt: "You're glowing 💚 — I don't deserve this smile, but I'll take it.", chip: "Perfect love" },
  { max: 40, txt: "Okay okay… softening. I see you. Keep going.", chip: "Warming up" },
  { max: 70, txt: "Still salty. That's fair. I'm listening.", chip: "Simmering" },
  { max: 100, txt: "Take a deep breath… try sliding me left to calm down.", chip: "Fuming" },
];

// heart-melting lines shown each time the "No" button is chased
const FORGIVE_NO_MSGS = [
  "That button's too shy to be pressed 🙈",
  "Aww — my heart can't take a 'no' 🥺",
  "It keeps running… just like I'll keep trying 💕",
  "You don't mean that 😌 the pink one's waiting 💗",
  "Every 'no' makes me adore you more 💞",
  "I'd wait a whole lifetime for your yes 🌹",
  "Okay that's adorable — but you know the answer 💘",
  "My love for you doesn't come with a 'no' 💗",
  "Chase it all you want — I'm not giving up on us 🥹",
];
const HIT_MSGS = [
  "Ouch! I deserved that 🥺",
  "I'm sorry — hit me again 💔",
  "You're right, I was wrong 🙏",
  "Take it all out on me 😣",
  "Dishoom! I'm so sorry 💥",
  "I'll do better, I promise 🥹",
  "Whack away — I still adore you 💗",
  "Each hit, I'm even sorrier 💕",
];
const HIT_EMOJI = ["💥", "💗", "🥺", "🙏", "💔", "💞"];
const EMOJI_FACES = ["🥺", "😜", "🤦‍♂️", "😅", "🙈", "🤡", "😇", "🫠", "😬"];
const DISHOOM_SFX = "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/apology-dashboard/sfx/dishoom.mp3";

// staggered entrance (re-triggers each time a step scrolls into view — works on mobile too)
const STAGGER_PARENT = { hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } } };
const STAGGER_CHILD = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };
// a card that fills most of the screen so steps don't look empty
const FULL_CARD: CSSProperties = { ...{ background: "#fff", borderRadius: 28, boxShadow: "0 20px 50px -20px rgba(230,64,114,.25), 0 4px 10px -4px rgba(0,0,0,.05)", border: "1px solid #ffe4ea" }, minHeight: "min(64vh, 560px)", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" };

// lofi chords (Cmaj7, Am7, Fmaj7, G)
const CHORDS = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 293.66, 392.0],
];

interface Props {
  data: ApologyData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

interface LocalToast { id: number; msg: string; emoji: string }
interface Mole { up: boolean; face: number }

// smooth pastel blend that tracks the anger % — soft green (love) → soft rose (fuming)
const bgForAnger = (v: number) => {
  const t = Math.max(0, Math.min(1, v / 100));
  const a = [223, 247, 230]; // #DFF7E6 mint
  const b = [255, 220, 228]; // #FFDCE4 rose
  const c = a.map((x, i) => Math.round(x + (b[i] - x) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// ─── Bubbles the bear (morphs with anger) ────────────────────────────────────
function Mascot({ anger }: { anger: number }) {
  let mouth: string, eyeL: string, eyeR: string, tears: number, blush: number;
  if (anger > 70) {
    mouth = "M85 155 q15 12 30 0"; tears = 1; blush = 0;
    eyeL = "M75 100 q0 -10 10 -10 q10 0 10 10";
    eyeR = "M105 100 q0 -10 10 -10 q10 0 10 10";
  } else if (anger > 40) {
    mouth = "M85 152 L115 152"; tears = 0; blush = 0;
    eyeL = "M75 98 q10 -6 20 0"; eyeR = "M105 98 q10 -6 20 0";
  } else if (anger > 15) {
    mouth = "M85 148 q15 8 30 0"; tears = 0; blush = 0.7;
    eyeL = "M75 98 q10 -6 20 0"; eyeR = "M105 98 q10 -6 20 0";
  } else {
    mouth = "M80 145 q20 22 40 0"; tears = 0; blush = 0.9;
    eyeL = "M75 100 q10 -14 20 0"; eyeR = "M105 100 q10 -14 20 0";
  }
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 sm:w-44 sm:h-44">
      <circle cx="55" cy="55" r="22" fill="#b57a5e" />
      <circle cx="55" cy="55" r="12" fill="#e6b393" />
      <circle cx="145" cy="55" r="22" fill="#b57a5e" />
      <circle cx="145" cy="55" r="12" fill="#e6b393" />
      <ellipse cx="100" cy="110" rx="70" ry="65" fill="#c98d6e" />
      <ellipse cx="100" cy="125" rx="42" ry="35" fill="#f2d3b8" />
      <circle cx="60" cy="130" r="9" fill="#ff7aa8" opacity={blush} style={{ transition: "opacity .3s" }} />
      <circle cx="140" cy="130" r="9" fill="#ff7aa8" opacity={blush} style={{ transition: "opacity .3s" }} />
      <path d={eyeL} stroke="#2b1b24" strokeWidth="4" fill="none" strokeLinecap="round" style={{ transition: "d .3s" }} />
      <path d={eyeR} stroke="#2b1b24" strokeWidth="4" fill="none" strokeLinecap="round" style={{ transition: "d .3s" }} />
      <g opacity={tears} style={{ transition: "opacity .3s" }}>
        <path d="M82 108 q-4 12 0 20 q4 -8 0 -20z" fill="#5ac8fa" />
        <path d="M118 108 q-4 12 0 20 q4 -8 0 -20z" fill="#5ac8fa" />
      </g>
      <ellipse cx="100" cy="128" rx="6" ry="4" fill="#2b1b24" />
      <path d={mouth} stroke="#2b1b24" strokeWidth="4" fill="none" strokeLinecap="round" style={{ transition: "d .3s" }} />
    </svg>
  );
}

export default function ApologyDashboard({ data, mode, shareId }: Props) {
  const [anger, setAnger] = useState(100);
  const [toasts, setToasts] = useState<LocalToast[]>([]);
  const [step, setStep] = useState(0);
  const [begun, setBegun] = useState(false); // gate: page 1 only advances via the hero button
  const [acceptedPromises, setAcceptedPromises] = useState<string[] | null>(null); // chosen in the Bribery step → carried into the forgiveness deed
  const idRef = useRef(0);

  const setMood = useCallback((v: number) => setAnger(Math.max(0, Math.min(100, Math.round(v)))), []);

  const toast = useCallback((msg: string, emoji = "💖") => {
    const id = ++idRef.current;
    setToasts((p) => [...p, { id, msg, emoji }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 2700);
  }, []);

  const hint = useMemo(() => HINTS.find((x) => anger <= x.max) ?? HINTS[HINTS.length - 1], [anger]);

  // the ordered set of steps (sorry-letter is optional)
  const stepKeys = useMemo(() => {
    const keys = ["hero", "anger", "scratch", "whack", "bribery"];
    if (data.sorryLetter?.trim()) keys.push("letter");
    keys.push("timeline", "final");
    return keys;
  }, [data.sorryLetter]);

  const total = stepKeys.length;
  const clamp = useCallback((n: number) => Math.max(0, Math.min(total - 1, n)), [total]);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const stepRef = useRef(0);
  const setActive = useCallback((i: number) => { stepRef.current = i; setStep(i); }, []);
  const scrollToIndex = useCallback((n: number) => {
    sectionRefs.current[clamp(n)]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [clamp]);
  const go = useCallback((d: number) => scrollToIndex(stepRef.current + d), [scrollToIndex]);
  const begin = useCallback(() => { setBegun(true); requestAnimationFrame(() => scrollToIndex(1)); }, [scrollToIndex]);

  // track which full-page section is in view → active dot
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) setActive(idx);
          }
        }
      },
      { threshold: [0.5, 0.8] }
    );
    sectionRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [stepKeys.length, setActive]);

  // keyboard navigation (arrows)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!begun) return; // page 1 is gated behind the hero button
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, begun]);

  const renderStep = (key: string) => {
    switch (key) {
      case "hero": return <Hero data={data} onBegin={begin} />;
      case "anger": return <AngerMeter anger={anger} setMood={setMood} hint={hint} />;
      case "scratch": return <ScratchCard data={data} mode={mode} toast={toast} />;
      case "whack": return <WhackGame data={data} setMood={setMood} anger={anger} toast={toast} />;
      case "bribery": return <BriberyDesk data={data} setMood={setMood} anger={anger} toast={toast} onLock={setAcceptedPromises} />;
      case "letter": return <SorryLetter letter={data.sorryLetter} voiceUrl={data.voiceUrl} senderName={data.senderName} recipientName={data.recipientName} />;
      case "timeline": return <Timeline data={data} />;
      case "final": return <FinalDecision data={data} mode={mode} shareId={shareId} setMood={setMood} toast={toast} acceptedPromises={acceptedPromises} />;
      default: return null;
    }
  };

  const atStart = step === 0;
  const atEnd = step === total - 1;

  return (
    <div
      className="apo-root"
      style={{ height: "100dvh", overflowY: begun ? "scroll" : "hidden", overflowX: "hidden", background: bgForAnger(anger), color: INK, fontFamily: BODY, transition: "background-color .8s ease", position: "relative", scrollSnapType: "y mandatory", scrollBehavior: "smooth", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
    >
      {/* keyframes / helpers */}
      <style>{`
        @keyframes apoToastIn { from{transform:translateY(-26px) scale(.92);opacity:0} to{transform:none;opacity:1} }
        @keyframes apoPop { 0%{transform:scale(0) translateY(20px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes apoShine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .apo-root::-webkit-scrollbar{ width:0;height:0;display:none }
        @keyframes apoBar { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }
        .apo-shine{ background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.7) 50%,transparent 70%);background-size:200% 100%;animation:apoShine 3s linear infinite;-webkit-background-clip:text;background-clip:text;color:transparent }
        .apo-mood{ -webkit-appearance:none;appearance:none;width:100%;height:14px;border-radius:9999px;background:linear-gradient(90deg,#8ee6a8,#ffe082,#ff8ba8,#e64072);outline:none }
        .apo-mood::-webkit-slider-thumb{ -webkit-appearance:none;width:32px;height:32px;border-radius:50%;background:#fff;border:4px solid ${ROSE_DEEP};cursor:pointer;box-shadow:0 6px 14px -4px rgba(230,64,114,.5) }
        .apo-mood::-moz-range-thumb{ width:32px;height:32px;border-radius:50%;background:#fff;border:4px solid ${ROSE_DEEP};cursor:pointer }
      `}</style>

      {/* dotted romantic background */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage:
            "radial-gradient(rgba(230,64,114,.16) 1.6px, transparent 1.7px), radial-gradient(rgba(255,138,168,.10) 1.6px, transparent 1.7px)",
          backgroundSize: "26px 26px, 26px 26px",
          backgroundPosition: "0 0, 13px 13px",
          maskImage: "radial-gradient(ellipse at 50% 40%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, #000 60%, transparent 100%)",
        }}
      />

      {/* fixed header — centered brand only, so editor Back/Create sit clear on the sides */}
      <div className="fixed top-0 left-0 right-0" style={{ zIndex: 40, background: "rgba(255,245,245,.6)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,214,226,.6)" }}>
        <Header />
      </div>

      {/* SubhSandesh brand — top-right on the shared page (birthday-gf style) */}
      {mode === "live" && (
        <Link
          href="/templates"
          aria-label="SubhSandesh"
          // The growth loop: a recipient clicking through to make their own.
          // Attributing this to the eventual signup depends on the GA4
          // cross-subdomain config — see docs/analytics/SOLUTIONS.md N1.
          onClick={() =>
            track(EVENTS.CREATE_CTA_CLICKED, {
              template: "apology-dashboard",
              source: "viewer_logo",
            })
          }
          style={{ position: "fixed", top: 12, right: 12, zIndex: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textDecoration: "none" }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 11, overflow: "hidden", background: "rgba(255,245,245,.9)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid #ffd6e2", display: "grid", placeItems: "center", boxShadow: "0 6px 18px -6px rgba(230,64,114,.45)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="SubhSandesh" width={30} height={30} style={{ objectFit: "contain" }} />
          </span>
          <span style={{ fontFamily: DISPLAY, fontSize: 8, fontWeight: 700, color: ROSE_DEEP, letterSpacing: ".04em", opacity: .85, lineHeight: 1 }}>SubhSandesh</span>
        </Link>
      )}

      {/* floating music button (bottom-right, extreme corner) */}
      <MusicFab url={data.backgroundMusic} toast={toast} />

      {/* desktop side arrows — only after the journey has begun */}
      {begun && (
        <>
          <button
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="Previous"
            className="hidden md:grid place-items-center fixed left-3 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full transition-all disabled:opacity-0 hover:scale-110"
            style={{ background: "#fff", color: ROSE_DEEP, border: "1px solid #ffd6e2", boxShadow: "0 10px 26px -12px rgba(230,64,114,.5)", zIndex: 45 }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="Next"
            className="hidden md:grid place-items-center fixed right-3 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full transition-all disabled:opacity-0 hover:scale-110"
            style={{ background: "#fff", color: ROSE_DEEP, border: "1px solid #ffd6e2", boxShadow: "0 10px 26px -12px rgba(230,64,114,.5)", zIndex: 45 }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* ─── full-page snap sections ─── */}
      {stepKeys.map((key, i) => (
        <section
          key={key}
          data-idx={i}
          ref={(el) => { sectionRefs.current[i] = el; }}
          className="flex items-center justify-center px-4 sm:px-6"
          style={{ minHeight: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always", paddingTop: 88, paddingBottom: 92, position: "relative", zIndex: 10 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.35 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-4xl"
          >
            {renderStep(key)}
          </motion.div>
        </section>
      ))}

      {/* toasts (top-center, newest at bottom of the stack) */}
      <div className="fixed left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-md" style={{ zIndex: 60, top: 84 }}>
        {toasts.slice(-3).map((t) => (
          <div key={t.id} className="bg-white/95 shadow-lg px-4 py-2 rounded-full font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ border: "1px solid #ffd6e2", color: ROSE_DEEP, animation: "apoToastIn .35s ease" }}>
            <span>{t.emoji}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
// centered brand — narrow, so the editor's Back (left) / Create (right) never collide
function Header() {
  return (
    <div className="pt-3.5 pb-2 flex flex-col items-center text-center leading-tight" style={{ zIndex: 10 }}>
      <div className="font-semibold text-base sm:text-lg" style={{ fontFamily: DISPLAY, color: INK }}>To My Love</div>
      <div className="text-[10px] sm:text-[11px]" style={{ color: "rgba(255,95,138,.85)" }}>an apology, wrapped in hearts</div>
    </div>
  );
}

// floating bottom-right music button — plays the chosen song (loop) or the built-in
// lofi tune; auto-starts on the first tap of the shared page (autoplay-policy safe).
function MusicFab({ url, toast }: { url: string; toast: (m: string, e?: string) => void }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lofiRef = useRef(false);
  const startedRef = useRef(false);

  const playChord = (freqs: number[], when: number, dur: number) => {
    const ctx = ctxRef.current!, master = gainRef.current!;
    freqs.forEach((f) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(0.09, when + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g).connect(master);
      o.start(when); o.stop(when + dur + 0.05);
    });
  };
  const startLofi = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.5; master.connect(ctx.destination);
      ctxRef.current = ctx; gainRef.current = master;
    }
    ctxRef.current!.resume().catch(() => {});
    lofiRef.current = true;
    let i = 0;
    const step = () => { if (!lofiRef.current) return; playChord(CHORDS[i % CHORDS.length], ctxRef.current!.currentTime, 2.2); i++; timerRef.current = setTimeout(step, 2200); };
    step();
  };
  const stopLofi = () => { lofiRef.current = false; if (timerRef.current) clearTimeout(timerRef.current); };

  const startMp3 = () => {
    let a = audioRef.current;
    if (!a) { a = new Audio(url); a.loop = true; a.volume = 0.5; audioRef.current = a; }
    a.play().catch(() => {});
  };

  const start = useCallback(() => {
    if (url) startMp3(); else startLofi();
    setPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  const stop = useCallback(() => { if (url) audioRef.current?.pause(); else stopLofi(); setPlaying(false); }, [url]);
  const toggle = () => { if (playing) stop(); else { start(); toast("Music on 🎶", "🎵"); } };

  // Duck the background song while a voice note is being recorded / played, or a
  // song is being previewed in the editor — resume only what we auto-paused.
  const duckedRef = useRef(false);
  useEffect(() => {
    const onPause = () => { if (playing) { duckedRef.current = true; stop(); } };
    const onResume = () => { if (duckedRef.current) { duckedRef.current = false; start(); } };
    window.addEventListener(MUSIC_PAUSE_EVENT, onPause);
    window.addEventListener(MUSIC_RESUME_EVENT, onResume);
    return () => {
      window.removeEventListener(MUSIC_PAUSE_EVENT, onPause);
      window.removeEventListener(MUSIC_RESUME_EVENT, onResume);
    };
  }, [playing, start, stop]);

  // kick off on the first user gesture (browsers block silent autoplay) — both the
  // editor preview and the shared page, so the default song plays right away.
  useEffect(() => {
    const once = () => { if (!startedRef.current) { startedRef.current = true; start(); } };
    window.addEventListener("pointerdown", once, { once: true });
    return () => window.removeEventListener("pointerdown", once);
  }, [start]);

  useEffect(() => () => { audioRef.current?.pause(); if (timerRef.current) clearTimeout(timerRef.current); ctxRef.current?.close().catch(() => {}); }, []);

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Pause music" : "Play music"}
      className="fixed grid place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
      style={{ right: 14, bottom: "max(14px, env(safe-area-inset-bottom))", width: 46, height: 46, zIndex: 48, background: playing ? "linear-gradient(135deg,#ff7aa8,#e64072)" : "#fff", color: playing ? "#fff" : ROSE_DEEP, border: "1px solid #ffd6e2", boxShadow: "0 12px 28px -10px rgba(230,64,114,.55)" }}
    >
      {playing ? <Pause size={18} /> : <Music size={18} />}
    </button>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero({ data, onBegin }: { data: ApologyData; onBegin?: () => void }) {
  return (
    <section className="mx-auto px-4 sm:px-6 relative text-center" style={{ zIndex: 10 }}>
      {data.senderPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.senderPhoto} alt={data.senderName} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg" style={{ border: "3px solid #fff" }} />
      ) : null}
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold text-sm" style={{ background: "#fff0f4", color: ROSE_DEEP, border: "1px solid #ffd6e2" }}>
        <Sparkles size={14} /> a tiny apology dashboard
      </span>
      <h1 className="text-4xl sm:text-6xl font-bold mt-4 leading-tight" style={{ fontFamily: DISPLAY }}>
        {data.headline || "I'm really, really sorry 🥺"}
      </h1>
      <p className="max-w-xl mx-auto mt-3 text-base sm:text-lg" style={{ color: "rgba(58,34,51,.7)" }}>
        {data.subMessage}
      </p>
      {data.recipientName ? (
        <p className="mt-2 font-semibold" style={{ color: ROSE_DEEP, fontFamily: DISPLAY }}>
          For {data.recipientName} 💗
        </p>
      ) : null}
      {onBegin ? (
        <button
          onClick={onBegin}
          className="mt-7 inline-flex items-center gap-2 text-white font-semibold transition-transform hover:scale-105"
          style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)", borderRadius: 9999, padding: "14px 30px", boxShadow: "0 14px 34px -12px rgba(230,64,114,.6)" }}
        >
          <Heart size={17} fill="#fff" /> Take my hand, let&apos;s begin
        </button>
      ) : null}
    </section>
  );
}

// ─── card shell ──────────────────────────────────────────────────────────────
const cardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  boxShadow: "0 20px 50px -20px rgba(230,64,114,.25), 0 4px 10px -4px rgba(0,0,0,.05)",
  border: "1px solid #ffe4ea",
};

// ─── Anger meter ─────────────────────────────────────────────────────────────
function AngerMeter({ anger, setMood, hint }: { anger: number; setMood: (v: number) => void; hint: { chip: string; txt: string } }) {
  return (
    <section className="p-7 sm:p-10 lg:p-14 relative overflow-hidden" style={cardStyle}>
      {/* soft cute accents */}
      <span aria-hidden className="absolute text-2xl select-none" style={{ top: 16, right: 22, opacity: 0.5 }}>🌸</span>
      <span aria-hidden className="absolute text-xl select-none" style={{ bottom: 18, left: 22, opacity: 0.4 }}>💗</span>

      <div className="flex flex-col sm:flex-row items-center gap-7 lg:gap-10">
        <div
          className="w-44 h-44 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-full grid place-items-center shrink-0"
          style={{ background: "linear-gradient(135deg,#fce7f3,#fecdd3)", boxShadow: "inset 0 4px 12px rgba(0,0,0,.06), 0 18px 40px -18px rgba(230,64,114,.5)" }}
        >
          <div style={{ transform: "scale(1.15)" }}><Mascot anger={anger} /></div>
        </div>
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="text-2xl lg:text-3xl font-semibold flex items-center gap-2" style={{ fontFamily: DISPLAY }}>
              Anger-o-Meter <Heart size={18} fill={ROSE} color={ROSE} />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: "#fff0f4", color: ROSE_DEEP, border: "1px solid #ffd6e2" }}>
              <Flame size={14} /> {hint.chip}
            </div>
          </div>
          <div className="mb-3.5" style={{ height: 26, borderRadius: 9999, background: "#ffe4ea", overflow: "hidden", boxShadow: "inset 0 2px 5px rgba(230,64,114,.12)" }}>
            <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg,#8ee6a8,#ffe082,#ff5f8a,#e64072)", clipPath: `inset(0 0 0 ${100 - anger}%)`, transition: "clip-path .3s ease" }} />
          </div>
          <input className="apo-mood" type="range" min={0} max={100} value={anger} onChange={(e) => setMood(+e.target.value)} />
          <div className="flex justify-between text-xs sm:text-sm mt-2.5 font-medium" style={{ color: "rgba(58,34,51,.6)" }}>
            <span>💚 Perfect love</span>
            <span>❤️‍🔥 Fuming</span>
          </div>
          <p className="mt-5 italic text-base lg:text-lg leading-relaxed" style={{ color: "rgba(58,34,51,.72)" }}>{hint.txt}</p>
        </div>
      </div>
    </section>
  );
}

// ─── Scratch card ────────────────────────────────────────────────────────────
// compact rose voice player (equalizer + scrub), used in the scratch reveal
function VoicePlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const [dur, setDur] = useState(0);
  const [cur, setCur] = useState(0);
  const aRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    aRef.current = a;
    const onMeta = () => setDur(a.duration || 0);
    const onEnd = () => { setPlaying(false); setCur(0); };
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.src = src;
    return () => {
      a.pause(); a.src = "";
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src]);

  const tick = useCallback(() => {
    const a = aRef.current; if (!a) return;
    setCur(a.currentTime);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const toggle = () => {
    const a = aRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); if (rafRef.current) cancelAnimationFrame(rafRef.current); }
    else { a.play().catch(() => {}); setPlaying(true); rafRef.current = requestAnimationFrame(tick); }
  };

  const pct = dur > 0 ? Math.min(cur / dur, 1) : 0;
  const fmt = (s: number) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3 w-full max-w-xs mx-auto px-3 py-2.5 rounded-2xl" style={{ background: "#fff", border: "1px solid #ffd6e2", boxShadow: "0 6px 18px -10px rgba(230,64,114,.4)" }}>
      <button onClick={toggle} className="grid place-items-center rounded-full shrink-0 text-white" style={{ width: 38, height: 38, background: "linear-gradient(135deg,#ff7aa8,#e64072)" }} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause size={16} /> : <Play size={16} fill="#fff" />}
      </button>
      <div className="flex items-end gap-[3px] h-5 shrink-0">
        {[0.5, 0.85, 0.6, 1, 0.7, 0.45, 0.8].map((h, i) => (
          <span key={i} style={{ width: 3, height: `${h * 20}px`, borderRadius: 3, background: ROSE, transformOrigin: "bottom", opacity: playing ? 0.9 : 0.35, animation: playing ? `apoBar ${0.6 + i * 0.07}s ease-in-out infinite ${i * 0.06}s` : "none", transition: "opacity .3s" }} />
        ))}
      </div>
      <div className="flex-1">
        <div style={{ height: 5, borderRadius: 999, background: "#ffe0e9", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct * 100}%`, background: "linear-gradient(90deg,#ff7aa8,#e64072)", borderRadius: 999 }} />
        </div>
        <div className="flex justify-between mt-1 text-[10px] font-medium" style={{ color: "rgba(58,34,51,.5)" }}>
          <span>🎤 voice note</span>
          <span>{dur ? fmt(dur) : "0:00"}</span>
        </div>
      </div>
    </div>
  );
}

function ScratchCard({ data, mode, toast }: { data: ApologyData; mode: "preview" | "live"; toast: (m: string, e?: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [fading, setFading] = useState(false);
  const [scratchPct, setScratchPct] = useState(0);
  const drawing = useRef(false);
  const revealedRef = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const lastCheck = useRef(0);
  const checkRaf = useRef<number | null>(null);

  const secret = data.scratchSecret;
  const images = data.scratchImages ?? [];
  const voice = data.scratchVoice;
  // the scratch experience shows in BOTH preview and live — the sender can scratch to
  // test it and verify their photo / note / voice, and can "Scratch again" to re-cover.
  const showReveal = revealed;

  const init = useCallback(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // DPR-scaled backing store → crisp foil on retina (birthday-gf style)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = "source-over";
    // rose scratch-foil (matches the apology theme)
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, "#ff9db8");
    g.addColorStop(0.3, "#ffc7d8");
    g.addColorStop(0.5, "#ff7fa6");
    g.addColorStop(0.7, "#ffdce7");
    g.addColorStop(1, "#ff9db8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
    // glitter speckles (foil shimmer)
    ctx.fillStyle = "rgba(255,255,255,0.20)";
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * rect.width, y = Math.random() * rect.height, r = 1 + Math.random() * 2.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // label (white foil ink with a soft rose glow for legibility)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(230,64,114,0.35)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 20px 'Fredoka', system-ui, sans-serif";
    ctx.fillText("✦ Scratch to reveal ✦", rect.width / 2, rect.height / 2 - 10);
    ctx.font = "14px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.fillText("use your finger or mouse 💗", rect.width / 2, rect.height / 2 + 16);
    ctx.shadowBlur = 0;
    // switch to erase mode for scratching
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 48;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    rectRef.current = rect;
  }, []);

  // (re)paint the foil whenever the card is covered — on mount and after "Scratch again"
  useEffect(() => {
    if (revealed) return;
    const raf = requestAnimationFrame(init);
    const onResize = () => { if (!revealedRef.current) init(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [init, revealed]);

  const recover = () => { revealedRef.current = false; last.current = null; lastCheck.current = 0; setScratchPct(0); setFading(false); setRevealed(false); };

  // Smooth full reveal once ~50% is scratched: stop input, dissolve the remaining
  // foil (fade + slight zoom) while the content pops in, with a gentle heart burst.
  const doReveal = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    drawing.current = false;
    if (checkRaf.current != null) { cancelAnimationFrame(checkRaf.current); checkRaf.current = null; }
    setFading(true); // triggers the foil fade + content pop
    try {
      confetti({
        particleCount: 44,
        spread: 62,
        startVelocity: 30,
        scalar: 0.9,
        ticks: 120,
        origin: { y: 0.5 },
        colors: ["#ff5f8a", "#ffd6e2", "#ffb3c8", "#e64072", "#fff"],
      });
    } catch {}
    toast("You found it. I meant every word. 💗", "💌");
    window.setTimeout(() => setRevealed(true), 560); // unmount foil after the fade
  };

  // reveal check — kept OFF the paint hot path: at most ~5×/sec, in a rAF so it
  // never blocks a stroke frame. Coarse pixel sampling keeps getImageData cheap.
  const check = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || revealedRef.current) return;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < img.length; i += 800) { total++; if (img[i] === 0) clear++; }
    const pct = total ? clear / total : 0;
    setScratchPct(pct);
    if (pct >= 0.45) doReveal();
  };

  const scheduleCheck = (now: number) => {
    if (revealedRef.current || checkRaf.current != null) return;
    if (now - lastCheck.current < 200) return;
    lastCheck.current = now;
    checkRaf.current = requestAnimationFrame(() => { checkRaf.current = null; check(); });
  };

  const drawTo = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
    }
    last.current = { x, y };
  };

  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const rect = rectRef.current;
    if (!rect) return;
    const native = e.nativeEvent as PointerEvent;
    // paint EVERY intermediate point the browser captured → silky trail even on fast swipes
    const pts = native.getCoalescedEvents ? native.getCoalescedEvents() : [native];
    for (const p of pts) drawTo(p.clientX - rect.left, p.clientY - rect.top);
    scheduleCheck(native.timeStamp || performance.now());
  };

  const beginStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    last.current = null;
    const c = canvasRef.current;
    if (c) { rectRef.current = c.getBoundingClientRect(); c.setPointerCapture(e.pointerId); }
    paint(e);
  };

  const endStroke = () => {
    drawing.current = false;
    last.current = null;
    if (checkRaf.current != null) { cancelAnimationFrame(checkRaf.current); checkRaf.current = null; }
    check();
  };

  return (
    <section className="p-6 sm:p-8 relative overflow-hidden" style={cardStyle}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="text-xl lg:text-2xl font-semibold" style={{ fontFamily: DISPLAY }}>A tiny secret 🤫</div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold" style={{ background: "#fff0f4", color: ROSE_DEEP, border: "1px solid #ffd6e2" }}>
          <Sparkles size={13} /> {showReveal ? "revealed" : "scratch me"}
        </span>
      </div>

      <div ref={wrapRef} className="relative overflow-hidden" style={{ borderRadius: 24, background: "linear-gradient(135deg,#fff0f3,#ffe0ea)", minHeight: 300 }}>
        {/* reveal content — blurred as a teaser under the foil, sharpens on reveal */}
        <div
          className="relative flex flex-col items-center justify-center gap-4 px-5 py-7 text-center"
          style={{
            minHeight: 300,
            transition: "transform .55s cubic-bezier(.2,1.4,.4,1), filter .5s ease",
            transform: fading || revealed ? "scale(1)" : "scale(.96)",
            filter: fading || revealed ? "none" : "blur(5px)",
          }}
        >
          {images.length > 0 && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {images.slice(0, 4).map((src, i) => (
                <div key={i} className="bg-white p-2 pb-3 rounded-xl shadow-md" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (2 + (i % 3))}deg)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="rounded-lg object-cover" style={{ width: images.length === 1 ? 190 : 128, height: images.length === 1 ? 150 : 128 }} />
                </div>
              ))}
            </div>
          )}
          {!images.length && <div className="text-4xl">💌</div>}
          <p className="text-lg sm:text-xl leading-snug max-w-md" style={{ fontFamily: DISPLAY, color: INK }}>
            {secret || "Even when I mess up, my favorite place is right next to you. 💗"}
          </p>
          {voice ? <VoicePlayer src={voice} /> : null}
        </div>

        {/* scratch overlay — shown until revealed, in both preview & live */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            onPointerDown={beginStroke}
            onPointerMove={paint}
            onPointerUp={endStroke}
            onPointerLeave={endStroke}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              touchAction: "none", cursor: "grab",
              opacity: fading ? 0 : 1,
              transform: fading ? "scale(1.05)" : "none",
              transition: "opacity .5s ease, transform .5s ease",
              pointerEvents: fading ? "none" : "auto",
            }}
          />
        )}

        {/* live scratch progress pill */}
        {!revealed && !fading && scratchPct > 0.05 && (
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ bottom: 12, zIndex: 3 }}>
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(230,64,114,.8)", color: "#fff", backdropFilter: "blur(6px)" }}>
              {Math.round(Math.min(scratchPct / 0.45, 1) * 100)}% revealed
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-3 min-h-[24px]">
        {revealed ? (
          <button onClick={recover} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-transform hover:scale-105" style={{ background: "#fff0f4", color: ROSE_DEEP, border: "1px solid #ffd6e2" }}>
            <RotateCw size={13} /> Scratch again
          </button>
        ) : mode === "preview" ? (
          <p className="text-center text-xs" style={{ color: "rgba(58,34,51,.5)" }}>
            Preview — scratch it yourself to see what your recipient will unwrap.
          </p>
        ) : null}
      </div>
    </section>
  );
}

// ─── Whack game ──────────────────────────────────────────────────────────────
function WhackGame({ data, setMood, anger, toast }: { data: ApologyData; setMood: (v: number) => void; anger: number; toast: (m: string, e?: string) => void }) {
  // whacked = the one apologizing (opposite of the recipient's relationship)
  const whackTarget = data.relationship === "boyfriend" ? "Girlfriend" : data.relationship === "partner" ? "Sweetheart" : "Boyfriend";
  const usePhotos = data.whackFaces.length > 0;
  const [moles, setMoles] = useState<Mole[]>(() => Array.from({ length: 9 }, () => ({ up: false, face: 0 })));
  const [score, setScore] = useState(0);
  const [bursts, setBursts] = useState<{ id: number; cell: number }[]>([]);
  const molesRef = useRef<Mole[]>(moles);
  const scoreRef = useRef(0);
  const overRef = useRef(false);
  const angerRef = useRef(anger);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const burstId = useRef(0);
  useEffect(() => { angerRef.current = anger; }, [anger]);

  const commitMoles = (next: Mole[]) => { molesRef.current = next; setMoles(next); };

  // preload the "dishoom" sound once
  useEffect(() => {
    const a = new Audio(DISHOOM_SFX);
    a.preload = "auto";
    a.volume = 0.75;
    sfxRef.current = a;
    return () => { a.pause(); sfxRef.current = null; };
  }, []);

  const playDishoom = () => {
    const base = sfxRef.current;
    if (!base) return;
    // clone so rapid whacks overlap ("dishoom-dishoom") instead of cutting off
    const clip = base.cloneNode() as HTMLAudioElement;
    clip.volume = 0.75;
    clip.play().catch(() => {});
  };

  useEffect(() => {
    const iv = setInterval(() => {
      if (overRef.current) return;
      const idx = Math.floor(Math.random() * 9);
      const face = Math.floor(Math.random() * (usePhotos ? data.whackFaces.length : EMOJI_FACES.length));
      commitMoles(molesRef.current.map((m, i) => (i === idx ? { up: true, face } : m)));
      setTimeout(() => commitMoles(molesRef.current.map((m, i) => (i === idx ? { ...m, up: false } : m))), 900);
    }, 1100);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePhotos, data.whackFaces.length]);

  // Side effects live OUTSIDE any state updater — updaters must be pure, and React
  // strict mode double-invokes them, which was counting every hit twice (+2).
  const hit = (i: number) => {
    if (overRef.current || !molesRef.current[i]?.up) return;
    commitMoles(molesRef.current.map((m, idx) => (idx === i ? { ...m, up: false } : m))); // down now → no double hit
    playDishoom();
    const id = ++burstId.current;
    setBursts((b) => [...b, { id, cell: i }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 650);
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setMood(angerRef.current - 10);
    toast(HIT_MSGS[Math.floor(Math.random() * HIT_MSGS.length)], HIT_EMOJI[Math.floor(Math.random() * HIT_EMOJI.length)]);
    if (scoreRef.current >= 10) { overRef.current = true; toast("Okay okay — you win. I'm truly sorry. 💗", "🏆"); }
  };

  const reset = () => { scoreRef.current = 0; setScore(0); overRef.current = false; toast("Round two — let it all out on me. 🔨", "💗"); };

  return (
    <section className="p-6 sm:p-8 relative overflow-hidden" style={cardStyle}>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="text-xl lg:text-2xl font-semibold" style={{ fontFamily: DISPLAY }}>Whack-a-{whackTarget} 🔨</div>
          <div className="text-sm" style={{ color: "rgba(58,34,51,.6)" }}>Every hit takes 10% off the anger meter — with a satisfying <b style={{ color: ROSE_DEEP }}>dishoom!</b> 💥</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold" style={{ background: "#fff0f4", color: ROSE_DEEP, border: "1px solid #ffd6e2" }}>
            <Trophy size={13} /> Hits: {score}/10
          </span>
          <button onClick={reset} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-transform hover:scale-105" style={{ background: "#fff0f4", color: ROSE_DEEP, border: "1px solid #ffd6e2" }}>
            <RotateCw size={13} /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mx-auto" style={{ maxWidth: 380 }}>
        {moles.map((m, i) => {
          const bursting = bursts.some((b) => b.cell === i);
          return (
            <div key={i} className="relative" style={{ aspectRatio: "1/1" }}>
              {/* clip container = the little burrow tile */}
              <div className="absolute inset-0" style={{ overflow: "hidden", borderRadius: 20, background: "#fff5f8", boxShadow: "inset 0 1px 3px rgba(230,64,114,.08)" }}>
                {/* dark burrow recess */}
                <div className="absolute inset-x-[7%] bottom-[2%]" style={{ height: "80%", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 30%, #a85c78 0%, #6d3850 60%, #522639 100%)", boxShadow: "inset 0 10px 18px rgba(0,0,0,.3)" }} />
                {/* the mole / face rising out */}
                <button
                  onClick={() => hit(i)}
                  aria-label="whack"
                  className="absolute left-0 right-0 flex items-end justify-center"
                  style={{ bottom: m.up ? "24%" : "-18%", height: "72%", transition: "bottom .17s cubic-bezier(.2,1.5,.4,1)", cursor: m.up ? "pointer" : "default", zIndex: 1 }}
                >
                  {usePhotos ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.whackFaces[m.face]} alt="" className="rounded-full object-cover" style={{ width: "62%", aspectRatio: "1/1", border: "3px solid #fff", boxShadow: "0 5px 12px rgba(82,38,57,.35)", pointerEvents: "none" }} />
                  ) : (
                    <span style={{ fontSize: "clamp(30px,9vw,50px)", pointerEvents: "none", filter: "drop-shadow(0 4px 6px rgba(82,38,57,.3))" }}>{EMOJI_FACES[m.face]}</span>
                  )}
                </button>
                {/* front mound (dirt lip) — face emerges from behind it */}
                <div className="absolute inset-x-0 bottom-0" style={{ height: "40%", borderRadius: "48% 48% 40% 40% / 78% 78% 22% 22%", background: "linear-gradient(180deg,#ffc7d8 0%,#ff9fb9 58%,#f987a6 100%)", boxShadow: "inset 0 3px 5px rgba(255,255,255,.6), 0 4px 10px -4px rgba(230,64,114,.5)", zIndex: 2 }} />
                <span aria-hidden style={{ position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)", zIndex: 3, fontSize: 12, opacity: 0.9 }}>🌸</span>
              </div>
              {/* DISHOOM! burst (not clipped) */}
              {bursting && (
                <span
                  className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap"
                  style={{ zIndex: 6, fontFamily: DISPLAY, color: "#e64072", fontSize: "clamp(15px,4.5vw,22px)", textShadow: "0 2px 0 #fff, 0 0 10px rgba(255,255,255,.8)", animation: "apoPop .32s cubic-bezier(.2,1.6,.4,1)", pointerEvents: "none" }}
                >
                  💥 DISHOOM!
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Bribery desk ────────────────────────────────────────────────────────────
function BriberyDesk({ data, setMood, anger, toast, onLock }: { data: ApologyData; setMood: (v: number) => void; anger: number; toast: (m: string, e?: string) => void; onLock?: (promises: string[]) => void }) {
  const [checked, setChecked] = useState<boolean[]>(() => data.briberyItems.map(() => false));
  const [agreement, setAgreement] = useState<string[] | null>(null);
  const angerRef = useRef(anger);
  useEffect(() => { angerRef.current = anger; }, [anger]);

  const toggle = (i: number) => setChecked((p) => p.map((c, idx) => (idx === i ? !c : c)));

  const lock = () => {
    const picks = data.briberyItems.filter((_, i) => checked[i]);
    if (!picks.length) { toast("Pick at least one, I insist! 🥺", "📝"); return; }
    setMood(angerRef.current - 30);
    toast("Sealed & stamped — legally binding in my heart 💌", "✅");
    const labels = picks.map((p) => `${p.icon} ${p.label}`);
    setAgreement(labels);
    onLock?.(labels); // carry the chosen promises into the forgiveness deed
  };

  return (
    <section className="p-6 sm:p-10" style={FULL_CARD}>
      <span aria-hidden className="absolute select-none" style={{ top: 18, right: 24, fontSize: 24, opacity: 0.4 }}>🎁</span>
      <div className="w-full max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }}>
          <div className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: DISPLAY, color: INK }}>Sweet Bribery Desk 🎁</div>
          <div className="text-sm sm:text-base mt-1 mb-5" style={{ color: "rgba(58,34,51,.6)" }}>Tick the promises — then make them official.</div>
        </motion.div>
        <motion.div variants={STAGGER_PARENT} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.2 }} className="space-y-2.5">
          {data.briberyItems.map((b, i) => {
            const on = checked[i] ?? false;
            return (
              <motion.label
                key={i}
                variants={STAGGER_CHILD}
                className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-colors"
                style={{ border: `1.5px solid ${on ? ROSE : "#fce7f0"}`, background: on ? "#fff0f4" : "#fff" }}
              >
                <input type="checkbox" checked={on} onChange={() => toggle(i)} className="w-5 h-5" style={{ accentColor: ROSE }} />
                <span className="text-xl">{b.icon}</span>
                <span className="flex-1 font-medium text-sm sm:text-base">{b.label}</span>
              </motion.label>
            );
          })}
        </motion.div>
        <motion.button
          onClick={lock}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-5 inline-flex items-center justify-center gap-2 text-white font-semibold"
          style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)", borderRadius: 9999, padding: "14px 28px", boxShadow: "0 12px 30px -10px rgba(230,64,114,.6)" }}
        >
          <Lock size={16} /> Lock it in (-30% anger)
        </motion.button>
      </div>

      <AnimatePresence>
        {agreement && (
          <BriberyAgreementModal data={data} promises={agreement} onClose={() => setAgreement(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Bribery agreement — cute ₹100 stamp-paper "official order" ────────────────
function BriberyAgreementModal({ data, promises, onClose }: { data: ApologyData; promises: string[]; onClose: () => void }) {
  const sender = data.senderName || "The Apologiser";
  const recipient = data.recipientName || "The Beloved";
  const token = useMemo(() => "IN-" + Math.random().toString(36).slice(2, 8).toUpperCase(), []);
  const [downloading, setDownloading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  const downloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    setCapturing(true); // hide the close/action buttons + expand the paper for a clean snapshot
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    try {
      if (paperRef.current) {
        const { downloadAgreementPdf } = await import("./briberyAgreementPdf");
        await downloadAgreementPdf(paperRef.current, token);
      }
    } catch {
      /* retry-able */
    } finally {
      setCapturing(false);
      setDownloading(false);
    }
  };
  const thumb: CSSProperties = {
    width: 46, height: 58, borderRadius: "46% 46% 48% 48%",
    background: "repeating-radial-gradient(circle at 50% 45%, #b83a5e 0 1.1px, transparent 1.1px 3px)",
    opacity: 0.6, margin: "0 auto",
  };

  return (
    <motion.div
      className="fixed flex items-center justify-center p-3 sm:p-5"
      style={{ top: 58, bottom: 12, left: 0, right: 0, background: "rgba(70,16,32,.62)", zIndex: 60 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={paperRef}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.82, rotate: -2, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="relative w-full max-w-lg"
        style={{
          maxHeight: capturing ? "none" : "100%", overflowY: capturing ? "visible" : "auto",
          background: "#fbf7ec",
          backgroundImage: "repeating-linear-gradient(0deg, rgba(120,80,40,0.035) 0 1px, transparent 1px 26px)",
          borderRadius: 10,
          boxShadow: "0 30px 70px -20px rgba(60,20,30,.6)",
          padding: 0,
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "#4a2b1c",
        }}
      >
        {/* sticky close — stays reachable while the tall deed scrolls on phone */}
        {!capturing && (
          <div style={{ position: "sticky", top: 0, height: 0, zIndex: 20 }}>
            <button onClick={onClose} className="absolute w-8 h-8 rounded-full grid place-items-center" style={{ top: 12, right: 12, color: "#9c7b4a", background: "rgba(156,123,74,.16)", backdropFilter: "blur(4px)" }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ornate stamp-paper border — normal flow so it wraps the FULL content
            (fixes the bottom border overflow on phones) */}
        <div style={{ position: "relative", margin: 8, border: "2px solid #9c7b4a", borderRadius: 6 }}>
        <div style={{ position: "relative", margin: 5, border: "1px solid #b89a63", borderRadius: 4, overflow: "hidden" }}>

        {/* watermark heart */}
        <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", fontSize: 220, opacity: 0.05 }}>❤</div>

        <div className="relative px-5 sm:px-8 py-7">
          {/* header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#8a6b3f", fontWeight: 700 }}>GOVERNMENT OF LOVE</div>
              <div style={{ fontSize: 10, letterSpacing: 1, color: "#8a6b3f" }}>NON-JUDICIAL LOVE STAMP</div>
            </div>
            {/* ₹100 revenue stamp */}
            <div style={{ border: "1.5px solid #b04a5e", borderRadius: 4, padding: "4px 8px", textAlign: "center", color: "#b04a5e", transform: "rotate(3deg)", background: "rgba(176,74,94,.05)" }}>
              <div style={{ fontSize: 8, letterSpacing: 1 }}>LOVE STAMP</div>
              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>₹100</div>
              <div style={{ fontSize: 7 }}>AGREEMENT • ∞</div>
            </div>
          </div>

          <div className="text-center mt-4">
            <div style={{ fontFamily: DISPLAY, fontSize: "clamp(22px,5vw,30px)", fontWeight: 700, color: "#5a2f1e" }}>Certificate of Forgiveness</div>
            <div style={{ fontSize: 12, fontStyle: "italic", color: "#8a6b3f" }}>A solemn, adorable pledge</div>
            <div style={{ height: 2, width: 120, background: "linear-gradient(90deg,transparent,#b89a63,transparent)", margin: "10px auto 0" }} />
          </div>

          {/* body */}
          <p className="mt-5 text-sm sm:text-[15px] leading-relaxed">
            This agreement is executed with full sincerity between <b style={{ color: "#b04a5e" }}>{sender}</b> (hereinafter <i>“the Apologiser”</i>) and <b style={{ color: "#b04a5e" }}>{recipient}</b> (hereinafter <i>“the Beloved &amp; Honourable”</i>), who hereby lovingly binds the Apologiser to the following:
          </p>

          <ol className="mt-4 space-y-2.5">
            {promises.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex gap-2 text-sm sm:text-[15px]"
              >
                <span style={{ fontWeight: 700, color: "#b04a5e" }}>{i + 1}.</span>
                <span><b>WHEREAS</b> the Apologiser shall provide — {p}.</span>
              </motion.li>
            ))}
          </ol>

          <p className="mt-4 text-xs sm:text-sm" style={{ color: "#7a5a3a" }}>
            Executed on this fine day, valid for eternity ∞. Breach of clauses punishable by extra cuddles. Jurisdiction: matters of the heart. Ref&nbsp;No.&nbsp;{token}
          </p>

          {/* seal + thumbs row */}
          <div className="mt-6 grid grid-cols-3 gap-3 items-end">
            {/* apologiser thumb */}
            <div className="text-center">
              <div style={thumb} />
              <div style={{ borderTop: "1px solid #9c7b4a", marginTop: 6, paddingTop: 3, fontSize: 11 }}>{sender}</div>
              <div style={{ fontSize: 9, color: "#8a6b3f" }}>Apologiser (thumb)</div>
            </div>

            {/* romantic wax seal — stamps in */}
            <div className="grid place-items-center">
              <motion.div
                initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: -12 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 12 }}
                style={{
                  width: 92, height: 92, borderRadius: "50%",
                  display: "grid", placeItems: "center", textAlign: "center",
                  color: "#fff", background: "radial-gradient(circle at 35% 30%, #ff7aa8, #c11e46)",
                  border: "3px dashed rgba(255,255,255,.6)",
                  boxShadow: "0 6px 16px -4px rgba(193,30,70,.6), inset 0 0 0 6px rgba(255,255,255,.12)",
                }}
              >
                <div>
                  <div style={{ fontSize: 22, lineHeight: 1 }}>💖</div>
                  <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1, marginTop: 2 }}>SEALED WITH<br />LOVE • ∞</div>
                </div>
              </motion.div>
            </div>

            {/* beloved thumb */}
            <div className="text-center">
              <div style={thumb} />
              <div style={{ borderTop: "1px solid #9c7b4a", marginTop: 6, paddingTop: 3, fontSize: 11 }}>{recipient}</div>
              <div style={{ fontSize: 9, color: "#8a6b3f" }}>Beloved (thumb)</div>
            </div>
          </div>

          {!capturing && (
            <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="flex-1 inline-flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
                style={{ background: "#fff", color: "#b04a5e", border: "1.5px solid #d99", borderRadius: 9999, padding: "12px 20px", fontFamily: DISPLAY }}
              >
                <Download size={16} /> {downloading ? "Preparing…" : "Download PDF"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold"
                style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)", borderRadius: 9999, padding: "12px 20px", fontFamily: DISPLAY, boxShadow: "0 12px 30px -12px rgba(230,64,114,.6)" }}
              >
                <Check size={16} /> Accepted with all my heart
              </button>
            </div>
          )}
        </div>
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sorry letter + voice (immersive, animated) ──────────────────────────────
function SorryLetter({ letter, voiceUrl, senderName, recipientName }: { letter: string; voiceUrl: string; senderName: string; recipientName: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play().catch(() => {});
  };
  return (
    <section className="p-8 sm:p-12" style={FULL_CARD}>
      {/* soft decorative flourishes to fill negative space */}
      <span aria-hidden className="absolute select-none" style={{ top: 20, right: 26, fontSize: 30, opacity: 0.5 }}>💌</span>
      <span aria-hidden className="absolute select-none" style={{ bottom: 22, left: 26, fontSize: 22, opacity: 0.35 }}>🌸</span>
      <span aria-hidden className="absolute select-none" style={{ bottom: 60, right: 40, fontSize: 18, opacity: 0.3 }}>💗</span>

      <motion.div
        variants={STAGGER_PARENT}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        className="w-full max-w-2xl mx-auto text-center flex flex-col items-center gap-5"
      >
        <motion.div variants={STAGGER_CHILD} className="text-5xl sm:text-6xl">💌</motion.div>
        <motion.h2 variants={STAGGER_CHILD} className="text-2xl sm:text-4xl font-bold leading-tight" style={{ fontFamily: DISPLAY, color: INK }}>
          From the bottom of my heart
        </motion.h2>
        {recipientName ? (
          <motion.div variants={STAGGER_CHILD} className="text-sm font-semibold" style={{ color: ROSE_DEEP, fontFamily: DISPLAY }}>
            Dear {recipientName},
          </motion.div>
        ) : null}
        <motion.p variants={STAGGER_CHILD} className="leading-relaxed whitespace-pre-line" style={{ color: "rgba(58,34,51,.82)", fontSize: "clamp(1.05rem, 2.4vw, 1.35rem)", maxWidth: 620 }}>
          {letter}
        </motion.p>
        <motion.div variants={STAGGER_CHILD} className="text-lg sm:text-xl" style={{ fontFamily: DISPLAY, color: ROSE_DEEP }}>
          — {senderName || "me"} 💗
        </motion.div>
        {voiceUrl ? (
          <motion.button
            variants={STAGGER_CHILD}
            onClick={toggle}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)", boxShadow: "0 12px 30px -12px rgba(230,64,114,.6)" }}
          >
            {playing ? <Pause size={16} /> : <Mic size={16} />} {playing ? "Pause my voice" : "Hear it in my voice"}
          </motion.button>
        ) : null}
      </motion.div>

      {voiceUrl ? (
        <audio ref={audioRef} src={voiceUrl} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} className="hidden" />
      ) : null}
    </section>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────
const TL_GRADS = ["linear-gradient(135deg,#f9a8d4,#f43f5e)", "linear-gradient(135deg,#fde047,#fb923c)", "linear-gradient(135deg,#6ee7b7,#14b8a6)", "linear-gradient(135deg,#a5b4fc,#818cf8)"];
function Timeline({ data }: { data: ApologyData }) {
  return (
    <section className="p-8 sm:p-12" style={FULL_CARD}>
      <span aria-hidden className="absolute select-none" style={{ top: 22, right: 28, fontSize: 26, opacity: 0.4 }}>🌸</span>
      <span aria-hidden className="absolute select-none" style={{ bottom: 24, right: 44, fontSize: 18, opacity: 0.3 }}>✨</span>

      <div className="w-full max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-10"
          style={{ fontFamily: DISPLAY, color: INK }}
        >
          Memory Lane 🌸
        </motion.h2>

        <motion.div variants={STAGGER_PARENT} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.3 }} className="space-y-8 sm:space-y-10">
          {data.timeline.map((n, i) => (
            <motion.div key={i} variants={STAGGER_CHILD} className="relative flex gap-5 items-start">
              {i < data.timeline.length - 1 && (
                <motion.span
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.15 * i + 0.2 }}
                  style={{ position: "absolute", left: 26, top: 58, bottom: -34, width: 3, background: "linear-gradient(#ffb3c8,#ffd6d6)", transformOrigin: "top", borderRadius: 2 }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.08, rotate: -4 }}
                className="w-14 h-14 rounded-full text-white grid place-items-center shrink-0 text-2xl"
                style={{ background: TL_GRADS[i % TL_GRADS.length], boxShadow: "0 10px 22px -8px rgba(230,64,114,.45)" }}
              >
                {n.icon || (i === 0 ? <Star size={22} /> : i === 1 ? <Smile size={22} /> : <Sprout size={22} />)}
              </motion.div>
              <div className="pt-1">
                <div className="text-lg sm:text-xl font-semibold" style={{ fontFamily: DISPLAY, color: INK }}>{n.title}</div>
                <p className="text-sm sm:text-base mt-1" style={{ color: "rgba(58,34,51,.72)" }}>{n.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Final decision + agreement modal ────────────────────────────────────────
function FinalDecision({ data, mode, shareId, setMood, toast, acceptedPromises }: { data: ApologyData; mode: "preview" | "live"; shareId?: string; setMood: (v: number) => void; toast: (m: string, e?: string) => void; acceptedPromises: string[] | null }) {
  const [noPos, setNoPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dodges, setDodges] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  // Place the No button somewhere in the area that does NOT overlap the (centered,
  // growing) Yes button — so it can never end up sitting behind it.
  const placeNo = useCallback((random: boolean) => {
    const a = areaRef.current?.getBoundingClientRect();
    const b = noRef.current?.getBoundingClientRect();
    if (!a || !b) return;
    const yes = yesRef.current?.getBoundingClientRect();
    const maxX = Math.max(0, a.width - b.width - 6);
    const maxY = Math.max(0, a.height - b.height - 6);
    const cx = a.width / 2, cy = a.height / 2;
    const safeW = (yes ? yes.width : Math.min(a.width * 0.7, 260)) + b.width + 16;
    const safeH = (yes ? yes.height : 96) + b.height + 12;
    const clear = (x: number, y: number) => Math.abs(x + b.width / 2 - cx) > safeW / 2 || Math.abs(y + b.height / 2 - cy) > safeH / 2;
    // default resting spot: lower-right, guaranteed clear
    let x = maxX, y = maxY;
    if (random) {
      for (let i = 0; i < 30; i++) {
        const rx = Math.random() * maxX, ry = Math.random() * maxY;
        if (clear(rx, ry)) { x = rx; y = ry; break; }
      }
    } else if (!clear(x, y)) {
      y = maxY; x = maxX; // corner fallback
    }
    setNoPos({ x, y });
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => placeNo(false));
    const onResize = () => placeNo(false);
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [placeNo]);

  const dodge = () => {
    placeNo(true);
    setDodges((d) => d + 1);
    toast(FORGIVE_NO_MSGS[Math.floor(Math.random() * FORGIVE_NO_MSGS.length)], "💗");
  };

  const fireConfetti = () => {
    const end = Date.now() + 1400;
    const colors = ["#ff5f8a", "#ffd6d6", "#ffb3c8", "#e64072", "#fff"];
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors });
  };

  const onYes = () => { setMood(0); setShowModal(true); };

  const yesScale = Math.min(1 + dodges * 0.05, 1.35); // Yes grows the more No runs
  const noScale = Math.max(1 - dodges * 0.07, 0.5); // No shrinks away

  return (
    <section className="p-6 sm:p-12 text-center" style={FULL_CARD}>
      <span aria-hidden className="absolute select-none" style={{ top: 18, left: 22, fontSize: 22, opacity: 0.4 }}>💗</span>
      <span aria-hidden className="absolute select-none" style={{ top: 34, right: 26, fontSize: 18, opacity: 0.35 }}>🌸</span>
      <span aria-hidden className="absolute select-none" style={{ bottom: 22, left: 38, fontSize: 16, opacity: 0.3 }}>✨</span>

      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ type: "spring", stiffness: 200, damping: 13 }}
          className="text-4xl sm:text-6xl mb-2 sm:mb-3"
        >
          🥺
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-[1.6rem] sm:text-4xl font-bold leading-tight"
          style={{ fontFamily: DISPLAY, color: INK }}
        >
          So… will you forgive me?
        </motion.h2>
        <motion.p
          key={dodges < 4 ? (dodges === 0 ? "a" : "b") : "c"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 sm:mt-3 text-sm sm:text-lg px-2"
          style={{ color: "rgba(58,34,51,.72)" }}
        >
          {dodges === 0
            ? "There's a right answer… and a running one 😌"
            : dodges < 4
            ? "See? The 'no' can't even stay still 💕"
            : "You've almost caught it — but your heart already knows 💗"}
        </motion.p>

        {/* play area */}
        <div ref={areaRef} className="relative w-full mt-6 sm:mt-8" style={{ height: "clamp(180px, 30vh, 240px)" }}>
          {/* Yes — grows + pulses the more No dodges */}
          <motion.button
            ref={yesRef}
            onClick={onYes}
            animate={{ scale: [yesScale, yesScale * 1.045, yesScale] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: yesScale * 1.07 }}
            whileTap={{ scale: yesScale * 0.95 }}
            className="absolute left-1/2 top-1/2 inline-flex items-center gap-2 text-white font-bold whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)", borderRadius: 9999, padding: "14px 26px", fontSize: "clamp(.9rem,3.6vw,1.2rem)", boxShadow: "0 16px 40px -12px rgba(230,64,114,.7)", zIndex: 2, x: "-50%", y: "-50%", transformOrigin: "center" }}
          >
            <Heart size={18} fill="#fff" /> Yes, I forgive you!
          </motion.button>

          {/* No — springs away, shrinking, heartfelt on each dodge (never overlaps Yes) */}
          <motion.button
            ref={noRef}
            onMouseEnter={dodge}
            onFocus={dodge}
            onTouchStart={(e) => { e.preventDefault(); dodge(); }}
            onClick={(e) => { e.preventDefault(); dodge(); }}
            initial={false}
            animate={{ x: noPos.x, y: noPos.y, scale: noScale }}
            transition={{ type: "spring", stiffness: 520, damping: 30 }}
            className="font-semibold text-sm sm:text-base"
            style={{ position: "absolute", left: 0, top: 0, background: "#fff", color: ROSE_DEEP, border: "2px solid #ffd0dc", borderRadius: 9999, padding: "10px 18px", zIndex: 1 }}
          >
            No 🙃
          </motion.button>
        </div>
      </div>

      {showModal && (
        <AgreementModal
          data={data}
          mode={mode}
          shareId={shareId}
          onClose={() => setShowModal(false)}
          onSigned={fireConfetti}
          toast={toast}
          acceptedPromises={acceptedPromises}
        />
      )}
    </section>
  );
}

// ─── Agreement modal (signature + promises + sign flow) ──────────────────────
// press-&-hold fingerprint scanner — verifies over 3s, then seals
function FingerprintScanner({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const [pct, setPct] = useState(0);
  const [scanning, setScanning] = useState(false);
  const holding = useRef(false);
  const doneRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const DURATION = 3000;

  const tick = useCallback(() => {
    if (!holding.current) return;
    const p = Math.min(100, ((performance.now() - startRef.current) / DURATION) * 100);
    setPct(p);
    if (p >= 100) { doneRef.current = true; holding.current = false; setScanning(false); onComplete(); return; }
    rafRef.current = requestAnimationFrame(tick);
  }, [onComplete]);

  const start = () => { if (doneRef.current) return; holding.current = true; setScanning(true); startRef.current = performance.now(); rafRef.current = requestAnimationFrame(tick); };
  const end = () => { if (doneRef.current || !holding.current) return; holding.current = false; setScanning(false); if (rafRef.current) cancelAnimationFrame(rafRef.current); setPct(0); };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <div className="fixed inset-0 grid place-items-center p-5" style={{ background: "rgba(70,16,32,.66)", zIndex: 90 }} onClick={onCancel}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xs text-center p-7 rounded-3xl"
        style={{ background: "#fff", boxShadow: "0 30px 70px -20px rgba(230,64,114,.5)", border: "1px solid #ffe4ea" }}
      >
        <div className="font-semibold text-lg" style={{ fontFamily: DISPLAY, color: INK }}>Seal it with your thumb 💗</div>
        <div className="text-sm mt-1" style={{ color: "rgba(58,34,51,.6)" }}>Press &amp; hold for 3 seconds</div>

        <div
          onPointerDown={start}
          onPointerUp={end}
          onPointerLeave={end}
          onContextMenu={(e) => e.preventDefault()}
          className="relative mx-auto my-6 grid place-items-center select-none"
          style={{ width: 152, height: 152, borderRadius: "50%", cursor: "pointer", background: `conic-gradient(#e64072 ${pct * 3.6}deg, #ffe0e9 0deg)`, touchAction: "none" }}
        >
          <div className="grid place-items-center" style={{ width: 126, height: 126, borderRadius: "50%", background: scanning ? "#fff0f4" : "#fff", position: "relative", overflow: "hidden", transition: "background .3s" }}>
            <Fingerprint size={66} color={ROSE_DEEP} strokeWidth={1.4} />
            {scanning && (
              <motion.div
                initial={{ y: -62 }} animate={{ y: 62 }}
                transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                style={{ position: "absolute", left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#e64072,transparent)", boxShadow: "0 0 8px #ff5f8a" }}
              />
            )}
          </div>
        </div>

        <div className="text-sm font-semibold" style={{ color: ROSE_DEEP }}>
          {pct <= 0 ? "Touch the scanner" : pct < 100 ? `Verifying… ${Math.round(pct)}%` : "Verified 💖"}
        </div>
        <button onClick={onCancel} className="mt-4 text-xs font-medium" style={{ color: "rgba(58,34,51,.5)" }}>cancel</button>
      </motion.div>
    </div>
  );
}

function AgreementModal({ data, mode, shareId, onClose, onSigned, toast, acceptedPromises }: {
  data: ApologyData;
  mode: "preview" | "live";
  shareId?: string;
  onClose: () => void;
  onSigned: () => void;
  toast: (m: string, e?: string) => void;
  acceptedPromises: string[] | null;
}) {
  // who asks forgiveness (Apologiser) vs who grants it (Beloved)
  const apologiser = data.senderName || "The Apologiser";
  const beloved = data.recipientName || "The Beloved";
  // conditions = the promises chosen in the Bribery step (fallback to all items)
  const conditions = (acceptedPromises && acceptedPromises.length ? acceptedPromises : data.briberyItems.map((b) => `${b.icon} ${b.label}`));

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenId, setTokenId] = useState(() => "IN-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [downloading, setDownloading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  const confirm = async () => {
    if (mode === "preview") {
      setDone(true); onSigned();
      toast("Preview — publish to make it real 💌", "💌");
      return;
    }
    if (!shareId) { toast("Please publish first ⚠️", "⚠️"); return; }
    setSubmitting(true);
    try {
      const body: SignAgreementBody = { signerName: beloved, signerEmail: "", signatureImage: "", acceptedPromises: conditions };
      const res = await fetch(`${API_URL}/apology-dashboard-pages/share/${shareId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Sign failed");
      if (result.data?.tokenId) setTokenId(result.data.tokenId);
      setDone(true); onSigned();
      toast("Forgiven — you made my whole year 💗", "🎉");
    } catch {
      toast("Couldn't send the deed — please try again ⚠️", "⚠️");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    setCapturing(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    try {
      if (paperRef.current) {
        const { downloadAgreementPdf } = await import("./briberyAgreementPdf");
        await downloadAgreementPdf(paperRef.current, tokenId);
      }
    } catch {
      /* retry-able */
    } finally {
      setCapturing(false);
      setDownloading(false);
    }
  };

  const thumbCss: CSSProperties = { width: 48, height: 60, borderRadius: "46% 46% 48% 48%", margin: "0 auto", background: "repeating-radial-gradient(circle at 50% 45%, #b83a5e 0 1.1px, transparent 1.1px 3px)", opacity: 0.6 };

  return (
    <div className="fixed flex items-center justify-center p-3 sm:p-5" style={{ top: 58, bottom: 12, left: 0, right: 0, background: "rgba(70,16,32,.62)", zIndex: 60 }} onClick={onClose}>
      <motion.div
        ref={paperRef}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, rotate: -2, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="relative w-full max-w-lg text-left"
        style={{
          maxHeight: capturing ? "none" : "100%", overflowY: capturing ? "visible" : "auto",
          background: "#fbf7ec",
          backgroundImage: "repeating-linear-gradient(0deg, rgba(120,80,40,0.035) 0 1px, transparent 1px 26px)",
          borderRadius: 10, boxShadow: "0 30px 70px -20px rgba(60,20,30,.6)",
          fontFamily: "Georgia, 'Times New Roman', serif", color: "#4a2b1c",
        }}
      >
        {/* sticky close — stays reachable while the tall deed scrolls on phone */}
        {!capturing && (
          <div style={{ position: "sticky", top: 0, height: 0, zIndex: 20 }}>
            <button onClick={onClose} className="absolute w-8 h-8 rounded-full grid place-items-center" style={{ top: 12, right: 12, color: "#9c7b4a", background: "rgba(156,123,74,.16)", backdropFilter: "blur(4px)" }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ornate stamp-paper border — normal flow so it wraps the FULL content
            (fixes the bottom border overflow on phones) */}
        <div style={{ position: "relative", margin: 8, border: "2px solid #9c7b4a", borderRadius: 6 }}>
        <div style={{ position: "relative", margin: 5, border: "1px solid #b89a63", borderRadius: 4, overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", fontSize: 220, opacity: 0.05 }}>❤</div>

        <div className="relative px-5 sm:px-8 py-7">
          {/* header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#8a6b3f", fontWeight: 700 }}>GOVERNMENT OF LOVE</div>
              <div style={{ fontSize: 10, letterSpacing: 1, color: "#8a6b3f" }}>NON-JUDICIAL LOVE STAMP</div>
            </div>
            <div style={{ border: "1.5px solid #b04a5e", borderRadius: 4, padding: "4px 8px", textAlign: "center", color: "#b04a5e", transform: "rotate(3deg)", background: "rgba(176,74,94,.05)" }}>
              <div style={{ fontSize: 8, letterSpacing: 1 }}>LOVE STAMP</div>
              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>₹100</div>
              <div style={{ fontSize: 7 }}>RECONCILIATION • ∞</div>
            </div>
          </div>

          <div className="text-center mt-4">
            <div style={{ fontFamily: DISPLAY, fontSize: "clamp(22px,5vw,30px)", fontWeight: 700, color: "#5a2f1e" }}>Deed of Reconciliation</div>
            <div style={{ fontSize: 12, fontStyle: "italic", color: "#8a6b3f" }}>forgiveness, granted on loving conditions</div>
            <div style={{ height: 2, width: 120, background: "linear-gradient(90deg,transparent,#b89a63,transparent)", margin: "10px auto 0" }} />
          </div>

          {/* body — conditional forgiveness */}
          <p className="mt-5 text-sm sm:text-[15px] leading-relaxed">
            <b style={{ color: "#b04a5e" }}>{beloved}</b> (<i>“the Forgiver”</i>) hereby grants heartfelt forgiveness to <b style={{ color: "#b04a5e" }}>{apologiser}</b> (<i>“the Apologiser”</i>), <b>strictly on the loving condition</b> that the Apologiser faithfully fulfils each promise set out below:
          </p>

          {conditions.length > 0 && (
            <ol className="mt-3 space-y-2 text-sm sm:text-[15px]">
              {conditions.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ fontWeight: 700, color: "#b04a5e" }}>{i + 1}.</span>
                  <span><b>CONDITION</b> — {c}.</span>
                </li>
              ))}
            </ol>
          )}

          <p className="mt-4 text-xs sm:text-sm" style={{ color: "#7a5a3a" }}>
            Upon these conditions the said misunderstanding stands forgiven; all grudges are released, effective immediately. Any breach is remediable by extra cuddles. Valid for eternity ∞. Ref No. {tokenId}
          </p>

          {/* seal + named thumbprints (who asks vs who grants forgiveness) */}
          <div className="mt-6 grid grid-cols-3 gap-2 items-end">
            <div className="text-center">
              <div style={thumbCss} />
              <div style={{ borderTop: "1px solid #9c7b4a", marginTop: 6, paddingTop: 3, fontSize: 12, fontWeight: 700 }}>{apologiser}</div>
              <div style={{ fontSize: 8.5, color: "#8a6b3f" }}>Apologiser · seeks forgiveness</div>
            </div>
            <div className="grid place-items-center">
              {done ? (
                <motion.div
                  initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  transition={{ type: "spring", stiffness: 260, damping: 12 }}
                  style={{ width: 92, height: 92, borderRadius: "50%", display: "grid", placeItems: "center", textAlign: "center", color: "#fff", background: "radial-gradient(circle at 35% 30%, #ff7aa8, #c11e46)", border: "3px dashed rgba(255,255,255,.6)", boxShadow: "0 6px 16px -4px rgba(193,30,70,.6)" }}
                >
                  <div>
                    <div style={{ fontSize: 20, lineHeight: 1 }}>💖</div>
                    <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 1, marginTop: 2 }}>FORGIVEN<br />WITH LOVE • ∞</div>
                  </div>
                </motion.div>
              ) : (
                <div style={{ width: 92, height: 92, borderRadius: "50%", border: "2px dashed #d9b3c0", display: "grid", placeItems: "center", color: "#c99", fontSize: 26 }}>💗</div>
              )}
            </div>
            <div className="text-center">
              <div style={thumbCss} />
              <div style={{ borderTop: "1px solid #9c7b4a", marginTop: 6, paddingTop: 3, fontSize: 12, fontWeight: 700 }}>{beloved}</div>
              <div style={{ fontSize: 8.5, color: "#8a6b3f" }}>Forgiver · grants forgiveness</div>
            </div>
          </div>

          {!capturing && (
            !done ? (
              <button
                onClick={() => setShowScanner(true)}
                disabled={submitting}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 text-white font-semibold disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)", borderRadius: 9999, padding: "14px 28px", fontFamily: DISPLAY, boxShadow: "0 12px 30px -10px rgba(230,64,114,.6)" }}
              >
                <HandHeart size={16} /> {submitting ? "Sealing…" : "Seal my forgiveness"}
              </button>
            ) : (
              <>
                <p className="mt-4 text-center text-xs" style={{ color: "#8a6b3f" }}>
                  {mode === "preview" ? "Preview — publish to send this for real." : `A signed copy is on its way to ${apologiser}'s inbox 💌`}
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={downloadPdf}
                    disabled={downloading}
                    className="flex-1 inline-flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
                    style={{ background: "#fff", color: "#b04a5e", border: "1.5px solid #d99", borderRadius: 9999, padding: "12px 20px", fontFamily: DISPLAY }}
                  >
                    <Download size={16} /> {downloading ? "Preparing…" : "Download PDF"}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold"
                    style={{ background: "linear-gradient(135deg,#ff7aa8,#e64072)", borderRadius: 9999, padding: "12px 20px", fontFamily: DISPLAY, boxShadow: "0 12px 30px -12px rgba(230,64,114,.6)" }}
                  >
                    <Check size={16} /> Aww, thank you
                  </button>
                </div>
              </>
            )
          )}
        </div>
        </div>
        </div>
      </motion.div>

      {showScanner && !done && (
        <FingerprintScanner
          onComplete={() => { setShowScanner(false); confirm(); }}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
