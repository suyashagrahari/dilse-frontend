// ─── Caller ID — the whole thing ─────────────────────────────────────────────
//
//   incoming → (dark, if declined) → connected → ended
//
// This component owns the stage machine, the ringtone, the haptics, the
// decline joke, the photo viewer, the toasts and the letter; the screens own
// their own layout and nothing else.
//
// ── LAYOUT ───────────────────────────────────────────────────────────────────
//
//   phone   — the phone IS the screen: full-bleed call, then the caller-ID
//             profile as a page once the call ends.
//   tablet  — the caller-ID web app: the phone ringing in a device frame on
//             the left, the caller's profile beside it.
//   desktop — the same, plus the call history as its own left rail.
//
// ── THE DECLINE JOKE ─────────────────────────────────────────────────────────
//
// Decline and the screen goes dark for 800ms — then the call comes straight
// back, labelled "Incoming call (2)". After the fourth it answers itself.

"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LetterPop from "../../_love/LetterPop";
import Incoming from "./Incoming";
import InCall from "./InCall";
import Profile, { LogList } from "./Profile";
import ShareCard from "./ShareCard";
import Viewer from "./Viewer";
import { CALL_CSS } from "./styles";
import { Crown, Face, Heart, Pic, Play, Search, StatusBar, mmss, useLayout } from "./kit";
import { CheckBadgeGlyph, PhoneGlyph } from "./icons";
import { Ringtone, makeHaptics } from "./ringtone";
import { useReducedMotion } from "./theme";
import { mergeTags, useLiveTags, copyText } from "./tagApi";
import { WORDMARK, type CallData } from "./types";

type Stage = "incoming" | "dark" | "connected" | "ended";

const AUTO_ANSWER_AFTER = 4;

export interface CallTemplateProps {
  data: CallData;
  mode: "preview" | "live";
  shareId?: string | null;
  hasPassword?: boolean;
  /** The friends' write link — only in the editor, where the sender owns it. */
  contribLink?: string | null;
  /** The editor hides the letter while its own sheets are open. */
  hideLetter?: boolean;
  /** The editor's floating dock sits at the bottom: keep the call's own buttons clear of it. */
  dockSpace?: boolean;
}

const portraitOf = (d: CallData) =>
  d.caller.photoUrl ? { url: d.caller.photoUrl, cropX: d.caller.cropX, cropY: d.caller.cropY, scale: d.caller.scale } : null;

export default function CallTemplate({ data, mode, shareId, contribLink, hideLetter, dockSpace }: CallTemplateProps) {
  const layout = useLayout();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("incoming");
  const [declines, setDeclines] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [silent, setSilent] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [viewer, setViewer] = useState<number | null>(null);
  const [talked, setTalked] = useState(0);
  const [openLetter, setOpenLetter] = useState(false);
  const answeredAt = useRef(0);

  const ring = useRef<Ringtone | null>(null);
  const haptics = useRef<ReturnType<typeof makeHaptics> | null>(null);

  const { tags: published } = useLiveTags({ shareId: shareId ?? null, enabled: Boolean(shareId) });
  const tags = useMemo(() => mergeTags(data.tags, published), [data.tags, published]);

  const first = data.caller.name.trim().split(/\s+/)[0] || "They";

  // ── Toast ──────────────────────────────────────────────────────────────────
  const pushToast = useCallback((text: string) => setToast({ id: Date.now(), text }), []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  // ── Audio ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const r = new Ringtone();
    const h = makeHaptics();
    ring.current = r;
    haptics.current = h;
    return () => {
      h.stop();
      r.destroy();
      ring.current = null;
      haptics.current = null;
    };
  }, []);

  const unlock = useCallback(() => {
    const r = ring.current;
    if (!r) return;
    if (r.ensureContext() && !audioReady) setAudioReady(true);
  }, [audioReady]);

  const ringing = stage === "incoming" && audioReady && !silent;
  useEffect(() => {
    const r = ring.current;
    const h = haptics.current;
    if (!r || !h) return;
    const sync = () => {
      if (ringing && document.visibilityState === "visible") {
        r.pump();
        r.start();
        h.start();
      } else {
        r.stop();
        h.stop();
      }
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      r.stop();
      h.stop();
    };
  }, [ringing]);

  // ── Stages ─────────────────────────────────────────────────────────────────
  const answer = useCallback(() => {
    if (stage !== "incoming") return;
    answeredAt.current = Date.now();
    setStage("connected");
  }, [stage]);

  const decline = useCallback(() => {
    if (stage !== "incoming") return;
    setDeclines((n) => n + 1);
    setStage("dark");
  }, [stage]);

  const autoAnswering = declines >= AUTO_ANSWER_AFTER;
  useEffect(() => {
    if (stage !== "dark") return;
    const id = setTimeout(() => {
      if (autoAnswering) answeredAt.current = Date.now();
      setStage(autoAnswering ? "connected" : "incoming");
    }, autoAnswering ? 1700 : 800);
    return () => clearTimeout(id);
  }, [stage, autoAnswering]);

  const endCall = useCallback(() => {
    setTalked(Math.max(1, Math.round((Date.now() - answeredAt.current) / 1000)));
    setStage("ended");
    if (layout === "phone") window.scrollTo({ top: 0 });
  }, [layout]);

  const callBack = useCallback(() => {
    setDeclines(0);
    setStage("incoming");
    pushToast(`Calling ${first}… picked up before it even rang.`);
    window.setTimeout(() => {
      answeredAt.current = Date.now();
      setStage((s) => (s === "incoming" ? "connected" : s));
    }, 1800);
  }, [first, pushToast]);

  // The voicemail card opens the letter; the prop is a one-shot pulse.
  const playVoicemail = useCallback(() => setOpenLetter(true), []);
  useEffect(() => {
    if (!openLetter) return;
    const id = window.setTimeout(() => setOpenLetter(false), 60);
    return () => window.clearTimeout(id);
  }, [openLetter]);

  const tagHer = useCallback(async () => {
    if (!contribLink) return;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Tag this number", text: `What have you got ${first} saved as?`, url: contribLink });
        return;
      } catch {
        /* dismissed — fall through to the clipboard */
      }
    }
    pushToast((await copyText(contribLink)) ? "Tag link copied" : "Couldn't copy the link");
  }, [contribLink, first, pushToast]);

  // ── The screen inside the phone ────────────────────────────────────────────
  const screen = (
    <>
      {stage === "incoming" && (
        <Incoming
          data={data}
          tags={tags}
          declines={declines}
          needsGesture={!audioReady}
          silent={silent}
          onToggleSilent={() => setSilent((v) => !v)}
          onAnswer={answer}
          onDecline={decline}
          onToast={pushToast}
        />
      )}
      {stage === "dark" && (
        <div className="cxDark" aria-live="polite">
          {autoAnswering ? <p>you were never going to win this one.<br />connecting…</p> : <span />}
        </div>
      )}
      {stage === "connected" && (
        <InCall data={data} reduce={reduce} onEnd={endCall} onOpenPhoto={setViewer} onToast={pushToast} />
      )}
    </>
  );

  const profileProps = {
    data,
    tags,
    talked,
    contribLink,
    onTagHer: contribLink ? tagHer : undefined,
    onOpenPhoto: setViewer,
    onVoicemail: playVoicemail,
    onCallBack: callBack,
    onSaveCard: () => setShowCard(true),
    onToast: pushToast,
  };

  const brand =
    mode === "live" ? (
      <Link href="/templates" className="cxBrand" aria-label="SubhSandesh — make your own">
        <Image src="/logo.webp" alt="" width={18} height={18} style={{ borderRadius: 5 }} />
        <span>Make your own</span>
      </Link>
    ) : null;

  const showLetter = !hideLetter && !!data.letter.trim() && (layout !== "phone" || stage === "ended");

  return (
    <div className={`cx cx--${layout}${reduce ? " is-reduced" : ""}${dockSpace ? " has-dock" : ""}`} onPointerDownCapture={unlock}>
      <style>{CALL_CSS}</style>

      {layout === "phone" ? (
        stage === "ended" ? (
          <div className="cxPage">
            <Profile variant="page" {...profileProps} />
            {brand && <div className="cxPageBrand">{brand}</div>}
          </div>
        ) : (
          <div className="cxScreen cxScreen--full">
            {screen}
            {brand && stage !== "incoming" && <div className="cxBrandSlot">{brand}</div>}
          </div>
        )
      ) : (
        <div className="cxWeb">
          <header className="cxWebBar">
            <span className="cxWebLogo"><i>✓</i><b>{WORDMARK}</b><small>web</small></span>
            <button type="button" className="cxWebSearch" onClick={() => pushToast(`1 result for everything you search: ${first}.`)}>
              <Search size={17} /> <span>Search names, numbers, feelings…</span>
            </button>
            <span className="cxFlex" />
            <span className="cxWebGold"><Crown size={13} /> Gold</span>
            {brand}
          </header>
          <div className="cxWebGrid">
            {layout === "desktop" && (
              <aside className="cxRail" aria-label="Recent calls">
                <h2 className="cxRailH">Recents</h2>
                <button type="button" className={`cxRailNow${stage === "incoming" ? " is-ringing" : ""}`} onClick={stage === "ended" ? callBack : undefined}>
                  <Face name={data.caller.name} photo={portraitOf(data)} size={44} />
                  <span className="cxRailTx">
                    <b>{data.savedAs || data.caller.name}</b>
                    <small>{stage === "incoming" ? "Incoming call · ringing now" : stage === "connected" ? "On call · live" : `Call ended · ${mmss(talked)} · tap to call back`}</small>
                  </span>
                  <i><PhoneGlyph size={16} color="#fff" /></i>
                </button>
                <LogList data={data} compact />
              </aside>
            )}

            <div className="cxDeviceCol">
              <div className="cxDevice">
                <span className="cxIsland" aria-hidden />
                <div className="cxScreen">
                  {stage === "ended" ? (
                    <AfterCall data={data} talked={talked} onCallBack={callBack} onVoicemail={playVoicemail} onMemories={() => { if (data.photos.length) setViewer(0); }} />
                  ) : (
                    screen
                  )}
                </div>
              </div>
              <p className="cxDeviceHint">{stage === "incoming" ? "slide to answer on the phone ↑" : stage === "connected" ? "on call · psst, try the keypad: 1-4-3" : "call ended · duration: forever"}</p>
            </div>

            <section className="cxPanel" aria-label="Caller profile">
              <Profile variant="panel" showLog={layout !== "desktop"} {...profileProps} />
            </section>
          </div>
        </div>
      )}

      {viewer !== null && data.photos[viewer] && (
        <Viewer data={data} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
      )}

      {showCard && <ShareCard data={data} tags={tags} onClose={() => setShowCard(false)} onToast={pushToast} />}

      {showLetter && (
        <LetterPop
          letter={data.letter}
          from={data.caller.name}
          to={data.recipient.name}
          question={data.lockQuestion.trim() || undefined}
          answer={data.lockAnswer.trim() || "Answer 📞"}
          accent="#1DA362"
          accent2="#F4C95D"
          paper="#FFF8EE"
          ink="#1B1410"
          bottom={layout === "phone" ? 18 : 24}
          right={layout === "phone" ? 16 : 24}
          delay={layout === "phone" ? 900 : 2600}
          teaser="left you a voicemail 🎙️ tap to listen"
          sign="yours, on every call,"
          variant="call"
          photos={data.photos.map((p) => p.url)}
          avatar={data.caller.photoUrl || undefined}
          title="Voicemail"
          forceOpen={openLetter}
          zIndex={95}
        />
      )}

      {toast && (
        <div className="cxToast" role="status" key={toast.id}>
          <Heart size={13} color="#FF5C93" /> <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}

/* ── after the call, inside the device (tablet / desktop) ─────────────────── */

function AfterCall({ data, talked, onCallBack, onVoicemail, onMemories }: { data: CallData; talked: number; onCallBack: () => void; onVoicemail: () => void; onMemories: () => void }) {
  const portrait = portraitOf(data);
  const cover = data.photos[0] ?? portrait;
  return (
    <div className="cxAfterScr">
      <div className="cxInBg" aria-hidden>
        {cover && <Pic photo={cover} className="cxCallBlur" />}
        <span className="cxCallShade" />
      </div>
      <StatusBar />
      <div className="cxAfterIn">
        <p className="cxAfterK">Call ended · {mmss(talked)}</p>
        <Face name={data.caller.name} photo={portrait} size={96} className="cxHeroFace" />
        <h2>{data.caller.name}{data.verified && <CheckBadgeGlyph size={18} color="#F4C95D" style={{ display: "inline-block", verticalAlign: "-2px", marginLeft: 6 }} />}</h2>
        <p className="cxAfterForever">Duration: forever <span>∞</span></p>
        <div className="cxAfterBtns">
          <button type="button" onClick={onCallBack}><span className="is-green"><PhoneGlyph size={22} color="#fff" /></span>Call back</button>
          {data.letter.trim() && <button type="button" onClick={onVoicemail}><span><Play size={20} /></span>Voicemail</button>}
          {data.photos.length > 0 && <button type="button" onClick={onMemories}><span><Heart size={20} /></span>Memories</button>}
        </div>
      </div>
    </div>
  );
}
