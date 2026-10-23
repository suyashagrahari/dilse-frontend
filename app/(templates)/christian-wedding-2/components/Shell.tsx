"use client";

// ─── The editor page: the live invitation + the dock + the form + the AI ────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { DayMusicProvider } from "../../_valentine/music/DayMusic";
import { useCw2Editor } from "../hooks/useCw2Editor";
import { CW2_SONGS, musicSettings } from "../lib/music";
import Experience from "./Experience";
import AiWeddingSheet from "./editor/AiWeddingSheet";
import Studio from "./editor/Studio";

const DOCK_CSS = `
.c2d { position:fixed; top:calc(10px + env(safe-area-inset-top,0px)); left:10px; right:10px; z-index:200; display:flex; align-items:center; gap:8px; pointer-events:none; }
.c2d > * { pointer-events:auto; }
.c2d-sp { flex:1; }
.c2d-b { min-height:44px; padding:0 16px; border-radius:999px; border:1px solid rgba(127,154,131,.35); background:rgba(255,253,249,.92); color:#34503b;
  font:700 14.5px var(--wk-font-sans, "DM Sans", system-ui, sans-serif); cursor:pointer; box-shadow:0 8px 22px -12px rgba(0,0,0,.35); backdrop-filter:blur(8px); white-space:nowrap; }
.c2d-b.is-main { background:linear-gradient(135deg, #4c6852, #7f9a83); color:#fff; border-color:transparent; }
.c2d-b.is-blush { background:linear-gradient(135deg, #b4677a, #d48a9a); color:#fff; border-color:transparent; }
.c2d-b.is-round { width:44px; padding:0; display:grid; place-items:center; }
.c2d-back { position:fixed; left:50%; bottom:calc(16px + env(safe-area-inset-bottom,0px)); transform:translateX(-50%); z-index:260; }
.c2-busy { position:fixed; inset:0; z-index:500; display:grid; place-items:center; background:rgba(251,248,243,.86); backdrop-filter:blur(4px);
  font:600 17px var(--wk-font-sans, system-ui); color:#34503b; text-align:center; }
.c2-busy i { display:block; width:40px; height:40px; margin:0 auto 14px; border-radius:50%; border:3px solid #cfd8cc; border-top-color:#4c6852; animation:c2-spin 1s linear infinite; }
@keyframes c2-spin { to { transform:rotate(360deg); } }
@media (min-width: 1024px) {
  .c2-shell.is-editing .c2-page { margin-left:min(560px, 44vw); }
  .c2-shell.is-editing .c2d { left:calc(min(560px, 44vw) + 10px); }
  .c2-shell.is-editing .c2-root .c2-backdrop { left:min(560px, 44vw); }
  /* The live preview beside the studio is only ~56vw wide: fit its viewport-keyed layouts to that column. */
  .c2-shell.is-editing .c2-couple { grid-template-columns:minmax(0, 1fr) auto minmax(0, 1fr); gap:16px; }
  .c2-shell.is-editing .c2-couple .c2-person .c2-frame { width:min(100%, 20vw, 300px); }
  .c2-shell.is-editing .c2-person-desc { max-width:100%; }
  .c2-shell.is-editing .c2-events > .c2-ev { flex-basis:calc((100% - 22px) / 2); }
}
@media (prefers-reduced-motion: reduce) { .c2-busy i { animation:none; } }
`;

export default function Shell() {
  const e = useCw2Editor();
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const shown = e.editorOpen ? e.mf : e.data;

  useEffect(() => {
    // Closing the editor always ends a phone preview.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!e.editorOpen) setPreviewOpen(false);
  }, [e.editorOpen]);

  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push("/templates");
  };

  return (
    <div className={`c2-shell${e.editorOpen ? " is-editing" : ""}`}>
      <style>{DOCK_CSS}</style>
      <DayMusicProvider settings={musicSettings(shown)} melody="garden" autoStart={!e.editorOpen || previewOpen} compact audioOnly songs={CW2_SONGS} overSheet={e.editorOpen && !previewOpen}>
        <div className="c2-page">
          <Experience data={shown} mode="preview" shareId={e.shareId} wishes={e.wishes} replayKey={e.replayKey} noOpening={e.editorOpen && !previewOpen} />
        </div>

        {!e.editorOpen && (
          <div className="c2d">
            <button type="button" className="c2d-b is-round" onClick={back} aria-label="Back">
              ←
            </button>
            <span className="c2d-sp" />
            {e.isPersonalized ? (
              <>
                <button type="button" className="c2d-b" onClick={() => e.openEditor()}>
                  Edit
                </button>
                {e.shareUrl ? (
                  <button type="button" className="c2d-b is-blush" onClick={e.share}>
                    Share
                  </button>
                ) : (
                  <button type="button" className="c2d-b is-main" onClick={e.publish} disabled={e.publishing}>
                    {e.publishing ? "Publishing…" : "Publish"}
                  </button>
                )}
              </>
            ) : (
              <button type="button" className="c2d-b is-main" onClick={e.startCreate}>
                ✦ Create yours
              </button>
            )}
          </div>
        )}

        {e.editorOpen && <Studio e={e} previewOpen={previewOpen} setPreviewOpen={setPreviewOpen} />}
        {e.editorOpen && previewOpen && (
          <button type="button" className="c2d-b is-main c2d-back" onClick={() => setPreviewOpen(false)}>
            ← Back to editing
          </button>
        )}
      </DayMusicProvider>

      <AiWeddingSheet
        fill={e.fill}
        open={e.storyStarter}
        onClose={e.closeAi}
        onManual={() => {
          e.closeAi();
        }}
      />

      {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={() => undefined} />}
      {e.publishing && (
        <div className="c2-busy" role="status" aria-live="polite">
          <div>
            <i aria-hidden />
            Publishing your invitation…
          </div>
        </div>
      )}
    </div>
  );
}
