"use client";

// ─── The premium editor, reached from a free template's offer ────────────────
//
// Shown on the premium editor when it was opened by "Try Premium"
// (`?upgrade=<from>` plus the hand-off context, lib/upgrade/offer.ts). Their
// bouquet is already in preview; this floating card says so and keeps both
// doors open:
//
//   Edit                    → the premium form, everything pre-filled
//   Publish free instead    → back to the free template, which publishes the
//                             bouquet they made there, without asking again
//
// The premium publish itself stays where it always is (top-right). When it
// succeeds this records `premium_published` and forgets the hand-off.

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PenLine, Send, Sparkles, X } from "lucide-react";
import { clearUpgradeContext, readUpgradeContext, trackUpgrade, type UpgradeContext } from "@/lib/upgrade/offer";

export interface UpgradeBridgeProps {
  slug: string;
  shareUrl: string | null;
  pageId: string | null;
  /** The form is open: get out of its way. */
  editing: boolean;
  onEdit: () => void;
  token: string | null | undefined;
  /** UI font of the page it sits on. */
  font: string;
}

export default function UpgradeBridge({ slug, shareUrl, pageId, editing, onEdit, token, font }: UpgradeBridgeProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [ctx, setCtx] = useState<UpgradeContext | null>(null);
  const [folded, setFolded] = useState(false);
  const publishedRef = useRef(false);

  // Read once on arrival (sessionStorage is client-only).
  useEffect(() => {
    const from = params.get("upgrade");
    const c = readUpgradeContext();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one read of browser storage after mount
    if (from && c && c.from === from && c.to === slug) setCtx(c);
  }, [params, slug]);

  // The premium page went live: that is the conversion.
  useEffect(() => {
    if (!ctx || !shareUrl || publishedRef.current) return;
    publishedRef.current = true;
    trackUpgrade(ctx.from, "premium_published", { token, pageId, to: ctx.to });
    clearUpgradeContext();
  }, [ctx, shareUrl, token, pageId]);

  if (!ctx || shareUrl) return null;

  const edit = () => {
    trackUpgrade(ctx.from, "edit_opened", { token, pageId: ctx.pageId, to: ctx.to });
    onEdit();
  };
  const backToFree = () => {
    trackUpgrade(ctx.from, "back_to_free", { token, pageId: ctx.pageId, to: ctx.to });
    clearUpgradeContext();
    router.push(ctx.backUrl);
  };

  return (
    <AnimatePresence>
      {!editing && (
        <motion.div
          className="upb"
          style={{ fontFamily: font }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 }}
          role="region"
          aria-label="Your bouquet in Premium"
        >
          <style>{CSS}</style>
          {folded ? (
            <button type="button" className="upb-pill" onClick={() => setFolded(false)}>
              <Sparkles size={14} /> Premium preview · options
            </button>
          ) : (
            <div className="upb-card">
              <button type="button" className="upb-fold" onClick={() => setFolded(true)} aria-label="Hide">
                <X size={14} />
              </button>
              <p className="upb-t"><Sparkles size={14} /> Your bouquet, in Premium</p>
              <p className="upb-s">We carried your flowers and card across. Watch it, change anything, then publish from the top.</p>
              <div className="upb-row">
                <button type="button" className="upb-edit" onClick={edit}><PenLine size={15} /> Edit</button>
                <button type="button" className="upb-free" onClick={backToFree}><Send size={14} /> Publish free instead</button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const CSS = `
.upb { position: fixed; left: 12px; right: 12px; bottom: max(14px, env(safe-area-inset-bottom)); margin: 0 auto; max-width: 420px; z-index: 150; display: flex; justify-content: center; pointer-events: none; }
.upb > * { pointer-events: auto; }
.upb-card { position: relative; width: 100%; padding: 14px 14px 12px; border-radius: 22px; color: #2b2440; background: rgba(255,250,245,.97);
  border: 2px solid #2b2440; box-shadow: 4px 5px 0 rgba(43,36,64,.18), 0 24px 60px -24px rgba(0,0,0,.55); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.upb-t { display: flex; align-items: center; gap: 6px; margin: 0; padding-right: 28px; font-size: 15px; font-weight: 800; }
.upb-t svg { color: #c48a12; }
.upb-s { margin: 4px 0 0; font-size: 12.5px; line-height: 1.45; color: #5d5574; }
.upb-row { display: grid; grid-template-columns: 1fr 1.35fr; gap: 8px; margin-top: 11px; }
.upb-row button, .upb-pill, .upb-fold { all: unset; box-sizing: border-box; cursor: pointer; }
.upb-row button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 0 10px; border-radius: 14px; font-size: 14px; font-weight: 800; border: 2px solid #2b2440; text-align: center; white-space: nowrap; }
.upb-row .upb-edit { color: #fff; background: linear-gradient(135deg,#ff5f96,#8b6fd4); box-shadow: 2px 3px 0 rgba(43,36,64,.2); }
.upb-row .upb-free { color: #2b2440; background: #fff; }
.upb-fold { position: absolute; top: 10px; right: 10px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: #f3ecf9; color: #2b2440; }
.upb-pill { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 99px; font-size: 13px; font-weight: 800; color: #2b2440; background: rgba(255,250,245,.97); border: 2px solid #2b2440; box-shadow: 3px 4px 0 rgba(43,36,64,.18); }
.upb-row button:focus-visible, .upb-pill:focus-visible, .upb-fold:focus-visible { outline: 3px solid #e2b44a; outline-offset: 2px; }
`;
