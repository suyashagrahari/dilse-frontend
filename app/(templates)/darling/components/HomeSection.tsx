"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Mail, Clock, X, Sparkles } from "lucide-react";
import {
  type ContentData,
  type TabId,
  getDarlingHomeCoverDisplay,
  hasDarlingUserHomeCover,
} from "./types";

const PINK      = "#ff3d6b";
const PURPLE    = "#a855f7";
const GRAD      = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";
const TEXT_DIM  = "rgba(255,255,255,0.50)";
const TEXT_SOFT = "rgba(255,255,255,0.75)";
const HERO_BG   = "/assets/hero-bg.webp";

/** Fixed anchor so the home template always shows a live-looking countdown before a real date is set */
const PREVIEW_LOVE_DATE = "2022-02-14T15:30:00";

/** Stable placeholder so timer digits match SSR and first client paint (avoids hydration mismatch). */
const TIMER_PLACEHOLDER = { years: 0, months: 0, days: 0, hours: 0, mins: 0, secs: 0 };

function computeElapsed(dateStr: string) {
  if (!dateStr) return null;
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) return null;
  const now = new Date();
  if (start > now) return null;

  let years  = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days   = now.getDate() - start.getDate();
  let hours  = now.getHours() - start.getHours();
  let mins   = now.getMinutes() - start.getMinutes();
  let secs   = now.getSeconds() - start.getSeconds();

  if (secs  < 0) { secs  += 60; mins--;   }
  if (mins  < 0) { mins  += 60; hours--;  }
  if (hours < 0) { hours += 24; days--;   }
  if (days  < 0) {
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prev.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }
  if (years  < 0) return null;

  return { years, months, days, hours, mins, secs };
}

interface Props {
  data: ContentData;
  isPersonalized: boolean;
  onEditClick: () => void;
  onTabChange?: (tab: TabId) => void;
}

export default function HomeSection({ data, isPersonalized: _isPersonalized, onEditClick }: Props) {
  const hasRealLoveDate = Boolean(data.loveDate?.trim()) && computeElapsed(data.loveDate) !== null;

  /** null until after mount — never call Date-based computeElapsed during SSR/first render */
  const [elapsedLive, setElapsedLive] = useState<ReturnType<typeof computeElapsed> | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);

  useEffect(() => {
    const src = hasRealLoveDate ? data.loveDate : PREVIEW_LOVE_DATE;
    const tick = () => {
      setElapsedLive(computeElapsed(src));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [hasRealLoveDate, data.loveDate]);

  const elapsedForDisplay = elapsedLive ?? TIMER_PLACEHOLDER;

  const homeCover = getDarlingHomeCoverDisplay(data);
  const hasUserHomePhoto = hasDarlingUserHomeCover(data);

  const wishTrim = data.wishMessage?.trim() ?? "";
  const personalTrim = data.personalMessage?.trim() ?? "";
  /** Single letter: merge wish + personal into one flow (no separate sections). */
  const combinedLetter = (() => {
    if (wishTrim && personalTrim) {
      if (wishTrim === personalTrim) return wishTrim;
      return `${wishTrim}\n\n${personalTrim}`;
    }
    return wishTrim || personalTrim;
  })();

  const timerUnits = [
    { val: elapsedForDisplay.years,  label: "Years",   accent: PINK   },
    { val: elapsedForDisplay.months, label: "Months",  accent: PURPLE },
    { val: elapsedForDisplay.days,   label: "Days",    accent: PINK   },
    { val: elapsedForDisplay.hours,  label: "Hours",   accent: PURPLE },
    { val: elapsedForDisplay.mins,   label: "Minutes", accent: PINK   },
    { val: elapsedForDisplay.secs,   label: "Seconds", accent: PURPLE },
  ];

  const namesHeader = (
    <motion.div
      key="names-header"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      style={{ textAlign: "center", width: "100%" }}
    >
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 5, marginBottom: 6,
        padding: "4px 11px", borderRadius: 999,
        background: "rgba(255,61,107,0.10)",
        border: "1px solid rgba(255,61,107,0.22)",
        backdropFilter: "blur(10px)",
      }}>
        <Sparkles size={11} color={PINK} strokeWidth={2} aria-hidden />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.55)" }}>
          FOR YOU
        </span>
      </div>
      <h1 style={{
        fontSize: "clamp(22px, 6.2vw, 32px)", fontWeight: 800, margin: 0,
        background: GRAD,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        lineHeight: 1.12,
        textShadow: "0 0 40px rgba(255,61,107,0.15)",
      }}>
        {data.senderName || "Always Yours"} & {data.recipientName || "My Love"}
      </h1>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 7 }}>
        <div style={{ height: 1, flex: 1, maxWidth: 40, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.22))" }} />
        <p style={{ margin: 0, fontSize: 11, color: TEXT_SOFT, letterSpacing: "0.03em", fontWeight: 500 }}>
          Together through every moment 💜
        </p>
        <div style={{ height: 1, flex: 1, maxWidth: 40, background: "linear-gradient(to left, transparent, rgba(255,255,255,0.22))" }} />
      </div>
    </motion.div>
  );

  const circleHero = (
    <motion.div
      key="circle-hero"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05, type: "spring", stiffness: 280, damping: 22 }}
      style={{
        position: "relative",
        width: "clamp(124px, 34vw, 156px)",
        height: "clamp(124px, 34vw, 156px)",
        margin: "0 auto 6px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -14,
          borderRadius: "50%",
          border: "1.5px dashed rgba(255,61,107,0.38)",
          boxShadow: "0 0 32px rgba(255,61,107,0.12)",
          pointerEvents: "none",
        }}
        aria-hidden
      />
      {([
        { emoji: "💕" as const, style: { top: "-4%", left: "12%" }, delay: 0 },
        { emoji: "✨" as const, style: { top: "8%", right: "-2%" }, delay: 0.2 },
        { emoji: "💕" as const, style: { bottom: "4%", right: "14%" }, delay: 0.4 },
        { emoji: "✨" as const, style: { bottom: "-2%", left: "4%" }, delay: 0.15 },
      ]).map(({ emoji, style: pos, delay }) => (
        <motion.span
          key={`${emoji}-${JSON.stringify(pos)}`}
          aria-hidden
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
          transition={{
            delay: 0.12 + delay,
            y: { duration: 2.8 + delay, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            position: "absolute",
            ...pos,
            fontSize: 15,
            filter: "drop-shadow(0 0 8px rgba(255,61,107,0.55))",
            pointerEvents: "none",
          }}
        >
          {emoji}
        </motion.span>
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          padding: 4,
          background: GRAD,
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.12) inset,
            0 16px 48px rgba(255,61,107,0.35),
            0 8px 32px rgba(168,85,247,0.25)
          `,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            background: "rgba(12,10,22,0.92)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={homeCover.url}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${homeCover.cropX}% ${homeCover.cropY}%`,
              transform: `scale(${homeCover.scale / 100})`,
              transformOrigin: `${homeCover.cropX}% ${homeCover.cropY}%`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{
      height: "100dvh", width: "100%",
      background: "#0d0b18",
      overflowY: "auto", overflowX: "hidden",
      position: "relative",
    }}>
      {/* Full-bleed hero — framing tuned for portrait (couple centered) vs landscape */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_BG}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_30%] min-[480px]:object-[center_34%] md:object-[center_38%] lg:object-[center_42%] xl:object-center"
          style={{
            filter: "saturate(1.06) contrast(1.02)",
          }}
        />
        {/* Soft ambient from their photo — hero jpeg + vignette still read on top */}
        {hasUserHomePhoto ? (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ opacity: 0.55 }}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={homeCover.url}
              alt=""
              className="absolute left-1/2 top-[28%] h-[min(120%,100vw)] w-[min(120%,100vw)] max-w-none -translate-x-1/2 -translate-y-1/2 scale-[1.35]"
              style={{
                objectFit: "cover",
                objectPosition: `${homeCover.cropX}% ${homeCover.cropY}%`,
                filter: "blur(48px) saturate(1.15)",
              }}
            />
          </div>
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(8,6,20,0.45) 0%,
                rgba(13,11,24,0.28) 28%,
                rgba(13,11,24,0.42) 52%,
                rgba(10,8,18,0.72) 78%,
                rgba(8,6,16,0.92) 100%
              ),
              radial-gradient(ellipse 95% 55% at 50% 0%, rgba(255,61,107,0.10), transparent 50%),
              radial-gradient(ellipse 130% 65% at 50% 100%, rgba(10,8,22,0.65), transparent 58%)
            `,
          }}
        />
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        padding: "max(48px, calc(env(safe-area-inset-top, 0px) + 42px)) 14px 92px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 11, maxWidth: 480, margin: "0 auto",
      }}
        className="lg:max-w-md lg:gap-3 lg:px-6"
      >

        {circleHero}
        {namesHeader}

        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLetterOpen(true)}
          type="button"
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 11,
            padding: "11px 13px", borderRadius: 18,
            background: "linear-gradient(135deg, rgba(255,61,107,0.12), rgba(168,85,247,0.06))",
            border: "1px solid rgba(255,61,107,0.28)",
            cursor: "pointer", textAlign: "left",
            backdropFilter: "blur(14px)",
            boxShadow: "0 6px 22px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(145deg, rgba(255,61,107,0.35), rgba(168,85,247,0.22))",
            border: "1px solid rgba(255,61,107,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 12px rgba(255,61,107,0.18)",
          }}>
            <Mail size={19} color={PINK} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.01em" }}>Love Letter</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: TEXT_DIM, lineHeight: 1.35 }}>
              Tap to read your special message
            </p>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,61,107,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,61,107,0.25)",
          }}>
            <ChevronRight size={14} color={PINK} />
          </div>
        </motion.button>

        {/* Together timer — creative glass strips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            width: "100%",
            borderRadius: 20,
            padding: "2px",
            background: "linear-gradient(135deg, rgba(255,61,107,0.35), rgba(168,85,247,0.2), rgba(255,61,107,0.15))",
            boxShadow: "0 8px 28px rgba(0,0,0,0.32)",
          }}
        >
          <div style={{
            borderRadius: 18,
            background: "rgba(12,10,22,0.72)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "11px 10px 10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, paddingLeft: 2 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(255,61,107,0.25), rgba(168,85,247,0.2))",
                border: "1px solid rgba(255,61,107,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 3px 10px rgba(255,61,107,0.12)",
              }}>
                <Clock size={15} color={PINK} strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 15, fontWeight: 800,
                  background: GRAD,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>Our time together</p>
                <p style={{ margin: "2px 0 0", fontSize: 9, color: TEXT_DIM, letterSpacing: "0.1em", fontWeight: 600 }}>
                  {hasRealLoveDate ? "LIVE · EVERY SECOND" : "PREVIEW · SAMPLE DATE"}
                </p>
              </div>
              <span style={{ fontSize: 21, lineHeight: 1, opacity: 0.9 }} aria-hidden>💍</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 6,
                opacity: hasRealLoveDate ? 1 : 0.92,
              }}
            >
              {timerUnits.map(({ val, label, accent }) => (
                  <div
                    key={label}
                    style={{
                      position: "relative",
                      borderRadius: 13,
                      padding: "9px 5px 8px",
                      textAlign: "center",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                      border: `1px solid ${hasRealLoveDate ? "rgba(255,255,255,0.08)" : "rgba(255,61,107,0.12)"}`,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 0, left: "15%", right: "15%", height: 2,
                      borderRadius: 999,
                      background: accent === PINK
                        ? "linear-gradient(90deg, transparent, rgba(255,61,107,0.85), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(168,85,247,0.85), transparent)",
                      opacity: 0.9,
                    }} />
                    <p style={{
                      margin: 0, lineHeight: 1,
                      fontSize: "clamp(19px, 5.5vw, 26px)",
                      fontWeight: 800, color: accent,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.02em",
                    }}>
                      {String(val).padStart(2, "0")}
                    </p>
                    <p style={{
                      margin: "5px 0 0", fontSize: 8,
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.36)",
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                    }}>
                      {label}
                    </p>
                    {label === "Seconds" && elapsedLive !== null && (
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                          position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
                          width: 3, height: 3, borderRadius: "50%", background: PINK,
                          boxShadow: `0 0 8px ${PINK}`,
                        }}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {letterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", inset: 0, zIndex: 250,
              background: "rgba(4, 2, 12, 0.72)",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "24px 16px",
            }}
            onClick={() => setLetterOpen(false)}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 420, maxHeight: "min(78vh, 620px)",
                borderRadius: 26,
                overflow: "hidden",
                background: "linear-gradient(165deg, rgba(18,14,32,0.98) 0%, rgba(12,10,24,0.99) 100%)",
                border: "1px solid rgba(255,61,107,0.25)",
                boxShadow: "0 28px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05) inset",
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{
                flexShrink: 0,
                display: "flex", alignItems: "center", gap: 12,
                padding: "18px 18px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "linear-gradient(180deg, rgba(255,61,107,0.08) 0%, transparent 100%)",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(255,61,107,0.3), rgba(168,85,247,0.2))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(255,61,107,0.3)",
                }}>
                  <Mail size={22} color={PINK} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#fff" }}>Your letter</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: TEXT_DIM, letterSpacing: "0.04em", lineHeight: 1.35 }}>
                    For you, with love
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLetterOpen(false)}
                  aria-label="Close"
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.06)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={18} color="rgba(255,255,255,0.65)" />
                </button>
              </div>

              <div style={{
                flex: 1, minHeight: 0, overflowY: "auto",
                padding: "16px 18px 18px",
                WebkitOverflowScrolling: "touch",
              }}>
                {combinedLetter ? (
                  <p style={{
                    margin: 0,
                    fontSize: 14, lineHeight: 1.82,
                    color: "rgba(255,255,255,0.88)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {combinedLetter}
                  </p>
                ) : (
                  <div style={{ textAlign: "center", padding: "8px 6px 4px" }}>
                    <p style={{ margin: 0, fontSize: 13, color: TEXT_DIM, lineHeight: 1.6 }}>
                      Write your letter in the editor — it will show here.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setLetterOpen(false); onEditClick(); }}
                      style={{
                        marginTop: 14, padding: "10px 24px", borderRadius: 999,
                        background: GRAD, border: "none", color: "#fff",
                        fontWeight: 700, fontSize: 12, cursor: "pointer",
                      }}
                    >
                      Open editor
                    </button>
                  </div>
                )}
              </div>

              <div style={{
                flexShrink: 0,
                padding: "10px 16px 14px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}>
                <p style={{ margin: 0, fontSize: 11, color: TEXT_DIM, letterSpacing: "0.06em" }}>
                  <span style={{ color: TEXT_SOFT }}>{data.senderName || "Yours"}</span>
                  {" · "}
                  <span style={{ color: TEXT_SOFT }}>{data.recipientName || "My love"}</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
