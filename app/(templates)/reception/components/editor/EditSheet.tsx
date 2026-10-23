"use client";

// ─── The Reception Night editor shell ────────────────────────────────────────
//
// Phones: a full-screen sheet — a sticky rail of step chips (tap any, ✓ when
// it has content, the current one centred), the step, and a sticky bar at the
// bottom (Preview · Save · Next) that hides while the keyboard is up and never
// covers a field. Laptops: a left panel with the steps as a vertical rail;
// the invitation itself, live, fills the rest of the screen.
// Removing a row lives inside the row, with a 6-second undo.

import { useCallback, useEffect, useRef, useState } from "react";
import { WeddingRoot } from "../../../_wedding";
import { EDITOR_STEPS, type ReceptionEditor } from "../../hooks/useReceptionEditor";
import { ED_CSS } from "./editorCss";
import { StepCouple, StepEvening, StepGuests, StepInvite, StepLook, StepPhotos, StepSend, StepStory } from "./Steps";

function stepDone(ed: ReceptionEditor, i: number): boolean {
  const m = ed.mf;
  switch (EDITOR_STEPS[i].id) {
    case "couple":
      return !!(m.brideName && m.groomName && (m.families.bride || m.families.groom));
    case "evening":
      return m.events.some((e) => e.title && e.date);
    case "photos":
      return m.galleryImages.length > 0 && !m.galleryImages.every((g) => g.src.startsWith("/wedding-v3/demo/"));
    case "invite":
      return !!m.invitation;
    case "story":
      return m.story.some((c) => c.title || c.line);
    case "guests":
      return m.contacts.length > 0;
    case "look":
      return !!m.music.mode;
    case "send":
      return !!ed.shareUrl;
    default:
      return false;
  }
}

export default function EditSheet({ ed, onPreview }: { ed: ReceptionEditor; onPreview: () => void }) {
  const { mf, step, setStep } = ed;
  const bodyRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [kbd, setKbd] = useState(false);
  const [undo, setUndo] = useState<{ label: string; restore: () => void } | null>(null);

  // The keyboard is up when the visual viewport shrinks a lot: hide the bar.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const base = { h: window.innerHeight };
    const on = () => setKbd(base.h - vv.height > 150);
    vv.addEventListener("resize", on);
    return () => vv.removeEventListener("resize", on);
  }, []);

  // New step: back to its top, and the chip centred in the rail.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    const chip = railRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`);
    chip?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(t);
  }, [undo]);

  const onUndo = useCallback((label: string, restore: () => void) => setUndo({ label, restore }), []);
  const last = step === EDITOR_STEPS.length - 1;
  const props = { mf, patch: ed.patchMf, onUndo };
  const saved = ed.savedAt ? "Saved" : "";

  return (
    <WeddingRoot theme="champagne" background={false} className="rc-ed-root">
      <style>{ED_CSS}</style>
      <div className="rc-ed" role="dialog" aria-modal="false" aria-label="Edit your invitation">
        <header className="rc-ed-top">
          <button type="button" className="rc-ed-icon is-x" onClick={ed.closeEditor} aria-label="Close the editor">
            ✕
          </button>
          <div className="rc-ed-title">
            <b>Your reception invitation</b>
            <small aria-live="polite">{saved ? `✓ ${saved} on this device` : "Changes save as you type"}</small>
          </div>
          <button type="button" className="rc-ed-btn is-sm is-ghost rc-ed-only-phone" onClick={onPreview}>
            Preview
          </button>
        </header>

        <nav ref={railRef} className="rc-ed-steps" aria-label="Steps">
          {EDITOR_STEPS.map((s, i) => (
            <button key={s.id} type="button" data-step={i} aria-current={i === step ? "step" : undefined} className={stepDone(ed, i) ? "is-done" : undefined} onClick={() => setStep(i)}>
              <span className="rc-ed-step-n" aria-hidden>
                {stepDone(ed, i) && i !== step ? "✓" : i + 1}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div ref={bodyRef} className={`rc-ed-body${kbd ? " is-kbd" : ""}`}>
          <div className="rc-ed-pane" key={step}>
            <p className="rc-ed-k">
              Step {step + 1} of {EDITOR_STEPS.length} · {EDITOR_STEPS[step].emoji} {EDITOR_STEPS[step].label}
            </p>
            {step === 0 && <StepCouple {...props} onAi={ed.openAi} onCard={(imgs) => void ed.handleCardExtract(imgs)} cardBusy={ed.extractLoading} aiAvailable={!!ed.fill.schema} />}
            {step === 1 && <StepEvening {...props} />}
            {step === 2 && <StepPhotos {...props} />}
            {step === 3 && <StepInvite {...props} />}
            {step === 4 && <StepStory {...props} />}
            {step === 5 && <StepGuests {...props} />}
            {step === 6 && <StepLook {...props} />}
            {step === 7 && <StepSend {...props} password={ed.pagePassword} setPassword={ed.setPagePassword} shareUrl={ed.shareUrl} pageId={ed.pageId} token={ed.accessToken} />}
          </div>
        </div>

        <footer className={`rc-ed-bar${kbd ? " is-hidden" : ""}`}>
          {step > 0 ? (
            <button type="button" className="rc-ed-btn is-ghost" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : (
            <button type="button" className="rc-ed-btn is-ghost rc-ed-only-phone" onClick={onPreview}>
              Preview
            </button>
          )}
          <button type="button" className={`rc-ed-btn${last ? " is-gold" : " is-ghost"}`} onClick={() => ed.handleSavePreview()}>
            {last ? "Save & preview ✦" : "Save"}
          </button>
          {!last && (
            <button type="button" className="rc-ed-btn is-gold" onClick={() => setStep(step + 1)}>
              Next →
            </button>
          )}
        </footer>

        {undo && (
          <div className="rc-ed-undo" role="status">
            <span>{undo.label}</span>
            <button
              type="button"
              onClick={() => {
                undo.restore();
                setUndo(null);
              }}
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </WeddingRoot>
  );
}
