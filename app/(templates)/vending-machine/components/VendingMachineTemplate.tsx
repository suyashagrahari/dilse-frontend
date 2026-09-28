"use client";

// ─── AFFECTION DISPENSER ─────────────────────────────────────────────────────
//
// The whole template is one physical object. The coil turns, the item tips off
// the lip, gravity takes it, and the thunk lands with the flap and the jolt on
// the same frame. Everything else on this page is packaging for that half
// second, so the ordering rules here are not stylistic:
//
//   · the coil PATH is redrawn per frame, so the spiral turns rather than the
//     item sliding over a static squiggle;
//   · the fall is transitioned with VEND.fallEasing — accelerating, never eased
//     out, never linear;
//   · the thunk, the tray flap and the body jolt are dispatched from one
//     synchronous call in one rAF tick;
//   · the motor audibly drops out for VEND.stutterMs at 40% of the rotation.
//
// Nothing is random. Tilt, tumble and surface wear all come from the seeded
// helpers so the machine looks identical on every reload and in every export.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { templateMedia } from "@/lib/templateMedia";
import {
  motor,
  setMuted,
  sfxBuzzer,
  sfxCoin,
  sfxRattle,
  sfxThunk,
  unlockAudio,
} from "@/lib/webAudio";
import {
  MACHINE_MODEL,
  MACHINE_SERIAL,
  RESERVED_MESSAGE,
  RESERVED_SLOT,
  VEND,
  isValidSlotCode,
  itemTiltFor,
  tumbleFor,
  type CreditAnswer,
  type Slot,
  type VendingMachineTemplateProps,
} from "./types";
import Coil, { COIL_LOOPS, coilPath } from "./Coil";
import CollectionTray from "./CollectionTray";
import Coupon from "./Coupon";
import CreditPrompt from "./CreditPrompt";
import DotMatrixDisplay from "./DotMatrixDisplay";
import Keypad from "./Keypad";
import ProductWindow, { ProductFace } from "./ProductWindow";
import useShakeToDislodge from "./useShakeToDislodge";
import useVendSequence, { P_AT_TIP } from "./useVendSequence";
import {
  BODY_PAD,
  C,
  COIL_H,
  COUPON_W,
  DISPLAY_H,
  DISPLAY_INNER_H,
  DISPLAY_INNER_W,
  ITEM_H,
  ITEM_W,
  MACHINE_W,
  MAIN_W,
  MAX_SCALE,
  MIN_SCALE,
  MONO,
  OSWALD,
  RAIL_GAP,
  RAIL_W,
  SLOT_W,
  TRAVEL,
  offsetWithin,
  scuffsFor,
} from "./machine";
import "./vending.css";
import { V, themeVars } from "../../_love/theme";
import { BrandBadge, GROTESK, ITALIC, LOVE_CSS, LoveSky, LoveThemeContext, GradText } from "../../_love/LoveKit";
import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { VM_FONT_VARS } from "./fonts";
import { machineVars, pickVendTheme } from "./themes";
import { alpha, PIXEL } from "./machine";
import MemoryVendor from "./MemoryVendor";
import ReceiptPrinter from "./ReceiptPrinter";

const TIP_DEG = 85;
const STUCK_DEG = 62;
const STUCK_STEP_DEG = 12;
const FLAP_TOTAL = VEND.flapOutMs + VEND.flapBackMs;
const ALL_GONE = "THAT WAS THE LAST ONE. RESTOCKING SOON.";

interface Fly {
  slot: Slot;
  x: number;
  y: number;
  tilt: number;
  fall: number;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export default function VendingMachineTemplate({ data, mode }: VendingMachineTemplateProps) {
  const reducedMotion = useReducedMotion();
  const live = mode === "live";
  const theme = pickVendTheme(data.theme);
  const rootVars = useMemo(() => ({ ...themeVars(theme), ...machineVars(theme) }), [theme]);

  // Memory cards collected this session → unlocks the receipt printer.
  const [collected, setCollected] = useState<number[]>([]);
  useEffect(() => setCollected([]), [data.photos]);
  const collectCard = useCallback((i: number) => setCollected((c) => (c.includes(i) ? c : [...c, i])), []);

  // ── machine state ─────────────────────────────────────────────────────────
  const [slots, setSlots] = useState<Slot[]>(data.slots);
  useEffect(() => setSlots(data.slots), [data.slots]);

  const [entry, setEntry] = useState("");
  const [credit, setCredit] = useState(0);
  const [creditShown, setCreditShown] = useState(0);
  const [answers, setAnswers] = useState<CreditAnswer[]>([]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [promptOpen, setPromptOpen] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [tray, setTray] = useState<Slot[]>([]);
  const [trayExpanded, setTrayExpanded] = useState(false);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<Record<string, boolean>>({});
  const [muted, setMutedUI] = useState(true);
  const [touchedSound, setTouchedSound] = useState(false);
  const [displayText, setDisplayText] = useState<string | null>(null);
  const [displayFlash, setDisplayFlash] = useState(false);
  const [fly, setFly] = useState<Fly | null>(null);
  const [fallHard, setFallHard] = useState(false);
  const [creditToast, setCreditToast] = useState(false);
  const [issued, setIssued] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const [shellH, setShellH] = useState(0);

  const allSoldOut = useMemo(() => slots.every((s) => s.soldOut), [slots]);
  const idleText = useMemo(() => data.displayIdleMessages.join("  ·  "), [data.displayIdleMessages]);
  const prompt = data.creditPrompts[promptIdx % Math.max(1, data.creditPrompts.length)] ?? "SAY SOMETHING";
  const scuffs = useMemo(() => scuffsFor(data.machineName || "machine", 4, MACHINE_W, 700), [data.machineName]);

  // ── refs ──────────────────────────────────────────────────────────────────
  const outerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const travelRef = useRef<HTMLDivElement>(null);
  const bounceRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const coilEls = useRef<{ front: SVGPathElement; back: SVGPathElement; glint: SVGPathElement } | null>(null);
  const motorStop = useRef<(() => void) | null>(null);
  const timers = useRef<number[]>([]);
  const audioReady = useRef(false);
  const creditRef = useRef(0);
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);
  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    // Starts muted. Nothing can make a sound until the toggle is flipped.
    setMuted(true);
    const d = new Date();
    setIssued(
      `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`,
    );
    return () => {
      motorStop.current?.();
      motorStop.current = null;
    };
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  /** unlockAudio() on the FIRST user gesture and never on load. */
  const ensureAudio = useCallback(() => {
    if (audioReady.current) return;
    audioReady.current = true;
    unlockAudio();
  }, []);

  // ── fit to viewport: scale, never reflow ──────────────────────────────────
  useEffect(() => {
    const measure = () => {
      const avail = outerRef.current?.clientWidth ?? MACHINE_W;
      const h = shellRef.current?.offsetHeight ?? 0;
      const byWidth = Math.min(avail, 480) / MACHINE_W;
      const byHeight = h > 0 ? (window.innerHeight - 28) / h : byWidth;
      // Height-fitting may shrink the unit so the whole machine is on screen at
      // once, but never past MIN_SCALE — below that a keycap would compute to
      // less than 44px and the keypad would stop being a keypad.
      const cap = Math.min(byWidth, MAX_SCALE);
      setScale(Math.max(Math.min(cap, byHeight), MIN_SCALE));
      if (h > 0) setShellH(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    if (shellRef.current) ro.observe(shellRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  // ── credit readout rolls mechanically ─────────────────────────────────────
  useEffect(() => {
    creditRef.current = credit;
    let cur = creditShown;
    if (Math.abs(cur - credit) < 0.001) return;
    const step = credit > cur ? 0.1 : -0.1;
    const id = window.setInterval(() => {
      cur = Math.round((cur + step) * 10) / 10;
      if ((step > 0 && cur >= credit) || (step < 0 && cur <= credit)) {
        window.clearInterval(id);
        setCreditShown(credit);
      } else {
        setCreditShown(cur);
      }
    }, 26);
    return () => window.clearInterval(id);
    // creditShown deliberately excluded: this effect drives it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credit]);

  // ── display helpers ───────────────────────────────────────────────────────
  const toIdle = useCallback(() => {
    setDisplayFlash(false);
    setDisplayText(null);
  }, []);

  const show = useCallback(
    (text: string, holdMs?: number, flash = false) => {
      clearTimers();
      setDisplayFlash(flash);
      setDisplayText(text);
      if (holdMs) later(holdMs, toIdle);
    },
    [clearTimers, later, toIdle],
  );

  // ── the sequence ──────────────────────────────────────────────────────────
  const vend = useVendSequence(reducedMotion, {
    onStart: (slot) => {
      const shell = shellRef.current;
      let geom = { x: 0, y: 0, fall: 240 };
      if (shell) {
        const itemEl = shell.querySelector<HTMLElement>(`[data-item="${slot.code}"]`);
        const floorEl = shell.querySelector<HTMLElement>("[data-tray-floor]");
        if (itemEl && floorEl) {
          const a = offsetWithin(itemEl, shell);
          const b = offsetWithin(floorEl, shell);
          geom = { x: a.x, y: a.y, fall: Math.max(40, b.y - (a.y + ITEM_H)) };
        }
        const coilEl = shell.querySelector<SVGSVGElement>(`[data-coil="${slot.code}"]`);
        const front = coilEl?.querySelector<SVGPathElement>(".vm-coil-front") ?? null;
        const back = coilEl?.querySelector<SVGPathElement>(".vm-coil-back") ?? null;
        const glint = coilEl?.querySelector<SVGPathElement>(".vm-coil-glint") ?? null;
        coilEls.current = front && back && glint ? { front, back, glint } : null;
      }

      setFallHard(false);
      setFly({
        slot,
        x: geom.x,
        y: geom.y,
        tilt: itemTiltFor(slot.code, slot.code.charCodeAt(1)),
        fall: geom.fall,
      });
      if (travelRef.current) travelRef.current.style.transform = "translate3d(0,0,0)";

      setCredit((c) => Math.max(0, Math.round((c - slot.price) * 100) / 100));
      show("VENDING");
      motorStop.current?.();
      motorStop.current = motor({ freq: 76, gain: 0.13 });
    },

    // The spiral turns: the path itself is regenerated every frame.
    onCoilFrame: (p) => {
      const els = coilEls.current;
      if (els) {
        const phase = p * Math.PI * 2; // exactly one revolution
        const w = SLOT_W - 4;
        const front = coilPath(w, COIL_H, phase, 0);
        els.front.setAttribute("d", front);
        els.glint.setAttribute("d", front);
        els.back.setAttribute("d", coilPath(w, COIL_H, phase, 1));
      }
      const el = travelRef.current;
      if (el) {
        const advance = TRAVEL * Math.min(1, p / P_AT_TIP);
        const wobble = Math.sin(p * Math.PI * 2 * COIL_LOOPS);
        el.style.transform = `translate3d(${advance.toFixed(2)}px, ${wobble.toFixed(2)}px, 0)`;
      }
    },

    // Real motors stutter. Cutting the voice is the honest way to do it.
    onStutter: (on) => {
      if (on) {
        motorStop.current?.();
        motorStop.current = null;
      } else if (!motorStop.current) {
        motorStop.current = motor({ freq: 74, gain: 0.13 });
      }
    },

    onTip: () => {},

    onStuck: () => {
      motorStop.current?.();
      motorStop.current = null;
      show("PLEASE COLLECT ITEM");
      later(1500, () => {
        setDisplayFlash(true);
        setDisplayText("ITEM STUCK — SHAKE MACHINE");
      });
    },

    onShakeProgress: (count, direction) => {
      sfxRattle();
      const shell = shellRef.current;
      if (shell && !reducedRef.current) {
        shell.animate(
          [
            { transform: "translateX(0)" },
            { transform: `translateX(${6 * direction}px)`, offset: 0.28 },
            { transform: `translateX(${-2 * direction}px)`, offset: 0.62 },
            { transform: "translateX(0)" },
          ],
          { duration: 260, easing: "cubic-bezier(.2,.8,.3,1)" },
        );
      }
      if (count < VEND.shakesRequired) {
        setDisplayFlash(true);
        setDisplayText("ITEM STUCK — SHAKE MACHINE");
      }
    },

    onFall: (hard) => {
      setFallHard(hard);
      motorStop.current?.();
      motorStop.current = null;
    },

    // ── IMPACT — one call, one frame ────────────────────────────────────────
    onImpact: (hard) => {
      sfxThunk();
      // A shaken-loose item lands heavier. Same voice, doubled — not a new one.
      if (hard) sfxThunk();
      if (reducedRef.current) return;
      const flapDeg = hard ? -46 : -30;
      const flapMs = hard ? Math.round(FLAP_TOTAL * 1.4) : FLAP_TOTAL;
      flapRef.current?.animate(
        [
          { transform: "rotateX(0deg)" },
          { transform: `rotateX(${flapDeg}deg)`, offset: VEND.flapOutMs / FLAP_TOTAL },
          { transform: "rotateX(5deg)", offset: 0.74 },
          { transform: "rotateX(0deg)" },
        ],
        { duration: flapMs, easing: "cubic-bezier(.3,0,.35,1)" },
      );
      shellRef.current?.animate(
        [
          { transform: "translateY(0)" },
          { transform: "translateY(2px)", offset: 0.38 },
          { transform: "translateY(0)" },
        ],
        { duration: VEND.joltMs, easing: "cubic-bezier(.25,.1,.3,1)" },
      );
      bounceRef.current?.animate(
        [
          { transform: "translateY(0)" },
          { transform: "translateY(-6px)", offset: 0.45 },
          { transform: "translateY(0)" },
        ],
        { duration: 200, easing: "cubic-bezier(.3,0,.4,1)" },
      );
    },

    onCollect: (slot, reason) => {
      setSlots((prev) => prev.map((s) => (s.code === slot.code ? { ...s, soldOut: true } : s)));
      setTray((prev) => [...prev, slot]);
      setFly(null);
      coilEls.current = null;
      clearTimers();
      setDisplayFlash(false);
      setDisplayText(reason === "shake" ? "FINALLY." : "PLEASE COLLECT ITEM");
      if (reason === "shake") later(900, () => setDisplayText("PLEASE COLLECT ITEM"));
    },

    onIdle: () => {
      setEntry("");
      toIdle();
    },

    onOverride: () => {
      setDisplayFlash(false);
      setDisplayText("MAINTENANCE OVERRIDE");
    },
  });

  const stuck = vend.stage === "stuck";
  const { permission, requestPermission, manualShake, needsButton } = useShakeToDislodge({
    active: stuck,
    onShake: (dir) => vend.registerShake(dir),
  });

  // ── keypad ────────────────────────────────────────────────────────────────
  const attemptCode = useCallback(
    (raw: string) => {
      const code = raw.toUpperCase();

      if (!isValidSlotCode(code)) {
        sfxBuzzer();
        show("INVALID SELECTION", 1600);
        setEntry("");
        return;
      }
      // A1 is checked first, on purpose: it is force-sold-out by the contract and
      // would otherwise never get to make its joke.
      if (code === RESERVED_SLOT) {
        show(RESERVED_MESSAGE, 2000);
        setEntry("");
        return;
      }
      const slot = slots.find((s) => s.code === code);
      if (!slot) {
        sfxBuzzer();
        show("INVALID SELECTION", 1600);
        setEntry("");
        return;
      }
      if (slot.soldOut) {
        sfxBuzzer();
        clearTimers();
        setDisplayFlash(false);
        for (let i = 0; i < 6; i++) later(i * 200, () => setDisplayText(i % 2 === 0 ? "SOLD OUT" : ""));
        later(1200, toIdle);
        setEntry("");
        return;
      }
      if (creditRef.current < slot.price) {
        sfxBuzzer();
        show("INSERT CREDIT", 1500);
        setEntry("");
        // Never a dead end: put the way to earn credit straight in front of them.
        later(700, () => setPromptOpen(true));
        return;
      }
      // The stuck path needs motion permission, and iOS only grants it from
      // inside the gesture that is running right now.
      if (slot.sticks && permission === "prompt") void requestPermission();
      setOpenCode(null);
      vend.begin(slot);
    },
    [slots, show, clearTimers, later, toIdle, permission, requestPermission, vend],
  );

  const onKey = useCallback(
    (key: string) => {
      ensureAudio();

      if (key === "CLEAR") {
        setEntry("");
        if (!vend.busy) toIdle();
        return;
      }

      if (key === "ENTER") {
        if (vend.busy) return;
        if (!entry) {
          if (allSoldOut) {
            sfxBuzzer();
            show(ALL_GONE, 2600);
            return;
          }
          setPromptOpen(true);
          return;
        }
        if (entry.length < 2) {
          sfxBuzzer();
          show("INVALID SELECTION", 1400);
          setEntry("");
          return;
        }
        attemptCode(entry);
        return;
      }

      // Rapid mashing must never queue a second vend.
      if (vend.busy) return;

      if (/^[ABC]$/.test(key)) {
        setEntry(key);
        show(key);
        return;
      }
      if (!entry) {
        sfxBuzzer();
        show("SELECT ROW A B C", 1400);
        return;
      }
      const next = `${entry[0]}${key}`;
      setEntry(next);
      show(next);
    },
    [ensureAudio, vend.busy, entry, allSoldOut, attemptCode, show, toIdle],
  );

  // ── credit ────────────────────────────────────────────────────────────────
  const openCoinSlot = useCallback(() => {
    ensureAudio();
    if (allSoldOut) {
      sfxBuzzer();
      show(ALL_GONE, 2600);
      return;
    }
    setPromptOpen(true);
  }, [ensureAudio, allSoldOut, show]);

  const grantCredit = useCallback(() => {
    sfxCoin();
    setCredit((c) => Math.round((c + 1) * 100) / 100);
    setCreditToast(true);
    show("CREDIT ACCEPTED", 1600);
    later(2400, () => setCreditToast(false));
  }, [show, later]);

  const submitAnswer = useCallback(() => {
    const text = answerText.trim();
    if (!text) return;
    ensureAudio();
    // TODO(server): POST { prompt, answer } to the sender's page document. Sender
    // only — never aggregated, never reused. See PRIVACY_NOTICE in types.ts, which
    // is rendered above this field before anything can be submitted.
    setAnswers((prev: CreditAnswer[]) => [...prev, { prompt, answer: text }]);
    setAnswerText("");
    setPromptIdx((i) => i + 1);
    setPromptOpen(false);
    grantCredit();
  }, [answerText, ensureAudio, prompt, grantCredit]);

  // ── coupon ────────────────────────────────────────────────────────────────
  const openSlot = openCode ? (slots.find((s) => s.code === openCode) ?? null) : null;

  const downloadCoupon = useCallback(async () => {
    if (!openSlot) return;
    setSaving(true);
    setExporting(true);
    await new Promise((r) => window.setTimeout(r, 40));
    const node = paperRef.current;
    const height = node ? Math.ceil(node.scrollHeight) : 480;
    const result = await exportNodeToPng(node, {
      width: COUPON_W,
      height,
      filename: `${fileSlug(data.machineName, "coupon")}-${openSlot.code.toLowerCase()}`,
      backgroundColor: C.paper,
    });
    setExporting(false);
    setSaving(false);
    show(result.ok ? "SAVED." : "SAVE FAILED", 1600);
  }, [openSlot, data.machineName, show]);

  // ── derived render values ─────────────────────────────────────────────────
  const stuckDeg = STUCK_DEG + Math.min(vend.shakes, VEND.shakesRequired - 1) * STUCK_STEP_DEG;

  let dropStyle: React.CSSProperties = { transformOrigin: "100% 100%" };
  if (fly) {
    const tumble = tumbleFor(fly.slot.code);
    if (vend.stage === "tip") {
      dropStyle = {
        transformOrigin: "100% 100%",
        transform: `translateY(0px) rotate(${TIP_DEG}deg)`,
        transition: reducedMotion ? undefined : `transform ${VEND.tipMs}ms cubic-bezier(.45,0,.75,1)`,
      };
    } else if (vend.stage === "stuck") {
      dropStyle = {
        transformOrigin: "100% 100%",
        transform: `translateY(0px) rotate(${stuckDeg}deg)`,
        transition: reducedMotion ? undefined : "transform 180ms cubic-bezier(.3,0,.4,1)",
      };
    } else if (vend.stage === "fall" || vend.stage === "impact" || vend.stage === "settle") {
      const from = fallHard ? STUCK_DEG + (VEND.shakesRequired - 1) * STUCK_STEP_DEG : TIP_DEG;
      dropStyle = {
        transformOrigin: "100% 100%",
        transform: `translateY(${fly.fall}px) rotate(${from + tumble}deg)`,
        // Gravity accelerates. This easing is the product.
        transition:
          reducedMotion || vend.stage !== "fall"
            ? undefined
            : `transform ${VEND.fallMs}ms ${VEND.fallEasing}`,
      };
    }
  }

  const railBtn: React.CSSProperties = {
    width: RAIL_W - 6,
    fontFamily: OSWALD,
    fontSize: 8,
    letterSpacing: "0.14em",
    color: C.keyInk,
    background: `linear-gradient(180deg, ${C.keyHi} 0%, ${C.keyLo} 100%)`,
    border: `1px solid ${C.edge}`,
    borderRadius: 2,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.12), 0 1px 0 rgba(0,0,0,.5)",
    touchAction: "manipulation",
  };

  // ──────────────────────────────────────────────────────────────────────────
  const photos = data.photos;
  const hasCards = photos.length > 0;

  return (
    <LoveThemeContext.Provider value={theme}>
    <div
      className={`vm-root lv-root ${VM_FONT_VARS} ${DATE_FONT_VARS}`}
      style={{
        ...rootVars,
        position: "relative",
        minHeight: "100dvh",
        color: V.ink,
        fontFamily: GROTESK,
        overflowX: "clip",
      }}
      onPointerDownCapture={ensureAudio}
    >
      <style>{LOVE_CSS}</style>
      <LoveSky theme={theme} reduceMotion={reducedMotion} />

      {/*
        The thunk is the product. It is also muted by default, because autoplay
        policy forbids sound before a gesture and because a gift link opened on
        a bus should not blare. Ask once, in the machine's own voice, with both
        answers equally available. Session state only; no storage.
      */}
      {!touchedSound && (
        <div
          role="group"
          aria-label="Sound"
          className="vm-sound-ask"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            transform: "translateX(-50%)",
            zIndex: 95,
            width: "min(calc(100vw - 24px), 420px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "8px 8px 8px 16px",
            borderRadius: 999,
            background: `linear-gradient(180deg, ${C.plateHi}, ${C.plateLo})`,
            border: `1px solid ${alpha(C.sign, 30)}`,
            boxShadow: `0 18px 40px -18px ${V.shadow}`,
          }}
        >
          <span style={{ fontFamily: PIXEL, fontSize: 10.5, letterSpacing: ".06em", color: C.sign, lineHeight: 1.35 }}>
            🔊 this machine
            <br />
            makes noise
          </span>
          <span style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => {
                ensureAudio();
                setMuted(false);
                setMutedUI(false);
                setTouchedSound(true);
                sfxCoin();
              }}
              className="lv-focus"
              style={{
                minHeight: 44,
                padding: "0 16px",
                background: V.grad,
                color: "#fff",
                borderRadius: 999,
                fontFamily: GROTESK,
                fontSize: 13.5,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Sound on
            </button>
            <button
              type="button"
              onClick={() => setTouchedSound(true)}
              className="lv-focus"
              style={{
                minHeight: 44,
                padding: "0 14px",
                color: C.sign,
                border: `1px solid ${alpha(C.sign, 35)}`,
                borderRadius: 999,
                fontFamily: GROTESK,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Stay quiet
            </button>
          </span>
        </div>
      )}

      {live && <BrandBadge />}

      <div className="vm-page" style={{ position: "relative", zIndex: 1 }}>
        {/* ── intro ─────────────────────────────────────────────────────── */}
        <header className="vm-intro" style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontFamily: PIXEL, fontSize: 10.5, letterSpacing: ".14em", color: V.soft }}>
            INSERT FEELINGS ✦ RECEIVE LOVE
          </p>
          <h1
            style={{
              margin: "6px 0 0",
              fontFamily: GROTESK,
              fontWeight: 800,
              fontSize: "clamp(30px, 8.4vw, 46px)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: V.ink,
              overflowWrap: "anywhere",
            }}
          >
            for{" "}
            <GradText style={{ fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.015em", paddingRight: 4 }}>
              {data.recipientName || "you"}
            </GradText>
          </h1>
          <p style={{ margin: "8px auto 0", maxWidth: 360, fontSize: 13.5, lineHeight: 1.45, color: V.soft }}>
            {data.senderName || "Someone"} stocked a machine with {hasCards ? `17 little things, ${photos.length} limited-edition memor${photos.length === 1 ? "y" : "ies"}` : "17 little things"} and one receipt.
          </p>
          <ol className="vm-steps" aria-label="How it works">
            <li><span>1</span> punch a code</li>
            {hasCards && <li><span>2</span> pull the cards</li>}
            <li><span>{hasCards ? 3 : 2}</span> print the prize</li>
          </ol>
        </header>

        <div className="vm-layout">
        <div className="vm-col-machine">
      {/* ── the object ───────────────────────────────────────────────────── */}
      <div
        ref={outerRef}
        style={{
          maxWidth: 480,
          margin: "0 auto",
          // Pan rather than clip on anything narrower than the tap-target floor
          // allows. overflowY is pinned so a scrollbar can never feed back into
          // the width measurement and oscillate the scale.
          overflowX: "auto",
          overflowY: "hidden",
          height: shellH ? shellH * scale : undefined,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          <div
            ref={shellRef}
            style={{
              position: "relative",
              width: MACHINE_W,
              flex: "0 0 auto",
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              padding: BODY_PAD,
              background: `linear-gradient(90deg, ${C.bodyDark} 0%, ${C.body} 14%, ${C.bodyLight} 42%, ${C.body} 66%, ${C.bodyDark} 100%)`,
              border: `1px solid ${C.edge}`,
              boxShadow: "0 18px 44px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.1)",
            }}
          >
            {/* seeded surface wear */}
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {scuffs.map((s, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: s.left,
                    top: s.top,
                    width: s.w,
                    height: s.h,
                    borderRadius: s.radius,
                    transform: `rotate(${s.rot}deg)`,
                    background: "#ffffff",
                    opacity: s.opacity,
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: RAIL_GAP, position: "relative" }}>
              {/* ── main face ──────────────────────────────────────────── */}
              <div style={{ width: MAIN_W, flex: "0 0 auto" }}>
                {/* header */}
                <div
                  style={{
                    background: `linear-gradient(180deg, ${C.plateLo} 0%, ${C.plateHi} 55%, ${C.plateLo} 100%)`,
                    border: `1px solid ${C.edge}`,
                    padding: "8px 10px 6px",
                    marginBottom: 8,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
                  }}
                >
                  <h1
                    style={{
                      margin: 0,
                      fontFamily: OSWALD,
                      fontWeight: 600,
                      fontSize: 25,
                      lineHeight: 1.05,
                      letterSpacing: "0.16em",
                      color: C.sign,
                      textTransform: "uppercase",
                      textShadow: `0 0 12px ${C.signGlow}, 0 0 3px ${C.signGlow}, 0 1px 0 rgba(0,0,0,.6)`,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {data.machineName}
                  </h1>
                  <div
                    style={{
                      marginTop: 5,
                      display: "inline-block",
                      padding: "2px 6px",
                      background: "linear-gradient(180deg,#8e9c9a 0%,#5d6d6b 100%)",
                      border: "1px solid #0a1a1c",
                      fontFamily: OSWALD,
                      fontSize: 8,
                      letterSpacing: "0.2em",
                      color: "#0d1c1e",
                    }}
                  >
                    {MACHINE_MODEL} · SERIAL {MACHINE_SERIAL}
                  </div>
                </div>

                <ProductWindow
                  slots={slots}
                  hiddenCode={fly?.slot.code ?? null}
                  activeCode={vend.stage === "coil" ? (fly?.slot.code ?? null) : null}
                  coilMs={VEND.coilRotateMs}
                />

                {/* dot matrix */}
                <div style={{ marginTop: 8 }}>
                  <DotMatrixDisplay
                    idleText={allSoldOut ? ALL_GONE : idleText}
                    text={displayText}
                    flash={displayFlash}
                    width={DISPLAY_INNER_W}
                    height={DISPLAY_INNER_H}
                    color={theme.machine.led}
                    dimColor={theme.machine.ledDim}
                  />
                </div>

                {/* credit readout */}
                <div
                  style={{
                    marginTop: 6,
                    height: DISPLAY_H,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 9px",
                    background: "#040806",
                    border: "1px solid #000",
                    boxShadow: "inset 0 2px 5px rgba(0,0,0,.9)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: OSWALD,
                      fontSize: 9,
                      letterSpacing: "0.28em",
                      color: C.green,
                      opacity: 0.6,
                    }}
                  >
                    CREDIT
                  </span>
                  <span
                    aria-live="polite"
                    style={{
                      fontFamily: MONO,
                      fontSize: 17,
                      letterSpacing: "0.16em",
                      color: C.green,
                      textShadow: `0 0 8px ${C.green}`,
                    }}
                  >
                    ₹{creditShown.toFixed(2)}
                  </span>
                </div>

                {/* coin slot */}
                <button
                  type="button"
                  onClick={openCoinSlot}
                  disabled={allSoldOut}
                  aria-label="Insert credit"
                  style={{
                    marginTop: 6,
                    width: "100%",
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 10px",
                    background: `linear-gradient(180deg, ${C.well} 0%, ${C.well2} 100%)`,
                    border: `1px solid ${C.edge}`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
                    opacity: allSoldOut ? 0.5 : 1,
                    cursor: allSoldOut ? "default" : "pointer",
                    touchAction: "manipulation",
                  }}
                >
                  <span
                    style={{
                      fontFamily: OSWALD,
                      fontSize: 10,
                      letterSpacing: "0.24em",
                      color: C.ink,
                      opacity: 0.8,
                    }}
                  >
                    INSERT
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      flex: 1,
                      height: 7,
                      background: "linear-gradient(180deg,#000 0%,#0a1416 60%,#16292b 100%)",
                      border: `1px solid ${C.edge}`,
                      borderRadius: 1,
                      boxShadow: "inset 0 2px 3px rgba(0,0,0,.95), 0 1px 0 rgba(255,255,255,.08)",
                    }}
                  />
                </button>

                <div style={{ marginTop: 6 }}>
                  {/* Input is locked for the whole sequence: mashing the pad
                      must never queue a second vend. */}
                  <Keypad onKey={onKey} disabled={vend.busy} />
                </div>

                <div style={{ marginTop: 8 }}>
                  <CollectionTray
                    items={tray}
                    flapRef={flapRef}
                    expanded={trayExpanded}
                    onToggleExpanded={() => setTrayExpanded((v) => !v)}
                    onOpen={(code) => {
                      ensureAudio();
                      setOpenCode(code);
                    }}
                  />
                </div>
              </div>

              {/* ── service rail ───────────────────────────────────────── */}
              <div
                style={{
                  width: RAIL_W,
                  flex: "0 0 auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  paddingTop: 2,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    ensureAudio();
                    const next = !muted;
                    setMuted(next);
                    setMutedUI(next);
                    setTouchedSound(true);
                    if (!next) sfxCoin();
                  }}
                  aria-label={muted ? "Turn sound on" : "Turn sound off"}
                  style={{
                    ...railBtn,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: muted ? C.keyInk : C.red,
                    borderColor: !touchedSound ? C.amber : undefined,
                  }}
                >
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    {muted ? "SOUND OFF" : "SOUND ON"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    ensureAudio();
                    if (!stuck) return;
                    manualShake(1);
                  }}
                  disabled={!stuck}
                  aria-label="Shake the machine"
                  style={{
                    ...railBtn,
                    height: 74,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: stuck ? 1 : 0.42,
                    background: stuck
                      ? `linear-gradient(180deg, ${C.red} 0%, color-mix(in srgb, ${C.red} 70%, #000) 100%)`
                      : `linear-gradient(180deg, ${C.keyHi} 0%, ${C.keyLo} 100%)`,
                    color: stuck ? "#fff" : C.keyInk,
                  }}
                >
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 10 }}>
                    SHAKE
                    {stuck ? ` ${vend.shakes}/${VEND.shakesRequired}` : ""}
                  </span>
                </button>

                {/* vents */}
                <div aria-hidden="true" style={{ width: RAIL_W - 10, marginTop: 2 }}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: 2,
                        marginBottom: 3,
                        background: "rgba(0,0,0,.42)",
                        boxShadow: "0 1px 0 rgba(255,255,255,.08)",
                      }}
                    />
                  ))}
                </div>

                <div
                  aria-hidden="true"
                  style={{
                    marginTop: "auto",
                    writingMode: "vertical-rl",
                    fontFamily: OSWALD,
                    fontSize: 7,
                    letterSpacing: "0.28em",
                    color: C.ink,
                    opacity: 0.35,
                    paddingBottom: 6,
                  }}
                >
                  REGISTRAR OF HEARTS
                </div>
              </div>

              {/* ── peeling sticker, ignored by everyone ────────────────── */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: MAIN_W - 78,
                  top: 44,
                  transform: "rotate(-7deg)",
                  zIndex: 9,
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,.5))",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    padding: "3px 7px",
                    background: "linear-gradient(180deg,#efe7cf 0%,#d9cfae 100%)",
                    border: "1px solid #8d8161",
                    fontFamily: OSWALD,
                    fontSize: 8,
                    letterSpacing: "0.18em",
                    color: "#7a3b32",
                  }}
                >
                  OUT OF ORDER
                  <span
                    style={{
                      position: "absolute",
                      right: -1,
                      bottom: -1,
                      width: 13,
                      height: 13,
                      background: "linear-gradient(315deg,#b9ae8d 0%,#efe7cf 70%)",
                      clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                      transform: "rotate(-6deg)",
                      boxShadow: "-1px -1px 2px rgba(0,0,0,.35)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── the airborne item: under the glass, above the shelves ── */}
            {fly && !reducedMotion && (
              <div
                style={{
                  position: "absolute",
                  left: fly.x,
                  top: fly.y,
                  width: ITEM_W,
                  height: ITEM_H,
                  zIndex: 6,
                  pointerEvents: "none",
                }}
              >
                <div ref={travelRef} style={{ willChange: "transform" }}>
                  {/* the bounce sits OUTSIDE the rotation, or "up 6px" would be
                      up-6px-in-the-item's-frame, i.e. sideways */}
                  <div ref={bounceRef}>
                    <div style={dropStyle}>
                      <div className={stuck ? "vm-jitter" : undefined}>
                        <ProductFace slot={fly.slot} tilt={fly.tilt} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── everything below the machine ─────────────────────────────────── */}
      <div style={{ maxWidth: 480, margin: "14px auto 0", display: "grid", gap: 12 }}>
        {creditToast && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              background: V.glass,
              border: `1px solid ${V.edge}`,
              borderRadius: 18,
            }}
          >
            {!reducedMotion && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={templateMedia("vending-machine", "credit-accepted.webp")}
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 12 }}
              />
            )}
            <span style={{ fontFamily: PIXEL, fontSize: 12, letterSpacing: "0.08em", color: V.ink }}>
              CREDIT ACCEPTED ✦ PUNCH A CODE
            </span>
          </div>
        )}

        {stuck && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              background: V.glass,
              border: `1.5px solid ${C.red}`,
              borderRadius: 18,
            }}
          >
            {!reducedMotion && (
              <video
                src={templateMedia("vending-machine", "shake-it.webm")}
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                style={{ width: 76, height: 76, objectFit: "contain", flex: "0 0 auto" }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: OSWALD,
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  color: V.ink,
                }}
              >
                IT&apos;S STUCK. SHAKE IT. ({vend.shakes}/{VEND.shakesRequired})
              </p>
              <p style={{ margin: "3px 0 8px", fontFamily: GROTESK, fontSize: 12, color: V.soft }}>
                {needsButton
                  ? "No motion sensor here — use the button."
                  : "Shake your phone, or press the button."}
              </p>
              <button
                type="button"
                onClick={() => {
                  ensureAudio();
                  manualShake(1);
                }}
                style={{
                  height: 44,
                  padding: "0 18px",
                  fontFamily: OSWALD,
                  fontSize: 14,
                  letterSpacing: "0.2em",
                  color: "#fff",
                  background: C.red,
                  border: "none",
                  borderRadius: 999,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 3px 0 rgba(0,0,0,.25)",
                  touchAction: "manipulation",
                }}
              >
                SHAKE
              </button>
            </div>
          </div>
        )}

        {promptOpen && !allSoldOut && (
          <CreditPrompt
            prompt={prompt}
            senderName={data.senderName}
            value={answerText}
            onChange={setAnswerText}
            onSubmit={submitAnswer}
            onSkip={() => setPromptIdx((i) => i + 1)}
            onClose={() => setPromptOpen(false)}
            freeCreditAvailable={answers.length >= 3}
            onFreeCredit={() => {
              setPromptOpen(false);
              grantCredit();
            }}
            reducedMotion={reducedMotion}
          />
        )}

        {openSlot && (
          <Coupon
            slot={openSlot}
            machineName={data.machineName}
            issued={issued}
            redeemed={!!redeemed[openSlot.code]}
            onRedeem={() => {
              ensureAudio();
              sfxCoin();
              setRedeemed((r) => ({ ...r, [openSlot.code]: true }));
            }}
            onDownload={downloadCoupon}
            onClose={() => setOpenCode(null)}
            paperRef={paperRef}
            exporting={exporting}
            reducedMotion={reducedMotion}
            saving={saving}
          />
        )}

        {allSoldOut && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px",
              border: `1px solid ${V.edge}`,
              background: V.glass,
              borderRadius: 18,
            }}
          >
            {!reducedMotion && (
              <video
                src={templateMedia("vending-machine", "sold-out.webm")}
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                style={{ width: 92, height: 92, objectFit: "contain", flex: "0 0 auto" }}
              />
            )}
            <div>
              <p
                style={{
                  margin: 0,
                  fontFamily: OSWALD,
                  fontSize: 14,
                  letterSpacing: "0.14em",
                  color: V.ink,
                }}
              >
                {ALL_GONE}
              </p>
              <p style={{ margin: "4px 0 0", fontFamily: GROTESK, fontSize: 12.5, color: V.soft }}>
                {data.recipientName}, that&apos;s the whole machine. Tap anything in the tray to read it again{hasCards ? " — and don't forget the cards." : "."}
              </p>
            </div>
          </div>
        )}

        <p
          style={{
            margin: 0,
            fontFamily: GROTESK,
            fontSize: 12,
            lineHeight: 1.5,
            color: V.faint,
            textAlign: "center",
          }}
        >
          Punch a row (A/B/C), then a number, then ENTER. Credit comes from answering the machine.
        </p>
      </div>
        </div>

        {/* ── the story column: memory cards, then the receipt ─────────── */}
        <div className="vm-col-story">
          {hasCards && (
            <MemoryVendor
              photos={photos}
              gifs={data.gifs}
              senderName={data.senderName}
              recipientName={data.recipientName}
              ledColor={theme.machine.led}
              ledDim={theme.machine.ledDim}
              pulledOn={issued}
              reducedMotion={reducedMotion}
              collected={collected}
              onCollect={collectCard}
            />
          )}
          <ReceiptPrinter
            machineName={data.machineName}
            senderName={data.senderName}
            recipientName={data.recipientName}
            letter={data.letter}
            photos={photos}
            slots={slots}
            gifs={data.gifs}
            collectedCount={collected.length}
            issued={issued}
            ledColor={theme.machine.led}
            ledDim={theme.machine.ledDim}
            reducedMotion={reducedMotion}
          />
          {live && (
            <Link
              href="/templates"
              className="lv-focus"
              style={{
                display: "block",
                margin: "8px auto 0",
                textAlign: "center",
                fontFamily: GROTESK,
                fontSize: 13,
                fontWeight: 700,
                color: V.soft,
                textDecoration: "none",
              }}
            >
              Stock a machine for someone ↗
            </Link>
          )}
        </div>
        </div>
      </div>

      {/* A screen-reader route through the machine that does not depend on any
          of the above being visible or animated. */}
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        <p>
          {data.senderName} left {data.recipientName} eighteen things in a vending machine. Answers you type
          go to {data.senderName} only.
        </p>
        {answers.length > 0 && <p>{answers.length} answers inserted.</p>}
      </div>

      {/* Idle coil parked off-screen keeps the SVG gradient warm for the first
          vend on Safari, which otherwise flashes an unstyled stroke. */}
      <div aria-hidden="true" style={{ position: "absolute", left: -9999, top: -9999 }}>
        <Coil code="warm" w={SLOT_W - 4} h={COIL_H} />
      </div>
    </div>
    </LoveThemeContext.Provider>
  );
}
