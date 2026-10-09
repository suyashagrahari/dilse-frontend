"use client";

// A petal, lifted out of the rose: the photo on a paper mat that tilts with the phone, its caption in italic, the
// little note under it. Rendered at the root (outside every transformed scene) so `position: fixed` is the
// viewport. Tap anywhere or Esc to put it back (sfx swoosh-soft).

import { useEffect, useRef } from "react";
import { CinematicPhoto, TiltCard, usePremium } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_love/types";

export function PetalLightbox({ photo, onClose }: { photo: LovePhoto | null; onClose: () => void }) {
  const { sfx } = usePremium();
  const close = useRef<HTMLButtonElement>(null);
  const shut = () => {
    sfx("swoosh-soft", { gain: 0.4 });
    onClose();
  };
  const shutRef = useRef(shut);
  useEffect(() => {
    shutRef.current = shut;
  });
  useEffect(() => {
    if (!photo) return;
    close.current?.focus({ preventScroll: true });
    const k = (e: KeyboardEvent) => e.key === "Escape" && shutRef.current();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [photo]);
  if (!photo) return null;
  return (
    <div className="rb-lb" role="dialog" aria-modal="true" aria-label={photo.caption || "A photo from the rose"} onClick={shut}>
      <div className="rb-lbIn" onClick={(e) => e.stopPropagation()}>
        <TiltCard radius={4} max={9} glare={0.28} style={{ width: "min(320px, 80vw)" }}>
          <CinematicPhoto photo={photo} grade="warm" aspect="4 / 5" eager caption={photo.caption || ""} />
        </TiltCard>
        {photo.note && <p className="rb-lbNote">{photo.note}</p>}
      </div>
      <button ref={close} type="button" className="rb-lbClose" onClick={shut}>
        Back to the rose
      </button>
    </div>
  );
}
