"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FEATURES } from "./data";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

type TimeoutRef = ReturnType<typeof setTimeout>;

const AI_DEMO_PROMPTS = [
  {
    occasion: "Wedding",
    prompt: "Write a heartfelt wedding wish for my best friend Priya",
    result: '"As two souls unite under the stars, may your journey together be woven with golden threads of love, laughter, and eternal togetherness. Congratulations, Priya! 🌸"',
  },
  {
    occasion: "Eid",
    prompt: "Eid greeting for my family with Urdu touch",
    result: '"Eid Mubarak! May Allah shower your home with noor, your heart with sukoon, and your life with barakah beyond measure. Eid ki khushiyaan mubaarak ho! 🌙✨"',
  },
  {
    occasion: "Birthday",
    prompt: "Fun birthday message for my sister who loves travel",
    result: '"Another trip around the sun, another chapter of adventures! May this birthday take you to places that take your breath away. Happy birthday, wanderer! 🌍🎂"',
  },
];

function AIFeatureCard({ accent, onCycleDone }: { accent: string; onCycleDone?: () => void }) {
  const [phase, setPhase] = React.useState<"idle" | "processing" | "revealing" | "done">("idle");
  const [prompt, setPrompt] = React.useState("");
  const [result, setResult] = React.useState("");
  const [revealed, setRevealed] = React.useState("");
  const [demoIdx, setDemoIdx] = React.useState(0);
  const [procDot, setProcDot] = React.useState(0);
  const timers = React.useRef<TimeoutRef[]>([]);

  function clearAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  React.useEffect(() => {
    const runDemo = (idx: number) => {
      const d = AI_DEMO_PROMPTS[idx % AI_DEMO_PROMPTS.length];
      setPhase("idle");
      setPrompt("");
      setResult("");
      setRevealed("");

      const t0 = 1200;
      d.prompt.split("").forEach((ch, i) => {
        timers.current.push(
          setTimeout(() => {
            setPrompt((p) => p + ch);
          }, t0 + i * 52),
        );
      });

      const t1 = t0 + d.prompt.length * 52 + 800;
      timers.current.push(
        setTimeout(() => {
          setPhase("processing");
          setProcDot(0);
        }, t1),
      );
      [0, 1, 2, 3, 4].forEach((k) => {
        timers.current.push(setTimeout(() => setProcDot((p) => p + 1), t1 + 600 + k * 700));
      });

      const t2 = t1 + 4500;
      timers.current.push(
        setTimeout(() => {
          setPhase("revealing");
          setResult(d.result);
          d.result.split("").forEach((ch, i) => {
            timers.current.push(setTimeout(() => setRevealed((p) => p + ch), i * 24));
          });
        }, t2),
      );

      const t3 = t2 + d.result.length * 24 + 5000;
      timers.current.push(
        setTimeout(() => {
          setPhase("idle");
          setPrompt("");
          setResult("");
          setRevealed("");
          onCycleDone?.();
          setDemoIdx((n) => (n + 1) % AI_DEMO_PROMPTS.length);
        }, t3),
      );
    };

    clearAll();
    runDemo(demoIdx);
    return clearAll;
  }, [demoIdx, onCycleDone]);

  function handleGenerate() {
    if (!prompt.trim() || phase === "processing" || phase === "revealing") return;
    clearAll();
    setPhase("processing");
    setResult("");
    setRevealed("");
    setProcDot(0);
    const fakeResult = '"Your heartfelt message crafted with love and care — SubhSandesh AI brings your words to life with every occasion! 🌟"';

    [0, 1, 2, 3, 4].forEach((k) => {
      timers.current.push(setTimeout(() => setProcDot((p) => p + 1), 350 + k * 280));
    });
    timers.current.push(
      setTimeout(() => {
        setPhase("revealing");
        setResult(fakeResult);
        fakeResult.split("").forEach((ch, i) => {
          timers.current.push(setTimeout(() => setRevealed((p) => p + ch), i * 16));
        });
        timers.current.push(setTimeout(() => setPhase("done"), fakeResult.length * 16 + 400));
      }, 2200),
    );
  }

  const d = AI_DEMO_PROMPTS[demoIdx % AI_DEMO_PROMPTS.length];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", padding: "16px 14px 14px" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, background: `radial-gradient(ellipse at 60% 30%,${accent},transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ flexShrink: 0, marginBottom: 10, marginTop: 25, position: "relative" }}>
        <motion.div
          animate={phase === "processing" ? { borderColor: `${accent}88`, boxShadow: `0 0 18px ${accent}33` } : { borderColor: "rgba(201,168,76,0.2)", boxShadow: "0 0 0px rgba(0,0,0,0)" }}
          transition={{ duration: 0.4 }}
          style={{ background: "linear-gradient(135deg,rgba(35,5,10,0.97),rgba(18,3,6,0.97))", border: "1.5px solid rgba(201,168,76,0.2)", borderRadius: 14, overflow: "hidden" }}
        >
          {(phase === "processing" || phase === "revealing" || phase === "done") && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} style={{ padding: "6px 12px 0", fontFamily: "monospace", fontSize: 9.5, color: "rgba(201,168,76,0.5)", letterSpacing: "0.08em" }}>
              {">"} Occasion: <span style={{ color: accent, fontWeight: 700 }}>{d.occasion}</span>
            </motion.div>
          )}
          <textarea
            value={prompt}
            onChange={(e) => {
              if (phase === "idle" || phase === "done") setPrompt(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="Describe your occasion & tone... e.g. 'Wedding wish for my best friend with Urdu touch'"
            rows={3}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", padding: "8px 12px", fontSize: 10, lineHeight: 1.55, color: "rgba(240,215,170,0.88)", fontFamily: "'Playfair Display',serif", fontStyle: "italic", caretColor: `${accent}cc`, scrollbarWidth: "none" }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px 8px", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
            <span style={{ fontSize: 8, color: "rgba(201,168,76,0.3)", fontFamily: "monospace", letterSpacing: "0.1em" }}>{prompt.length > 0 ? `${prompt.length} chars` : "ENTER to generate"}</span>
            <motion.button
              onClick={handleGenerate}
              whileTap={{ scale: 0.88 }}
              animate={prompt.trim() && phase !== "processing" ? { background: `linear-gradient(135deg,${accent},rgba(160,110,40,1))`, boxShadow: `0 0 14px ${accent}55`, color: "#1a0507" } : { background: "rgba(201,168,76,0.1)", boxShadow: "none", color: "rgba(201,168,76,0.35)" }}
              transition={{ duration: 0.25 }}
              style={{ border: "none", cursor: "pointer", borderRadius: 20, padding: "4px 12px", fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "monospace" }}
            >
              ✦ GENERATE
            </motion.button>
          </div>
        </motion.div>
      </div>

      {phase === "processing" && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ flexShrink: 0, marginBottom: 8, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12 }}>
          <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${accent}22` }} />
            <div style={{ position: "absolute", inset: 3, borderRadius: "50%", border: "2px solid transparent", borderTopColor: accent, borderRightColor: `${accent}55`, animation: "spinSlow 1s linear infinite" }} />
            <div style={{ position: "absolute", inset: 9, borderRadius: "50%", background: `${accent}33` }} />
          </div>
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
              {["READING", "THINKING", "COMPOSING"].map((label, i) => (
                <motion.span key={label} animate={procDot > i ? { color: accent, opacity: 1 } : { color: "rgba(201,168,76,0.25)", opacity: 0.6 }} transition={{ duration: 0.3 }} style={{ fontSize: 7, fontFamily: "monospace", letterSpacing: "0.12em", fontWeight: 700 }}>
                  {label}
                  {i < 2 ? "…" : ""}
                </motion.span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div key={i} animate={procDot > i ? { background: accent, scaleY: 1 } : { background: "rgba(201,168,76,0.15)", scaleY: 0.5 }} transition={{ duration: 0.25 }} style={{ width: 16, height: 3, borderRadius: 2, transformOrigin: "bottom" }} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {(phase === "revealing" || phase === "done") && (
        <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} style={{ flex: 1, position: "relative", overflow: "hidden", background: "linear-gradient(135deg,rgba(201,168,76,0.06),rgba(61,12,17,0.6))", border: "1px solid rgba(201,168,76,0.22)", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(201,168,76,0.04) 50%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 8, right: 8, fontSize: 14, opacity: 0.25 }}>✦</div>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(201,168,76,0.7)", letterSpacing: "0.12em", marginBottom: 6, fontWeight: 700 }}>AI OUTPUT</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, color: "rgba(240,215,170,0.92)", lineHeight: 1.65, fontStyle: "italic", wordBreak: "break-word" }}>
            {revealed}
            {phase === "revealing" && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.55 }} style={{ color: accent, fontStyle: "normal", marginLeft: 1 }}>▌</motion.span>}
          </div>
          {phase === "done" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "rgba(201,168,76,0.45)", fontFamily: "monospace", fontWeight: 700 }}>✓ READY TO USE</div>
            </motion.div>
          )}
        </motion.div>
      )}

      {phase === "idle" && (
        <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 22 }}>✨</div>
          <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", color: "rgba(201,168,76,0.35)", textAlign: "center", lineHeight: 1.7 }}>
            TYPE YOUR PROMPT
            <br />
            ABOVE & HIT GENERATE
          </div>
        </motion.div>
      )}
    </div>
  );
}

const TEMPLATE_ITEMS = [
  { id: "holi", label: "Holi", emoji: "🎨", tag: "Festival", color: "#E91E63", bg: "linear-gradient(145deg,#3d0c11,#1a0505)", accent: "#FF6090", imgSrc: null, desc: "Rang Barse vibes", pattern: "radial-gradient(circle at 30% 40%, rgba(233,30,99,0.18) 0%, transparent 55%), radial-gradient(circle at 70% 70%, rgba(255,152,0,0.12) 0%, transparent 50%)" },
  { id: "wedding", label: "Wedding", emoji: "💍", tag: "Shaadi", color: "#c9a84c", bg: "linear-gradient(145deg,#2a1500,#140a00)", accent: "#f0c060", imgSrc: null, desc: "Eternal celebrations", pattern: "radial-gradient(circle at 60% 30%, rgba(201,168,76,0.18) 0%, transparent 55%)" },
  { id: "eid", label: "Eid Mubarak", emoji: "🌙", tag: "Festival", color: "#4FC3F7", bg: "linear-gradient(145deg,#001a2c,#000d18)", accent: "#7ee0ff", imgSrc: null, desc: "Chand raat magic", pattern: "radial-gradient(circle at 40% 60%, rgba(79,195,247,0.15) 0%, transparent 55%)" },
  { id: "diwali", label: "Diwali", emoji: "🪔", tag: "Festival", color: "#FF9800", bg: "linear-gradient(145deg,#1a0a00,#0d0400)", accent: "#ffb74d", imgSrc: null, desc: "Festival of lights", pattern: "radial-gradient(circle at 50% 35%, rgba(255,152,0,0.2) 0%, transparent 55%)" },
  { id: "reception", label: "Reception", emoji: "🥂", tag: "Celebration", color: "#CE93D8", bg: "linear-gradient(145deg,#1a001f,#0d0010)", accent: "#e8b4f8", imgSrc: null, desc: "Grand evening affair", pattern: "radial-gradient(circle at 65% 45%, rgba(206,147,216,0.15) 0%, transparent 55%)" },
  { id: "birthday", label: "Birthday", emoji: "🎂", tag: "Celebration", color: "#F48FB1", bg: "linear-gradient(145deg,#1f0012,#100009)", accent: "#ffaed4", imgSrc: null, desc: "Celebrate every year", pattern: "radial-gradient(circle at 35% 55%, rgba(244,143,177,0.15) 0%, transparent 55%)" },
] as const;

function TemplatesFeatureCard() {
  const [active, setActive] = React.useState(1);
  const TOT = TEMPLATE_ITEMS.length;
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % TOT), 2200);
    return () => clearInterval(t);
  }, [TOT]);
  const mod = (n: number) => ((n % TOT) + TOT) % TOT;
  const slots = [-2, -1, 0, 1, 2].map((off) => ({ item: TEMPLATE_ITEMS[mod(active + off)], off, idx: mod(active + off) }));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "12px 0 10px" }}>
      <motion.div animate={{ background: `radial-gradient(ellipse at 50% 60%,${TEMPLATE_ITEMS[active].color}28,transparent 65%)` }} transition={{ duration: 0.6 }} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: "100%", perspective: "900px" }}>
        {slots.map((s) => {
          const isActive = s.off === 0;
          const isNear = Math.abs(s.off) === 1;
          const item = s.item;
          return (
            <motion.div
              key={`${item.id}-${s.off}`}
              onClick={() => {
                if (!isActive) setActive(s.idx);
              }}
              animate={{ x: `${s.off * 85}%`, scale: isActive ? 1 : isNear ? 0.78 : 0.58, opacity: isActive ? 1 : isNear ? 0.55 : 0.2, rotateY: s.off * -14, z: isActive ? 0 : isNear ? -60 : -130 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              style={{ position: "absolute", width: 148, height: 210, borderRadius: 20, cursor: isActive ? "default" : "pointer", zIndex: 10 - Math.abs(s.off), transformStyle: "preserve-3d", boxShadow: isActive ? `0 24px 60px rgba(0,0,0,0.8), 0 0 40px ${item.color}33` : "0 8px 24px rgba(0,0,0,0.5)", border: isActive ? `1.5px solid ${item.color}66` : "1px solid rgba(255,255,255,0.06)", background: item.bg, overflow: "hidden", flexShrink: 0 }}
            >
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: item.pattern }} />
              {isActive && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.05) 50%,transparent 70%)", pointerEvents: "none" }} />}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "58%", background: "rgba(0,0,0,0.25)", overflow: "hidden", borderBottom: `1px solid ${item.color}22` }}>
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", fontSize: 110, opacity: 0.05, userSelect: "none", color: item.color, lineHeight: 1, pointerEvents: "none" }}>✺</div>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${item.color}18 1px,transparent 1px),linear-gradient(90deg,${item.color}18 1px,transparent 1px)`, backgroundSize: "18px 18px" }} />
                  <motion.div animate={isActive ? { scale: [1, 1.1, 1], y: [0, -4, 0] } : { scale: 1 }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} style={{ fontSize: 42, position: "relative", zIndex: 1, filter: `drop-shadow(0 4px 16px ${item.color}88)` }}>
                    {item.emoji}
                  </motion.div>
                </div>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, top: "58%", padding: "10px 12px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", fontFamily: "'Playfair Display',serif", color: isActive ? item.accent : "rgba(255,255,255,0.5)" }}>{item.label}</span>
                    <span style={{ fontSize: 7, letterSpacing: "0.14em", fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: isActive ? `${item.color}22` : "rgba(255,255,255,0.05)", color: isActive ? item.color : "rgba(255,255,255,0.25)", border: `1px solid ${isActive ? `${item.color}44` : "transparent"}` }}>{item.tag}</span>
                  </div>
                  <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.4, fontStyle: "italic", fontFamily: "'Playfair Display',serif" }}>{item.desc}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div style={{ flexShrink: 0, marginTop: 8, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", overflow: "hidden" }}>
        <motion.div animate={{ x: `-${active * 72}px` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{ display: "flex", gap: 8, willChange: "transform" }}>
          {TEMPLATE_ITEMS.map((item, i) => (
            <motion.div key={item.id} onClick={() => setActive(i)} animate={{ color: i === active ? item.color : "rgba(201,168,76,0.25)", scale: i === active ? 1 : 0.88 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0, cursor: "pointer", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", fontFamily: "monospace", width: 64, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.label.toUpperCase()}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

const PHOTO_SLOTS = [
  { emoji: "💍", label: "Wedding Day", tag: "Ceremony", color: "#c9a84c" },
  { emoji: "🌸", label: "Floral Holi", tag: "Festival", color: "#E91E63" },
  { emoji: "🪔", label: "Diwali Night", tag: "Festival", color: "#FF9800" },
  { emoji: "🌙", label: "Eid Mubarak", tag: "Occasion", color: "#4FC3F7" },
  { emoji: "🥂", label: "Reception", tag: "Celebrate", color: "#CE93D8" },
  { emoji: "🎂", label: "Birthday", tag: "Birthday", color: "#F48FB1" },
] as const;

function PhotosFeatureCard() {
  const [focused, setFocused] = React.useState(0);
  const [spread, setSpread] = React.useState(false);

  useEffect(() => {
    const timers: TimeoutRef[] = [];
    const cycle = () => {
      setSpread(false);
      setFocused(0);
      timers.push(setTimeout(() => setSpread(true), 500));
      PHOTO_SLOTS.forEach((_, i) => timers.push(setTimeout(() => setFocused(i), 1400 + i * 1100)));
      const afterAll = 1400 + PHOTO_SLOTS.length * 1100 + 600;
      timers.push(setTimeout(() => setSpread(false), afterAll + 1800));
      timers.push(setTimeout(cycle, afterAll + 2800));
    };
    cycle();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", padding: "12px 14px 10px" }}>
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {PHOTO_SLOTS.map((slot, i) => {
          const isFocused = focused === i && spread;
          const fanAngle = spread ? (i - (PHOTO_SLOTS.length - 1) / 2) * 22 : (i - 2.5) * 6;
          const fanX = spread ? (i - (PHOTO_SLOTS.length - 1) / 2) * 42 : 0;
          const fanY = spread ? Math.abs(i - (PHOTO_SLOTS.length - 1) / 2) * 14 : i * -2;
          return (
            <motion.div
              key={slot.label}
              animate={{ rotate: isFocused ? 0 : fanAngle, x: isFocused ? 0 : fanX, y: isFocused ? -18 : fanY, scale: isFocused ? 1.18 : spread ? 0.82 : 0.7 + i * 0.02, zIndex: isFocused ? PHOTO_SLOTS.length + 1 : i, boxShadow: isFocused ? `0 28px 60px rgba(0,0,0,0.85), 0 0 36px ${slot.color}44` : "0 8px 24px rgba(0,0,0,0.6)" }}
              transition={{ type: "spring", stiffness: 220, damping: 24, delay: spread ? i * 0.06 : 0 }}
              style={{ position: "absolute", width: 108, height: 138, background: "linear-gradient(145deg,rgba(40,8,12,0.98),rgba(20,4,6,0.99))", borderRadius: 10, border: `1.5px solid ${isFocused ? `${slot.color}77` : "rgba(201,168,76,0.12)"}`, overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
              onClick={() => setFocused(i)}
            >
              <div style={{ height: "65%", position: "relative", background: "rgba(0,0,0,0.3)", borderBottom: `1px solid ${isFocused ? `${slot.color}33` : "rgba(255,255,255,0.04)"}` }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${slot.color}12 1px,transparent 1px),linear-gradient(90deg,${slot.color}12 1px,transparent 1px)`, backgroundSize: "14px 14px" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, opacity: 0.04, color: slot.color, userSelect: "none", pointerEvents: "none", lineHeight: 1 }}>✺</div>
                <motion.div animate={isFocused ? { scale: [1, 1.12, 1], y: [0, -5, 0] } : { scale: 0.9, y: 0 }} transition={{ repeat: isFocused ? Infinity : 0, duration: 2.5, ease: "easeInOut" }} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isFocused ? 40 : 32, filter: isFocused ? `drop-shadow(0 4px 14px ${slot.color}99)` : "none" }}>
                  {slot.emoji}
                </motion.div>
              </div>
              <div style={{ height: "35%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 8px", gap: 4 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: isFocused ? 10 : 8.5, fontWeight: 700, letterSpacing: "0.04em", textAlign: "center", color: isFocused ? slot.color : "rgba(255,255,255,0.35)", transition: "color 0.3s" }}>{slot.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 8 }}>
        {PHOTO_SLOTS.map((slot, i) => (
          <motion.div key={slot.label} onClick={() => setFocused(i)} animate={{ width: i === focused && spread ? 18 : 5, background: i === focused && spread ? slot.color : "rgba(201,168,76,0.18)", opacity: spread ? 1 : 0.3 }} transition={{ duration: 0.3 }} style={{ height: 5, borderRadius: 3, cursor: "pointer" }} />
        ))}
      </div>
    </div>
  );
}

const MUSIC_TRACKS = [
  { title: "Rang Barse", artist: "Amitabh Bachchan", duration: "4:32" },
  { title: "Balam Pichkari", artist: "Vishal Dadlani", duration: "4:45" },
  { title: "Holi Ke Din", artist: "Kishore Kumar", duration: "5:10" },
  { title: "Jai Jai Shiv Shankar", artist: "Kishore Kumar", duration: "6:02" },
  { title: "Holi Khele Raghuveera", artist: "Amitabh Bachchan", duration: "5:48" },
];

function TimerFeatureCard({ accent }: { accent: string }) {
  const [time, setTime] = React.useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 20px", gap: 10, position: "relative", overflow: "hidden" }}>
      <div style={{ width: 148, height: 148, borderRadius: "50%", border: `2px solid ${accent}`, boxShadow: `0 0 18px ${accent}44`, background: "radial-gradient(circle at 40% 30%, rgba(55,12,16,1), rgba(12,2,4,1))", display: "flex", alignItems: "center", justifyContent: "center", color: accent, fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 24 }}>{pad(time.getHours())}:{pad(time.getMinutes())}</div>
      <div style={{ background: "rgba(12,2,4,0.97)", border: `1px solid ${accent}44`, borderRadius: 20, padding: "3px 12px", display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.08em" }}>
          {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
        </span>
        <span style={{ fontSize: 7, fontWeight: 700, color: `${accent}88`, letterSpacing: "0.1em" }}>{ampm}</span>
      </div>
    </div>
  );
}

const GOLD = "#c9a84c";
const SHARE_PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "twitter", label: "Twitter/X" },
  { id: "instagram", label: "Instagram" },
  { id: "telegram", label: "Telegram" },
] as const;

function SharingFeatureCard({ accent }: { accent: string }) {
  const [opened, setOpened] = React.useState(false);
  const [sent, setSent] = React.useState<(typeof SHARE_PLATFORMS)[number]["id"] | null>(null);
  const sentTimer = React.useRef<TimeoutRef | null>(null);

  useEffect(() => {
    const timers: TimeoutRef[] = [];
    const demo = () => {
      setOpened(false);
      setSent(null);
      timers.push(setTimeout(() => setOpened(true), 900));
      timers.push(setTimeout(() => setSent("whatsapp"), 2400));
      timers.push(setTimeout(() => {
        setOpened(false);
        setSent(null);
      }, 4200));
      timers.push(setTimeout(demo, 5800));
    };
    demo();
    return () => timers.forEach(clearTimeout);
  }, []);

  const positions = [{ angle: -90 }, { angle: 0 }, { angle: 90 }, { angle: 180 }];
  const R = 88;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", userSelect: "none" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.08, background: `radial-gradient(ellipse at 50% 50%,${accent},transparent 70%)`, pointerEvents: "none" }} />
      {SHARE_PLATFORMS.map((plat, i) => {
        const rad = (positions[i].angle * Math.PI) / 180;
        const tx = Math.cos(rad) * R;
        const ty = Math.sin(rad) * R;
        const isSent = sent === plat.id;
        return (
          <motion.div
            key={plat.id}
            animate={opened ? { x: tx, y: ty, opacity: 1, scale: isSent ? 1.28 : 1 } : { x: 0, y: 0, opacity: 0, scale: 0.3 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: opened ? i * 0.06 : 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setSent(plat.id);
              if (sentTimer.current) clearTimeout(sentTimer.current);
              sentTimer.current = setTimeout(() => {
                setSent(null);
                setOpened(false);
              }, 2200);
            }}
            style={{ position: "absolute", width: 52, height: 52, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: isSent ? `linear-gradient(135deg,${GOLD},rgba(120,80,20,1))` : "linear-gradient(145deg,rgba(42,8,12,0.98),rgba(25,4,8,0.98))", border: `1.5px solid ${isSent ? GOLD : `${GOLD}33`}`, boxShadow: isSent ? `0 0 28px ${GOLD}88,0 0 60px ${GOLD}33` : "0 4px 20px rgba(0,0,0,0.6)", color: isSent ? "#1a0507" : `${GOLD}bb`, zIndex: 10 }}
          >
            {isSent ? "✓" : plat.label[0]}
          </motion.div>
        );
      })}
      <motion.div onClick={() => !sent && setOpened((o) => !o)} animate={opened ? { scale: 1.06 } : { scale: 1 }} transition={{ duration: 0.3 }} style={{ width: 74, height: 74, borderRadius: "50%", cursor: "pointer", zIndex: 20, background: "radial-gradient(circle at 38% 36%,rgba(201,168,76,0.18),rgba(28,4,8,0.99) 70%)", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ color: GOLD, fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em" }}>{opened ? "CLOSE" : "SHARE"}</span>
      </motion.div>
    </div>
  );
}

const DEMO_BLESSINGS = [
  { text: "May your life be filled with joy & colours! 🌈", name: "Priya", emoji: "🙏" },
  { text: "Wishing you love, light and togetherness always ❤️", name: "Rahul", emoji: "💛" },
  { text: "Har pal khushiyan laaye, yahi dua hai hamari! ✨", name: "Anjali", emoji: "🕊️" },
];

function BlessingsFeatureCard() {
  const [input, setInput] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [blessings, setBlessings] = React.useState(DEMO_BLESSINGS);
  useEffect(() => {
    const DEMO_MSG = "Khushiyon se bhara rahe aapka jeevan! 🌸";
    const timers: TimeoutRef[] = [];
    const runDemo = () => {
      setInput("");
      setSubmitted(false);
      DEMO_MSG.split("").forEach((ch, i) => timers.push(setTimeout(() => setInput((p) => p + ch), 800 + i * 45)));
      const doneAt = 800 + DEMO_MSG.length * 45 + 300;
      timers.push(
        setTimeout(() => {
          setSubmitted(true);
          setBlessings((prev) => [{ text: DEMO_MSG, name: "You", emoji: "🙏" }, ...prev].slice(0, 6));
          setInput("");
        }, doneAt),
      );
      timers.push(setTimeout(() => setSubmitted(false), doneAt + 2000));
      timers.push(setTimeout(runDemo, doneAt + 4500));
    };
    runDemo();
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", padding: "18px 16px 14px" }}>
      <div style={{ flex: 1, overflowY: "auto", marginTop: 15, marginBottom: 10, display: "flex", flexDirection: "column", gap: 7, scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {blessings.map((b, i) => (
          <motion.div key={`${b.text}-${i}`} initial={{ opacity: 0, x: -20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.4 }} style={{ background: "linear-gradient(135deg,rgba(61,12,17,0.9),rgba(35,5,10,0.95))", border: `1px solid rgba(201,168,76,${i === 0 ? "0.45" : "0.18"})`, borderRadius: 12, padding: "9px 12px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{b.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, color: "rgba(240,220,180,0.88)", lineHeight: 1.45, wordBreak: "break-word", fontStyle: i === 0 ? "italic" : "normal" }}>{b.text}</div>
                <div style={{ fontSize: 8, color: "rgba(201,168,76,0.5)", marginTop: 4, fontWeight: 700, letterSpacing: "0.1em" }}>— {b.name}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ flexShrink: 0, position: "relative" }}>
        <motion.div animate={submitted ? { borderColor: "rgba(201,168,76,0.8)", boxShadow: "0 0 24px rgba(201,168,76,0.35)" } : { borderColor: "rgba(201,168,76,0.25)", boxShadow: "0 0 0px rgba(201,168,76,0)" }} transition={{ duration: 0.4 }} style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,rgba(35,5,10,0.97),rgba(20,3,6,0.97))", border: "1.5px solid rgba(201,168,76,0.25)", borderRadius: 50, padding: "8px 8px 8px 16px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && input.trim() && setSubmitted(true)} placeholder="Send your blessings... 🙏" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 10.5, color: "rgba(240,215,170,0.9)", fontFamily: "'Playfair Display',serif", fontStyle: "italic", caretColor: "rgba(201,168,76,0.9)", minWidth: 0 }} />
          <motion.button onClick={() => input.trim() && setSubmitted(true)} whileTap={{ scale: 0.88 }} animate={input.trim() ? { background: "linear-gradient(135deg,rgba(201,168,76,1),rgba(160,110,40,1))", boxShadow: "0 0 16px rgba(201,168,76,0.5)" } : { background: "rgba(201,168,76,0.15)", boxShadow: "0 0 0px rgba(0,0,0,0)" }} transition={{ duration: 0.25 }} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", color: input.trim() ? "#1a0507" : "rgba(201,168,76,0.4)", fontSize: 15 }}>
            →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

const PASSWORD = "subhsandesh@123";
function SecurityFeatureCard({ accent }: { accent: string }) {
  const [phase, setPhase] = React.useState<"idle" | "typing" | "submitting" | "success">("idle");
  const [typed, setTyped] = React.useState("");
  useEffect(() => {
    const timers: TimeoutRef[] = [];
    const run = () => {
      setPhase("idle");
      setTyped("");
      timers.push(setTimeout(() => setPhase("typing"), 1000));
      PASSWORD.split("").forEach((ch, i) => timers.push(setTimeout(() => setTyped((p) => p + ch), 1000 + (i + 1) * 80)));
      const afterTyping = 1000 + PASSWORD.length * 80 + 400;
      timers.push(setTimeout(() => setPhase("submitting"), afterTyping));
      timers.push(setTimeout(() => setPhase("success"), afterTyping + 1800));
      timers.push(setTimeout(run, afterTyping + 4200));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px", gap: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,rgba(35,8,12,0.98),rgba(18,3,6,0.98))", border: `2px solid ${(phase === "success" ? "#4ade80" : accent)}88`, fontSize: 32 }}>{phase === "success" ? "✅" : "🔐"}</div>
      <div style={{ width: "100%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", borderRadius: 14, border: `1px solid ${phase === "success" ? "#4ade8044" : `${accent}33`}`, padding: "12px 16px" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", color: `${accent}66`, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Password</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "7px 10px", border: `1px solid ${accent}22` }}>
          <span style={{ fontSize: 11, opacity: 0.4 }}>🔒</span>
          <div style={{ flex: 1, fontFamily: "monospace", fontSize: 12, letterSpacing: "0.12em", color: phase === "success" ? "#4ade80" : "rgba(255,220,160,0.9)", minHeight: 16 }}>{typed.split("").map(() => "•").join("")}</div>
        </div>
      </div>
    </div>
  );
}

function MusicFeatureCard({ accent }: { accent: string }) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const song = MUSIC_TRACKS[activeIdx];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 68, width: "100%", justifyContent: "center" }}>
        {[32, 58, 78, 50, 68, 44, 62, 38, 72, 28].map((h, i) => (
          <motion.div key={i} animate={isPlaying ? { height: [h * 0.4, h, h * 0.35, h * 0.8] } : { height: 5 }} transition={isPlaying ? { repeat: Infinity, duration: 1 + i * 0.1, delay: i * 0.08, ease: "easeInOut" } : { duration: 0.5 }} style={{ flex: 1, minWidth: 0, borderRadius: "3px 3px 0 0", background: `linear-gradient(to top,${accent},rgba(201,168,76,0.12))` }} />
        ))}
      </div>
      <motion.div style={{ width: "100%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(18px)", borderRadius: 16, padding: "13px 18px", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,220,160,0.95)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
          <div style={{ fontSize: 10, color: "rgba(255,200,100,0.4)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.artist}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setActiveIdx((p) => (p - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "rgba(255,200,100,0.5)", fontSize: 8 }}>⏮</motion.button>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setIsPlaying((p) => !p)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer", background: `linear-gradient(135deg,${accent},${accent}bb)`, boxShadow: `0 0 14px ${accent}55`, fontSize: 11, color: "#1a0507" }}>{isPlaying ? "⏸" : "▶"}</motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setActiveIdx((p) => (p + 1) % MUSIC_TRACKS.length)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "rgba(255,200,100,0.5)", fontSize: 8 }}>⏭</motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureAnimation({ id, accent, onCycleDone }: { id: string; accent: string; onCycleDone?: () => void }) {
  switch (id) {
    case "ai":
      return <AIFeatureCard accent={accent} onCycleDone={onCycleDone} />;
    case "templates":
      return <TemplatesFeatureCard />;
    case "photos":
      return <PhotosFeatureCard />;
    case "music":
      return <MusicFeatureCard accent={accent} />;
    case "timer":
      return <TimerFeatureCard accent={accent} />;
    case "security":
      return <SecurityFeatureCard accent={accent} />;
    case "sharing":
      return <SharingFeatureCard accent={accent} />;
    case "blessings":
      return <BlessingsFeatureCard />;
    default:
      return null;
  }
}

export default function FeaturesSection() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  const TOT = FEATURES.length;
  const feat = FEATURES[active];
  const advanceRef = React.useRef<(() => void) | null>(null);

  const advance = React.useCallback(() => {
    setActive((a) => (a + 1) % TOT);
  }, [TOT]);

  advanceRef.current = advance;

  useEffect(() => {
    if (feat.id === "ai") return;
    const t = setTimeout(() => advance(), 5000);
    return () => clearTimeout(t);
  }, [active, feat.id, advance]);

  return (
    <section id="features" className="feat-section" style={{
      background: 'linear-gradient(170deg,#0d0102 0%,#120306 30%,#1c0508 60%,#0d0102 100%)',
      padding: '100px 0 0', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-5%', left: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(201,168,76,0.07)', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(201,168,76,0.07)', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,rgba(245,237,230,0.5) 50%,#c9a84c 75%,transparent)' }} />

      <div className="feat-inner" style={{ maxWidth: 1300, margin: '0 auto', padding: '0 60px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={stagger} style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(201,168,76,0.45)', padding: '7px 24px',
              fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#c9a84c',
              background: 'rgba(201,168,76,0.08)', backdropFilter: 'blur(8px)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', animation: 'pulseSlow 1.8s ease-in-out infinite' }} />
              FEATURES
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp}
            style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4.8vw,60px)', fontWeight: 700, color: '#f5ede6', letterSpacing: '-1.5px', lineHeight: 1.06, marginBottom: 10 }}>
            Everything you need to create<br />
            <em style={{ color: '#c9a84c', fontStyle: 'italic', textShadow: '0 0 40px rgba(201,168,76,0.3)' }}>unforgettable wishes</em>
          </motion.h2>
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 16 }}>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(to right,transparent,rgba(201,168,76,0.5))' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="akehan3.svg" aria-hidden="true" style={{ width: 20, height: 20, opacity: 0.5, filter: 'brightness(0) saturate(100%) invert(70%) sepia(48%) saturate(760%) hue-rotate(2deg) brightness(95%)' }} alt="" />
            <div style={{ width: 80, height: 1, background: 'linear-gradient(to left,transparent,rgba(201,168,76,0.5))' }} />
          </motion.div>
        </motion.div>

        {/* Main Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 56, alignItems: 'center', marginBottom: 72 }}
          className="feat-split">

          {/* Left: Showcase panel */}
          <div className="feat-showcase" style={{
            height: 480, borderRadius: 32, border: '1px solid rgba(201,168,76,0.18)',
            background: 'linear-gradient(145deg,#2a0608 0%,#1a0305 40%,#210507 100%)', overflow: 'hidden',
            position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(201,168,76,0.08)'
          }}>
            <div style={{ position: "absolute", top: 16, left: 18, display: "flex", alignItems: "center", gap: 7, zIndex: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#c9a84c", animation: "pulseSlow 1.6s ease-in-out infinite" }} />
              <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em", color: "rgba(201,168,76,0.5)", textTransform: "uppercase" }}>{feat.title}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                style={{ width: "100%", height: "100%" }}>
                <FeatureAnimation id={feat.id} accent={feat.accent} onCycleDone={() => advanceRef.current?.()} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Info panel */}
          <AnimatePresence mode="wait">
            <motion.div className="feat-info-panel" key={active}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              <div className="feat-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {feat.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '6px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.18em', textTransform: 'uppercase'
                  }}>{tag}</span>
                ))}
              </div>
              <h2 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 'clamp(28px,3.2vw,48px)', fontWeight: 700, color: '#f5ede6',
                letterSpacing: '-1px', lineHeight: 1.1, margin: 0
              }}>{feat.title}</h2>
              <p style={{ fontSize: 16, color: 'rgba(245,237,230,0.42)', lineHeight: 1.78, fontWeight: 300, margin: 0, maxWidth: 400 }}>{feat.desc}</p>
              <div className="feat-metric-row" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div className="feat-metric-block">
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: feat.accent, fontWeight: 700, lineHeight: 1 }}>{feat.metric}</div>
                  <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.22)', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>{feat.label}</div>
                </div>
                <div className="feat-metric-div" style={{ width: 1, height: 44, background: 'rgba(255,255,255,0.08)' }} />
                <motion.button className="feat-cta-btn"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                  onClick={() => router.push('/templates')}
                  style={{ height: 50, padding: '0 32px', background: '#c9a84c', color: '#1a0507', borderRadius: 25, fontWeight: 800, fontSize: 12, border: 'none', cursor: 'pointer', letterSpacing: '0.06em', boxShadow: '0 10px 28px rgba(201,168,76,0.25)' }}>
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot Navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, paddingBottom: 16, marginTop: -16, position: 'relative', zIndex: 1 }}>
        <motion.button
          whileHover={{ scale: 1.12, background: 'rgba(201,168,76,0.18)' }} whileTap={{ scale: 0.94 }}
          onClick={() => setActive((active - 1 + TOT) % TOT)}
          style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.32)', background: 'rgba(201,168,76,0.07)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </motion.button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {FEATURES.map((f, i) => (
            <motion.button key={i} onClick={() => setActive(i)}
              animate={{ width: i === active ? 26 : 7, background: i === active ? FEATURES[i].accent : 'rgba(201,168,76,0.2)', opacity: i === active ? 1 : 0.55 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={{ height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.12, background: 'rgba(201,168,76,0.18)' }} whileTap={{ scale: 0.94 }}
          onClick={() => setActive((active + 1) % TOT)}
          style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.32)', background: 'rgba(201,168,76,0.07)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
        </motion.button>
      </div>

      <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,rgba(245,237,230,0.5) 50%,#c9a84c 75%,transparent)', marginTop: 40 }} />

      <style>{`
        @media (max-width: 768px) {
          .feat-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
