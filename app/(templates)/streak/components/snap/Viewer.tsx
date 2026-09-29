"use client";

// The snap / story viewer. Snaps get the circular timer ring top-right; stories
// get the segmented bars. Tap right to advance, left to go back, swipe down or
// ✕ to close. Auto-advance rides on the CSS animation's end event, so nothing
// here writes state from a timer — and reduced motion simply waits for a tap.

import { useState } from "react";
import type { Ctx, ViewerSpec } from "./ctx";
import { photoStyle } from "./tokens";
import Bitmoji from "./Bitmoji";
import { IcCamera, IcClose, IcLock } from "./icons";

export default function Viewer({ ctx, spec, onClose }: { ctx: Ctx; spec: ViewerSpec; onClose: () => void }) {
  const [i, setI] = useState(spec.start ?? 0);
  const items = spec.items;
  const it = items[Math.min(i, items.length - 1)];
  const person = spec.from === ctx.me ? ctx.meP : ctx.themP;
  const avatar = spec.from === ctx.me ? ctx.meAvatar : ctx.themAvatar;
  const secs = it?.secs ?? (spec.kind === "snap" ? 6 : 5);

  const next = () => (i + 1 >= items.length ? onClose() : setI(i + 1));
  const prev = () => setI(Math.max(0, i - 1));
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (spec.kind !== "snap" && e.clientX - r.left < r.width * 0.3) prev();
    else next();
  };

  if (!it) return null;
  return (
    <div className="snViewer" role="dialog" aria-modal="true" aria-label={spec.kind === "snap" ? "Snap" : "Story"}>
      <div className="snViewerCard">
        <div className="snViewerMedia" onClick={onTap}>
          {it.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${i}-${it.photo.url}`} src={it.photo.url} alt="" draggable={false} className="snViewerImg" style={photoStyle(it.photo)} />
          ) : (
            <div key={i} className="snViewerBg" style={{ background: it.bg ?? "linear-gradient(160deg,#FF7AB6,#7C5CFF)" }} />
          )}
          {it.locked ? (
            <div className="snLockedSnap">
              <span className="snLockedIc"><IcLock size={30} color="#fff" /></span>
              <b>{person.name || "they"} left you a secret line</b>
              <span>it opens the second you send today&apos;s snap 🤫</span>
              <button
                type="button"
                className="snLockedGo"
                onClick={(e) => { e.stopPropagation(); onClose(); ctx.go("camera"); }}
              >
                send yours 📸
              </button>
            </div>
          ) : (
            <>
              {it.caption && <div className={`snViewerCap${it.photo ? "" : " is-big"}`}>{it.caption}</div>}
              {it.sub && <p className="snViewerSub">{it.sub}</p>}
            </>
          )}
        </div>

        {spec.kind !== "snap" && (
          <div className="snBars" aria-hidden>
            {items.map((_, k) => (
              <span key={k} className="snBar">
                {k < i && <i className="is-full" />}
                {k === i && (
                  <i
                    key={`b${i}`}
                    className={`is-run${ctx.reduced ? " is-still" : ""}`}
                    style={{ animationDuration: `${secs}s` }}
                    onAnimationEnd={next}
                  />
                )}
              </span>
            ))}
          </div>
        )}

        <div className="snViewerTop">
          <Bitmoji preset={avatar} side={spec.from} photoUrl={person.photoUrl} size={36} />
          <div className="snViewerWho">
            <b>{person.name || (spec.from === ctx.me ? "Me" : "them")}</b>
            <span>{spec.time}</span>
          </div>
          <div className="snFlex" />
          {spec.kind === "snap" && !it.locked && (
            <svg key={`r${i}`} className="snRing" width="30" height="30" viewBox="0 0 36 36" aria-hidden>
              <circle cx="18" cy="18" r="15" fill="rgba(0,0,0,.25)" stroke="rgba(255,255,255,.35)" strokeWidth="3.4" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#fff"
                strokeWidth="3.4"
                strokeLinecap="round"
                pathLength={100}
                className={`snRingRun${ctx.reduced ? " is-still" : ""}`}
                style={{ animationDuration: `${secs}s` }}
                onAnimationEnd={next}
              />
              <text x="18" y="22.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{items.length - i}</text>
            </svg>
          )}
          <button type="button" className="snViewerX" onClick={onClose} aria-label="Close">
            <IcClose size={22} color="#fff" strokeWidth={2.6} />
          </button>
        </div>

        <div className="snViewerReply">
          <button type="button" className="snReplyCam" onClick={() => { onClose(); ctx.go("camera"); }} aria-label="Reply with a snap">
            <IcCamera size={20} color="#fff" />
          </button>
          <button type="button" className="snReplyInput" onClick={() => { onClose(); ctx.openConvo(); }}>
            Send a chat
          </button>
          <span className="snReplyHeart" aria-hidden>💛</span>
        </div>
      </div>
    </div>
  );
}
