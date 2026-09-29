"use client";

// ─── Engagement panel ────────────────────────────────────────────────────────
//
// Chapters, transcript, description and comments open in the same surface a
// watch page uses: on desktop a card at the top of the right column, as tall
// as the player; on a phone a sheet that slides up from the bottom and stops
// right under the (sticky) player, so the video keeps playing above it.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IClose } from "./icons";

export default function Panel({
  title,
  subtitle,
  onClose,
  children,
  variant,
  playerEl,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  variant: "column" | "sheet";
  /** The player, so a phone sheet can stop just under it. */
  playerEl?: HTMLElement | null;
}) {
  const [top, setTop] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (variant !== "sheet") return;
    const measure = () => {
      const b = playerEl?.getBoundingClientRect().bottom ?? 0;
      setTop(Math.max(56, Math.min(window.innerHeight * 0.45, b)));
    };
    measure();
    window.addEventListener("resize", measure);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", measure);
      document.body.style.overflow = prev;
    };
  }, [variant, playerEl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`wt-pn is-${variant}`}
      style={variant === "sheet" && top !== null ? { top } : undefined}
      role="dialog"
      aria-modal={variant === "sheet" ? true : undefined}
      aria-label={title}
    >
      {variant === "sheet" ? <span className="wt-pn-grip" aria-hidden="true" /> : null}
      <header className="wt-pn-head">
        <h2>
          {title}
          {subtitle ? <small>{subtitle}</small> : null}
        </h2>
        <button type="button" className="wt-pn-x" onClick={onClose} aria-label="Close">
          <IClose size={22} color="#F1F1F1" />
        </button>
      </header>
      <div className="wt-pn-body">{children}</div>
    </div>
  );
}

export const PANEL_CSS = `
.wt-pn { display: flex; flex-direction: column; background: #0F0F0F; color: #F1F1F1; }
.wt-pn.is-column {
  border: 1px solid rgba(255,255,255,.2); border-radius: 12px; overflow: hidden; height: var(--wt-player-h, 460px);
  min-height: 360px; margin-bottom: 16px; animation: wt-rise .25s ease both;
}
.wt-pn.is-sheet {
  position: fixed; left: 0; right: 0; bottom: 0; top: 40vh; z-index: 250; border-radius: 12px 12px 0 0;
  background: #212121; box-shadow: 0 -12px 40px rgba(0,0,0,.5); animation: wt-pn-up .3s cubic-bezier(.2,.8,.2,1) both;
}
@keyframes wt-pn-up { from { transform: translateY(100%); } to { transform: none; } }
.wt-pn-grip { width: 40px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.3); margin: 8px auto 0; flex: none; }
.wt-pn-head { display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 16px; border-bottom: 1px solid rgba(255,255,255,.1); flex: none; }
.wt-pn-head h2 { margin: 0; flex: 1; font-size: 18px; font-weight: 700; display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.wt-pn-head small { font-size: 14px; font-weight: 400; color: #AAAAAA; }
.wt-pn-x { width: 40px; height: 40px; border: 0; background: none; border-radius: 50%; display: grid; place-items: center; cursor: pointer; flex: none; }
.wt-pn-x:hover { background: #272727; }
.wt-pn-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
.wt-pn.is-sheet .wt-pn-body { padding-bottom: env(safe-area-inset-bottom, 0px); }
.wt-pn-list { list-style: none; margin: 0; padding: 8px 0; }
.wt-pn-ch {
  display: flex; gap: 12px; align-items: center; width: 100%; padding: 8px 16px; border: 0; background: none; color: #F1F1F1;
  font-family: inherit; text-align: left; cursor: pointer;
}
.wt-pn-ch:hover { background: #272727; }
.wt-pn-ch.is-now { background: rgba(255,62,134,.14); }
.wt-pn-ch-img { position: relative; width: 104px; flex: none; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; }
.wt-pn-ch-t { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wt-pn-ch-t b { font-size: 14px; line-height: 20px; font-weight: 500; }
.wt-pn-ch-t small { display: inline-block; width: max-content; font-size: 12px; font-weight: 500; color: #3EA6FF; background: rgba(62,166,255,.12); padding: 1px 6px; border-radius: 4px; }
.wt-pn-tr {
  display: flex; gap: 16px; width: 100%; padding: 10px 16px; border: 0; background: none; color: #F1F1F1; font-family: inherit;
  text-align: left; cursor: pointer; font-size: 14px; line-height: 20px;
}
.wt-pn-tr:hover { background: #272727; }
.wt-pn-tr.is-now { background: rgba(255,62,134,.14); }
.wt-pn-tr time { flex: none; min-width: 40px; font-size: 12px; font-weight: 500; color: #AAAAAA; background: #272727; border-radius: 4px; height: 20px; line-height: 20px; text-align: center; padding: 0 4px; }
.wt-pn-pad { padding: 12px 16px 24px; }
@media (prefers-reduced-motion: reduce) { .wt-pn.is-sheet, .wt-pn.is-column { animation: none; } }
`;
