"use client";

// ─── Pushed pages and sheets ─────────────────────────────────────────────────
//
// Version History is a pushed page on phones (slides in from the right, its
// own nav bar with a back chevron) and a centred card on wider screens. A
// review opens as a sheet with the developer's reply underneath.

import { useEffect, useRef } from "react";
import type { AppReview, AppVersion } from "../types";
import { ChevronLeft, Stars } from "../icons";
import { ReviewCard } from "./sections";

function useEscape(onClose: () => void) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return ref;
}

export function VersionHistoryPage({ versions, onClose }: { versions: AppVersion[]; onClose: () => void }) {
  const closeRef = useEscape(onClose);
  return (
    <>
      <div className="al-scrim" onClick={onClose} aria-hidden="true" />
      <div className="al-page" role="dialog" aria-modal="true" aria-label="Version History">
        <div className="al-nav is-solid" style={{ position: "sticky" }}>
          <button ref={closeRef} type="button" className="al-back al-press" onClick={onClose}>
            <ChevronLeft size={22} /> Back
          </button>
          <span className="al-page-title">Version History</span>
          <span />
        </div>
        <div className="al-vh">
          {versions.map((v, i) => (
            <div className="al-vh-item" key={`${v.version}-${i}`}>
              <div className="al-vh-top">
                <b>
                  {v.version}
                  {i === versions.length - 1 && versions.length > 1 ? <span className="al-vh-first">where it started ♥</span> : null}
                </b>
                <span>{v.date}</span>
              </div>
              <div className="al-body">
                {v.notes.map((n, j) => (
                  <p key={j} style={{ margin: j ? "8px 0 0" : 0 }}>
                    {n}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function ReviewSheet({ review, name, onClose }: { review: AppReview; name: string; onClose: () => void }) {
  const closeRef = useEscape(onClose);
  return (
    <>
      <div className="al-scrim" onClick={onClose} aria-hidden="true" />
      <div className="al-sheet" role="dialog" aria-modal="true" aria-label={review.title || "Review"}>
        <div className="al-grab" aria-hidden="true" />
        <div className="al-sheet-bar">
          <span />
          <button ref={closeRef} type="button" onClick={onClose}>
            Done
          </button>
        </div>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.3px" }}>{review.title}</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 14px", color: "var(--al-soft)", fontSize: 15 }}>
          <Stars value={review.stars} size={15} color="#FF9500" empty="#FF9500" />
          <span>
            {review.author}
            {review.ago ? ` · ${review.ago}` : ""}
          </span>
        </div>
        <p className="al-body" style={{ margin: 0, fontSize: 16, lineHeight: 1.45 }}>
          {review.body}
        </p>
        {review.version ? (
          <p className="al-muted" style={{ margin: "10px 0 0", fontSize: 13 }}>
            Reviewed on version {review.version} of {name}
          </p>
        ) : null}
        {review.developerResponse ? (
          <div className="al-devresp">
            <div className="al-devresp-h">
              Developer Response <span>{review.developerResponse.ago}</span>
            </div>
            <p className="al-body" style={{ margin: 0 }}>
              {review.developerResponse.text}
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}

export function AllReviewsSheet({
  reviews,
  onOpen,
  onClose,
}: {
  reviews: AppReview[];
  onOpen: (r: AppReview) => void;
  onClose: () => void;
}) {
  const closeRef = useEscape(onClose);
  return (
    <>
      <div className="al-scrim" onClick={onClose} aria-hidden="true" />
      <div className="al-sheet" role="dialog" aria-modal="true" aria-label="Ratings and Reviews">
        <div className="al-grab" aria-hidden="true" />
        <div className="al-sheet-bar">
          <h3>Ratings &amp; Reviews</h3>
          <button ref={closeRef} type="button" onClick={onClose}>
            Done
          </button>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ display: "grid" }}>
              <ReviewCard review={r} onOpen={() => onOpen(r)} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
