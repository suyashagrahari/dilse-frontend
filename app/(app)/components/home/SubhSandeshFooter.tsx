"use client";

import { useState, useRef, useEffect } from "react";
import { WM_VB, WORDMARK_GLYPHS } from "@/lib/wordmarkGlyphs";
import Link from "next/link";
import SocialIcons from "@/components/SocialIcons";
import { BUSINESS, LEGAL_LINKS } from "@/lib/business";

/*
 * SubhSandesh — footer. Simple, flat, luxurious.
 * Solid brand maroon (#3d0c11), gold (#c9a84c), cream (#f5ede6) — no
 * gradients, glows, or shadows. Same fonts as the landing (Playfair Display).
 * Scoped under `.ssfoot`.
 */

// Brand social icons come from components/SocialIcons (shared with the blog).

// Every link here goes somewhere real. The Occasions and Company columns were
// all `href="#"`, which left the footer — the first place a payment-gateway
// reviewer looks for the policy pages — pointing nowhere. The occasion targets
// are the same live templates the hero carousel opens.
const OCCASIONS = [
  { label: "Birthday Pages", href: "/birthday-gf" },
  { label: "Wedding", href: "/wedding-shaadi" },
  { label: "Holi Festival", href: "/holi" },
  { label: "Eid Mubarak", href: "/eid-mubarak" },
  { label: "Anniversary", href: "/anniversary-gf" },
];
const PLATFORM = [
  { label: "How It Works", href: "#how" },
  { label: "Templates", href: "/templates" },
  // Two real destinations in a column that was half placeholders. /showcase in
  // particular NEEDS this link: it is meant to be indexed and to rank, and a
  // page reached only from the sitemap is crawled late and treated as low
  // value. See the note at the top of app/(app)/showcase/page.tsx.
  { label: "Walkthrough Videos", href: "/showcase" },
  { label: "Guides", href: "/guides" },
  { label: "AI Generator", href: "#demo" },
];
const COMPANY = [
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Help", href: "/help" },
  { label: "Feedback", href: "/feedback" },
];

export default function SubhSandeshFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Fill the giant wordmark with gold (left→right) once it scrolls into view
  const wordmarkRef = useRef<SVGSVGElement>(null);
  const [wordmarkFilled, setWordmarkFilled] = useState(false);
  useEffect(() => {
    const el = wordmarkRef.current;
    if (!el || wordmarkFilled) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setWordmarkFilled(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [wordmarkFilled]);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <footer className="ssfoot">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="ssfoot-inner">
        {/* flourish divider */}
        <div className="ssfoot-flourish" aria-hidden>
          <span className="line l" />
          <svg viewBox="0 0 60 20" fill="none">
            <circle cx="6" cy="10" r="1.7" fill="currentColor" />
            <path d="M12 10 H24" stroke="currentColor" strokeWidth="1" />
            <path d="M30 3 L37 10 L30 17 L23 10 Z" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="30" cy="10" r="1.5" fill="currentColor" />
            <path d="M36 10 H48" stroke="currentColor" strokeWidth="1" />
            <circle cx="54" cy="10" r="1.7" fill="currentColor" />
          </svg>
          <span className="line r" />
        </div>

        {/* columns */}
        <div className="ssfoot-grid">
          <div className="ssfoot-brand">
            <div className="ssfoot-logo"><span className="dot" />SubhSandesh</div>
            <p>Turn your heartfelt wishes into beautiful digital celebration pages — shared with love across India and the world.</p>

            <div className="ssfoot-social">
              <SocialIcons variant="bare" />
            </div>

            <div className="ssfoot-sub-label">Get new templates first</div>
            {subscribed ? (
              <div className="ssfoot-sub-done"><span aria-hidden>✓</span> You&rsquo;re on the list — welcome!</div>
            ) : (
              <form className="ssfoot-sub" onSubmit={subscribe}>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email address" />
                <button type="submit" aria-label="Subscribe"><span aria-hidden>→</span></button>
              </form>
            )}
          </div>

          <div className="ssfoot-col">
            <h3>Occasions</h3>
            <ul>{OCCASIONS.map((o) => <li key={o.label}><Link href={o.href}>{o.label}</Link></li>)}</ul>
          </div>
          <div className="ssfoot-col">
            <h3>Platform</h3>
            <ul>{PLATFORM.map((p) => <li key={p.label}><a href={p.href}>{p.label}</a></li>)}</ul>
          </div>
          <div className="ssfoot-col">
            <h3>Company</h3>
            <ul>{COMPANY.map((c) => <li key={c.label}><Link href={c.href}>{c.label}</Link></li>)}</ul>
          </div>
          <div className="ssfoot-col">
            <h3>Legal</h3>
            <ul>{LEGAL_LINKS.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
          </div>
        </div>

        {/* wordmark — outlines "write" themselves on, then the gold fill glows in (on scroll into view) */}
        <svg ref={wordmarkRef} className={`ssfoot-wordmark${wordmarkFilled ? " is-filled" : ""}`} aria-hidden
          viewBox={`0 0 ${WM_VB.w} ${WM_VB.h}`} preserveAspectRatio="xMidYMid meet" role="img">
          <defs>
            <linearGradient id="ssfoot-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a8823a" />
              <stop offset="0.5" stopColor="#e9c97a" />
              <stop offset="1" stopColor="#c9a84c" />
            </linearGradient>
          </defs>
          <g transform={`translate(${WM_VB.pad}, ${WM_VB.baseline}) scale(1,-1)`}>
            <g className="ssfoot-wm-fill">
              {WORDMARK_GLYPHS.map((g, i) => (
                <path key={i} d={g.d} transform={`translate(${g.x},0)`} />
              ))}
            </g>
            <g className="ssfoot-wm-stroke">
              {WORDMARK_GLYPHS.map((g, i) => (
                <path key={i} d={g.d} pathLength={1} transform={`translate(${g.x},0)`} />
              ))}
            </g>
          </g>
        </svg>

        {/* bottom bar */}
        <div className="ssfoot-bottom">
          <span>© 2026 {BUSINESS.name}. All rights reserved. · Made with <span className="heart">❤</span> in India</span>
          <span className="ssfoot-tagline">India&rsquo;s #1 Digital Celebrations</span>
          {/* The registered business, in one line — the legal name, proprietor,
              city and a way to reach a person, as payment gateways require. */}
          <address className="ssfoot-business">
            {BUSINESS.name} ({BUSINESS.type}, Proprietor: {BUSINESS.proprietor}) · {BUSINESS.address.line1},{" "}
            {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.postalCode} ·{" "}
            <a href={`tel:${BUSINESS.phone.tel}`}>{BUSINESS.phone.display}</a> ·{" "}
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
          </address>
        </div>
      </div>
    </footer>
  );
}

const STYLES = `
.ssfoot{position:relative;overflow:hidden;background:linear-gradient(170deg,#120306 0%,#1c0508 45%,#220709 75%,#120306 100%);color:#f5ede6;font-family:'Playfair Display',Georgia,'Times New Roman',serif;}
.ssfoot *{box-sizing:border-box;}
.ssfoot::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:rgba(201,168,76,.3);}
.ssfoot-inner{position:relative;max-width:1160px;margin:0 auto;padding:0 24px;}

.ssfoot-flourish{display:flex;align-items:center;justify-content:center;gap:16px;padding:60px 0 48px;color:rgba(201,168,76,.55);}
.ssfoot-flourish .line{height:1px;flex:1;max-width:280px;background:rgba(201,168,76,.28);}
.ssfoot-flourish svg{width:66px;height:20px;flex-shrink:0;}

.ssfoot-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr 1.25fr;gap:40px;padding-bottom:52px;border-bottom:1px solid rgba(201,168,76,.16);}
.ssfoot-logo{display:flex;align-items:center;gap:11px;font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:23px;color:#f5ede6;}
.ssfoot-logo .dot{width:12px;height:12px;border-radius:50%;background:#c9a84c;}
.ssfoot-brand p{color:#cdb3a5;font-size:14px;line-height:1.72;margin:16px 0 22px;max-width:310px;}
.ssfoot-social{display:flex;gap:10px;margin-bottom:28px;}
.ssfoot-social a{width:40px;height:40px;border-radius:50%;border:1px solid rgba(201,168,76,.32);display:flex;align-items:center;justify-content:center;color:#c9a84c;transition:background .18s ease,color .18s ease,border-color .18s ease;}
.ssfoot-social a:hover{background:#c9a84c;color:#3d0c11;border-color:#c9a84c;}
.ssfoot-social svg{width:17px;height:17px;}
.ssfoot-sub-label{font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:11px;}
.ssfoot-sub{display:flex;gap:8px;max-width:340px;}
.ssfoot-sub input{flex:1;min-width:0;font-family:ui-sans-serif,system-ui,sans-serif;background:#4a141a;border:1px solid rgba(201,168,76,.28);border-radius:999px;padding:12px 18px;color:#f5ede6;font-size:13.5px;outline:none;transition:border-color .18s ease;}
.ssfoot-sub input::placeholder{color:#a98a7c;}
.ssfoot-sub input:focus{border-color:#c9a84c;}
.ssfoot-sub button{flex-shrink:0;width:44px;height:44px;border-radius:50%;background:#c9a84c;color:#3d0c11;font-size:17px;font-weight:800;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .18s ease;}
.ssfoot-sub button:hover{background:#d8ba62;}
.ssfoot-sub-done{display:inline-flex;align-items:center;gap:8px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:13.5px;font-weight:600;color:#c9a84c;border:1px solid rgba(201,168,76,.3);padding:11px 18px;border-radius:999px;}

.ssfoot-col h3{font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:9px;}
.ssfoot-col h3::before{content:'';width:16px;height:1.5px;background:#c9a84c;flex-shrink:0;}
.ssfoot-col ul{list-style:none;display:flex;flex-direction:column;gap:13px;margin:0;padding:0;}
.ssfoot-col a{font-family:ui-sans-serif,system-ui,sans-serif;color:#d8c1b3;font-size:14px;text-decoration:none;transition:color .16s ease,padding-left .16s ease;}
.ssfoot-col a:hover{color:#c9a84c;padding-left:6px;}

/* Giant wordmark drawn as SVG glyph paths. On scroll into view (.is-filled):
   every letter's outline traces on together (stroke-dashoffset, pathLength=1),
   then the gold fill glows in across the whole word. */
.ssfoot-wordmark{display:block;width:100%;max-width:1000px;height:auto;margin:44px auto 8px;overflow:visible;user-select:none;}
.ssfoot-wm-stroke path{fill:none;stroke:#c9a84c;stroke-width:7;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;}
.ssfoot-wm-fill path{fill:url(#ssfoot-gold);fill-opacity:0;}
.ssfoot-wordmark.is-filled .ssfoot-wm-stroke path{stroke-dashoffset:0;transition:stroke-dashoffset 2.3s cubic-bezier(.5,0,.3,1);}
.ssfoot-wordmark.is-filled .ssfoot-wm-fill path{fill-opacity:1;transition:fill-opacity .9s ease 2.15s;}
@media (prefers-reduced-motion:reduce){
  .ssfoot-wm-stroke path,.ssfoot-wordmark.is-filled .ssfoot-wm-stroke path{stroke-dashoffset:0;transition:none;}
  .ssfoot-wordmark.is-filled .ssfoot-wm-fill path{transition:none;}
}

.ssfoot-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:22px 0 44px;border-top:1px solid rgba(201,168,76,.16);font-family:ui-sans-serif,system-ui,sans-serif;color:#b99b8c;font-size:13px;}
.ssfoot-bottom .heart{color:#e07a86;}
.ssfoot-tagline{color:#c9a84c;font-weight:600;letter-spacing:.02em;}

.ssfoot-business{width:100%;font-style:normal;font-size:12.5px;line-height:1.7;color:#b99b8c;}
.ssfoot-business a{color:#d8c1b3;text-decoration:none;}
.ssfoot-business a:hover{color:#c9a84c;}
/* Phones show a fixed bottom nav (md:hidden, ~112px tall) over the page, which
   covered the business line. Clear it, plus the home-indicator inset. */
@media (max-width:767px){
  .ssfoot-bottom{padding-bottom:calc(128px + env(safe-area-inset-bottom, 0px));}
}
@media (max-width:1100px){
  .ssfoot-grid{grid-template-columns:1fr 1fr 1fr 1fr;}
  .ssfoot-brand{grid-column:1 / -1;}
}
@media (max-width:860px){
  .ssfoot-grid{grid-template-columns:1fr 1fr;gap:34px;}
  .ssfoot-brand{grid-column:1 / -1;}
}
@media (max-width:560px){
  .ssfoot-inner{padding:0 20px;}
  .ssfoot-flourish{padding-top:44px;}
  .ssfoot-grid{grid-template-columns:1fr;gap:30px;}
  .ssfoot-bottom{flex-direction:column;text-align:center;}
  .ssfoot-wm-stroke path{stroke-width:9;}
}
`;
