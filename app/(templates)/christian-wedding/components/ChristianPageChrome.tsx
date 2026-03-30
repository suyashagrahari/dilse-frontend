"use client";

const ASSET = "/christan-wedding";

export function ChristianPageChrome() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${ASSET}/christian-bg.png`}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        aria-hidden="true"
      />
    </>
  );
}
