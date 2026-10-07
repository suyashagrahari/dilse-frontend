// Keyframes and small classes the kit shares, injected once into <head> on the
// first mount of any kit component (so each component works standalone).
// Everything animated is switched off under prefers-reduced-motion.

export const KIT_CSS = `
@keyframes vw-bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12%) } }
@keyframes vw-float { 0%,100% { transform: translateY(0) rotate(-3deg) } 50% { transform: translateY(-8%) rotate(3deg) } }
@keyframes vw-wiggle { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-9deg) } 75% { transform: rotate(9deg) } }
@keyframes vw-pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.12) } }
@keyframes vw-spin { 0% { transform: rotate(0) scale(1) } 50% { transform: rotate(180deg) scale(1.1) } 100% { transform: rotate(360deg) scale(1) } }
@keyframes vw-fade-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes vw-drift { from { transform: translate3d(0, 0, 0) rotate(0deg) } to { transform: translate3d(var(--vw-dx, 20px), -110vh, 0) rotate(var(--vw-rot, 180deg)) } }
.vw-anim-bounce { animation: vw-bounce 1.6s ease-in-out infinite }
.vw-anim-float { animation: vw-float 3.2s ease-in-out infinite }
.vw-anim-wiggle { animation: vw-wiggle 1.8s ease-in-out infinite }
.vw-anim-pulse { animation: vw-pulse 1.4s ease-in-out infinite }
.vw-anim-spin { animation: vw-spin 2.6s cubic-bezier(.4,0,.2,1) infinite }
.vw-fade-up { animation: vw-fade-up .5s cubic-bezier(.2,.8,.2,1) both }
[data-vw-day] input, [data-vw-day] textarea, [data-vw-day] [contenteditable] { user-select: text; -webkit-user-select: text }
.vw-sr { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0 }
@media (prefers-reduced-motion: reduce) {
  .vw-anim-bounce, .vw-anim-float, .vw-anim-wiggle, .vw-anim-pulse, .vw-anim-spin, .vw-fade-up, .vw-drift { animation: none !important }
}
`;

let injected = false;

export function ensureKitCss(): void {
  if (injected || typeof document === "undefined") return;
  injected = true;
  if (document.getElementById("vw-kit-css")) return;
  const el = document.createElement("style");
  el.id = "vw-kit-css";
  el.textContent = KIT_CSS;
  document.head.appendChild(el);
}
