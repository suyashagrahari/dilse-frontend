// ─── Dedication — the sender's own videos ────────────────────────────────────
//
// A plain <video> element on the radio's screen, driven the same way the voice
// elements are: it is PLAYED once inside the tune-in gesture (muted, then
// paused) so that WebKit lifts its gesture restriction for that element, and
// every later clip can start with sound without a second tap.
//
// If a browser still refuses (NotAllowedError), the screen shows a big "tap to
// play" button — a fresh gesture — instead of silently skipping the clip.
//
// The element is NOT routed through the AudioContext: uploaded videos live on
// the CDN without CORS headers, and a cross-origin MediaElementSource outputs
// silence. The VU meters simulate during clips, as they do during songs.

export interface ClipCallbacks {
  onEnded: () => void;
  onError: (why: string) => void;
  onBlocked: () => void;
  onPlaying: () => void;
}

export class ClipController {
  private el: HTMLVideoElement | null = null;
  private fadeTimer: number | null = null;
  private cbs: ClipCallbacks | null = null;
  private active = false;

  attach = (el: HTMLVideoElement | null): void => {
    this.el = el;
    if (!el) return;
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.preload = "metadata";
    el.onended = () => {
      if (this.active) this.cbs?.onEnded();
    };
    el.onerror = () => {
      if (this.active) this.cbs?.onError("video failed to load");
    };
    el.onplaying = () => {
      if (this.active) this.cbs?.onPlaying();
    };
  };

  get exists(): boolean {
    return Boolean(this.el);
  }

  /** Inside the tune-in gesture. Synchronous call to play() is what matters. */
  prime(url: string): void {
    const el = this.el;
    if (!el) return;
    try {
      el.muted = true;
      el.src = url;
      void el.play().then(
        () => {
          if (!this.active) {
            el.pause();
            el.currentTime = 0;
          }
        },
        () => {
          /* AbortError / NotAllowed — handled by the blocked path later */
        },
      );
    } catch {
      /* no video support — clips will report errors and be skipped */
    }
  }

  play(url: string, volume01: number, cbs: ClipCallbacks): void {
    const el = this.el;
    this.cbs = cbs;
    this.active = true;
    if (!el) {
      cbs.onError("no video element");
      return;
    }
    this.clearFade();
    if (el.src !== url) el.src = url;
    try {
      el.currentTime = 0;
    } catch {
      /* not seekable yet — starts at 0 anyway */
    }
    el.muted = false;
    el.volume = Math.max(0, Math.min(1, volume01));
    void el.play().catch((e: unknown) => {
      if (!this.active) return;
      const name = e instanceof DOMException ? e.name : "";
      if (name === "NotAllowedError") cbs.onBlocked();
      else if (name !== "AbortError") cbs.onError(String(e));
    });
  }

  /** From a tap on the screen's "tap to play" button — a real gesture. */
  resumeFromGesture(): void {
    const el = this.el;
    if (!el || !this.active) return;
    el.muted = false;
    void el.play().catch(() => {
      // Last resort: play muted rather than not at all.
      el.muted = true;
      void el.play().catch(() => {});
    });
  }

  pause(): void {
    this.el?.pause();
  }

  resume(): void {
    if (this.active) void this.el?.play().catch(() => {});
  }

  setVolume(volume01: number): void {
    if (this.el) this.el.volume = Math.max(0, Math.min(1, volume01));
  }

  fadeOut(ms: number, done?: () => void): void {
    const el = this.el;
    this.clearFade();
    if (!el || !this.active) {
      this.stop();
      done?.();
      return;
    }
    const from = el.volume;
    const start = performance.now();
    this.fadeTimer = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / ms);
      el.volume = Math.max(0, from * (1 - t));
      if (t >= 1) {
        this.stop();
        done?.();
      }
    }, 50);
  }

  stop(): void {
    this.clearFade();
    this.active = false;
    this.cbs = null;
    if (this.el) {
      this.el.pause();
      this.el.muted = true;
    }
  }

  private clearFade(): void {
    if (this.fadeTimer !== null) window.clearInterval(this.fadeTimer);
    this.fadeTimer = null;
  }

  destroy(): void {
    this.stop();
  }
}
