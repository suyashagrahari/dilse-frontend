"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { postHug } from "./engagement";
import { muMedia } from "./assets";

// Tap-to-hug. Each hug triggers a full-screen takeover — everything fades away, the
// hugging penguin fills the screen, then it smoothly fades back to the page. On the
// LIVE (shared) page every hug is persisted (batched) so the sender sees the total
// in History.
export default function HugButton({
  mode,
  shareId,
  initialCount = 0,
}: {
  mode: "preview" | "live";
  shareId?: string;
  initialCount?: number;
}) {
  const live = mode === "live" && !!shareId;
  const [count, setCount] = useState(initialCount);
  const [hugging, setHugging] = useState(false);
  // Portal the takeover into the template's .mu-root (not document.body) so the
  // scoped fonts + colour vars still apply — while still escaping the transformed
  // section wrappers, since .mu-root is not a fixed-positioning containing block.
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalEl((document.querySelector(".mu-root") as HTMLElement) || document.body);
  }, []);

  const pending = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (live) return;
    const saved = Number(localStorage.getItem("missyou_hugCount") || "0");
    if (saved) setCount(saved);
  }, [live]);

  useEffect(() => {
    return () => {
      if (live && pending.current > 0 && shareId) postHug(shareId, pending.current);
    };
  }, [live, shareId]);

  const flush = () => {
    if (!live || !shareId || pending.current === 0) return;
    const delta = pending.current;
    pending.current = 0;
    postHug(shareId, delta).then((total) => {
      if (typeof total === "number") setCount(total);
    });
  };

  const dismiss = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHugging(false);
  };

  const hug = () => {
    if (hugging) return; // one takeover at a time
    setCount((c) => {
      const next = c + 1;
      if (!live) { try { localStorage.setItem("missyou_hugCount", String(next)); } catch {} }
      return next;
    });
    if (live) {
      pending.current += 1;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flush, 700);
    }
    setHugging(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setHugging(false), 2800);
  };

  return (
    <>
      <div className="mu-paper p-6 text-center sm:p-8">
        <p className="mu-script text-3xl mu-rose-deep sm:text-4xl">need a squeeze?</p>
        <p className="mu-serif mt-1 text-base mu-muted">every hug counts — literally</p>
        <button
          onClick={hug}
          disabled={hugging}
          className="mu-btn mu-anim-glow mu-serif mt-6 px-8 py-4 text-xl disabled:opacity-70 sm:px-10 sm:py-5 sm:text-2xl"
          style={{ fontStyle: "italic" }}
        >
          send a hug ♥
        </button>
        <div className="mu-script mt-6 text-2xl mu-sepia">
          <span className="tabular-nums mu-rose-deep">{count}</span> {count === 1 ? "hug" : "hugs"} shared so far
        </div>
      </div>

      {/* full-screen hug takeover — portalled to .mu-root so it fills the viewport
          (escaping transformed section wrappers) while keeping the scoped theme */}
      {portalEl &&
        createPortal(
          <AnimatePresence>
            {hugging && (
              <motion.div
                className="fixed inset-0 z-[999] flex flex-col items-center justify-center px-6 text-center"
                style={{ background: "radial-gradient(120% 100% at 50% 40%, #fdf3ea, #f4e6d7)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                onClick={dismiss}
                role="dialog"
                aria-label="Sending a hug"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={muMedia("hug-penguin.gif")}
                  alt="a big warm hug just for you"
                  initial={{ scale: 0.6, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  style={{ width: "min(80vw,460px)", maxHeight: "46vh", objectFit: "contain" }}
                />
                <motion.p
                  className="mu-script mt-3 text-3xl sm:text-5xl"
                  style={{ color: "#b23a5b" }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  sending you the biggest hug 🤍
                </motion.p>
                <p className="mu-sans mt-4 text-[11px] uppercase tracking-[0.3em]" style={{ color: "#9a7457" }}>tap to close</p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
