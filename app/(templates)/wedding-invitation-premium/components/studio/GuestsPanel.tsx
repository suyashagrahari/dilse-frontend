"use client";
// ─── The couple's RSVP list, over the editor preview of a published page ─────
// A small "Guest replies" pill top-left; tap → a sheet with the kit's
// RsvpDashboard (totals, per-function heads, search, CSV).
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { RsvpDashboard, WeddingRoot, fetchGuests } from "../../../_wedding";
import type { OwnerPanelProps } from "../../../_valentine/editor/studios";

export default function GuestsPanel({ slug, pageId }: OwnerPanelProps) {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!token) return;
    let live = true;
    fetchGuests(slug, pageId, token).then((r) => {
      if (live && r.ok) setCount(r.data.totals.heads);
    });
    return () => {
      live = false;
    };
  }, [slug, pageId, token, open]);
  if (!token) return null;
  return (
    <>
      <style>{CSS}</style>
      <button type="button" className="wgp-pill" onClick={() => setOpen(true)} aria-haspopup="dialog">
        RSVPs{count !== null ? ` · ${count} coming` : ""}
      </button>
      {open && (
        <div className="wgp-scrim" onClick={() => setOpen(false)}>
          <div className="wgp-sheet" role="dialog" aria-modal="true" aria-label="Guest replies" onClick={(e) => e.stopPropagation()}>
            <div className="wgp-head">
              <b>Guest replies</b>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <WeddingRoot theme="blush" background={false}>
              <RsvpDashboard slug={slug} pageId={pageId} token={token} csvName="wedding-rsvps" />
            </WeddingRoot>
          </div>
        </div>
      )}
    </>
  );
}

const CSS = `
.wgp-pill { position: fixed; z-index: 131; top: max(14px, env(safe-area-inset-top, 0px)); left: max(12px, env(safe-area-inset-left, 0px)); min-height: 44px; padding: 0 16px; border-radius: 99px;
  border: 1px solid rgba(192,138,92,.6); background: rgba(255,250,248,.96); color: #6e2a3c; font: 600 13px/1 system-ui, sans-serif; box-shadow: 0 10px 26px -12px rgba(0,0,0,.4); cursor: pointer; }
.wgp-scrim { position: fixed; inset: 0; z-index: 210; background: rgba(30,12,20,.5); display: grid; align-items: end; justify-items: center; }
.wgp-sheet { width: min(100%, 720px); max-height: 88dvh; overflow: auto; background: #fffaf8; border-radius: 22px 22px 0 0; padding: 14px 14px calc(18px + env(safe-area-inset-bottom, 0px)); }
@media (min-width: 768px) { .wgp-scrim { align-items: center; } .wgp-sheet { border-radius: 22px; } }
.wgp-head { display: flex; justify-content: space-between; align-items: center; padding: 4px 4px 10px; color: #3e1f27; font: 600 17px system-ui, sans-serif; }
.wgp-head button { width: 44px; height: 44px; border: 0; border-radius: 50%; background: #f7e6e3; cursor: pointer; font-size: 16px; }
`;
