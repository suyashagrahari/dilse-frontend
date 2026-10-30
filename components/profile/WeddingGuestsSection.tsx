"use client";

// ─── Wedding guests, straight from the profile ──────────────────────────────
//
// A couple who sent their invitation wants one thing from their profile: "how
// many are coming?". Before this, the answer sat inside the editor ("Guest
// replies & blessings"), behind Edit. Here every PUBLISHED invitation that
// takes RSVPs gets a card with its live numbers (guests coming, yes / maybe /
// can't come, blessings), and one button opens the full guest list: the same
// <RsvpDashboard> the editor shows, with search, per-function headcount,
// blessings moderation and the CSV export.
//
// Drafts are left out: nobody can reply to a page that has not been shared.
// The counts are one GET per invitation (most couples have one), fetched when
// the section mounts and again when the sheet closes.

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Users, X, ChevronRight, Heart, ExternalLink } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { RsvpDashboard, fetchGuests, type GuestsData } from "@/app/(templates)/_wedding";

/**
 * Every template whose pages take RSVPs: the profile's templateType → the slug
 * of its guest list (`/<slug>-pages/:id/guests`). Shaadi Card pages are listed
 * as "shaadi"; Christian Wedding's Scroll Edition shares the "christian-wedding"
 * collection, whose guest list serves both editions.
 */
export const RSVP_TEMPLATES: Record<string, string> = {
  "wedding-invitation": "wedding-invitation",
  "wedding-invitation-premium": "wedding-invitation-premium",
  "royal-wedding-invitation": "royal-wedding-invitation",
  "lotus-wedding-invitation": "lotus-wedding-invitation",
  "palace-door-wedding-invitation": "palace-door-wedding-invitation",
  "floral-wedding-invitation": "floral-wedding-invitation",
  "sikh-wedding-invitation": "sikh-wedding-invitation",
  "muslim-wedding-invitation": "muslim-wedding-invitation",
  "christian-wedding-invitation": "christian-wedding-invitation",
  "tamil-wedding-invitation": "tamil-wedding-invitation",
  "telugu-wedding-invitation": "telugu-wedding-invitation",
  "kannada-wedding-invitation": "kannada-wedding-invitation",
  "malayalam-wedding-invitation": "malayalam-wedding-invitation",
  "marathi-wedding-invitation": "marathi-wedding-invitation",
  "garden-wedding-invitation": "garden-wedding-invitation",
  "christian-wedding": "christian-wedding",
  reception: "reception",
  shaadi: "shaadi-card",
};

export interface GuestPage {
  _id: string;
  shareId: string;
  /** The guest-list slug (RSVP_TEMPLATES), not the profile's templateType. */
  templateType: string;
  /** "Royal Wedding Invitation". */
  label: string;
  emoji: string;
  /** Who it is for / from, whichever the page has. */
  title: string;
  shareLink: string;
}

type Summary = { ok: true; data: GuestsData } | { ok: false; error: string };

export default function WeddingGuestsSection({ pages, token }: { pages: GuestPage[]; token: string | null }) {
  const [sum, setSum] = useState<Record<string, Summary>>({});
  const [open, setOpen] = useState<GuestPage | null>(null);

  // The parent rebuilds `pages` on every render; fetch again only when the
  // set of invitations actually changes (the key carries all a fetch needs).
  const key = pages.map((p) => `${p.templateType}/${p._id}`).join("|");
  const load = useCallback(() => {
    if (!token || !key) return;
    key.split("|").forEach((k) => {
      const [slug, id] = k.split("/");
      void fetchGuests(slug, id, token).then((r) =>
        setSum((s) => ({ ...s, [id]: r.ok ? { ok: true, data: r.data } : { ok: false, error: r.error } })),
      );
    });
  }, [key, token]);

  useEffect(load, [load]);

  if (!pages.length || !token) return null;

  return (
    <section className="wgS" aria-labelledby="wg-title">
      <style>{WG_CSS}</style>
      <div className="wgHead">
        <span className="wgHeadIc"><Users size={16} /></span>
        <div>
          <h2 id="wg-title">Wedding Guests</h2>
          <p>Who is coming, for which function, and the blessings they left</p>
        </div>
      </div>

      <div className="wgGrid">
        {pages.map((p) => {
          const s = sum[p._id];
          const t = s?.ok ? s.data.totals : null;
          const blessings = s?.ok ? s.data.blessings.length : 0;
          return (
            <article key={p._id} className="wgCard">
              <div className="wgTop">
                <span className="wgEmoji" aria-hidden>{p.emoji}</span>
                <div className="wgTx">
                  <b>{p.title}</b>
                  <span>{p.label}</span>
                </div>
                <a className="wgOpen" href={p.shareLink} target="_blank" rel="noreferrer" aria-label="Open the invitation" title="Open the invitation"><ExternalLink size={14} /></a>
              </div>

              {!s ? (
                <div className="wgSkel" aria-busy="true" />
              ) : !s.ok ? (
                <p className="wgErr">{s.error}</p>
              ) : (
                <>
                  <div className="wgHero">
                    <b>{t!.heads}</b>
                    <span>{t!.heads === 1 ? "guest coming" : "guests coming"}</span>
                  </div>
                  <div className="wgStats">
                    <span><b>{t!.attending}</b> yes</span>
                    <span><b>{t!.maybe}</b> maybe</span>
                    <span><b>{t!.declined}</b> can&apos;t come</span>
                    <span><Heart size={11} /> <b>{blessings}</b> {blessings === 1 ? "blessing" : "blessings"}</span>
                  </div>
                </>
              )}

              <button type="button" className="wgBtn" onClick={() => setOpen(p)}>
                See all guests &amp; blessings <ChevronRight size={15} />
              </button>
            </article>
          );
        })}
      </div>

      {open && <GuestsSheet page={open} token={token} onClose={() => { setOpen(null); load(); }} />}
    </section>
  );
}

function GuestsSheet({ page, token, onClose }: { page: GuestPage; token: string; onClose: () => void }) {
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="wgSheetBack" onClick={onClose}>
      <style>{WG_CSS}</style>
      <div className="wgSheet" role="dialog" aria-modal="true" aria-label={`Guests — ${page.title}`} onClick={(e) => e.stopPropagation()}>
        <div className="wgSheetHead">
          <span className="wgEmoji" aria-hidden>{page.emoji}</span>
          <div className="wgTx">
            <b>{page.title}</b>
            <span>{page.label}</span>
          </div>
          <button type="button" className="wgClose" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="wgSheetBody">
          <RsvpDashboard slug={page.templateType} pageId={page._id} token={token} csvName={`guests-${page.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "wedding"}`} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

const WG_CSS = `
.wgS { margin: 18px 0 6px; }
.wgHead { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.wgHeadIc { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px; color: #fff6e6; background: linear-gradient(135deg, #5a1520, ${BRAND.accentStrong}); flex: none; }
.wgHead h2 { margin: 0; font: 700 18px/1.2 var(--font-playfair, Georgia, serif); color: ${BRAND.text}; }
.wgHead p { margin: 2px 0 0; font-size: 12.5px; color: ${BRAND.muted}; }
.wgGrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 12px; }
.wgCard { position: relative; display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: 18px; border: 1px solid rgba(201,168,76,.45); overflow: hidden;
  background: radial-gradient(120% 90% at 100% 0%, rgba(201,168,76,.16), transparent 55%), linear-gradient(180deg, #fffdf9, #fbf3ea); }
.wgTop { display: flex; align-items: center; gap: 10px; min-width: 0; }
.wgEmoji { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; background: #fff; border: 1px solid ${BRAND.border}; font-size: 19px; flex: none; }
.wgTx { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.wgTx b { font-size: 14.5px; color: ${BRAND.text}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wgTx span { font-size: 12px; color: ${BRAND.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wgOpen { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; color: ${BRAND.accent}; border: 1px solid ${BRAND.border}; background: #fff; flex: none; }
.wgHero { display: flex; align-items: baseline; gap: 8px; }
.wgHero b { font: 700 40px/1 var(--font-playfair, Georgia, serif); color: ${BRAND.accentStrong}; }
.wgHero span { font-size: 13px; font-weight: 700; color: ${BRAND.goldDeep}; text-transform: uppercase; letter-spacing: .08em; }
.wgStats { display: flex; flex-wrap: wrap; gap: 6px; }
.wgStats span { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 999px; background: #fff; border: 1px solid ${BRAND.border}; font-size: 12px; color: ${BRAND.muted}; }
.wgStats b { color: ${BRAND.text}; }
.wgStats svg { color: #c2405c; }
.wgSkel { height: 74px; border-radius: 12px; background: linear-gradient(90deg, rgba(61,12,17,.05), rgba(61,12,17,.1), rgba(61,12,17,.05)); background-size: 200% 100%; animation: wgSh 1.2s linear infinite; }
@keyframes wgSh { to { background-position: -200% 0; } }
.wgErr { margin: 0; font-size: 12.5px; color: ${BRAND.danger}; }
.wgBtn { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 42px; padding: 0 16px; border-radius: 12px;
  font-size: 13.5px; font-weight: 700; color: #fff6e6; background: linear-gradient(135deg, #5a1520, ${BRAND.accentStrong}); box-shadow: 0 10px 22px -14px rgba(61,12,17,.8); transition: transform .15s; }
.wgBtn:hover { transform: translateY(-1px); }
.wgBtn:focus-visible, .wgOpen:focus-visible, .wgClose:focus-visible { outline: 2px solid ${BRAND.gold}; outline-offset: 2px; }
.wgSheetBack { position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: flex-end; justify-content: center; background: rgba(30,8,10,.45); animation: wgFade .2s ease; }
@media (min-width: 720px) { .wgSheetBack { align-items: center; padding: 24px; } }
.wgSheet { display: flex; flex-direction: column; width: 100%; max-width: 880px; max-height: 92dvh; border-radius: 22px 22px 0 0; background: ${BRAND.surface}; overflow: hidden; animation: wgUp .28s cubic-bezier(.22,1,.36,1); }
@media (min-width: 720px) { .wgSheet { border-radius: 22px; } }
.wgSheetHead { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid ${BRAND.border}; background: linear-gradient(180deg, #fdf9f4, #f8efe4); }
.wgClose { all: unset; cursor: pointer; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; color: ${BRAND.text}; background: #fff; border: 1px solid ${BRAND.border}; flex: none; }
.wgSheetBody { overflow-y: auto; padding: 16px; overscroll-behavior: contain; }
@keyframes wgFade { from { opacity: 0; } }
@keyframes wgUp { from { transform: translateY(24px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .wgSheet, .wgSheetBack, .wgSkel { animation: none; } }
`;
