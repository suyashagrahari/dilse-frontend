// ─── Dedication — the radio's own audio ──────────────────────────────────────
//
// Everything you hear that is NOT the YouTube player is made here, live, in Web
// Audio. No audio file ships with this template.
//
//   • the tuning static      — two looping noise buffers through a bandpass
//   • the decoy stations     — a tone (music) or an AM-chopped lowpassed noise
//                              (voice-ish), gain driven by dial proximity
//   • the target carrier     — a steady tone that rises as the needle closes in
//   • the RJ voice           — an <audio> element, optionally routed through an
//                              AnalyserNode so the VU meters are genuine
//
// WHY THE STATIC IS NOT A FILE. A recorded static loop is audibly a loop inside
// about four seconds; the brief is explicit about it. Even generated, ONE
// looping buffer is periodic, so two run at coprime playback rates — their
// combined period is minutes long and the ear never finds the seam.
//
// THE THREE WAYS THIS GOES SILENT, and what is done about each:
//
//   1. AudioContext created outside a gesture → starts `suspended` and stays
//      there. Fixed by only ever constructing it from a pointerdown/keydown,
//      and by calling `resume()` on every subsequent gesture.
//   2. iOS interrupts the context (a call, a Siri invocation) and leaves it
//      `interrupted`/`suspended`. `pump()` is called on visibility return and
//      on every user control, and re-resumes.
//   3. A cross-origin voice file routed through `createMediaElementSource`
//      plays silently if the response has no CORS headers. Handled by trying
//      the routed element with `crossOrigin="anonymous"` first and, on the load
//      error that produces, replaying through a SECOND element that was never
//      routed into the graph. That element cannot be analysed, so the VU meters
//      drop to the simulated path — which is stated in `voiceIsAnalysed`.
//
// Every one of those writes a line into `diagnostics`, which the dev overlay
// prints. Silence with no explanation is the failure mode this file exists to
// prevent.

import { mulberry32, hash32 } from "@/lib/seededRandom";
import { DIAL, STATIC, proximity, type Decoy } from "./types";

type Ctor = new () => AudioContext;

const getCtor = (): Ctor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
};

/** Smoothing constant for `setTargetAtTime`. Small = snappy, large = syrupy. */
const GLIDE = 0.045;

/**
 * Origins already known to serve media without CORS headers.
 *
 * MEASURED, not assumed: the media bucket currently answers a cross-origin
 * request with no `Access-Control-Allow-Origin` at all, so an
 * `<audio crossOrigin="anonymous">` pointed at it fails with a format error and
 * the unrouted fallback has to run. Without this cache EVERY voice segment pays
 * for that twice — a failed round-trip, then the real one — which on a metered
 * connection is exactly the waste the show is supposed to avoid.
 *
 * Deliberately per-origin and learned at runtime rather than hard-coded: the
 * day the bucket gets a CORS rule, the first segment succeeds on the routed
 * pass and the VU meters become genuine again with no code change.
 */
const corsHostileOrigins = new Set<string>();

const originOf = (url: string): string | null => {
  if (!url.startsWith("http")) return null;
  try {
    const u = new URL(url);
    return u.origin === window.location.origin ? null : u.origin;
  } catch {
    return null;
  }
};

/** The carrier that rises as the target station comes in. */
const CARRIER_HZ = 440;
const CARRIER_GAIN = 0.07;

export interface RadioDiagnostic {
  at: number;
  level: "info" | "warn" | "error";
  message: string;
}

export class RadioAudio {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;

  // Static bed — two sources so the loop never reveals itself.
  private noiseSources: AudioBufferSourceNode[] = [];
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;

  // Target carrier.
  private carrierOsc: OscillatorNode | null = null;
  private carrierGain: GainNode | null = null;

  // Decoy bleed — one music voice, one voice-ish voice, cross-faded by dial.
  private decoyOsc: OscillatorNode | null = null;
  private decoyOscGain: GainNode | null = null;
  private decoyNoise: AudioBufferSourceNode | null = null;
  private decoyNoiseFilter: BiquadFilterNode | null = null;
  private decoyNoiseGain: GainNode | null = null;
  private decoyChopper: OscillatorNode | null = null;
  private decoyChopDepth: GainNode | null = null;

  // The RJ.
  private voiceEl: HTMLAudioElement | null = null;
  private plainEl: HTMLAudioElement | null = null;
  private analyser: AnalyserNode | null = null;
  private voiceBuf: Uint8Array<ArrayBuffer> | null = null;
  private routedOk = false;

  /** True while the currently-playing voice is genuinely being analysed. */
  voiceIsAnalysed = false;

  readonly diagnostics: RadioDiagnostic[] = [];

  private log(level: RadioDiagnostic["level"], message: string): void {
    this.diagnostics.push({ at: Date.now(), level, message });
    if (this.diagnostics.length > 60) this.diagnostics.shift();
    if (process.env.NODE_ENV !== "production" && level !== "info") {
      console[level === "error" ? "error" : "warn"](`[dedication/audio] ${message}`);
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * MUST be called from inside a real user-gesture handler. Idempotent, so the
   * tuner can call it on the first pointerdown (to get static under the drag)
   * and the lock handler can call it again as UNLOCK_ORDER step 1 without
   * building a second context.
   *
   * Returns true if a context exists afterwards.
   */
  ensureContext(): boolean {
    if (this.ac) {
      this.pump();
      return true;
    }
    const Ctor = getCtor();
    if (!Ctor) {
      this.log("error", "no AudioContext constructor — static, carrier and decoys will be silent");
      return false;
    }
    try {
      this.ac = new Ctor();
    } catch {
      this.log("error", "AudioContext construction threw — the radio has no sound");
      return false;
    }
    this.master = this.ac.createGain();
    this.master.gain.value = 1;
    this.master.connect(this.ac.destination);
    this.buildStatic();
    this.buildCarrier();
    this.buildDecoys();
    this.log("info", `AudioContext created (state=${this.ac.state})`);
    this.pump();
    return true;
  }

  /** True once the context exists AND is actually running. */
  get running(): boolean {
    return this.ac?.state === "running";
  }

  get contextState(): string {
    return this.ac?.state ?? "none";
  }

  /** Re-resume after an iOS interruption or a tab return. Safe to spam. */
  pump(): void {
    if (!this.ac) return;
    if (this.ac.state !== "running") {
      void this.ac.resume().catch(() => {
        this.log("warn", `resume() rejected while state=${this.ac?.state} — output stays silent`);
      });
    }
  }

  private now(): number {
    return this.ac ? this.ac.currentTime : 0;
  }

  /**
   * A noise buffer filled from a seeded generator. `Math.random` is banned in
   * this template and, more usefully, a fixed seed means the static sounds
   * identical for everyone — it can be reasoned about rather than guessed at.
   */
  private noiseBuffer(seed: string): AudioBuffer | null {
    if (!this.ac) return null;
    const rate = this.ac.sampleRate;
    const frames = Math.max(1, Math.floor(rate * STATIC.bufferSeconds));
    const buf = this.ac.createBuffer(1, frames, rate);
    const data = buf.getChannelData(0);
    const rand = mulberry32(hash32(seed));
    for (let i = 0; i < frames; i++) data[i] = rand() * 2 - 1;
    return buf;
  }

  private buildStatic(): void {
    if (!this.ac || !this.master) return;
    const filt = this.ac.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = STATIC.cutoffFar;
    filt.Q.value = 0.7;

    const gain = this.ac.createGain();
    gain.gain.value = 0;

    // Two beds at coprime rates. One alone is a 2-second loop and the ear finds
    // it; together the pattern does not repeat for minutes.
    for (const [seed, rate] of [
      ["dedication-static-a", 1],
      ["dedication-static-b", 0.7937],
    ] as const) {
      const buf = this.noiseBuffer(seed);
      if (!buf) continue;
      const src = this.ac.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.playbackRate.value = rate;
      src.connect(filt);
      try {
        src.start();
      } catch {
        this.log("warn", "static source failed to start");
      }
      this.noiseSources.push(src);
    }

    filt.connect(gain).connect(this.master);
    this.noiseFilter = filt;
    this.noiseGain = gain;
  }

  private buildCarrier(): void {
    if (!this.ac || !this.master) return;
    const osc = this.ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = CARRIER_HZ;
    const g = this.ac.createGain();
    g.gain.value = 0;
    osc.connect(g).connect(this.master);
    try {
      osc.start();
    } catch {
      this.log("warn", "carrier oscillator failed to start");
    }
    this.carrierOsc = osc;
    this.carrierGain = g;
  }

  private buildDecoys(): void {
    if (!this.ac || !this.master) return;

    // "music" flavour — a plain pitched tone, slightly detuned by the dial.
    const osc = this.ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 220;
    const oscGain = this.ac.createGain();
    oscGain.gain.value = 0;
    osc.connect(oscGain).connect(this.master);
    try {
      osc.start();
    } catch {
      this.log("warn", "decoy oscillator failed to start");
    }
    this.decoyOsc = osc;
    this.decoyOscGain = oscGain;

    // "voice" flavour — narrow lowpassed noise, amplitude-chopped at ~5.5Hz so
    // it has the cadence of speech through a wall without being speech.
    const buf = this.noiseBuffer("dedication-decoy-voice");
    if (buf) {
      const src = this.ac.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filt = this.ac.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = 520;
      filt.Q.value = 4.5;
      const g = this.ac.createGain();
      g.gain.value = 0;

      const chop = this.ac.createOscillator();
      chop.type = "sine";
      chop.frequency.value = 5.5;
      const depth = this.ac.createGain();
      depth.gain.value = 0;
      // Chopper modulates the gain node's own AudioParam — this is what turns a
      // flat hiss into something with syllables.
      chop.connect(depth).connect(g.gain);
      try {
        src.start();
        chop.start();
      } catch {
        this.log("warn", "decoy voice source failed to start");
      }

      src.connect(filt).connect(g).connect(this.master);
      this.decoyNoise = src;
      this.decoyNoiseFilter = filt;
      this.decoyNoiseGain = g;
      this.decoyChopper = chop;
      this.decoyChopDepth = depth;
    }
  }

  // ── The tuner ─────────────────────────────────────────────────────────────

  /**
   * Drive the whole tuning bed from one needle position.
   *
   * `nearest` is the strongest signal at this point on the dial, whether decoy
   * or target; the static thins out for BOTH, which is what makes the decoys
   * feel like real stations rather than sound effects.
   */
  setTuning(needle: number, target: number, decoys: Decoy[]): void {
    if (!this.ac) return;
    const t = this.now();

    const targetProx = proximity(needle, target);

    let bestDecoy: Decoy | null = null;
    let bestDecoyProx = 0;
    for (const d of decoys) {
      const p = proximity(needle, d.freq);
      if (p > bestDecoyProx) {
        bestDecoyProx = p;
        bestDecoy = d;
      }
    }

    const nearest = Math.max(targetProx, bestDecoyProx);

    // Static: loud and wide out in the weeds, quiet and narrow near a station.
    if (this.noiseGain && this.noiseFilter) {
      const g = STATIC.gainFar + (STATIC.gainNear - STATIC.gainFar) * nearest;
      const cut = STATIC.cutoffFar + (STATIC.cutoffNear - STATIC.cutoffFar) * nearest;
      this.noiseGain.gain.setTargetAtTime(g, t, GLIDE);
      this.noiseFilter.frequency.setTargetAtTime(cut, t, GLIDE);
    }

    // Target carrier: squared so it only really appears in the last stretch.
    if (this.carrierGain && this.carrierOsc) {
      this.carrierGain.gain.setTargetAtTime(CARRIER_GAIN * targetProx * targetProx, t, GLIDE);
      // Detune off-centre so landing dead-on is audibly "in tune".
      const off = (needle - target) * 26;
      this.carrierOsc.frequency.setTargetAtTime(CARRIER_HZ + off, t, GLIDE);
    }

    // Decoys: only the nearest one bleeds, and never over the target.
    const musicOn = bestDecoy?.flavour === "music" ? bestDecoyProx : 0;
    const voiceOn = bestDecoy?.flavour === "voice" ? bestDecoyProx : 0;
    const duck = 1 - targetProx; // the real station wins the frequency

    if (this.decoyOscGain && this.decoyOsc) {
      this.decoyOscGain.gain.setTargetAtTime(0.05 * musicOn * musicOn * duck, t, GLIDE);
      if (bestDecoy) this.decoyOsc.frequency.setTargetAtTime(bestDecoy.hz, t, GLIDE);
    }
    if (this.decoyNoiseGain && this.decoyChopDepth && this.decoyNoiseFilter) {
      const level = 0.14 * voiceOn * voiceOn * duck;
      this.decoyNoiseGain.gain.setTargetAtTime(level, t, GLIDE);
      this.decoyChopDepth.gain.setTargetAtTime(level * 0.9, t, GLIDE);
      if (bestDecoy) this.decoyNoiseFilter.frequency.setTargetAtTime(bestDecoy.hz + 320, t, GLIDE);
    }
  }

  /** Kill the tuning bed. Called the moment the station locks. */
  silenceTuner(fadeMs = 220): void {
    if (!this.ac) return;
    const t = this.now();
    const k = fadeMs / 3000;
    for (const g of [this.noiseGain, this.carrierGain, this.decoyOscGain, this.decoyNoiseGain, this.decoyChopDepth]) {
      g?.gain.setTargetAtTime(0, t, k);
    }
  }

  /**
   * The generated static BETWEEN segments — a hard swell and decay, not the
   * dial bed. Never a hard cut from one segment to the next.
   */
  interstitial(ms: number): void {
    if (!this.ac || !this.noiseGain || !this.noiseFilter) return;
    const t = this.now();
    const dur = ms / 1000;
    this.noiseFilter.frequency.cancelScheduledValues(t);
    this.noiseFilter.frequency.setValueAtTime(900, t);
    this.noiseFilter.frequency.linearRampToValueAtTime(2200, t + dur);
    const g = this.noiseGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(0.0001, g.value), t);
    g.linearRampToValueAtTime(STATIC.gainFar, t + Math.min(0.09, dur * 0.3));
    g.linearRampToValueAtTime(0.0001, t + dur);
  }

  // ── The RJ voice ──────────────────────────────────────────────────────────

  private ensureVoiceEl(): HTMLAudioElement | null {
    if (typeof document === "undefined") return null;
    if (this.voiceEl) return this.voiceEl;

    const el = document.createElement("audio");
    el.preload = "none"; // metered connections: the next file loads during the current segment, never all at once
    el.crossOrigin = "anonymous";
    this.voiceEl = el;

    if (this.ac && this.master) {
      try {
        const src = this.ac.createMediaElementSource(el);
        const an = this.ac.createAnalyser();
        an.fftSize = 1024;
        an.smoothingTimeConstant = 0.55;
        // Routed to the master, NOT left dangling. An analyser with no path to
        // the destination is the classic "it plays but you hear nothing".
        src.connect(an).connect(this.master);
        this.analyser = an;
        this.voiceBuf = new Uint8Array(new ArrayBuffer(an.fftSize));
        this.routedOk = true;
      } catch {
        this.routedOk = false;
        this.log("warn", "createMediaElementSource failed — VU meters fall back to simulated");
      }
    } else {
      this.log("warn", "no AudioContext when the voice element was built — VU meters will be simulated");
    }
    return el;
  }

  /** The never-routed twin, used when the CORS-enabled attempt fails to load. */
  private ensurePlainEl(): HTMLAudioElement | null {
    if (typeof document === "undefined") return null;
    if (this.plainEl) return this.plainEl;
    const el = document.createElement("audio");
    el.preload = "none";
    this.plainEl = el;
    return el;
  }

  /**
   * UNLOCK_ORDER step 5, in the case where the show does not OPEN on a voice.
   *
   * An <audio> element has its own autoplay gate, independent of the
   * AudioContext and independent of the YouTube player. A show that runs
   * [song, voice, song] would reach segment 1 with no gesture in hand and
   * `play()` would be refused on iOS — silently, because the promise rejection
   * is the only signal and nobody watches it.
   *
   * So both elements are "primed" inside the gesture by playing 60ms of
   * silence. The WAV is BUILT HERE, in JavaScript, from 44 bytes of header and
   * a run of zero samples — no audio asset ships with this template.
   */
  primeVoiceElements(): void {
    const silence = silentWavDataUrl();
    for (const el of [this.ensureVoiceEl(), this.ensurePlainEl()]) {
      if (!el) continue;
      try {
        el.src = silence;
        el.volume = 0;
        void el.play().then(
          () => {
            el.pause();
            el.currentTime = 0;
            el.volume = 1;
          },
          (e: unknown) => {
            el.volume = 1;
            // AbortError means the play() STARTED and something paused it — the
            // element is activated either way, so this is not the failure we
            // care about. NotAllowedError is: that one is the autoplay policy
            // saying no, and every later voice segment will be silent.
            const name = e instanceof DOMException ? e.name : "";
            if (name === "AbortError") return;
            this.log("warn", `voice element priming refused (${String(e)}) — later voice segments may not start`);
          },
        );
      } catch {
        this.log("warn", "voice element priming threw — later voice segments may not start");
      }
    }
  }

  /**
   * UNLOCK_ORDER step 5. Start the RJ.
   *
   * `onEnded` advances the show; `onFailed` skips the segment. One of the two
   * always fires — a voice that neither plays nor reports is a stalled show,
   * so a watchdog forces `onFailed` if nothing has happened in 6 seconds.
   */
  playVoice(url: string, onEnded: () => void, onFailed: (why: string) => void): () => void {
    const el = this.ensureVoiceEl();
    if (!el) {
      onFailed("no audio element");
      return () => {};
    }

    let settled = false;
    let watchdog: number | null = null;
    let usedFallback = false;
    this.voiceIsAnalysed = false;

    const cleanupFns: Array<() => void> = [];
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      if (watchdog !== null) window.clearTimeout(watchdog);
      for (const c of cleanupFns) c();
      fn();
    };

    const armWatchdog = () => {
      if (watchdog !== null) window.clearTimeout(watchdog);
      watchdog = window.setTimeout(() => {
        finish(() => onFailed("voice never started within 6s"));
      }, 6000);
    };

    const attach = (target: HTMLAudioElement, analysed: boolean, onLoadError: () => void) => {
      const onEnd = () => finish(onEnded);
      const onErr = () => onLoadError();
      const onPlaying = () => {
        this.voiceIsAnalysed = analysed;
        if (watchdog !== null) window.clearTimeout(watchdog);
        watchdog = null;
      };
      target.addEventListener("ended", onEnd);
      target.addEventListener("error", onErr);
      target.addEventListener("playing", onPlaying);
      cleanupFns.push(() => {
        target.removeEventListener("ended", onEnd);
        target.removeEventListener("error", onErr);
        target.removeEventListener("playing", onPlaying);
        target.pause();
      });
    };

    const origin = originOf(url);

    const startPlain = (reason: string) => {
      const plain = this.ensurePlainEl();
      if (!plain) {
        finish(() => onFailed("no fallback audio element"));
        return;
      }
      usedFallback = true;
      this.log("warn", `${reason} — replaying unrouted, VU meters go simulated`);
      attach(plain, false, () => finish(() => onFailed("voice failed on both routed and unrouted elements")));
      plain.preload = "auto";
      plain.src = url;
      plain.load();
      armWatchdog();
      void plain.play().catch((e: unknown) => {
        finish(() => onFailed(`unrouted play() rejected: ${String(e)}`));
      });
    };

    // This origin already failed the routed pass once this session. Skip
    // straight to the element that works instead of buying the same failed
    // round-trip for every remaining segment.
    if (origin && corsHostileOrigins.has(origin)) {
      this.pump();
      startPlain(`${origin} is known to serve media without CORS headers`);
      return () => finish(() => {});
    }

    attach(el, this.routedOk, () => {
      if (usedFallback) return;
      if (origin) corsHostileOrigins.add(origin);
      startPlain("voice failed the CORS-routed load");
    });

    // The graph is only useful if the context is actually running.
    this.pump();
    if (this.ac && this.ac.state !== "running") {
      this.log("warn", `voice starting while AudioContext is ${this.ac.state} — routed output may be silent`);
    }

    el.preload = "auto";
    el.src = url;
    el.load();
    armWatchdog();
    void el.play().catch((e: unknown) => {
      // A rejected play() on the routed element is usually autoplay policy, not
      // CORS — but the unrouted twin is worth one attempt either way. NOT
      // recorded as a CORS failure: an autoplay refusal says nothing about the
      // origin's headers, and caching it would give up the analyser for good.
      this.log("warn", `routed voice play() rejected: ${String(e)}`);
      if (!usedFallback) startPlain("routed play() rejected");
    });

    return () => finish(() => {});
  }

  /** Warm the next voice file during the current segment. Metered-friendly. */
  prefetchVoice(url: string): void {
    if (!url || typeof document === "undefined") return;
    // A data URL is already in memory. Handing it to a second element just
    // decodes several megabytes of base64 twice for no benefit — this is the
    // editor-preview path, before the server has swapped it for an S3 URL.
    if (url.startsWith("data:")) return;
    const probe = document.createElement("audio");
    probe.preload = "auto";
    probe.crossOrigin = "anonymous";
    probe.src = url;
    // Nothing to clean up: the element is unreferenced after this and the
    // browser keeps the bytes in the HTTP cache, which is the entire point.
  }

  pauseVoice(): void {
    this.voiceEl?.pause();
    this.plainEl?.pause();
  }

  resumeVoice(): void {
    const el = this.voiceEl?.src ? this.voiceEl : this.plainEl;
    if (el?.src && el.paused) void el.play().catch(() => {});
  }

  stopVoice(): void {
    for (const el of [this.voiceEl, this.plainEl]) {
      if (!el) continue;
      // Leave a primer alone. Tearing the silent WAV out from under a play()
      // that is still resolving both aborts it and wastes the activation it was
      // there to capture.
      if (el.currentSrc.startsWith("data:audio/wav")) continue;
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    this.voiceIsAnalysed = false;
  }

  setVoiceVolume(v: number): void {
    const clamped = Math.min(1, Math.max(0, v));
    if (this.voiceEl) this.voiceEl.volume = clamped;
    if (this.plainEl) this.plainEl.volume = clamped;
  }

  /**
   * GENUINE level, 0..1, read from a real AnalyserNode on our own element.
   * Returns null when there is nothing real to read — the caller must then use
   * the simulated path and must not pretend otherwise.
   */
  voiceLevel(): number | null {
    if (!this.voiceIsAnalysed || !this.analyser || !this.voiceBuf) return null;
    this.analyser.getByteTimeDomainData(this.voiceBuf);
    let sum = 0;
    for (let i = 0; i < this.voiceBuf.length; i++) {
      const d = (this.voiceBuf[i] - 128) / 128;
      sum += d * d;
    }
    const rms = Math.sqrt(sum / this.voiceBuf.length);
    // ~3.2x makes speech sit in the top two-thirds of the meter without pinning.
    return Math.min(1, rms * 3.2);
  }

  destroy(): void {
    this.stopVoice();
    for (const s of this.noiseSources) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    for (const n of [this.carrierOsc, this.decoyOsc, this.decoyNoise, this.decoyChopper]) {
      try {
        n?.stop();
      } catch {
        /* already stopped */
      }
    }
    this.noiseSources = [];
    void this.ac?.close().catch(() => {});
    this.ac = null;
    this.master = null;
    this.noiseFilter = null;
    this.noiseGain = null;
    this.carrierOsc = null;
    this.carrierGain = null;
    this.decoyOsc = null;
    this.decoyOscGain = null;
    this.decoyNoise = null;
    this.decoyNoiseFilter = null;
    this.decoyNoiseGain = null;
    this.decoyChopper = null;
    this.decoyChopDepth = null;

    // The elements go too. `createMediaElementSource` binds an element to ONE
    // context for the life of that element, so a cached element carried into a
    // freshly-built context can never be analysed again — and worse, its output
    // stays routed into the closed graph, which is silence.
    this.voiceEl = null;
    this.plainEl = null;
    this.analyser = null;
    this.voiceBuf = null;
    this.routedOk = false;
    this.voiceIsAnalysed = false;
  }
}

/** Clamp a needle reading onto the band. */
export const clampDial = (v: number): number => Math.min(DIAL.max, Math.max(DIAL.min, v));

/**
 * 60ms of 8kHz mono silence as a `data:` URL, assembled byte by byte.
 *
 * Used only to satisfy the <audio> element's autoplay gate inside the tune-in
 * gesture. Deliberately built rather than imported: the brief forbids shipping
 * an audio asset, and this way nothing lands in the bundle but arithmetic.
 */
let cachedSilence: string | null = null;
function silentWavDataUrl(): string {
  if (cachedSilence) return cachedSilence;
  const rate = 8000;
  const frames = Math.floor(rate * 0.06);
  const dataBytes = frames * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buf);
  const ascii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  ascii(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  ascii(8, "WAVEfmt ");
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  ascii(36, "data");
  view.setUint32(40, dataBytes, true);
  // Samples are left at zero — that IS the silence.

  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  cachedSilence = `data:audio/wav;base64,${btoa(binary)}`;
  return cachedSilence;
}
