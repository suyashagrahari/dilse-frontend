"use client";

const ASSET = "/christan-wedding";

const C_BG = "#fcfcfa";

function CornerComposite({ flip }: { flip?: boolean }) {
  const imgs = flip
    ? [`${ASSET}/topleftcorner2.webp`, `${ASSET}/topleftcorner3.webp`, `${ASSET}/topleftcorner1.webp`]
    : [`${ASSET}/bottomcorner3.webp`, `${ASSET}/bottomcorner-3.webp`, `${ASSET}/bottomrightcorner1.webp`];

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        zIndex: 5,
        width: 262.2,
        height: 240.822,
        transform: flip ? "rotate(-180deg) scale(1.0)" : "scale(1.0)",
        ...(flip
          ? { left: -68, top: -45 }
          : { right: -68, bottom: -45 }),
      }}
      aria-hidden
    >
      <div style={{ width: 382.451, height: 351.27, transform: "scale(0.685577)", transformOrigin: "0 0", position: "relative" }}>
        <div style={{ position: "absolute", overflow: "hidden", width: 232.545, height: 96.295, transform: "translate(143.372px,68.125px) rotate(90deg)" }}>
          <div style={{ transform: "scaleY(-1)", width: 232.545, height: 96.295, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgs[0]} alt="" draggable={false} style={{ display: "block", width: 232.545, height: 235.11, transform: "translateY(-138.815px)" }} />
          </div>
        </div>
        <div style={{ position: "absolute", overflow: "hidden", width: 232.545, height: 96.295, transform: "translate(0px,216.397px)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgs[1]} alt="" draggable={false} style={{ display: "block", width: 232.545, height: 235.11, transform: "translateY(-138.815px)" }} />
        </div>
        <div style={{ position: "absolute", overflow: "hidden", width: 283.519, height: 281.972, transform: "translate(98.932px,69.297px)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgs[2]} alt="" draggable={false} style={{ display: "block", width: 283.519, height: 281.972 }} />
        </div>
      </div>
    </div>
  );
}

export function ChristianPageChrome() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 min-h-full" style={{ background: C_BG }} aria-hidden />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% -10%, rgba(143,175,147,0.14) 0%, transparent 55%), radial-gradient(ellipse 70% 40% at 100% 100%, rgba(196,165,116,0.08) 0%, transparent 50%)",
        }}
        aria-hidden
      />

      {/* Watercolor stain — top right */}
      <div
        className="pointer-events-none absolute z-[2]"
        style={{ right: -15, top: -30, width: 170, height: 220, transform: "rotate(-18.3deg)", opacity: 0.5 }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${ASSET}/watercolor-stain.webp`} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      {/* Watercolor stain — bottom left */}
      <div
        className="pointer-events-none absolute z-[2]"
        style={{ left: -40, bottom: -30, width: 200, height: 195, transform: "rotate(-18.3deg)", opacity: 0.5 }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${ASSET}/watercolor-stain.webp`} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      <CornerComposite flip />
      <CornerComposite />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[40%]"
        style={{ background: "linear-gradient(to top, rgba(252,252,250,0.90) 0%, transparent 100%)" }}
        aria-hidden
      />
    </>
  );
}
