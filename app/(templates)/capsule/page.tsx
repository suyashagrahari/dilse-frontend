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
import { ArrowLeft, PenLine, Send, Share2, Loader2, Lock } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import StoryStarter from "@/components/story/StoryStarter";
import { useCapsuleEditor } from "./hooks/useCapsuleEditor";
import CapsuleTemplate from "./components/CapsuleTemplate";
import EditSheet from "./components/EditSheet";
import SealCeremony from "./components/SealCeremony";
import { COPY, MONO, PALETTE, UI, fmtSealDate, type CapsuleView } from "./components/types";
import { localDateToIso } from "./components/capsuleData";
import { useNow } from "./components/useTick";
import { DebugBar, DebugButton } from "./components/ui";

const CHROME = "rgba(249,245,235,.93)";
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
  const [debugOpensOn, setDebugOpensOn] = useState<string | null>(null);
  const debugOpen = debugOpensOn !== null;

  const view: CapsuleView = useMemo(() => {
    if (debugOpensOn && e.capsule) {
      return { state: "open", capsule: { ...e.capsule, opensOn: debugOpensOn } };
    }
    return e.view;
  }, [debugOpensOn, e.capsule, e.view]);

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
    <div style={{ minHeight: "100dvh", position: "relative", background: PALETTE.paper }}>
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

        {/* "change mine" exists only while the window is open. */}
        {e.capsule && e.amendable && !e.showShare && (
          <button
            onClick={onEdit}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-2 shadow-sm"
            style={{ background: CHROME, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}`, fontFamily: UI, fontSize: 14, fontWeight: 600 }}
          >
            <PenLine size={14} /> change mine
          </button>
        )}
        {/* Locked. The sheet still opens — names never lock — but there is
            nothing behind it except the two name fields and a flat statement
            that the rest is final. */}
        {e.capsule && !e.amendable && (
          <button
            onClick={onEdit}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-2"
            style={{ background: CHROME, color: PALETTE.inkSoft, border: CHROME_BORDER, fontFamily: MONO, fontSize: 11 }}
          >
            <Lock size={13} /> locked
          </button>
        )}

        <button
          onClick={topAction.onClick}
          disabled={e.publishing}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 shadow-md disabled:opacity-60"
          style={{ background: PALETTE.wax, color: PALETTE.paper, fontFamily: UI, fontSize: 14, fontWeight: 700 }}
        >
          {topAction.icon} {topAction.label}
        </button>
      </div>

      {/* Session-only debug controls for the capsule written in this tab. */}
      {e.capsule && (
        <div className="fixed bottom-0 left-0 right-0 z-[130] mx-auto" style={{ maxWidth: 380 }}>
          <DebugBar>
            <DebugButton
              label={debugOpen ? "DEBUG: back to sealed" : "DEBUG: skip to opening date"}
              onClick={() => setDebugOpensOn((v) => (v === null ? new Date(Date.now() - 60_000).toISOString() : null))}
            />
            <span style={{ opacity: 0.55 }}>
              opens {fmtSealDate(localDateToIso(e.draft.opensOnDate, e.draft.timezone), e.draft.timezone)}
            </span>
          </DebugBar>
        </div>
      )}

      {/* Clears the fixed top bar. The template itself carries no chrome — the
          share viewer mounts it flush. */}
      <div key={e.previewVersion} style={{ paddingTop: 56, paddingBottom: e.capsule ? 64 : 0 }}>
        <CapsuleTemplate view={view} mode="demo" />
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
    </div>
  );
}

export default function CapsulePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: PALETTE.paper }} />}>
      <CapsulePageInner />
    </Suspense>
  );
}
