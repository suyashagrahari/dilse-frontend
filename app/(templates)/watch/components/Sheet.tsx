"use client";

// ─── Sheet ───────────────────────────────────────────────────────────────────
//
// One bottom sheet, used by the notification menu, the share row, the overflow
// menu and the sort control. It is a real dialog: Escape closes it, the scrim
// closes it, focus moves into it on open and back to the opener on close, and
// under `prefers-reduced-motion: reduce` it simply appears where it would have
// slid to.
//
// Nothing in it is decorative — every sheet this template opens has at least
// one control in it that does something.

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { CloseGlyph, FONT, T } from "./theme";

export interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Sheet({ open, title, onClose, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<Element | null>(null);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const panel = panelRef.current;
    panel?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const opener = openerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="wt-sheet-root" role="presentation">
      <button type="button" className="wt-sheet-scrim" aria-label="Close" onClick={close} />
      <div
        ref={panelRef}
        className="wt-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="wt-sheet-head">
          <h2 className="wt-sheet-title">{title}</h2>
          <button type="button" className="wt-sheet-x" onClick={close} aria-label="Close">
            <CloseGlyph size={18} color={T.ink} />
          </button>
        </header>
        <div className="wt-sheet-body">{children}</div>
      </div>
    </div>
  );
}

export const SHEET_CSS = `
.wt-sheet-root { position: fixed; inset: 0; z-index: 260; }
.wt-sheet-scrim {
  position: absolute; inset: 0; border: 0; padding: 0; cursor: default;
  background: rgba(0,0,0,0.66); animation: wt-fade 160ms ease-out both;
}
.wt-sheet {
  position: absolute; left: 50%; bottom: 0; transform: translateX(-50%);
  width: min(520px, 100%); background: ${T.raised};
  border-top-left-radius: 16px; border-top-right-radius: 16px;
  border-top: 1px solid ${T.line};
  padding: 4px 0 max(16px, env(safe-area-inset-bottom, 0px));
  animation: wt-sheet-up 200ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  max-height: 78vh; overflow-y: auto; outline: none;
}
.wt-sheet-head {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px 8px;
}
.wt-sheet-title {
  margin: 0; flex: 1; font-family: ${FONT}; font-size: 16px; font-weight: 700; color: ${T.ink};
}
.wt-sheet-x {
  width: 32px; height: 32px; flex: none; border: 0; border-radius: 50%;
  background: transparent; display: grid; place-items: center; cursor: pointer;
}
.wt-sheet-x:hover { background: ${T.chip}; }
.wt-sheet-body { padding: 4px 12px 8px; font-family: ${FONT}; }
.wt-sheet-item {
  display: flex; align-items: center; gap: 12px; width: 100%;
  min-height: 48px; padding: 0 12px; border: 0; border-radius: 10px;
  background: transparent; color: ${T.ink}; font-family: ${FONT}; font-size: 15px;
  text-align: left; cursor: pointer;
}
.wt-sheet-item:hover { background: ${T.chip}; }
.wt-sheet-note {
  margin: 6px 12px 2px; font-family: ${FONT}; font-size: 13px; line-height: 18px; color: ${T.inkSoft};
}
@keyframes wt-sheet-up { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
@media (prefers-reduced-motion: reduce) {
  .wt-sheet { animation: none; }
  .wt-sheet-scrim { animation: none; }
}
`;
