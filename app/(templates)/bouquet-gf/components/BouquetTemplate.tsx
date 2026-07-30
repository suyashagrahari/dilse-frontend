"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Share2, Sparkles, Check } from "lucide-react";

import "./bouquet.css";
import BouquetArrangement from "./BouquetArrangement";
import DeedOfDevotion from "./DeedOfDevotion";
import PetalBurst from "./PetalBurst";
import { FLOWERS } from "./assets";
import type { BouquetData } from "./types";

const NAME = (v: string, f: string) => (v.trim() ? v.trim() : f);

/** The unique blooms in the bouquet, for the "what's inside" meanings list. */
function uniqueBlooms(data: BouquetData) {
  const ids = new Set(data.flowers.filter((f) => f.count > 0).map((f) => f.id));
  return FLOWERS.filter((f) => ids.has(f.id));
}

function BrandLogo() {
  return (
    <Link
      href="/templates"
      aria-label="Create your own on SubhSandesh"
      className="fixed top-3 right-3 z-[95] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ background: "#fffdf9", border: "2px solid #2b2440", boxShadow: "3px 4px 0 rgba(43,36,64,0.14)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.webp" alt="SubhSandesh" width={18} height={18} style={{ width: 18, height: 18 }} />
      <span className="bq-display" style={{ fontSize: 12, fontWeight: 800, color: "#2b2440" }}>SubhSandesh</span>
    </Link>
  );
}

export default function BouquetTemplate({
  data,
  mode,
  shareId,
}: {
  data: BouquetData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const [burst, setBurst] = useState(0);
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLElement | null>(null);

  const recipient = NAME(data.recipientName, "Beloved");
  const sender = NAME(data.senderName, "Someone who adores you");
  const blooms = uniqueBlooms(data);

  const handleOpen = useCallback(() => {
    if (opened) return;
    setOpened(true);
    setBurst((b) => b + 1);
  }, [opened]);

  useEffect(() => {
    if (opened) {
      const t = setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 650);
      return () => clearTimeout(t);
    }
  }, [opened]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const copy = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [shareUrl]);
  const share = useCallback(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ title: "A bouquet for you 💐", text: "I made you a bouquet 💐", url: shareUrl }).catch(() => {});
    } else copy();
  }, [shareUrl, copy]);

  return (
    <div className="bq-root" style={{ minHeight: "100dvh" }}>
      <div className="bq-ambience" />
      <PetalBurst trigger={burst} />
      {mode === "live" && <BrandLogo />}

      {/* ── Hero: the bouquet ──
          The flex centering is spelled out in Tailwind utilities as well as in
          .bq-screen: bouquet.css is a route-code-split chunk, and on the share
          route this component only mounts after the page data resolves, so that
          chunk can land late. Utilities come from the always-loaded global sheet,
          so the column can never fall back to left-aligned blocks. */}
      <section className="bq-screen flex flex-col items-center justify-center min-h-[100svh] px-5 py-16 text-center">
        <span className="bq-eyebrow mb-5">
          <Sparkles size={12} /> {opened ? "delivered with love" : "a little something for you"}
        </span>

        <h1 className="bq-display mb-2" style={{ fontSize: "clamp(30px,9vw,58px)" }}>
          {opened ? (
            <>For <span className="bq-gt">{recipient}</span></>
          ) : (
            <>You&rsquo;ve got <span className="bq-gt">flowers</span> 💐</>
          )}
        </h1>
        <p className="bq-muted mb-6 mx-auto" style={{ maxWidth: 420, fontSize: 15 }}>
          {opened ? `hand-tied just for you, from ${sender}` : `${sender} sent a bouquet your way. tap to unwrap it.`}
        </p>

        <div
          className="relative mx-auto"
          style={{ width: "min(94vw,560px)", cursor: opened ? "default" : "pointer" }}
          onClick={opened ? undefined : handleOpen}
          role={opened ? undefined : "button"}
          tabIndex={opened ? undefined : 0}
          aria-label={opened ? undefined : "Open your bouquet"}
          onKeyDown={(e) => { if (!opened && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleOpen(); } }}
        >
          <BouquetArrangement
            mode={data.mode}
            flowers={data.flowers}
            seed={data.arrangementSeed}
            greenery={data.greenery}
            animate
            maxWidth={560}
          />
        </div>

        {!opened && (
          <button onClick={handleOpen} className="bq-btn mt-6 px-8 py-3.5 text-base inline-flex items-center gap-2">
            <Sparkles size={16} /> tap to open ✿
          </button>
        )}
      </section>

      {opened && (
        <>
          {/* ── The card / note ── */}
          <section ref={messageRef} className="bq-screen flex flex-col items-center justify-center min-h-[100svh] px-5 py-16">
            <div className="bq-card bq-anim-fade-up w-full max-w-[520px] mx-auto" style={{ padding: "clamp(22px,5vw,38px)" }}>
              <p className="bq-script" style={{ fontSize: 26, color: "#8b6fd4" }}>Dear {recipient},</p>
              <div className="mt-3 space-y-3" style={{ fontSize: 15.5, lineHeight: 1.75, color: "#2b2440" }}>
                {data.message.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <p className="bq-script text-right mt-5" style={{ fontSize: 24, color: "#ff5f96" }}>&mdash; {sender}</p>
            </div>

            {blooms.length > 0 && (
              <div className="w-full max-w-[520px] mx-auto mt-5 bq-anim-fade-up">
                <p className="bq-display text-center mb-3" style={{ fontSize: 12, letterSpacing: "0.14em", color: "#7a7191", textTransform: "uppercase" }}>
                  what&rsquo;s in your bouquet
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {blooms.map((f) => (
                    <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "#fffdf9", border: "2px solid #2b2440", fontSize: 12, boxShadow: "2px 3px 0 rgba(43,36,64,0.1)" }}>
                      <b className="bq-display" style={{ color: "#2b2440" }}>{f.name}</b>
                      <span style={{ color: "#7a7191" }}>· {f.meaning}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── The Deed of Devotion ── */}
          {data.deedEnabled && (
            <section className="bq-screen flex flex-col items-center justify-center min-h-[100svh] px-5 py-16">
              <span className="bq-eyebrow mb-5">✶ officially, forever</span>
              <DeedOfDevotion senderName={data.senderName} recipientName={data.recipientName} clauses={data.deedClauses} downloadable={mode === "live"} />
            </section>
          )}

          {/* ── Footer / closing ── */}
          <footer className="bq-screen flex flex-col items-center justify-center min-h-[100svh] px-5 py-16 text-center">
            <div style={{ fontSize: 52, marginBottom: 10 }}>💐</div>
            <h2 className="bq-display mb-2" style={{ fontSize: "clamp(28px,8vw,46px)" }}>
              with all my <span className="bq-gt">love</span>
            </h2>
            <p className="bq-muted mb-8 mx-auto" style={{ maxWidth: 360, fontSize: 15 }}>
              keep these somewhere you&rsquo;ll see them, {recipient}.
            </p>
            {mode === "live" && shareId && (
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <button onClick={copy} className="bq-btn-ghost inline-flex items-center gap-2 px-4 py-2.5 text-sm">
                  {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "copied!" : "copy link"}
                </button>
                <button onClick={share} className="bq-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm">
                  <Share2 size={15} /> share
                </button>
              </div>
            )}
            <Link href="/templates" className="bq-muted" style={{ fontSize: 13, textDecoration: "underline" }}>
              make your own bouquet on SubhSandesh 💐
            </Link>
          </footer>
        </>
      )}
    </div>
  );
}
