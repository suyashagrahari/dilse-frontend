"use client";

import { useState, useRef, useEffect } from "react";

/*
 * SubhSandesh — footer. Simple, flat, luxurious.
 * Solid brand maroon (#3d0c11), gold (#c9a84c), cream (#f5ede6) — no
 * gradients, glows, or shadows. Same fonts as the landing (Playfair Display).
 * Scoped under `.ssfoot`.
 */

const OCCASIONS = ["Birthday Pages", "Wedding", "Holi Festival", "Eid Mubarak", "Anniversary"];
const PLATFORM = [
  { label: "How It Works", href: "#how" },
  { label: "Templates", href: "/templates" },
  { label: "AI Generator", href: "#demo" },
  { label: "Blessings Wall", href: "#" },
  { label: "Sharing", href: "#" },
];
const COMPANY = ["About Us", "Contact Us", "Help", "Privacy Policy", "Terms of Service"];

/* "SubhSandesh" as Playfair Display vector glyphs (font units, 1000 UPM), one path
   per letter with its x-advance. Rendered as an SVG so the wordmark can "write" itself:
   all outlines trace on at once (pathLength=1 → stroke-dashoffset draw), then the gold
   fill glows in together. viewBox 6327×1453, baseline group flips font y-up → SVG. */
const WM_VB = { w: 6327, h: 1453, baseline: 1142, pad: 60 };
const WORDMARK_GLYPHS: { d: string; x: number }[] = [
  { x: 0, d: "M276 720Q333 720 363.5 708.0Q394 696 416 682Q428 675 435.5 671.5Q443 668 450 668Q460 668 464.5 679.0Q469 690 472 712H495Q494 693 492.5 667.5Q491 642 490.5 600.5Q490 559 490 490H467Q463 541 443.5 589.0Q424 637 388.5 667.5Q353 698 298 698Q249 698 217.0 669.5Q185 641 185 592Q185 550 206.0 521.5Q227 493 265.5 466.5Q304 440 357 405Q406 373 444.5 342.0Q483 311 506.0 272.5Q529 234 529 180Q529 114 496.0 71.0Q463 28 409.0 7.0Q355 -14 290 -14Q231 -14 195.5 -2.0Q160 10 136 23Q114 37 102 37Q92 37 87.5 26.0Q83 15 80 -7H57Q59 16 59.5 47.0Q60 78 60.5 128.0Q61 178 61 255H84Q88 191 106.5 135.0Q125 79 163.5 44.5Q202 10 266 10Q301 10 329.0 23.0Q357 36 374.0 62.0Q391 88 391 128Q391 169 372.0 200.0Q353 231 319.0 258.0Q285 285 240 313Q193 344 152.0 374.5Q111 405 86.5 445.0Q62 485 62 540Q62 602 92.0 642.0Q122 682 171.5 701.0Q221 720 276 720Z" },
  { x: 572, d: "M512 528V108Q512 63 526.5 41.5Q541 20 579 20V-1Q548 2 517 2Q479 2 445.0 -1.0Q411 -4 382 -12V86Q357 32 314.0 9.0Q271 -14 220 -14Q180 -14 154.0 -3.5Q128 7 112 25Q95 44 88.0 75.0Q81 106 81 155V408Q81 453 67.0 474.5Q53 496 14 496V517Q46 514 76 514Q114 514 148.0 517.5Q182 521 211 528V119Q211 92 215.0 71.5Q219 51 233.0 39.0Q247 27 275 27Q305 27 329.0 44.5Q353 62 367.5 92.0Q382 122 382 160V408Q382 453 368.0 474.5Q354 496 315 496V517Q347 514 377 514Q415 514 449.0 517.5Q483 521 512 528Z" },
  { x: 1171, d: "M356 531Q435 531 487.0 466.0Q539 401 539 268Q539 168 508.0 105.5Q477 43 425.0 14.5Q373 -14 312 -14Q269 -14 230.5 3.5Q192 21 168 60L184 61Q204 34 231.5 21.0Q259 8 287 8Q345 8 374.0 69.5Q403 131 403 258Q403 342 391.5 393.5Q380 445 358.5 468.0Q337 491 305 491Q267 491 235.0 459.0Q203 427 198 368L191 398Q208 462 252.0 496.5Q296 531 356 531ZM202 783V28Q180 28 157.5 22.0Q135 16 115.5 6.5Q96 -3 81 -16L66 -8Q70 6 71.5 20.0Q73 34 73 49V663Q73 708 58.5 729.5Q44 751 5 751V772Q37 769 67 769Q106 769 140.0 772.5Q174 776 202 783Z" },
  { x: 1751, d: "M216 783V431Q241 486 285.0 508.5Q329 531 381 531Q423 531 448.5 520.0Q474 509 490 492Q507 473 515.0 443.0Q523 413 523 362V93Q523 51 538.0 36.0Q553 21 590 21V0Q571 1 534.0 2.5Q497 4 461 4Q424 4 388.5 2.5Q353 1 336 0V21Q367 21 380.0 36.0Q393 51 393 93V398Q393 424 388.0 445.0Q383 466 368.5 478.0Q354 490 326 490Q295 490 270.0 473.0Q245 456 230.5 426.0Q216 396 216 357V93Q216 51 229.0 36.0Q242 21 273 21V0Q256 1 222.0 2.5Q188 4 152 4Q115 4 76.5 2.5Q38 1 19 0V21Q56 21 71.0 36.0Q86 51 86 93V663Q86 708 72.0 729.5Q58 751 19 751V772Q51 769 81 769Q119 769 153.0 772.5Q187 776 216 783Z" },
  { x: 2354, d: "M276 720Q333 720 363.5 708.0Q394 696 416 682Q428 675 435.5 671.5Q443 668 450 668Q460 668 464.5 679.0Q469 690 472 712H495Q494 693 492.5 667.5Q491 642 490.5 600.5Q490 559 490 490H467Q463 541 443.5 589.0Q424 637 388.5 667.5Q353 698 298 698Q249 698 217.0 669.5Q185 641 185 592Q185 550 206.0 521.5Q227 493 265.5 466.5Q304 440 357 405Q406 373 444.5 342.0Q483 311 506.0 272.5Q529 234 529 180Q529 114 496.0 71.0Q463 28 409.0 7.0Q355 -14 290 -14Q231 -14 195.5 -2.0Q160 10 136 23Q114 37 102 37Q92 37 87.5 26.0Q83 15 80 -7H57Q59 16 59.5 47.0Q60 78 60.5 128.0Q61 178 61 255H84Q88 191 106.5 135.0Q125 79 163.5 44.5Q202 10 266 10Q301 10 329.0 23.0Q357 36 374.0 62.0Q391 88 391 128Q391 169 372.0 200.0Q353 231 319.0 258.0Q285 285 240 313Q193 344 152.0 374.5Q111 405 86.5 445.0Q62 485 62 540Q62 602 92.0 642.0Q122 682 171.5 701.0Q221 720 276 720Z" },
  { x: 2926, d: "M164 -7Q121 -7 91.0 9.5Q61 26 46.5 54.5Q32 83 32 118Q32 161 51.5 188.5Q71 216 102.5 232.5Q134 249 169.0 260.5Q204 272 235.0 282.5Q266 293 286.0 307.0Q306 321 306 344V418Q306 449 296.5 469.5Q287 490 268.5 500.5Q250 511 223 511Q202 511 179.5 505.0Q157 499 143 483Q169 475 183.5 456.0Q198 437 198 410Q198 379 177.0 360.5Q156 342 125 342Q91 342 74.0 363.5Q57 385 57 414Q57 442 71.0 460.5Q85 479 110 495Q136 511 175.0 521.0Q214 531 260 531Q304 531 339.0 521.5Q374 512 397 488Q421 465 428.5 431.0Q436 397 436 347V74Q436 49 441.5 39.0Q447 29 460 29Q470 29 478.5 34.0Q487 39 498 47L509 30Q487 13 462.5 3.0Q438 -7 404 -7Q369 -7 348.0 3.0Q327 13 317.5 32.0Q308 51 307 76Q283 37 248.0 15.0Q213 -7 164 -7ZM226 51Q250 51 269.5 63.0Q289 75 306 101V303Q296 288 278.0 276.0Q260 264 239.5 252.0Q219 240 201.0 224.5Q183 209 171.0 186.5Q159 164 159 130Q159 91 177.5 71.0Q196 51 226 51Z" },
  { x: 3439, d: "M387 531Q429 531 455.0 520.0Q481 509 497 492Q514 473 521.5 443.0Q529 413 529 362V93Q529 51 544.0 36.0Q559 21 596 21V0Q578 1 540.5 2.5Q503 4 467 4Q430 4 395.0 2.5Q360 1 342 0V21Q374 21 386.5 36.0Q399 51 399 93V398Q399 424 394.0 445.0Q389 466 374.5 478.0Q360 490 332 490Q301 490 276.0 472.5Q251 455 236.5 424.5Q222 394 222 356V93Q222 51 235.0 36.0Q248 21 279 21V0Q262 1 228.0 2.5Q194 4 159 4Q122 4 83.5 2.5Q45 1 25 0V21Q62 21 77.5 36.0Q93 51 93 93V408Q93 453 78.5 474.5Q64 496 25 496V517Q57 514 87 514Q126 514 160.0 517.5Q194 521 222 528V430Q247 486 291.0 508.5Q335 531 387 531Z" },
  { x: 4048, d: "M507 783V109Q507 64 522.0 42.5Q537 21 575 21V0Q544 3 513 3Q474 3 440.5 0.0Q407 -3 378 -11V663Q378 708 363.5 729.5Q349 751 311 751V772Q343 769 373 769Q411 769 445.0 772.5Q479 776 507 783ZM265 531Q309 531 343.5 514.5Q378 498 396 459L384 449Q370 477 346.5 490.0Q323 503 294 503Q241 503 209.0 443.0Q177 383 177 258Q177 174 189.5 123.0Q202 72 226.0 49.0Q250 26 283 26Q319 26 347.5 55.0Q376 84 380 137L387 107Q373 48 338.0 17.0Q303 -14 245 -14Q185 -14 138.5 15.5Q92 45 66.5 105.5Q41 166 41 260Q41 351 70.5 411.0Q100 471 151.0 501.0Q202 531 265 531Z" },
  { x: 4641, d: "M279 531Q367 531 417.0 478.5Q467 426 467 309H132L130 328H349Q350 377 342.5 418.5Q335 460 318.0 485.0Q301 510 274 510Q236 510 208.5 465.5Q181 421 175 320L179 314Q177 301 176.5 286.5Q176 272 176 257Q176 188 196.0 143.5Q216 99 247.5 78.0Q279 57 312 57Q335 57 359.0 64.5Q383 72 406.0 90.5Q429 109 448 143L467 136Q455 100 429.5 65.0Q404 30 364.0 8.0Q324 -14 270 -14Q201 -14 149.0 16.0Q97 46 68.0 105.0Q39 164 39 251Q39 343 70.0 405.0Q101 467 155.0 499.0Q209 531 279 531Z" },
  { x: 5146, d: "M218 531Q260 531 290.5 519.5Q321 508 335 498Q368 474 376 530H398Q396 501 395.0 461.5Q394 422 394 355H372Q367 392 353.0 427.5Q339 463 312.0 486.5Q285 510 242 510Q211 510 190.5 492.5Q170 475 170 442Q170 412 188.0 389.5Q206 367 234.5 347.0Q263 327 294 305Q329 280 357.0 255.5Q385 231 401.5 201.5Q418 172 418 132Q418 87 392.5 54.0Q367 21 325.5 3.5Q284 -14 234 -14Q206 -14 183.5 -8.5Q161 -3 144 5Q132 11 121.0 17.0Q110 23 99 27Q89 32 81.5 22.5Q74 13 70 -7H49Q51 25 52.0 71.0Q53 117 53 193H74Q81 138 96.0 96.5Q111 55 138.5 31.5Q166 8 210 8Q228 8 245.5 16.0Q263 24 274.0 41.0Q285 58 285 86Q285 130 255.5 158.5Q226 187 181 221Q148 246 118.5 270.5Q89 295 71.0 325.0Q53 355 53 395Q53 440 76.0 470.0Q99 500 137.0 515.5Q175 531 218 531Z" },
  { x: 5604, d: "M216 783V431Q241 486 285.0 508.5Q329 531 381 531Q423 531 448.5 520.0Q474 509 490 492Q507 473 515.0 443.0Q523 413 523 362V93Q523 51 538.0 36.0Q553 21 590 21V0Q571 1 534.0 2.5Q497 4 461 4Q424 4 388.5 2.5Q353 1 336 0V21Q367 21 380.0 36.0Q393 51 393 93V398Q393 424 388.0 445.0Q383 466 368.5 478.0Q354 490 326 490Q295 490 270.0 473.0Q245 456 230.5 426.0Q216 396 216 357V93Q216 51 229.0 36.0Q242 21 273 21V0Q256 1 222.0 2.5Q188 4 152 4Q115 4 76.5 2.5Q38 1 19 0V21Q56 21 71.0 36.0Q86 51 86 93V663Q86 708 72.0 729.5Q58 751 19 751V772Q51 769 81 769Q119 769 153.0 772.5Q187 776 216 783Z" },
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
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg></a>
              <a href="#" aria-label="X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4l16 16M20 4L4 20" /></svg></a>
              <a href="#" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 20l1.1-5.4A8.5 8.5 0 1 1 21 11.5Z" /><path d="M8.5 9.5c.3 3 2.5 5.2 5.5 5.5" /></svg></a>
              <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v6h3v-6h3l1-3h-4V9c0-.6.4-1 1-1Z" /></svg></a>
              <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M11 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none" /></svg></a>
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
            <h4>Occasions</h4>
            <ul>{OCCASIONS.map((o) => <li key={o}><a href="#">{o}</a></li>)}</ul>
          </div>
          <div className="ssfoot-col">
            <h4>Platform</h4>
            <ul>{PLATFORM.map((p) => <li key={p.label}><a href={p.href}>{p.label}</a></li>)}</ul>
          </div>
          <div className="ssfoot-col">
            <h4>Company</h4>
            <ul>{COMPANY.map((c) => <li key={c}><a href="#">{c}</a></li>)}</ul>
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
          <span>© 2026 SubhSandesh · Made with <span className="heart">❤</span> in India</span>
          <span className="ssfoot-tagline">India&rsquo;s #1 Digital Celebrations</span>
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

.ssfoot-grid{display:grid;grid-template-columns:1.7fr 1fr 1fr 1fr;gap:44px;padding-bottom:52px;border-bottom:1px solid rgba(201,168,76,.16);}
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

.ssfoot-col h4{font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:9px;}
.ssfoot-col h4::before{content:'';width:16px;height:1.5px;background:#c9a84c;flex-shrink:0;}
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
