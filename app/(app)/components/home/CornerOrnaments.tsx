"use client";

const F = "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

export default function CornerOrnaments() {
  return (
    <>
      {/* Desktop fixed corners (hidden on mobile) */}
      <div className="hidden md:block" style={{ position: 'fixed', inset: 0, zIndex: 230, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true"
          style={{ position: 'fixed', top: 0, left: 0, width: 240, height: 240, opacity: 0.62, zIndex: 230, pointerEvents: 'none', transform: 'scaleY(-1)', filter: F }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true"
          style={{ position: 'fixed', top: 0, right: 0, width: 240, height: 240, opacity: 0.62, zIndex: 230, pointerEvents: 'none', transform: 'scale(-1,-1)', filter: F }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true"
          style={{ position: 'fixed', bottom: 0, left: 0, width: 220, height: 220, opacity: 0.54, zIndex: 220, pointerEvents: 'none', filter: F }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true"
          style={{ position: 'fixed', bottom: 0, right: 0, width: 220, height: 220, opacity: 0.54, zIndex: 220, pointerEvents: 'none', transform: 'scaleX(-1)', filter: F }} />
      </div>

      {/* Mobile overlay corners (shown above nav bars) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" className="md:hidden"
        style={{ position: 'fixed', top: 0, left: 0, width: 110, height: 110, opacity: 0.55, zIndex: 360, pointerEvents: 'none', transform: 'scaleY(-1)', filter: F }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" className="md:hidden"
        style={{ position: 'fixed', top: 0, right: 0, width: 110, height: 110, opacity: 0.55, zIndex: 360, pointerEvents: 'none', transform: 'scale(-1,-1)', filter: F }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" className="md:hidden"
        style={{ position: 'fixed', bottom: 0, left: 0, width: 84, height: 84, opacity: 0.46, zIndex: 360, pointerEvents: 'none', filter: F }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" className="md:hidden"
        style={{ position: 'fixed', bottom: 0, right: 0, width: 84, height: 84, opacity: 0.46, zIndex: 360, pointerEvents: 'none', transform: 'scaleX(-1)', filter: F }} />
    </>
  );
}
