"use client";

// ─── /reception — the Reception Night editor ─────────────────────────────────
// The demo invitation (doors and all) under a slim top bar. Create → the AI
// questions → the stepped form, with the invitation itself as the live
// preview (beside the form on laptops, one tap away on phones) → Save →
// Publish → Share.

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import { DayMusicProvider } from "../_valentine/music/DayMusic";
import { WeddingRoot } from "../_wedding";
import { useReceptionEditor } from "./hooks/useReceptionEditor";
import ReceptionExperience from "./components/ReceptionExperience";
import EditSheet from "./components/editor/EditSheet";
import ReceptionAi from "./components/editor/ReceptionAi";
import { ED_CSS } from "./components/editor/editorCss";
import PublishingOverlay from "./components/PublishingOverlay";
import { RECEPTION_DAY_TRACK, musicSettings } from "./components/music";
import { RECEPTION_SONGS } from "./components/types";

function useWide(q: string) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setOn(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [q]);
  return on;
}

const BAR_CSS = `
.rc-bar-root { position: relative; z-index: 90; }
.rc-bar { position: fixed; z-index: 90; top: 0; left: 0; right: 0; height: calc(60px + env(safe-area-inset-top, 0px)); padding: env(safe-area-inset-top, 0px) 12px 0; display: flex; align-items: center; gap: 8px;
  background: rgba(255,253,248,.92); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(184,137,46,.25); font-family: var(--wk-font-sans), system-ui, sans-serif; }
.rc-bar-t { flex: 1; min-width: 0; margin: 0; text-align: center; font: 400 26px/1 var(--wk-font-script, cursive); color: #6E3F2C; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-bar-sp { display: none; }
@media (max-width: 599px) { .rc-bar-t { display: none; } .rc-bar-sp { display: block; flex: 1; } }
.rc-bar button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #E6D7BC; background: #FFFDF8; font: 700 14.5px/1 var(--wk-font-sans), system-ui, sans-serif; color: #2E2216; cursor: pointer; white-space: nowrap; }
.rc-bar .is-gold { border: 0; color: #3A2608; background: linear-gradient(135deg, #8A6420 0%, #D9B45E 30%, #F6E2A6 50%, #C9993F 70%, #8A6420 100%); box-shadow: 0 10px 20px -12px rgba(110,70,10,.7); }
.rc-bar .is-back { padding: 0 12px 0 10px; }
.rc-bar button:disabled { opacity: .6; }
.rc-bar button:focus-visible { outline: 3px solid #B8892E; outline-offset: 2px; }
@media (max-width: 400px) { .rc-bar { gap: 6px; padding-left: 8px; padding-right: 8px; } .rc-bar button { padding: 0 12px; font-size: 14px; } .rc-bar .is-back span { display: none; } }
.rc-float { position: fixed; z-index: 95; left: 50%; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); display: flex; gap: 8px; }
.rc-float button { min-height: 50px; padding: 0 20px; border-radius: 999px; border: 0; font: 700 15px var(--wk-font-sans), system-ui, sans-serif; cursor: pointer; white-space: nowrap; box-shadow: 0 16px 30px -12px rgba(60,40,10,.55); }
.rc-float .is-dark { background: #2E2216; color: #FFF8EA; }
.rc-float .is-light { background: #FFFDF8; color: #2E2216; border: 1.5px solid #E6D7BC; }
.rc-page.is-phone-preview .rc-pill-wrap { display: none; }
`;

export default function ReceptionPage() {
  const ed = useReceptionEditor();
  const wide = useWide("(min-width: 1024px)");
  const [phonePreview, setPhonePreview] = useState(false);
  const [replay, setReplay] = useState(0);
  const editing = ed.editMode === "manual";
  const sideBySide = editing && wide;
  const view = editing ? ed.mf : ed.content;
  const settings = useMemo(() => musicSettings(view.music), [view.music]);

  // Leaving the editor ends a phone preview.
  const [editingFrom, setEditingFrom] = useState(editing);
  if (editingFrom !== editing) {
    setEditingFrom(editing);
    if (!editing) setPhonePreview(false);
  }

  if (!ed.ready) return null;

  const style = {
    "--rc-top": "calc(60px + env(safe-area-inset-top, 0px))",
    "--rc-panel": "min(680px, 50vw)",
    "--rc-left": sideBySide ? "min(680px, 50vw)" : "0px",
    minHeight: "100dvh",
    background: "#FBF4E8",
  } as CSSProperties;

  const published = !!ed.shareUrl;

  return (
    <div className={`rc-page${editing ? " is-editing" : ""}${phonePreview ? " is-phone-preview" : ""}`} style={style}>
      <WeddingRoot theme="champagne" background={false} className="rc-bar-root">
        <style>{BAR_CSS}</style>
        <header className="rc-bar">
          <button type="button" className="is-back" onClick={editing && !wide ? ed.closeEditor : ed.goBack} aria-label="Back">
            ← <span>Back</span>
          </button>
          <span className="rc-bar-sp" />
          <p className="rc-bar-t">Reception Night</p>
          {editing ? (
            <>
              {wide && (
                <button type="button" onClick={() => setReplay((r) => r + 1)}>
                  ▶ Replay doors
                </button>
              )}
              <button type="button" className="is-gold" onClick={() => ed.handleSavePreview()}>
                Save &amp; preview
              </button>
            </>
          ) : ed.isPersonalized ? (
            <>
              <button type="button" onClick={ed.handleEditClick}>
                ✎ Edit
              </button>
              {published ? (
                <>
                  {ed.editMode === "preview" && (
                    <button type="button" onClick={() => void ed.handlePublish()} disabled={ed.publishing}>
                      Update
                    </button>
                  )}
                  <button type="button" className="is-gold" onClick={ed.handleShare}>
                    Share
                  </button>
                </>
              ) : (
                <button type="button" className="is-gold" onClick={() => void ed.handlePublish()} disabled={ed.publishing}>
                  {ed.publishing ? "Publishing…" : "🥂 Publish"}
                </button>
              )}
            </>
          ) : (
            <button type="button" className="is-gold" onClick={ed.handleEditClick}>
              ✦ Create yours
            </button>
          )}
        </header>
      </WeddingRoot>

      <div className="rc-music-host" style={{ display: "contents" }}>
        <DayMusicProvider settings={settings} melody="velvet" autoStart={!editing} compact audioOnly songs={RECEPTION_SONGS} track={RECEPTION_DAY_TRACK}>
          <div style={{ paddingLeft: sideBySide ? "min(680px, 50vw)" : 0 }}>
            <ReceptionExperience data={view} mode="preview" replay={replay} noOpening={editing} chromeHidden={editing && !wide && !phonePreview} />
          </div>

          {editing && !(phonePreview && !wide) && (
            <EditSheet
              ed={ed}
              onPreview={() => {
                setPhonePreview(true);
                window.scrollTo({ top: 0 });
              }}
            />
          )}
          {editing && phonePreview && !wide && (
            <div className="rc-float">
              <button type="button" className="is-light" onClick={() => setReplay((r) => r + 1)}>
                ▶ Doors
              </button>
              <button type="button" className="is-dark" onClick={() => setPhonePreview(false)}>
                ✎ Back to editing
              </button>
            </div>
          )}
          {ed.editMode === "ai" && (
            <WeddingRoot theme="champagne" background={false} className="rc-ed-root rc-ai-root">
              <style>{ED_CSS}</style>
              <ReceptionAi ed={ed} />
            </WeddingRoot>
          )}
        </DayMusicProvider>
      </div>

      <PublishingOverlay visible={ed.publishing} />
      <AnimatePresence>{ed.showAuth && <AuthModal onClose={ed.closeAuth} onSuccess={ed.closeAuthSuccess} />}</AnimatePresence>
    </div>
  );
}
