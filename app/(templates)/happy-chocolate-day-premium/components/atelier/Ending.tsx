"use client";

// ─── The ending: the tied box, the line, the golden-ticket coupon, the sealed
// P.S., "write back to the chocolatier", and the Certificate of Craft keepsake.

import { useState } from "react";
import type { DayConfig } from "../../../_valentine/types";
import { EndingActions, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { KineticName, ReplyBox, usePremium } from "../../../_valentine/kit/premium";
import { FLAVOURS } from "./art";
import { GoldenTicket } from "./Ticket";
import type { SceneProps } from "./shared";

export function certificate(day: DayConfig, p: SceneProps, tasted: number): KeepsakeLayout {
  const { data, x, truffles } = p;
  const W = 1080, H = 1920;
  const gold = "#E6B85C", cream = "#FFF6EA";
  const items: KeepsakeItem[] = [];
  items.push({ type: "rect", x: 60, y: 60, w: W - 120, h: H - 120, radius: 40, stroke: gold, lineWidth: 4 });
  items.push({ type: "rect", x: 84, y: 84, w: W - 168, h: H - 168, radius: 30, stroke: "rgba(230,184,92,.4)", lineWidth: 2 });
  items.push({ type: "text", text: "ATELIER · CHOCOLAT · MIDNIGHT BATCH", x: W / 2, y: 170, size: 30, weight: 700, color: gold, face: "ui" });
  items.push({ type: "text", text: "Certificate of Craft", x: W / 2, y: 240, size: 92, weight: 700, face: "serif", color: cream });
  items.push({ type: "text", text: "This is to certify that", x: W / 2, y: 380, size: 38, face: "serif", italic: true, color: "rgba(255,246,234,.75)" });
  items.push({ type: "text", text: data.recipientName || "you", x: W / 2, y: 440, size: 130, face: "script", weight: 700, color: gold, maxWidth: 920, maxLines: 1 });
  items.push({
    type: "text",
    text: `poured, tempered and smashed one chocolate heart, and tasted ${tasted || truffles.length} truffle${(tasted || truffles.length) === 1 ? "" : "s"} of reasons, made by hand at midnight by ${data.senderName || "someone who loves you"}.`,
    x: W / 2, y: 620, size: 40, face: "serif", color: cream, maxWidth: 860, maxLines: 4, lineHeight: 1.35,
  });
  const photo = data.photos[0];
  if (photo?.url) items.push({ type: "image", src: photo.url, x: W / 2 - 220, y: 860, w: 440, h: 440, radius: 220, cropX: photo.cropX, cropY: photo.cropY });
  else items.push({ type: "emoji", char: "🍫", x: W / 2, y: 1080, size: 300 });
  // the golden-ticket coupon
  const ty = 1380;
  items.push({ type: "rect", x: 120, y: ty, w: W - 240, h: 260, radius: 26, fill: "#E2B44A" });
  items.push({ type: "rect", x: 136, y: ty + 16, w: W - 272, h: 228, radius: 18, stroke: "#8f6118", lineWidth: 3 });
  items.push({ type: "text", text: "✦ GOLDEN TICKET · ADMIT ONE ✦", x: W / 2, y: ty + 40, size: 28, weight: 700, color: "#5a3a06", face: "ui" });
  items.push({ type: "text", text: x.ticketPromise || "One date of your choosing.", x: W / 2, y: ty + 92, size: 42, weight: 700, color: "#2b1a03", face: "serif", maxWidth: 760, maxLines: 2, lineHeight: 1.2 });
  items.push({ type: "text", text: `REDEEM WITH ${(data.senderName || "ME").toUpperCase()} · VALID FOREVER`, x: W / 2, y: ty + 200, size: 24, weight: 700, color: "#5a3a06", face: "ui" });
  const flav = truffles.map((t) => FLAVOURS[t.flavour]?.name).filter(Boolean).slice(0, 6).join(" · ");
  if (flav) items.push({ type: "text", text: flav, x: W / 2, y: 1690, size: 28, color: "rgba(255,246,234,.7)", face: "ui" });
  items.push({ type: "text", text: `${day.date} ${day.month}`.toUpperCase() + " · made on subhsandesh.in ✦", x: W / 2, y: 1750, size: 24, color: "rgba(255,246,234,.55)", face: "ui" });
  return { width: W, height: H, background: { stops: [[0, "#3B2117"], [0.6, "#24120A"], [1, "#140904"]] }, items };
}

export default function Ending({ day, mode, tasted, onReplay, ...p }: SceneProps & { day: DayConfig; mode: "preview" | "live"; tasted: number; onReplay: () => void }) {
  const { data, x, sfx, sticker } = p;
  const prem = usePremium();
  const [ps, setPs] = useState(false);
  const promise = x.ticketPromise || "One date of your choosing. My treat.";
  return (
    <section className="mc-sec mc-endSec">
      <span className="mc-stick">{sticker("pc6-box", 92)}</span>
      <p className="mc-kick">Closing time</p>
      <KineticName text={data.recipientName || "you"} size="clamp(44px, 13vw, 84px)" gilt as="h2" />
      <p className="mc-endLine">{data.endLine || "Made by hand, at midnight, for one person."}</p>
      <div className="mc-endTicket">
        <GoldenTicket promise={promise} sender={data.senderName} recipient={data.recipientName} small />
      </div>
      {prem.premium.psLetter && (
        <button
          type="button"
          className={`mc-ps${ps ? " is-open" : ""}`}
          onClick={() => {
            if (!ps) sfx("wax-crack");
            setPs(true);
          }}
          aria-expanded={ps}
        >
          {ps ? (
            <span className="mc-psTx">{prem.premium.psLetter}</span>
          ) : (
            <>
              <span className="mc-psSeal" aria-hidden>✦</span>
              <span>A sealed P.S. under the box — tap to open</span>
            </>
          )}
        </button>
      )}
      <ReplyBox title={`Write back to the chocolatier${data.senderName ? `, ${data.senderName}` : ""}`} placeholder="I'm redeeming my golden ticket…" accent="#C2185B" />
      <EndingActions
        day={day}
        data={data}
        mode={mode}
        onReplay={onReplay}
        replyLabel="🎫 Redeem my ticket"
        replyText={`I'm redeeming my golden ticket 🎫: ${promise}`}
        keepsake={() => certificate(day, p, tasted)}
      />
      <p className="mc-credit">Made by hand with SubhSandesh ✦ Premium</p>
    </section>
  );
}
