"use client";

// ─── /christian-wedding — "Join Us at the Altar" (the chapel doors) ─────────
//
// The demo invitation (doors and all) → Create → the AI's few questions and
// its review screen, or the form → Save shows the page with Publish → sign in
// when needed (the publish resumes by itself) → Share.
//
// The page's own actions sit in a dock at the bottom (the thumb zone), shown
// once the doors are open; the top corners belong to the page's section menu
// and the music button.

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import AuthModal from "@/components/AuthModal";
import PublishingOverlay from "./components/PublishingOverlay";
import { useChapelEditor } from "./hooks/useChapelEditor";

// The experience reads window/navigator on its first render (the ?to= greeting, low-end checks).
const ChapelExperience = dynamic(() => import("./chapel/ChapelExperience"), { ssr: false });
const ChapelMusic = dynamic(() => import("./chapel/ChapelExperience").then((m) => m.ChapelMusic), { ssr: false });
const ChapelEditor = dynamic(() => import("./chapel/editor/ChapelEditor"), { ssr: false });
const AiSheet = dynamic(() => import("./chapel/editor/AiSheet"), { ssr: false });

const DOCK_CSS = `
.cwp-dock { position: fixed; z-index: 95; left: 50%; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); display: flex; gap: 8px; padding: 6px; border-radius: 20px; background: rgba(255,253,248,.95); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border: 1px solid rgba(194,161,101,.45); box-shadow: 0 18px 38px -16px rgba(60,45,25,.55); max-width: calc(100vw - 24px); animation: cwp-in .5s cubic-bezier(.22,1,.36,1) both; font-family: var(--font-dm-sans), system-ui, sans-serif; }
@keyframes cwp-in { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translateX(-50%); opacity: 1; } }
.cwp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 48px; padding: 0 16px; border-radius: 14px; border: 1px solid rgba(135,104,58,.22); background: #fffdf8; color: #3b342c; font: 700 14.5px/1 inherit; font-family: inherit; cursor: pointer; white-space: nowrap; }
.cwp-btn.is-main { border-color: transparent; color: #fffdf8; background: linear-gradient(110deg, #7d9a7a, #5b7659); box-shadow: 0 10px 22px -12px rgba(40,50,30,.7); }
.cwp-btn:disabled { opacity: .7; }
body:has(.cwp-dock) .cw-page { padding-bottom: 96px; }
@media (max-width: 400px) { .cwp-dock { gap: 6px; padding: 5px; } .cwp-btn { padding: 0 12px; font-size: 14px; gap: 5px; } }
@media (prefers-reduced-motion: reduce) { .cwp-dock { animation: none; } }
`;

function Dock({ children }: { children: React.ReactNode }) {
  return (
    <div className="cwp-dock" role="toolbar" aria-label="Your invitation">
      <style>{DOCK_CSS}</style>
      {children}
    </div>
  );
}

function ChristianWeddingPage() {
  const ed = useChapelEditor();
  const [opened, setOpened] = useState(false);
  const [seenReplay, setSeenReplay] = useState(ed.replayKey);
  if (seenReplay !== ed.replayKey) {
    setSeenReplay(ed.replayKey);
    setOpened(false);
  }
  if (!ed.ready) return null;

  const editing = ed.mode === "edit";
  const published = !!ed.shareUrl;

  return (
    <ChapelMusic data={editing ? ed.mf : ed.content} autoStart={false} overSheet={editing}>
      {editing ? (
        <ChapelEditor ed={ed} />
      ) : (
        <>
          <ChapelExperience data={ed.content} mode="preview" replayKey={ed.replayKey} onOpened={() => setOpened(true)} />
          {opened && !ed.starter && (
            <Dock>
              {ed.mode === "preview" ? (
                <>
                  <button type="button" className="cwp-btn" onClick={ed.editFromPreview}>
                    ✎ Edit
                  </button>
                  {published ? (
                    <button type="button" className="cwp-btn is-main" onClick={ed.handleShare}>
                      Share invitation
                    </button>
                  ) : (
                    <button type="button" className="cwp-btn is-main" onClick={ed.handlePublish} disabled={ed.publishing} aria-busy={ed.publishing}>
                      {ed.publishing ? "Publishing…" : "Publish ✦"}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button type="button" className="cwp-btn" onClick={ed.goBack}>
                    ← Templates
                  </button>
                  <button type="button" className="cwp-btn is-main" onClick={ed.startCreate}>
                    ✦ {ed.isPersonalized ? "Edit" : "Create your invitation"}
                  </button>
                </>
              )}
            </Dock>
          )}
        </>
      )}

      {ed.starter && <AiSheet fill={ed.fill} setMf={ed.setMf} onClose={ed.closeStarter} />}
      <PublishingOverlay visible={ed.publishing} />
      {ed.showAuth && <AuthModal onClose={ed.closeAuth} onSuccess={ed.closeAuthSuccess} />}
    </ChapelMusic>
  );
}

export default function ChristianWeddingPageWrapper() {
  return (
    <Suspense>
      <ChristianWeddingPage />
    </Suspense>
  );
}
