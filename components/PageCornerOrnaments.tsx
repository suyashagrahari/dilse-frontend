"use client";

const F = "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

export default function PageCornerOrnaments() {
  return (
    <>
      {/* Desktop fixed corners */}
      <div className="hidden md:block" style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, width: 200, height: 200, opacity: 0.5, zIndex: 3, pointerEvents: 'none', transform: 'scaleY(-1)', filter: F }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: 'fixed', top: 0, right: 0, width: 200, height: 200, opacity: 0.5, zIndex: 3, pointerEvents: 'none', transform: 'scale(-1,-1)', filter: F }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: 'fixed', bottom: 0, left: 0, width: 180, height: 180, opacity: 0.4, zIndex: 3, pointerEvents: 'none', filter: F }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: 'fixed', bottom: 0, right: 0, width: 180, height: 180, opacity: 0.4, zIndex: 3, pointerEvents: 'none', transform: 'scaleX(-1)', filter: F }} />
      </div>
      {/* Mobile corners */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/alekhancorner2.svg" alt="" aria-hidden="true" className="md:hidden" style={{ position: 'fixed', top: 0, left: 0, width: 80, height: 80, opacity: 0.45, zIndex: 3, pointerEvents: 'none', transform: 'scaleY(-1)', filter: F }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/alekhancorner2.svg" alt="" aria-hidden="true" className="md:hidden" style={{ position: 'fixed', top: 0, right: 0, width: 80, height: 80, opacity: 0.45, zIndex: 3, pointerEvents: 'none', transform: 'scale(-1,-1)', filter: F }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/alekhancorner2.svg" alt="" aria-hidden="true" className="md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, width: 70, height: 70, opacity: 0.35, zIndex: 3, pointerEvents: 'none', filter: F }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/alekhancorner2.svg" alt="" aria-hidden="true" className="md:hidden" style={{ position: 'fixed', bottom: 0, right: 0, width: 70, height: 70, opacity: 0.35, zIndex: 3, pointerEvents: 'none', transform: 'scaleX(-1)', filter: F }} />
    </>
  );
}
