"use client";

// ─── Capsule — the editor page ───────────────────────────────────────────────
//
// Demo preview → Back/Create top bar → EditSheet → Save → auth-deferred Publish
// → Share → recipient opens /[shareId]. Same arc as every other template.
//
// The one departure: "Edit" is not always available. Once the capsule is sealed
// the button becomes "change mine", and once `canAmend` returns false it stops
// existing. It does not appear disabled — a greyed-out button invites someone
// to look for the way round it, and there isn't one.

import { Suspense, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, PenLine, Send, Share2, Loader2, Lock, Play, Camera, RotateCcw } from "lucide-react";
import { ThemeDock } from "../_love/LoveKit";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useCapsuleEditor } from "./hooks/useCapsuleEditor";
import CapsuleTemplate from "./components/CapsuleTemplate";
import EditSheet from "./components/EditSheet";
import SealCeremony from "./components/SealCeremony";
import { COPY, MONO, PALETTE, UI, fmtSealDate, type CapsuleView } from "./components/types";
import { useNow } from "./components/useTick";
import { CapsuleScope, PreviewBar, PreviewButton } from "./components/ui";
import { CAPSULE_THEMES } from "./components/themes";

const CHROME = "color-mix(in srgb, var(--cp-paper, #f9f1e3) 92%, transparent)";
const CHROME_BORDER = `1px solid ${PALETTE.edge}`;

function CapsulePageInner() {
  const e = useCapsuleEditor();
  const now = useNow();

  /**
   * DEBUG only, and only for this session: pretend the open date has arrived on
   * the capsule THIS BROWSER just wrote. It cannot do the same to a published
   * capsule, because the text for that one lives on the server and the server
   * will not send it early — which is exactly the property this control is here
   * to let you check.
   */
  // The overridden open date is stamped in the CLICK HANDLER, not in render —
  // `Date.now()` during render is impure and the linter is right about it.
  //
  // Offered only while the amend window is open: once it closes, the author is
  // bound by the seal like everyone else and the preview stays sealed.
  const [debugOpensOn, setDebugOpensOn] = useState<string | null>(null);
  const [previewStart, setPreviewStart] = useState<"ceremony" | "keepsakes">("ceremony");
  const debugOpen = debugOpensOn !== null && e.amendable;

  const view: CapsuleView = useMemo(() => {
    if (debugOpen && debugOpensOn && e.capsule) {
      return { state: "open", capsule: { ...e.capsule, opensOn: debugOpensOn } };
    }
    return e.view;
  }, [debugOpen, debugOpensOn, e.capsule, e.view]);

  const openPreview = useCallback((start: "ceremony" | "keepsakes") => {
    setPreviewStart(start);
    setDebugOpensOn(new Date(Date.now() - 60_000).toISOString());
    window.scrollTo({ top: 0 });
  }, []);

  const sheetMode = !e.capsule ? "write" : e.amendable ? "amend" : "locked";

  const onEdit = useCallback(() => {
    if (!e.capsule) {
      e.openWriteSheet();
      return;
    }
    if (e.amendable) {
      e.openAmendSheet();
      return;
    }
    // Locked. The sheet opens on names only, and says so.
    e.pushToast({ type: "info", title: COPY.amendClosed });
    e.openWriteSheet();
  }, [e]);

  const topAction = e.showShare
    ? { label: e.shareLabel, onClick: e.handleShare, icon: <Share2 size={14} /> }
    : e.showPublish
      ? { label: e.publishing ? "publishing…" : "publish", onClick: e.publish, icon: <Send size={14} /> }
      : { label: e.capsule ? "publish" : "create", onClick: e.capsule ? e.publish : e.handleStartCreate, icon: <PenLine size={14} /> };

  const amendLeftLabel = useMemo(() => {
    if (!e.amendUntil || now === 0) return undefined;
    const left = Date.parse(e.amendUntil) - now;
    if (left <= 0) return undefined;
    const h = Math.floor(left / 3_600_000);
    const m = Math.floor(left / 60_000) % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [e.amendUntil, now]);

  return (
    <CapsuleScope themeId={e.draft.theme} style={{ minHeight: "100dvh", position: "relative" }}>
      {/* The keyframes are injected exactly once, by `CapsuleTemplate` below.
          Two identical <style> nodes are a hydration mismatch in React 19,
          which hoists and dedupes style elements on the client but not on the
          server. */}

      {/* Top bar */}
      <div
        className="fixed left-0 right-0 top-3 z-[120] mx-auto flex items-center gap-2 px-3"
        style={{ maxWidth: 380, paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <button
          onClick={e.goBack}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-2 shadow-sm"
          style={{ background: CHROME, color: PALETTE.ink, border: CHROME_BORDER, fontFamily: UI, fontSize: 14, fontWeight: 600, backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />

        {/* The theme dock sits in the gap, top centre (portalled by the kit).
            "change mine" / "locked" live in the bottom bar with the preview. */}
        <ThemeDock themes={CAPSULE_THEMES} value={e.draft.theme} onChange={e.setTheme} />

        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 shadow-md disabled:opacity-60"
          style={{ background: `linear-gradient(180deg, ${PALETTE.waxHi} -40%, ${PALETTE.wax} 60%)`, color: PALETTE.paper, fontFamily: UI, fontSize: 14, fontWeight: 800, border: `1px solid ${PALETTE.waxDeep}` }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* The sender's own bar, once there is a capsule: preview opening day
          (while the amend window is open), and change / locked. */}
      {e.capsule && !e.sheetOpen && !e.ceremony && (
        <PreviewBar>
          {debugOpen ? (
            <>
              <PreviewButton label="back to sealed" icon={<RotateCcw size={14} />} onClick={() => setDebugOpensOn(null)} />
              {previewStart === "ceremony" && <PreviewButton label="keepsakes" icon={<Camera size={14} />} onClick={() => openPreview("keepsakes")} />}
            </>
          ) : e.amendable ? (
            <>
              <PreviewButton primary label="preview opening day" icon={<Play size={14} />} onClick={() => openPreview("ceremony")} />
              {!e.showShare && <PreviewButton label="change mine" icon={<PenLine size={14} />} onClick={onEdit} />}
            </>
          ) : (
            <PreviewButton label={`locked · opens ${fmtSealDate(e.capsule.opensOn, e.capsule.timezone)}`} icon={<Lock size={13} />} onClick={onEdit} />
          )}
        </PreviewBar>
      )}

      {/* Clears the fixed top bar. The template itself carries no chrome — the
          share viewer mounts it flush. */}
      <div key={`${e.previewVersion}-${debugOpen ? previewStart : "sealed"}`} style={{ paddingTop: 56 }}>
        <CapsuleTemplate
          view={view}
          mode="demo"
          themeOverride={e.draft.theme}
          hideDemoBar={Boolean(e.capsule)}
          startAt={debugOpen ? previewStart : "ceremony"}
        />
      </div>

      {e.ceremony && e.capsule && (
        <SealCeremony
          seed={e.capsule.sealedOn}
          slipCount={e.capsule.predictions.length}
          initials={`${e.capsule.pair.a.name.charAt(0)}${e.capsule.pair.b.name.charAt(0)}`}
          sealDateLabel={fmtSealDate(e.capsule.opensOn, e.capsule.timezone)}
          onDone={e.finishCeremony}
        />
      )}

      <EditSheet
        open={e.sheetOpen}
        draft={e.draft}
        update={e.updateDraft}
        seat={e.seat}
        setSeat={e.setSeat}
        onClose={() => e.setSheetOpen(false)}
        onSeal={!e.capsule ? e.seal : e.amendable ? e.saveAmend : e.saveNames}
        sealing={e.sealing}
        sheetMode={sheetMode}
        amendLeftLabel={amendLeftLabel}
        lockedCounts={e.lockedCounts}
      />

      {/* Sits over the sheet above, so the first thing a sender sees after
          "create" is the offer to have the OUTSIDE of the capsule written —
          the two names, the date and the stake. It never opens once a capsule
          exists, and it cannot reach anything behind the seal. The wrapper
          makes a stacking context: the sheet is z-220 and StoryStarter is
          z-200, so without it the starter would open underneath. */}
      {e.storyStarted && (
        <div style={{ position: "relative", zIndex: 230 }}>
          <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />
        </div>
      )}

      <AnimatePresence>
        {e.publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] grid place-items-center"
            style={{ background: "rgba(34,29,24,.5)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex flex-col items-center gap-3 rounded-[10px] px-8 py-6" style={{ background: PALETTE.paper }}>
              <Loader2 size={26} className="animate-spin" style={{ color: PALETTE.wax }} />
              <p style={{ fontFamily: MONO, fontSize: 12, color: PALETTE.wax }}>pressing the seal…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
      </AnimatePresence>
    </CapsuleScope>
  );
}

export default function CapsulePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#efe4d2" }} />}>
      <CapsulePageInner />
    </Suspense>
  );
}
