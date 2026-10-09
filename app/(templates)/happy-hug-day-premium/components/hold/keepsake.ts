// The keepsake: a 1080×1920 story image of the hug coupon. Their photo is printed the way the hug left it: black and
// white at the edges, blooming into colour from where the thumb was. Drawn by hand on a canvas (not the kit's layout
// renderer) so it uses the page's own two faces and the colour bloom. Photos come through the same-origin image route,
// so the canvas never taints.

import { fileSlug } from "@/lib/exportPng";
import type { LovePhoto } from "../../../_valentine/types";
import type { Coupon, Hug } from "./model";

const W = 1080;
const H = 1920;

const proxied = (src: string) => (src.startsWith("data:") || src.startsWith("/") ? src : `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`);

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = proxied(src);
  });
}

function family(name: string, fallback: string) {
  const el = document.querySelector(".hh-root");
  const v = el ? getComputedStyle(el).getPropertyValue(name).trim() : "";
  return v ? `${v}, ${fallback}` : fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > max && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Cover-fit the photo (sender's crop) into w×h, then bloom colour out of (fx, fy) over a black-and-white print. */
function bloomPrint(img: HTMLImageElement, ph: LovePhoto, w: number, h: number) {
  const colour = document.createElement("canvas");
  colour.width = w;
  colour.height = h;
  const c = colour.getContext("2d");
  if (!c) return colour;
  const s = Math.max(w / img.width, h / img.height) * (Math.max(100, Math.min(300, ph.scale ?? 100)) / 100);
  const dw = img.width * s;
  const dh = img.height * s;
  c.drawImage(img, (w - dw) * ((ph.cropX ?? 50) / 100), (h - dh) * ((ph.cropY ?? 50) / 100), dw, dh);

  const mono = document.createElement("canvas");
  mono.width = w;
  mono.height = h;
  const m = mono.getContext("2d");
  if (!m) return colour;
  m.drawImage(colour, 0, 0);
  const d = m.getImageData(0, 0, w, h);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const l = Math.max(0, Math.min(255, (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2] - 128) * 1.1 + 128 - 10));
    p[i] = p[i + 1] = p[i + 2] = l;
  }
  m.putImageData(d, 0, 0);

  // Warm the colour a touch, then keep it only inside a soft circle around the thumb.
  c.globalCompositeOperation = "soft-light";
  c.fillStyle = "rgba(255,180,130,.35)";
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = "destination-in";
  const g = c.createRadialGradient(w * 0.5, h * 0.7, 0, w * 0.5, h * 0.7, Math.hypot(w, h) * 0.62);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.62, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = "source-over";
  m.drawImage(colour, 0, 0);
  return mono;
}

export async function renderHugCard(h: Hug, coupon: Coupon, endLine: string): Promise<Blob | null> {
  try {
    const serif = family("--hh-serif", "Georgia, serif");
    const sans = family("--hh-sans", "system-ui, sans-serif");
    try {
      await Promise.all([document.fonts.load(`400 80px ${serif}`), document.fonts.load(`italic 400 80px ${serif}`), document.fonts.load(`700 28px ${sans}`)]);
    } catch {
      /* fall back to whatever is loaded */
    }
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const x = cv.getContext("2d");
    if (!x) return null;
    const bg = x.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#F6EEE3");
    bg.addColorStop(0.55, "#EADBC8");
    bg.addColorStop(1, "#DCC7AE");
    x.fillStyle = bg;
    x.fillRect(0, 0, W, H);
    const glow = x.createRadialGradient(W / 2, 980, 0, W / 2, 980, 760);
    glow.addColorStop(0, "rgba(242,164,119,.28)");
    glow.addColorStop(1, "rgba(242,164,119,0)");
    x.fillStyle = glow;
    x.fillRect(0, 0, W, H);

    x.textAlign = "center";
    x.textBaseline = "alphabetic";
    x.fillStyle = "rgba(75,52,38,.62)";
    x.font = `700 26px ${sans}`;
    x.letterSpacing = "8px";
    x.fillText("THE TWENTY-SECOND HUG", W / 2, 150);
    x.letterSpacing = "0px";

    // The print.
    const pw = 760;
    const ph = 950;
    const py = 220;
    x.save();
    x.translate(W / 2, py + ph / 2);
    x.rotate(-0.02);
    x.shadowColor = "rgba(75,52,38,.45)";
    x.shadowBlur = 60;
    x.shadowOffsetY = 30;
    x.fillStyle = "#FFFCF7";
    x.fillRect(-pw / 2 - 22, -ph / 2 - 22, pw + 44, ph + 96);
    x.shadowColor = "transparent";
    const img = h.hero ? await loadImage(h.hero.url) : null;
    if (img && h.hero) x.drawImage(bloomPrint(img, h.hero, pw, ph), -pw / 2, -ph / 2, pw, ph);
    else {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, ph * 0.6);
      g.addColorStop(0, "#F7C3A0");
      g.addColorStop(1, "#C9774A");
      x.fillStyle = g;
      x.fillRect(-pw / 2, -ph / 2, pw, ph);
    }
    x.fillStyle = "rgba(75,52,38,.78)";
    x.font = `italic 400 40px ${serif}`;
    x.fillText(`${h.to} & ${h.from}`, 0, ph / 2 + 56, pw);
    x.restore();

    // The coupon.
    let y = py + ph + 210;
    x.fillStyle = "#4B3426";
    x.font = `400 112px ${serif}`;
    x.fillText(coupon.title || "Hug owed: 1", W / 2, y, 960);
    y += 74;
    x.fillStyle = "#C9774A";
    x.font = `700 26px ${sans}`;
    x.letterSpacing = "6px";
    x.fillText("REDEEM IN PERSON", W / 2, y);
    x.letterSpacing = "0px";
    if (coupon.detail) {
      y += 62;
      x.fillStyle = "rgba(75,52,38,.75)";
      x.font = `400 34px ${sans}`;
      for (const l of wrap(x, coupon.detail, 860).slice(0, 2)) {
        x.fillText(l, W / 2, y);
        y += 46;
      }
    }
    if (endLine) {
      y += 34;
      x.fillStyle = "#4B3426";
      x.font = `italic 400 48px ${serif}`;
      for (const l of wrap(x, endLine, 900).slice(0, 2)) {
        x.fillText(l, W / 2, y);
        y += 58;
      }
    }
    x.fillStyle = "rgba(75,52,38,.5)";
    x.font = `500 24px ${sans}`;
    x.fillText("made on subhsandesh.in ✦", W / 2, H - 70);
    return await new Promise<Blob | null>((r) => cv.toBlob((b) => r(b), "image/png"));
  } catch {
    return null;
  }
}

/** Web Share with the PNG where phones can share files, else a download. */
export async function saveHugCard(h: Hug, coupon: Coupon, endLine: string): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await renderHugCard(h, coupon, endLine);
  if (!blob) return "failed";
  const name = `${fileSlug(`hug-for-${h.to}`, "hug")}.png`;
  const file = new File([blob], name, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: `A hug for ${h.to}, from ${h.from} 🤍` });
      return "shared";
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "shared";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}
