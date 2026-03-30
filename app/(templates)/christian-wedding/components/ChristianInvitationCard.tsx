"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";

const ASSET = "/christan-wedding";

const CW = 433;
const CH = 610;

const C_TEXT = "rgb(84, 107, 87)";
const F_SCRIPT = "var(--font-great-vibes), 'Great Vibes', cursive";
const F_CAP = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const F_DAY = "var(--font-lora), Lora, serif";

const ORIG = {
  joinus: 70, sub: 118,
  couple: 130, rings: 173,
  accentL: 218, accentR: 219,
  names: 355,
  month: 395, daterow: 412, year: 450, addr: 468,
};

function formatWeddingDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) throw new Error("invalid");
    const month = d.toLocaleString("en-US", { month: "long" }).toUpperCase();
    const weekday = d.toLocaleString("en-US", { weekday: "long" }).toUpperCase();
    const dayNum = String(d.getDate());
    const year = String(d.getFullYear());
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const timeStr = m === 0 ? `AT ${h12} ${ampm}` : `AT ${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    return { month, weekday, dayNum, year, timeStr };
  } catch {
    return { month: "JULY", weekday: "SATURDAY", dayNum: "22", year: "2026", timeStr: "AT 7 PM" };
  }
}

function splitAddress(addr: string): [string, string] {
  const t = addr.trim() || "123 Anywhere St, Any City, ST 12345";
  const i = t.indexOf(",");
  if (i === -1) return [t, ""];
  return [t.slice(0, i + 1).trim(), t.slice(i + 1).trim()];
}

interface Props {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  blessing?: string;
}

export default function ChristianInvitationCard({ brideName, groomName, weddingDate, venue }: Props) {
  const dateInfo = useMemo(() => formatWeddingDate(weddingDate), [weddingDate]);
  const b = brideName.trim() || "Jane";
  const g = groomName.trim() || "Andrew";
  const [line1, line2] = splitAddress(venue);

  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    const inner = innerRef.current;
    if (!wrap || !card || !inner) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 768;
    const portrait = vh > vw;

    if (mobile && portrait) {
      const s = vw / CW;
      const virtualH = Math.ceil(vh / s);
      const extra = Math.max(0, virtualH - CH);

      const g1 = Math.round(extra * 0.22);
      const g2 = Math.round(extra * 0.20);
      const g3 = Math.round(extra * 0.10);

      wrap.style.cssText = `width:${vw}px;height:${vh}px;overflow:hidden;position:fixed;top:0;left:0;z-index:30;`;
      card.style.width = `${CW}px`;
      card.style.height = `${virtualH}px`;
      card.style.transform = `scale(${s})`;
      card.style.transformOrigin = "0 0";
      card.style.left = "0";
      card.style.top = "0";
      card.style.borderRadius = "0";
      card.style.boxShadow = "none";

      inner.style.top = "25px";
      inner.style.height = `${virtualH - 50}px`;

      const q = (sel: string) => inner.querySelector<HTMLElement>(sel);
      const setT = (sel: string, v: number) => { const e = q(sel); if (e) e.style.top = `${v}px`; };

      setT("[data-el='joinus']", ORIG.joinus + g1);
      setT("[data-el='sub']", ORIG.sub + g1);

      const s2 = g1 + g2;
      setT("[data-el='couple']", ORIG.couple + s2);
      setT("[data-el='rings']", ORIG.rings + s2);
      setT("[data-el='accent-l']", ORIG.accentL + s2);
      setT("[data-el='accent-r']", ORIG.accentR + s2);
      setT("[data-el='names']", ORIG.names + s2);

      const s3 = s2 + g3;
      setT("[data-el='month']", ORIG.month + s3);
      setT("[data-el='daterow']", ORIG.daterow + s3);
      setT("[data-el='year']", ORIG.year + s3);
      setT("[data-el='addr']", ORIG.addr + s3);

      const names = q("[data-el='names']");
      if (names) names.style.fontSize = "44px";
      const amp = q("[data-el='names'] .amp");
      if (amp) amp.style.fontSize = "36px";

      const joinus = q("[data-el='joinus']");
      if (joinus) joinus.style.fontSize = "34px";
      const sub = q("[data-el='sub']");
      if (sub) sub.style.fontSize = "9px";
      const month = q("[data-el='month']");
      if (month) month.style.fontSize = "15px";
      const year = q("[data-el='year']");
      if (year) year.style.fontSize = "15px";
      const addr = q("[data-el='addr']");
      if (addr) addr.style.fontSize = "12px";

      const dr = q("[data-el='daterow']");
      if (dr) {
        const wk = dr.querySelector<HTMLElement>(".wkday");
        const tv = dr.querySelector<HTMLElement>(".time-val");
        const dn = dr.querySelector<HTMLElement>(".daynum");
        if (wk) wk.style.fontSize = "15px";
        if (tv) tv.style.fontSize = "15px";
        if (dn) dn.style.fontSize = "42px";
      }
    } else if (mobile) {
      const s = Math.min(vw / CW, vh / CH);
      const offX = Math.round((vw - CW * s) / 2);
      const offY = Math.round((vh - CH * s) / 2);

      resetMobile(inner);
      card.style.width = "";
      card.style.height = "";
      wrap.style.cssText = `width:${vw}px;height:${vh}px;overflow:hidden;position:fixed;top:0;left:0;z-index:30;`;
      card.style.transform = `scale(${s})`;
      card.style.transformOrigin = "0 0";
      card.style.left = `${offX}px`;
      card.style.top = `${offY}px`;
      card.style.borderRadius = "0";
      card.style.boxShadow = "none";
    } else {
      resetMobile(inner);
      const s = Math.min((vw - 320) / CW, (vh - 48) / CH, 1);

      wrap.style.cssText = `width:${Math.round(CW * s)}px;height:${Math.round(CH * s)}px;position:relative;margin:0 auto;`;
      card.style.width = "";
      card.style.height = "";
      card.style.transform = `scale(${s})`;
      card.style.transformOrigin = "0 0";
      card.style.left = "0";
      card.style.top = "0";
      card.style.borderRadius = "2px";
      card.style.boxShadow = "0 20px 50px rgba(84,107,87,0.13), 0 6px 16px rgba(84,107,87,0.07)";
    }
  }, []);

  useEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  return (
    <div ref={wrapRef}>
      <div
        ref={cardRef}
        style={{
          width: CW, height: CH,
          position: "absolute", left: 0, top: 0,
          background: "#ffffff",
          overflow: "hidden",
          transformOrigin: "0 0",
        }}
      >
        <div
          ref={innerRef}
          style={{
            position: "absolute",
            left: 18, top: 25,
            width: 397, height: 559,
            overflow: "visible",
          }}
        >
          {/* Watercolor stains */}
          <div style={{ position: "absolute", zIndex: 1, left: 287, top: -55, width: 268, height: 260, transform: "rotate(-18.3deg)", opacity: 0.73 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/watercolor-stain.png`} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ position: "absolute", zIndex: 1, left: -122, bottom: -55, width: 243, height: 236, transform: "rotate(-18.3deg)", opacity: 0.73 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/watercolor-stain.png`} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>

          {/* Corner floral — top-left (3-piece composite) */}
          <div style={{ position: "absolute", zIndex: 5, width: 262.2, height: 240.822, left: -76, top: -50, transform: "rotate(-180deg) scale(1.12)" }}>
            <div style={{ width: 382.451, height: 351.27, transform: "scale(0.685577)", transformOrigin: "0 0", position: "relative" }}>
              <div style={{ position: "absolute", overflow: "hidden", width: 232.545, height: 96.295, transform: "translate(143.372px,68.125px) rotate(90deg)" }}>
                <div style={{ transform: "scaleY(-1)", width: 232.545, height: 96.295, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${ASSET}/topleftcorner2.png`} alt="" draggable={false} style={{ display: "block", width: 232.545, height: 235.11, transform: "translateY(-138.815px)" }} />
                </div>
              </div>
              <div style={{ position: "absolute", overflow: "hidden", width: 232.545, height: 96.295, transform: "translate(0px,216.397px)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${ASSET}/topleftcorner3.png`} alt="" draggable={false} style={{ display: "block", width: 232.545, height: 235.11, transform: "translateY(-138.815px)" }} />
              </div>
              <div style={{ position: "absolute", overflow: "hidden", width: 283.519, height: 281.972, transform: "translate(98.932px,69.297px)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${ASSET}/topleftcorner1.png`} alt="" draggable={false} style={{ display: "block", width: 283.519, height: 281.972 }} />
              </div>
            </div>
          </div>

          {/* Corner floral — bottom-right (3-piece composite) */}
          <div style={{ position: "absolute", zIndex: 5, width: 262.2, height: 240.822, right: -76, bottom: -50, transform: "scale(1.12)" }}>
            <div style={{ width: 382.451, height: 351.27, transform: "scale(0.685577)", transformOrigin: "0 0", position: "relative" }}>
              <div style={{ position: "absolute", overflow: "hidden", width: 232.545, height: 96.295, transform: "translate(143.372px,68.125px) rotate(90deg)" }}>
                <div style={{ transform: "scaleY(-1)", width: 232.545, height: 96.295, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${ASSET}/bottomcorner3.png`} alt="" draggable={false} style={{ display: "block", width: 232.545, height: 235.11, transform: "translateY(-138.815px)" }} />
                </div>
              </div>
              <div style={{ position: "absolute", overflow: "hidden", width: 232.545, height: 96.295, transform: "translate(0px,216.397px)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${ASSET}/bottomcorner-3.png`} alt="" draggable={false} style={{ display: "block", width: 232.545, height: 235.11, transform: "translateY(-138.815px)" }} />
              </div>
              <div style={{ position: "absolute", overflow: "hidden", width: 283.519, height: 281.972, transform: "translate(98.932px,69.297px)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${ASSET}/bottomrightcorner1.png`} alt="" draggable={false} style={{ display: "block", width: 283.519, height: 281.972 }} />
              </div>
            </div>
          </div>

          {/* Small floral accents flanking the couple */}
          <div data-el="accent-l" style={{ position: "absolute", zIndex: 4, overflow: "hidden", mixBlendMode: "multiply", left: 40, top: ORIG.accentL, width: 185, height: 103, transform: "rotate(63.84deg)", opacity: 0.82 }}>
            <div style={{ position: "relative", width: 185, height: 187, transform: "translateY(-84px)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ASSET}/bottomcorner3.png`} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>
          <div data-el="accent-r" style={{ position: "absolute", zIndex: 4, overflow: "hidden", mixBlendMode: "multiply", left: 172, top: ORIG.accentR, width: 185, height: 103, transform: "rotate(117.66deg) scaleY(-1)", opacity: 1 }}>
            <div style={{ position: "relative", width: 185, height: 187, transform: "translateY(-84px)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ASSET}/bottomcorner3.png`} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>

          {/* Couple */}
          <div data-el="couple" style={{ position: "absolute", zIndex: 0, left: 103, top: ORIG.couple, width: 191, height: 174, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/couple.png`} alt="" draggable={false} style={{ display: "block", width: 191, height: 226, objectFit: "contain", objectPosition: "top center", opacity: 0.9 }} />
          </div>

          {/* Rings */}
          <div data-el="rings" style={{ position: "absolute", zIndex: 11, left: 189, top: ORIG.rings, width: 20, height: 21 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ASSET}/rings.png`} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>

          {/* Join Us */}
          <div data-el="joinus" style={{ position: "absolute", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", left: 0, top: ORIG.joinus, width: 397, height: 42, fontFamily: F_SCRIPT, fontSize: 30, lineHeight: 1, color: C_TEXT }}>
            <span>Join Us</span>
          </div>

          {/* Subtitle */}
          <div data-el="sub" style={{ position: "absolute", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", left: 0, top: ORIG.sub, width: 397, height: 14, fontFamily: F_CAP, fontSize: 7.8, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.227em", lineHeight: 1, color: C_TEXT }}>
            <span>to celebrate Wedding of</span>
          </div>

          {/* Names */}
          <div data-el="names" style={{ position: "absolute", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap" as const, gap: "0 6px", left: 0, top: ORIG.names, width: 397, fontFamily: F_SCRIPT, fontSize: 40, lineHeight: 1.2, color: C_TEXT, overflow: "visible" }}>
            <span style={{ padding: "3px 10px" }}>{b}</span>
            <span className="amp" style={{ fontSize: 32, padding: "2px 4px" }}>&amp;</span>
            <span style={{ padding: "3px 10px" }}>{g}</span>
          </div>

          {/* Month */}
          <div data-el="month" style={{ position: "absolute", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", left: 0, top: ORIG.month, width: 397, height: 18, fontFamily: F_CAP, fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: C_TEXT }}>
            <span>{dateInfo.month}</span>
          </div>

          {/* Date row */}
          <div data-el="daterow" style={{ position: "absolute", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", left: 0, top: ORIG.daterow, width: 397, height: 46, color: C_TEXT }}>
            <span className="wkday" style={{ fontFamily: F_CAP, fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.118em" }}>{dateInfo.weekday}</span>
            <span className="daynum" style={{ fontFamily: F_DAY, fontSize: 38, fontWeight: 400, lineHeight: 1, padding: "0 14px", position: "relative", top: -1 }}>{dateInfo.dayNum}</span>
            <span className="time-val" style={{ fontFamily: F_CAP, fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.118em" }}>{dateInfo.timeStr}</span>
          </div>

          {/* Year */}
          <div data-el="year" style={{ position: "absolute", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", left: 0, top: ORIG.year, width: 397, height: 18, fontFamily: F_CAP, fontSize: 13, fontWeight: 700, letterSpacing: "0.118em", color: C_TEXT }}>
            <span>{dateInfo.year}</span>
          </div>

          {/* Address */}
          <div data-el="addr" style={{ position: "absolute", zIndex: 20, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", left: 0, top: ORIG.addr, width: 397, height: 44, fontFamily: F_CAP, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.177em", lineHeight: 1.6, textAlign: "center" as const, color: C_TEXT }}>
            <span>{line1}</span>
            {line2 && <span>{line2}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function resetMobile(inner: HTMLElement) {
  inner.style.top = "";
  inner.style.height = "";
  const sels = ["joinus", "sub", "couple", "rings", "accent-l", "accent-r", "names", "month", "daterow", "year", "addr"];
  sels.forEach((s) => {
    const e = inner.querySelector<HTMLElement>(`[data-el='${s}']`);
    if (e) { e.style.top = ""; e.style.fontSize = ""; }
  });
  const amp = inner.querySelector<HTMLElement>("[data-el='names'] .amp");
  if (amp) amp.style.fontSize = "";
  const dr = inner.querySelector<HTMLElement>("[data-el='daterow']");
  if (dr) {
    const wk = dr.querySelector<HTMLElement>(".wkday");
    const tv = dr.querySelector<HTMLElement>(".time-val");
    const dn = dr.querySelector<HTMLElement>(".daynum");
    if (wk) wk.style.fontSize = "";
    if (tv) tv.style.fontSize = "";
    if (dn) dn.style.fontSize = "";
  }
}
