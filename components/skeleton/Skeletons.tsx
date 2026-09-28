// ─── Skeleton screens ────────────────────────────────────────────────────────
//
// What a page looks like while it is on its way: the page's own shape, drawn
// in shimmering cream (and maroon where the real page opens on a maroon hero),
// instead of a spinner in an empty screen. A skeleton says "this is where you
// are going and it is nearly here"; a spinner says only "wait".
//
// Pure CSS, no hooks and no "use client", on purpose: these render from the
// route `loading.tsx` files, which Next shows the instant a link is tapped —
// before any JavaScript for the next page has arrived — and they must animate
// on their own. Motion is transform/opacity/background-position only, and
// stops under prefers-reduced-motion.

import type { CSSProperties, ReactNode } from "react";

const CSS = `
.skRoot { min-height: 100dvh; background: radial-gradient(900px 420px at 100% 0%, rgba(201,168,76,0.12), transparent 60%), #f5ede6; }
.skWrap { width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 14px 128px; display: grid; gap: 12px; }
@media (min-width: 600px) { .skWrap { padding: 20px 24px 128px; gap: 14px } }
@media (min-width: 768px) { .skWrap { padding-top: 92px } }
@media (min-width: 1024px) { .skWrap { padding: 92px 32px 72px } }
.skWrap.inAdmin { padding-top: 12px }
@media (min-width: 768px) { .skWrap.inAdmin { padding-top: 18px } }

.sk { position: relative; overflow: hidden; border-radius: 12px; background: #e7d9ca; }
.sk::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(100deg, transparent 20%, rgba(255,250,242,0.75) 50%, transparent 80%);
  animation: skSweep 1.35s ease-in-out infinite; }
.sk.soft { background: #ede2d6 }
.sk.onDark { background: rgba(255,236,210,0.14) }
.sk.onDark::after { background: linear-gradient(100deg, transparent 20%, rgba(255,227,163,0.22) 50%, transparent 80%) }
@keyframes skSweep { to { transform: translateX(100%) } }

.skCard { border-radius: 18px; background: linear-gradient(180deg, #fffdfb, #fff6ee); border: 1px solid rgba(61,12,17,0.08);
  box-shadow: 0 10px 24px -20px rgba(61,12,17,0.45); padding: 12px; display: grid; gap: 9px; min-width: 0;
  animation: skIn .5s cubic-bezier(.22,1,.36,1) backwards; }
.skHero { position: relative; overflow: hidden; border-radius: 22px; padding: 18px 16px; display: grid; gap: 10px;
  background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
  box-shadow: 0 18px 40px -22px rgba(61,12,17,0.8); animation: skIn .5s cubic-bezier(.22,1,.36,1) backwards; }
@media (min-width: 600px) { .skHero { padding: 24px 26px } }
.skHeroGlow { position: absolute; right: -70px; top: -90px; width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,168,76,0.26), transparent 65%); pointer-events: none; }
.skPulse { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 10px;
  background: linear-gradient(135deg, #ffe3a3, #c9a84c); color: #3d0c11; font-size: 14px; animation: skBeat 1.4s ease-in-out infinite; }
@keyframes skBeat { 0%,100% { transform: scale(1) } 50% { transform: scale(1.12) } }
@keyframes skIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }

.skRow { display: flex; align-items: center; gap: 10px; min-width: 0 }
.skChips { display: flex; gap: 8px; overflow: hidden }
.skGrid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0,1fr)) }
@media (min-width: 760px) { .skGrid { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px } }
@media (min-width: 1100px) { .skGrid { grid-template-columns: repeat(4, minmax(0,1fr)) } }
.skGrid2 { display: grid; gap: 12px; grid-template-columns: minmax(0,1fr) }
@media (min-width: 820px) { .skGrid2 { grid-template-columns: repeat(2, minmax(0,1fr)) } }
.skStats { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0,1fr)) }
@media (min-width: 760px) { .skStats { grid-template-columns: repeat(4, minmax(0,1fr)) } }
.skSr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap }

@media (prefers-reduced-motion: reduce) {
  .sk::after, .skPulse { animation: none }
  .skCard, .skHero { animation: none }
}
`;

/** One shimmering block. */
export function Sk({ w = "100%", h = 12, r, dark, soft, style }: { w?: number | string; h?: number | string; r?: number; dark?: boolean; soft?: boolean; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`sk${dark ? " onDark" : ""}${soft ? " soft" : ""}`} style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />;
}

/** Page frame: background, gutters (clear of the site navs), a11y label. */
export function SkeletonFrame({ children, label = "Loading", admin }: { children: ReactNode; label?: string; admin?: boolean }) {
  return (
    <div className={admin ? undefined : "skRoot"} aria-busy="true" aria-live="polite">
      <style>{CSS}</style>
      <span className="skSr">{label}…</span>
      <div className={`skWrap${admin ? " inAdmin" : ""}`}>{children}</div>
    </div>
  );
}

/** The maroon hero most pages open on, in skeleton. */
export function HeroSkeleton({ stats = 0, tall }: { stats?: number; tall?: boolean }) {
  return (
    <div className="skHero">
      <span className="skHeroGlow" aria-hidden="true" />
      <div className="skRow">
        <span className="skPulse" aria-hidden="true">♥</span>
        <Sk dark w="42%" h={18} r={8} />
      </div>
      <Sk dark w="78%" h={tall ? 34 : 26} r={10} />
      <Sk dark w="56%" h={12} r={6} />
      {stats > 0 && (
        <div className="skStats" style={{ marginTop: 4 }}>
          {Array.from({ length: stats }).map((_, i) => (
            <div key={i} style={{ padding: 10, borderRadius: 13, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,236,190,0.12)", display: "grid", gap: 7 }}>
              <Sk dark w="60%" h={9} r={5} />
              <Sk dark w="40%" h={20} r={7} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chips({ n = 5 }: { n?: number }) {
  return (
    <div className="skChips">
      {Array.from({ length: n }).map((_, i) => <Sk key={i} w={i === 0 ? 64 : 84 + ((i * 17) % 30)} h={32} r={99} soft />)}
    </div>
  );
}

/** A template/favourite card: cover, title, meta. */
function TileCard({ i }: { i: number }) {
  return (
    <div className="skCard" style={{ animationDelay: `${Math.min(i, 10) * 45}ms`, padding: 8 }}>
      <Sk h={0} r={14} style={{ paddingBottom: "125%" }} />
      <Sk w="80%" h={13} r={6} />
      <Sk w="50%" h={10} r={5} soft />
    </div>
  );
}

/** A list row card: avatar, two lines, a tag. */
function RowCard({ i }: { i: number }) {
  return (
    <div className="skCard" style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}>
      <div className="skRow">
        <Sk w={40} h={40} r={12} />
        <div style={{ flex: 1, display: "grid", gap: 7, minWidth: 0 }}>
          <Sk w="55%" h={13} r={6} />
          <Sk w="80%" h={10} r={5} soft />
        </div>
        <Sk w={48} h={22} r={99} soft />
      </div>
      <Sk w="92%" h={10} r={5} soft />
    </div>
  );
}

// ── Page presets ──────────────────────────────────────────────────────────────

/** Gallery pages: templates, favourites, showcase. */
export function GallerySkeleton({ label = "Loading templates" }: { label?: string }) {
  return (
    <SkeletonFrame label={label}>
      <div style={{ display: "grid", gap: 10, justifyItems: "center", padding: "10px 0 4px" }}>
        <Sk w={150} h={22} r={99} soft />
        <Sk w="min(520px, 80%)" h={36} r={12} />
        <Sk w="min(380px, 64%)" h={12} r={6} soft />
      </div>
      <Sk h={46} r={14} />
      <Chips n={6} />
      <div className="skGrid">
        {Array.from({ length: 8 }).map((_, i) => <TileCard key={i} i={i} />)}
      </div>
    </SkeletonFrame>
  );
}

/** Profile: hero with avatar + stats, tab bar, page cards. */
export function ProfileSkeleton() {
  return (
    <SkeletonFrame label="Loading your profile">
      <div className="skHero">
        <span className="skHeroGlow" aria-hidden="true" />
        <div className="skRow">
          <Sk dark w={62} h={62} r={99} />
          <div style={{ flex: 1, display: "grid", gap: 8 }}>
            <Sk dark w="30%" h={9} r={5} />
            <Sk dark w="62%" h={22} r={8} />
          </div>
        </div>
        <div className="skRow" style={{ flexWrap: "wrap" }}>
          <Sk dark w={180} h={24} r={99} />
          <Sk dark w={150} h={24} r={99} />
        </div>
        <div className="skStats">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: 10, borderRadius: 13, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,236,190,0.12)", display: "grid", gap: 7 }}>
              <Sk dark w="40%" h={20} r={7} />
              <Sk dark w="60%" h={9} r={5} />
            </div>
          ))}
        </div>
      </div>
      <Sk h={46} r={16} soft />
      <div className="skGrid2">
        {Array.from({ length: 4 }).map((_, i) => <RowCard key={i} i={i} />)}
      </div>
    </SkeletonFrame>
  );
}

/**
 * Admin screens: maroon hero with tiles, chip filters, a list. Rendered under
 * the admin navbar; `standalone` when there is no navbar yet (the layout's own
 * sign-in check).
 */
export function AdminSkeleton({ standalone }: { standalone?: boolean }) {
  return (
    <SkeletonFrame label="Loading" admin={!standalone}>
      <HeroSkeleton stats={4} />
      <Sk h={42} r={12} soft />
      <Chips n={5} />
      <div className="skGrid2">
        {Array.from({ length: 6 }).map((_, i) => <RowCard key={i} i={i} />)}
      </div>
    </SkeletonFrame>
  );
}

/** Blog, guides: a header, then article cards. */
export function ArticleListSkeleton({ label = "Loading articles" }: { label?: string }) {
  return (
    <SkeletonFrame label={label}>
      <HeroSkeleton tall />
      <Chips n={4} />
      <div className="skGrid2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skCard" style={{ animationDelay: `${i * 60}ms` }}>
            <Sk h={0} r={14} style={{ paddingBottom: "52%" }} />
            <Sk w="85%" h={16} r={7} />
            <Sk w="95%" h={10} r={5} soft />
            <Sk w="70%" h={10} r={5} soft />
          </div>
        ))}
      </div>
    </SkeletonFrame>
  );
}

/** A content page: hero then a few cards (about, contact, help, feedback, legal). */
export function ContentSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <SkeletonFrame label={label}>
      <HeroSkeleton tall />
      <div className="skGrid2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skCard" style={{ animationDelay: `${i * 60}ms` }}>
            <Sk w="40%" h={10} r={5} soft />
            <Sk w="70%" h={18} r={7} />
            <Sk w="95%" h={10} r={5} soft />
            <Sk w="88%" h={10} r={5} soft />
            <Sk w="60%" h={10} r={5} soft />
          </div>
        ))}
      </div>
    </SkeletonFrame>
  );
}

/**
 * A template builder: the floating top bar (Back · Create), the live preview
 * card, and the bottom section tabs.
 */
export function TemplateSkeleton() {
  return (
    <div className="skRoot" aria-busy="true" aria-live="polite" style={{ position: "relative" }}>
      <style>{CSS}</style>
      <span className="skSr">Loading template…</span>
      <div style={{ position: "fixed", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", zIndex: 2 }}>
        <Sk w={78} h={38} r={99} soft />
        <Sk w={96} h={38} r={99} />
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "76px 16px 120px", display: "grid", gap: 14, justifyItems: "center" }}>
        <Sk w="46%" h={12} r={6} soft />
        <Sk w="74%" h={40} r={12} />
        <Sk w="52%" h={40} r={12} />
        <div className="skCard" style={{ width: "100%", padding: 10 }}>
          <Sk h={0} r={16} style={{ paddingBottom: "110%" }} />
        </div>
        <Sk w="84%" h={12} r={6} soft />
        <Sk w="66%" h={12} r={6} soft />
      </div>
      <div style={{ position: "fixed", left: 16, right: 16, bottom: 16, display: "flex", justifyContent: "center", zIndex: 2 }}>
        <Sk w="min(460px, 100%)" h={60} r={22} />
      </div>
    </div>
  );
}

/** Just the list rows — for a list loading inside an already-drawn page. */
export function ListSkeleton({ rows = 5, columns = 1 }: { rows?: number; columns?: 1 | 2 }) {
  return (
    <div aria-busy="true" style={{ display: "grid", gap: 10, gridTemplateColumns: columns === 2 ? "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" : "minmax(0,1fr)" }}>
      <style>{CSS}</style>
      <span className="skSr">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => <RowCard key={i} i={i} />)}
    </div>
  );
}
