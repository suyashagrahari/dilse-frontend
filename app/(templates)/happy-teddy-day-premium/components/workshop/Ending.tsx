"use client";

// ─── The ending: the Teddy Birth Certificate, the sealed P.S., write back ────

import { useMemo, useState } from "react";
import type { DayConfig } from "../../../_valentine/types";
import { EndingActions, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { KineticName, ReplyBox, usePremium } from "../../../_valentine/kit/premium";
import { FUR, Teddy } from "./art";
import type { SceneProps } from "./shared";

export function birthCertificate(day: DayConfig, p: SceneProps, squishes: number, bornAt: string): KeepsakeLayout {
  const { data, x, name } = p;
  const W = 1080, H = 1920;
  const ink = "#3A2A4A", rose = "#C2185B";
  const fur = FUR[x.furColor] ?? FUR.honey;
  const items: KeepsakeItem[] = [];
  items.push({ type: "rect", x: 70, y: 70, w: W - 140, h: H - 140, radius: 36, fill: "#FFFBF4", stroke: "#E8A0B4", lineWidth: 6 });
  items.push({ type: "rect", x: 96, y: 96, w: W - 192, h: H - 192, radius: 26, stroke: "#F3D3DF", lineWidth: 3 });
  items.push({ type: "text", text: "✦ TEDDY BIRTH CERTIFICATE ✦", x: W / 2, y: 170, size: 34, weight: 700, color: rose, face: "ui" });
  items.push({ type: "text", text: name, x: W / 2, y: 240, size: 140, weight: 700, face: "script", color: ink, maxWidth: 900, maxLines: 1 });
  // a paw print in the teddy's fur colour
  const px = W / 2, py = 560;
  items.push({ type: "rect", x: px - 110, y: py - 30, w: 220, h: 180, radius: 90, fill: fur.a });
  items.push({ type: "rect", x: px - 150, y: py - 150, w: 80, h: 90, radius: 40, fill: fur.a });
  items.push({ type: "rect", x: px - 40, y: py - 190, w: 80, h: 90, radius: 40, fill: fur.a });
  items.push({ type: "rect", x: px + 70, y: py - 150, w: 80, h: 90, radius: 40, fill: fur.a });
  if (x.pawInitial) items.push({ type: "text", text: x.pawInitial.toUpperCase(), x: px, y: py + 20, size: 80, weight: 700, color: "#FFFBF4", face: "serif" });
  const rows: [string, string][] = [
    ["Born", `${bornAt}, in ${data.recipientName || "your"}'s hands`],
    ["Contains", `1 heart, from ${data.senderName || "someone who loves you"}`],
    ["Stitched by", data.recipientName || "you"],
    ["Fur", `${x.furColor === "white" ? "snow" : x.furColor || "honey"} · fluffiness: perfect`],
    ["Squished", `${squishes}×`],
  ];
  let y = 830;
  for (const [k, v] of rows) {
    items.push({ type: "text", text: k.toUpperCase(), x: W / 2, y, size: 26, weight: 700, color: rose, face: "ui" });
    items.push({ type: "text", text: v, x: W / 2, y: y + 40, size: 44, face: "serif", color: ink, maxWidth: 860, maxLines: 2 });
    y += 150;
  }
  const photo = data.photos[0];
  if (photo?.url) items.push({ type: "image", src: photo.url, x: W / 2 - 150, y: 1580, w: 300, h: 300, radius: 150, cropX: photo.cropX, cropY: photo.cropY });
  items.push({ type: "text", text: `${day.date} ${day.month}`.toUpperCase() + " · made on subhsandesh.in ✦", x: W / 2, y: H - 150, size: 24, color: "rgba(58,42,74,.55)", face: "ui" });
  return { width: W, height: H, background: "#F3E6EE", items };
}

export default function Ending({ day, mode, squishes, onReplay, ...p }: SceneProps & { day: DayConfig; mode: "preview" | "live"; squishes: number; onReplay: () => void }) {
  const { data, name, look, sfx, sticker } = p;
  const prem = usePremium();
  const [ps, setPs] = useState(false);
  const bornAt = useMemo(() => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), []);
  return (
    <section className="td-sec td-endSec">
      <div className="td-endTeddy" aria-hidden>
        <Teddy {...look} awake={false} />
        <span className="td-zzz">z z z</span>
      </div>
      <p className="td-kick">{name} is home</p>
      <KineticName text={data.recipientName || "you"} size="clamp(42px, 12vw, 80px)" gilt as="h2" />
      <p className="td-endLine">{data.endLine || "A piece of me stays with you. Goodnight 🧸"}</p>
      <div className="td-certCard">
        <b>Teddy Birth Certificate</b>
        <span>Born {bornAt} in {data.recipientName || "your"}'s hands · contains 1 heart from {data.senderName || "me"} · squished {squishes}×</span>
      </div>
      <span className="td-stick">{sticker("pt6-sleep", 72)}</span>
      {prem.premium.psLetter && (
        <button
          type="button"
          className={`td-ps${ps ? " is-open" : ""}`}
          onClick={() => {
            if (!ps) sfx("wax-crack");
            setPs(true);
          }}
          aria-expanded={ps}
        >
          {ps ? (
            <span className="td-psTx">{prem.premium.psLetter}</span>
          ) : (
            <>
              <span className="td-psSeal" aria-hidden>✦</span>
              <span>A note pinned under his pillow — tap to open</span>
            </>
          )}
        </button>
      )}
      <ReplyBox title={`Write back to ${data.senderName || "them"}`} placeholder={`${name} says hi. So do I…`} accent="#D9628F" />
      <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => birthCertificate(day, p, squishes, bornAt)} />
      <p className="td-credit">Stitched with SubhSandesh ✦ Premium</p>
    </section>
  );
}
