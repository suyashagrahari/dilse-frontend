"use client";

// The gate's sealed object: a manila parcel tag on a loop of twine. Pure type + material (paper fibre, a rubber
// stamp, a brass eyelet); no drawn objects. It sways on its string; the whole tag is the gate's tap target.

export function ParcelTag({ line, serial, to }: { line: string; serial: string; to: string }) {
  return (
    <div className="ap-tagWrap" aria-hidden>
      <svg className="ap-twine" viewBox="0 0 120 90" preserveAspectRatio="none">
        <path d="M60 88 C 40 60, 18 40, 4 0 M60 88 C 78 58, 100 38, 116 0" />
      </svg>
      <div className="ap-tag">
        <i className="ap-eyelet" />
        <p className="ap-tagTo">
          <span>To</span> {to}
        </p>
        <span className="ap-stamp ap-stampTag">Fragile</span>
        <p className="ap-tagLine">{line}</p>
        <p className="ap-tagCare">This way up ↑</p>
        <p className="ap-tagNo">{serial}</p>
      </div>
    </div>
  );
}
