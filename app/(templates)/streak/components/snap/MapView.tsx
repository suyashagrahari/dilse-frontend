"use client";

// The map tab — a pastel city drawn in SVG, both avatars standing at the one
// place that's theirs, a heat glow of hearts around them, and the real map's
// floating chrome: avatar + search up top, three round buttons along the
// bottom, a friend card that says exactly how far apart they are.

import type { Ctx } from "./ctx";
import Bitmoji from "./Bitmoji";
import { IcGear, IcMemories, IcSearch, IcStories } from "./icons";

function Streets() {
  return (
    <svg className="snMapSvg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <rect width="400" height="700" fill="#F2EFE6" />
      {/* water */}
      <path d="M-20 520c60-30 120-10 170 20s130 40 270-10v200H-20z" fill="#BFE3F7" />
      <path d="M300 -20c-20 60 10 110 60 140s60 60 60 90V-20z" fill="#BFE3F7" />
      {/* parks */}
      <path d="M40 90h110l14 70-40 40H52z" fill="#CDEBC0" />
      <path d="M250 300l90 10 10 90-70 20-40-60z" fill="#CDEBC0" />
      <circle cx="120" cy="420" r="36" fill="#CDEBC0" />
      {/* blocks */}
      {Array.from({ length: 36 }, (_, i) => {
        const x = (i % 6) * 70 - 10 + ((i * 13) % 17);
        const y = Math.floor(i / 6) * 90 + 20 + ((i * 7) % 11);
        return <rect key={i} x={x} y={y} width="46" height="58" rx="6" fill="#E9E4D8" opacity={i % 3 === 0 ? 0.9 : 0.55} />;
      })}
      {/* roads */}
      <g stroke="#fff" strokeLinecap="round" fill="none">
        <path d="M-10 250C90 230 170 270 240 250s120-40 180-20" strokeWidth="16" />
        <path d="M180 -10c-10 120 20 220 0 330s-40 250-10 400" strokeWidth="14" />
        <path d="M-10 380h420" strokeWidth="9" />
        <path d="M60 -10v720M320 -10v720" strokeWidth="7" />
        <path d="M-10 120c120 20 260-10 420 30" strokeWidth="8" />
      </g>
      <g stroke="#FFD66B" strokeLinecap="round" fill="none" opacity=".9">
        <path d="M-10 250C90 230 170 270 240 250s120-40 180-20" strokeWidth="5" />
      </g>
    </svg>
  );
}

export function MiniMap({ ctx }: { ctx: Ctx }) {
  const place = ctx.data.mapPlace || "our spot";
  return (
    <div className="snMini">
      <Streets />
      <div className="snMiniPins">
        <Bitmoji preset={ctx.themAvatar} side={ctx.them} photoUrl={ctx.themP.photoUrl} size={40} />
        <span className="snMiniHeart">💗</span>
        <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={40} />
      </div>
      <span className="snMiniLabel">📍 {place}</span>
    </div>
  );
}

export default function MapView({ ctx }: { ctx: Ctx }) {
  const place = ctx.data.mapPlace || "our spot";
  const name = ctx.themP.name || "them";
  return (
    <div className="snMap">
      <Streets />
      <div className="snHeat" aria-hidden>
        <i />
        <i />
        <i />
      </div>

      <div className="snPins">
        <div className="snPin2 is-them">
          <Bitmoji preset={ctx.themAvatar} side={ctx.them} photoUrl={ctx.themP.photoUrl} size={64} />
          <span className="snPinName">{name}</span>
        </div>
        <span className="snPinHeart" aria-hidden>💗</span>
        <div className="snPin2 is-me">
          <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={64} mood="love" />
          <span className="snPinName">Me</span>
        </div>
      </div>
      <span className="snPlace">📍 {place}</span>

      <div className="snMapTop">
        <button type="button" className="snCamAv is-light" onClick={ctx.openProfile} aria-label="Profile">
          <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={38} />
        </button>
        <button type="button" className="snRound is-white" onClick={() => ctx.toast(`searching the map… ${name} is right next to you 💗`)} aria-label="Search">
          <IcSearch size={19} />
        </button>
        <div className="snFlex" />
        <span className="snWeather">☀️ 24°</span>
        <button type="button" className="snRound is-white" onClick={() => ctx.toast("ghost mode: off. forever. 💛")} aria-label="Settings">
          <IcGear size={19} />
        </button>
      </div>

      <div className="snMapBottom">
        <div className="snMapCard">
          <Bitmoji preset={ctx.themAvatar} side={ctx.them} photoUrl={ctx.themP.photoUrl} size={44} />
          <div>
            <b>{name}</b>
            <span>with you at {place} · 0 km away 💗</span>
          </div>
        </div>
        <div className="snMapBtns">
          <button type="button" onClick={ctx.openMemories}>
            <span><IcMemories size={22} /></span>
            Memories
          </button>
          <button type="button" onClick={ctx.openProfile}>
            <span><Bitmoji preset={ctx.meAvatar} side={ctx.me} size={30} /></span>
            Avatar
          </button>
          <button type="button" onClick={() => ctx.go("stories")}>
            <span><IcStories size={22} /></span>
            Friends
          </button>
        </div>
      </div>
    </div>
  );
}
