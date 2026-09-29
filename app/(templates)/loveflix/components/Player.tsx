"use client";

// The player. A photo plays as the "video" (slow push-in over a blurred
// letterbox), subtitles carry the sender's lines, and the chrome is the
// streaming player's: back arrow, maturity card at the start, Skip Intro that
// refuses once, scrubber with time remaining, ±10, volume, title, next
// episode, episodes / subtitles / speed panels, fullscreen, autoplay-next with
// a filling button, "Are you still watching?", then a finale and credits.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isMuted, setMuted } from "@/lib/webAudio";
import { Still } from "./Brand";
import { IcBack, IcEpisodes, IcFlag, IcForward, IcFullscreen, IcMute, IcNext, IcPause, IcPlay, IcRewind, IcSpeed, IcSubtitles, IcVolume } from "./icons";
import { sfxFinale, sfxUiTap } from "./loveflixAudio";
import { captionLines, cropStyle, fmtRuntime } from "./theme";
import { PLAYER, runtimeOf, type LoveflixData } from "./types";

type Panel = null | "episodes" | "subs" | "speed";
type Phase = "episode" | "finale" | "credits";

const SPEEDS: { v: number; label: string }[] = [
  { v: 0.5, label: "0.5x", },
  { v: 0.75, label: "0.75x" },
  { v: 1, label: "1x (Normal)" },
  { v: 1.25, label: "1.25x" },
  { v: 1.5, label: "1.5x" },
];

const mmss = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

export default function Player({
  data,
  startIndex,
  reduced,
  toast,
  onExit,
}: {
  data: LoveflixData;
  startIndex: number;
  reduced: boolean;
  toast: (t: string, icon?: string) => void;
  onExit: (finished: boolean, watchedUpTo: number) => void;
}) {
  const eps = data.episodes;
  const [ep, setEp] = useState(Math.min(Math.max(0, startIndex), eps.length - 1));
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [subsOn, setSubsOn] = useState(true);
  const [chrome, setChrome] = useState(true);
  const [panel, setPanel] = useState<Panel>(null);
  const [streak, setStreak] = useState(0);
  const [still, setStill] = useState(false);
  const [phase, setPhase] = useState<Phase>("episode");
  const [skipTries, setSkipTries] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [muted, setMutedState] = useState(() => isMuted());
  const [firstRun] = useState(true);
  const [maxWatched, setMaxWatched] = useState(ep);
  const root = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);

  const e = eps[ep];
  const lines = useMemo(() => captionLines(e?.subtitle || e?.synopsis || ""), [e]);
  const duration = PLAYER.introMs + lines.length * PLAYER.lineMs + PLAYER.tailMs;
  const ended = elapsed >= duration;
  const progress = Math.min(1, elapsed / duration);
  const isLast = ep >= eps.length - 1;

  // ── Clock ──────────────────────────────────────────────────────────────────
  const running = phase === "episode" && playing && !ended && !still;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc += (now - last) * speed;
      last = now;
      if (acc >= 60) {
        const add = acc;
        acc = 0;
        setElapsed((v) => v + add);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed]);

  // ── Chrome auto-hide ───────────────────────────────────────────────────────
  const poke = useCallback(() => {
    setChrome(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setChrome(false), 3200);
  }, []);
  useEffect(() => {
    hideTimer.current = window.setTimeout(() => setChrome(false), 3200);
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [poke]);
  const showChrome = chrome || !playing || panel !== null || ended;

  // ── Episode flow ───────────────────────────────────────────────────────────
  const goTo = useCallback(
    (i: number, auto = false) => {
      setEp(i);
      setMaxWatched((m) => Math.max(m, i));
      setElapsed(0);
      setSkipTries(0);
      setCountdown(null);
      setPanel(null);
      setPlaying(true);
      setStreak((s) => (auto ? s + 1 : 0));
    },
    [],
  );

  const next = useCallback(
    (auto: boolean) => {
      if (isLast) {
        setPhase("finale");
        return;
      }
      if (auto && streak + 1 >= PLAYER.stillWatchingAfter - 1) {
        setCountdown(null);
        setStill(true);
        return;
      }
      goTo(ep + 1, auto);
    },
    [isLast, streak, goTo, ep],
  );

  // End of an episode: last one rolls into the finale; others count down.
  useEffect(() => {
    if (!ended || phase !== "episode" || still) return;
    if (isLast) {
      const t = window.setTimeout(() => setPhase("finale"), 900);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setCountdown((c) => (c === null ? PLAYER.autoplayNextSeconds : c)), 0);
    return () => window.clearTimeout(t);
  }, [ended, phase, still, isLast]);

  useEffect(() => {
    if (countdown === null || !playing) return;
    if (countdown <= 0) {
      const t = window.setTimeout(() => next(true), 0);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [countdown, playing, next]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const seek = (ms: number) => {
    setCountdown(null);
    setElapsed((v) => Math.min(duration - 1, Math.max(0, v + ms)));
    poke();
  };
  const togglePlay = () => {
    setPlaying((p) => !p);
    poke();
  };
  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    setMutedState(m);
  };
  const fullscreen = () => {
    const el = root.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void el.requestFullscreen?.().catch(() => toast("Fullscreen isn't available here. Lean closer instead.", "🔍"));
  };
  const exit = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    onExit(false, maxWatched);
  }, [onExit, maxWatched]);

  const skipIntro = () => {
    if (skipTries === 0) {
      setSkipTries(1);
      sfxUiTap();
      return;
    }
    setElapsed(PLAYER.introMs);
    setSkipTries(2);
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (phase !== "episode") {
        if (ev.key === "Escape") exit();
        return;
      }
      if (ev.key === " " || ev.key === "k") {
        ev.preventDefault();
        setPlaying((p) => !p);
      } else if (ev.key === "ArrowRight") setElapsed((v) => Math.min(duration - 1, v + PLAYER.lineMs));
      else if (ev.key === "ArrowLeft") setElapsed((v) => Math.max(0, v - PLAYER.lineMs));
      else if (ev.key === "Escape" && !document.fullscreenElement) exit();
      poke();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, duration, exit, poke]);

  // ── Derived moments ────────────────────────────────────────────────────────
  const inIntro = elapsed < PLAYER.introMs;
  const lineIdx = Math.floor((elapsed - PLAYER.introMs) / PLAYER.lineMs);
  const caption = !inIntro && lineIdx >= 0 && lineIdx < lines.length ? lines[lineIdx] : "";
  const showRating = firstRun && ep === startIndex && streak === 0 && elapsed > 500 && elapsed < PLAYER.ratingCardMs;
  const showSkip = elapsed > 700 && elapsed < PLAYER.introMs - 250 && skipTries < 2;

  if (phase === "finale") {
    return <Finale data={data} reduced={reduced} onCredits={() => setPhase("credits")} onExit={() => onExit(true, eps.length - 1)} />;
  }
  if (phase === "credits") {
    return <Credits data={data} reduced={reduced} onDone={() => onExit(true, eps.length - 1)} />;
  }

  return (
    <div
      ref={root}
      className={`lf-pl${showChrome ? " is-chrome" : ""}${playing ? "" : " is-paused"}`}
      onMouseMove={poke}
      role="region"
      aria-label={`Playing ${data.showTitle}, episode ${ep + 1}`}
    >
      {/* The "video" */}
      <div className="lf-pl-stage" onClick={() => (chrome ? togglePlay() : poke())}>
        <div className="lf-pl-back" style={e?.imageUrl ? { backgroundImage: `url("${e.imageUrl}")` } : undefined} />
        <div key={ep} className={`lf-pl-frame${reduced ? "" : " is-kb"}`} style={{ animationPlayState: running ? "running" : "paused" }}>
          {e?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.imageUrl} alt="" draggable={false} style={{ ...cropStyle(e.crop), objectFit: "contain" }} />
          ) : (
            <Still label={e?.title} seed={`episode:${ep}${e?.title}`} artSize="lg" />
          )}
        </div>
        <div className="lf-pl-grain" aria-hidden />
      </div>

      {/* Title card over the intro */}
      {inIntro && (
        <div className="lf-pl-titlecard" key={`tc${ep}`} aria-hidden>
          <span className="lf-pl-tcshow">{data.showTitle}</span>
          <span className="lf-pl-tcep">Episode {ep + 1}</span>
          <span className="lf-pl-tctitle">{e?.title}</span>
        </div>
      )}

      {/* Maturity card */}
      {showRating && (
        <div className="lf-pl-rating" aria-live="polite">
          <span className="lf-pl-rbar" />
          <div>
            <b>RATED {data.rating}</b>
            {data.ratingReason && <span>{data.ratingReason}</span>}
          </div>
        </div>
      )}

      {/* Subtitles */}
      {subsOn && caption && (
        <p className="lf-pl-sub" key={`${ep}-${lineIdx}`}>
          {caption}
        </p>
      )}
      {!subsOn && !inIntro && !ended && lineIdx >= 0 && lineIdx === 0 && (
        <p className="lf-pl-sub is-meta">[subtitles off — {data.senderName || "they"} will have to tell you in person]</p>
      )}

      {/* Skip Intro — refuses once */}
      {showSkip && (
        <button type="button" className={`lf-pl-skip${skipTries === 1 ? " is-no" : ""}`} onClick={skipIntro}>
          {skipTries === 1 ? "you can't skip this one 💗 (tap again)" : "Skip Intro"}
        </button>
      )}

      {/* Next episode card */}
      {ended && countdown !== null && !isLast && !still && (
        <div className="lf-pl-next">
          <div className="lf-pl-nextthumb">
            <Still src={eps[ep + 1]?.imageUrl} crop={eps[ep + 1]?.crop} label={eps[ep + 1]?.title} seed={`episode:${ep + 1}${eps[ep + 1]?.title}`} artSize="sm" />
          </div>
          <div className="lf-pl-nextbody">
            <span className="lf-pl-nextk">Next Episode</span>
            <b>E{ep + 2} · {eps[ep + 1]?.title}</b>
            <div className="lf-pl-nextbtns">
              <button type="button" className="lf-pl-nextbtn" onClick={() => next(false)}>
                <span className="lf-pl-fill" style={{ animationDuration: `${PLAYER.autoplayNextSeconds}s`, animationPlayState: playing ? "running" : "paused" }} />
                <span className="lf-pl-nextlabel"><IcPlay size={16} /> Next Episode</span>
              </button>
              <button type="button" className="lf-pl-credbtn" onClick={() => setCountdown(null)}>
                Watch Credits
              </button>
            </div>
          </div>
        </div>
      )}
      {ended && countdown === null && !isLast && !still && (
        <div className="lf-pl-next is-static">
          <button type="button" className="lf-pl-nextbtn is-solid" onClick={() => next(false)}>
            <span className="lf-pl-nextlabel"><IcPlay size={16} /> Next Episode</span>
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="lf-pl-top">
        <button type="button" className="lf-pl-ic" onClick={exit} aria-label="Back to browse">
          <IcBack size={32} />
        </button>
        <button type="button" className="lf-pl-ic" onClick={() => toast("Problem reported: too cute. Status: won't fix.", "🚩")} aria-label="Report a problem">
          <IcFlag size={26} />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="lf-pl-bottom" onClick={(ev) => ev.stopPropagation()}>
        <div className="lf-pl-scrubrow">
          <div
            className="lf-pl-scrub"
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            tabIndex={0}
            onClick={(ev) => {
              const r = ev.currentTarget.getBoundingClientRect();
              setCountdown(null);
              setElapsed(((ev.clientX - r.left) / r.width) * duration);
            }}
          >
            <span className="lf-pl-track" />
            <span className="lf-pl-buffer" style={{ width: `${Math.min(100, progress * 100 + 18)}%` }} />
            <span className="lf-pl-played" style={{ width: `${progress * 100}%` }} />
            <span className="lf-pl-knob" style={{ left: `${progress * 100}%` }} />
          </div>
          <span className="lf-pl-time">{mmss((duration - elapsed) / 1000 / speed)}</span>
        </div>
        <div className="lf-pl-ctrls">
          <div className="lf-pl-group">
            <button type="button" className="lf-pl-ic" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <IcPause size={30} /> : <IcPlay size={30} />}
            </button>
            <button type="button" className="lf-pl-ic" onClick={() => seek(-PLAYER.lineMs)} aria-label="Back 10 seconds">
              <IcRewind size={30} />
            </button>
            <button type="button" className="lf-pl-ic" onClick={() => seek(PLAYER.lineMs)} aria-label="Forward 10 seconds">
              <IcForward size={30} />
            </button>
            <button type="button" className="lf-pl-ic" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? <IcMute size={30} /> : <IcVolume size={30} />}
            </button>
          </div>
          <div className="lf-pl-name">
            <b>{data.showTitle}</b>
            <span>E{ep + 1}</span>
            <span className="lf-pl-eptitle">{e?.title}</span>
          </div>
          <div className="lf-pl-group">
            {!isLast && (
              <button type="button" className="lf-pl-ic" onClick={() => next(false)} aria-label="Next episode">
                <IcNext size={28} />
              </button>
            )}
            <button type="button" className={`lf-pl-ic${panel === "episodes" ? " is-on" : ""}`} onClick={() => setPanel(panel === "episodes" ? null : "episodes")} aria-label="Episodes">
              <IcEpisodes size={28} />
            </button>
            <button type="button" className={`lf-pl-ic${panel === "subs" ? " is-on" : ""}`} onClick={() => setPanel(panel === "subs" ? null : "subs")} aria-label="Audio and subtitles">
              <IcSubtitles size={28} />
            </button>
            <button type="button" className={`lf-pl-ic lf-pl-hidephone${panel === "speed" ? " is-on" : ""}`} onClick={() => setPanel(panel === "speed" ? null : "speed")} aria-label="Playback speed">
              <IcSpeed size={28} />
            </button>
            <button type="button" className="lf-pl-ic" onClick={fullscreen} aria-label="Full screen">
              <IcFullscreen size={28} />
            </button>
          </div>
        </div>

        {panel === "episodes" && (
          <div className="lf-pl-panel is-eps">
            <h4>Season 1</h4>
            <ol>
              {eps.map((x, i) => (
                <li key={i}>
                  <button type="button" className={i === ep ? "is-cur" : ""} onClick={() => goTo(i)}>
                    <span className="lf-pl-pn">{i + 1}</span>
                    <span className="lf-pl-pt">{x.title}</span>
                    <span className="lf-pl-pr">{fmtRuntime(runtimeOf(x.title, i))}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
        {panel === "subs" && (
          <div className="lf-pl-panel is-subs">
            <div>
              <h4>Audio</h4>
              <button type="button" className="is-cur">✓ English (Heartfelt)</button>
              <button type="button" onClick={() => toast("Dil se audio is only available in person", "🎧")}>Hindi (Dil Se)</button>
              <button type="button" onClick={() => toast("Director's commentary: 'I'm so lucky' ×400", "🎙️")}>Commentary</button>
            </div>
            <div>
              <h4>Subtitles</h4>
              <button type="button" className={subsOn ? "" : "is-cur"} onClick={() => setSubsOn(false)}>{subsOn ? "" : "✓ "}Off</button>
              <button type="button" className={subsOn ? "is-cur" : ""} onClick={() => setSubsOn(true)}>{subsOn ? "✓ " : ""}English [CC]</button>
            </div>
          </div>
        )}
        {panel === "speed" && (
          <div className="lf-pl-panel is-speed">
            <h4>Playback Speed</h4>
            <div className="lf-pl-speeds">
              {SPEEDS.map((s) => (
                <button key={s.v} type="button" className={s.v === speed ? "is-cur" : ""} onClick={() => setSpeed(s.v)}>
                  <i />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            <p>Some moments are best at 0.5x.</p>
          </div>
        )}
      </div>

      {/* Are you still watching? */}
      {still && (
        <div className="lf-pl-still" role="dialog" aria-modal="true" aria-label="Are you still watching?">
          <div>
            <h3>Are you still watching {data.showTitle}?</h3>
            <p>{data.senderName || "Someone"} is. Every single day.</p>
            <div className="lf-pl-stillbtns">
              <button
                type="button"
                className="lf-btn is-play"
                onClick={() => {
                  setStill(false);
                  goTo(ep + 1);
                }}
              >
                Continue Watching
              </button>
              <button type="button" className="lf-btn is-ghost" onClick={exit}>
                Back to Browse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Finale ─────────────────────────────────────────────────────────────── */

function Finale({ data, reduced, onCredits, onExit }: { data: LoveflixData; reduced: boolean; onCredits: () => void; onExit: () => void }) {
  const paras = useMemo(() => data.finaleText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean), [data.finaleText]);
  const [shown, setShown] = useState(reduced ? paras.length : 0);
  const done = shown >= paras.length;

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), shown === 0 ? 900 : 2300);
    return () => window.clearTimeout(t);
  }, [shown, done]);

  useEffect(() => {
    if (!done || data.finaleQuestion) return;
    const t = window.setTimeout(onCredits, 2600);
    return () => window.clearTimeout(t);
  }, [done, data.finaleQuestion, onCredits]);

  const last = data.episodes[data.episodes.length - 1];

  return (
    <div className="lf-fin" role="region" aria-label="Finale">
      {last?.imageUrl && <div className="lf-fin-bg" style={{ backgroundImage: `url("${last.imageUrl}")` }} />}
      {!reduced && (
        <div className="lf-fin-hearts" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${(i * 37) % 100}%`,
                fontSize: 12 + ((i * 7) % 16),
                animationDuration: `${9 + ((i * 5) % 7)}s`,
                animationDelay: `${(i * 1.3) % 8}s`,
              }}
            >
              ♥
            </i>
          ))}
        </div>
      )}
      <button type="button" className="lf-pl-ic lf-fin-x" onClick={onExit} aria-label="Back to browse">
        <IcBack size={30} />
      </button>
      <div className="lf-fin-text">
        {paras.slice(0, shown).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {done && data.finaleQuestion && (
          <button
            type="button"
            className="lf-btn is-play lf-fin-q"
            onClick={() => {
              sfxFinale();
              onCredits();
            }}
          >
            {data.finaleQuestion}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Credits ────────────────────────────────────────────────────────────── */

function Credits({ data, reduced, onDone }: { data: LoveflixData; reduced: boolean; onDone: () => void }) {
  const credits: [string, string][] = [
    ["Created by", data.senderName || "someone who loves you"],
    ["Starring", data.recipientName || "you"],
    ["Also starring", data.senderName || "me"],
    ...(data.thirdProfile ? ([["Featuring", data.thirdProfile]] as [string, string][]) : []),
    ["Written by", "late-night conversations"],
    ["Cinematography", "every blurry photo in my camera roll"],
    ["Original soundtrack", "your laugh, on repeat"],
    ["Catering", "whatever we ate at 2 AM"],
    ["Filmed on location", "wherever you were"],
    ["Episodes", data.episodes.map((x) => x.title).join(" · ")],
  ];
  const [seasonN] = useState(() => {
    const m = /(\d+)/.exec(data.seasons);
    return m ? Number(m[1]) + 1 : 2;
  });

  useEffect(() => {
    const t = window.setTimeout(onDone, reduced ? 9000 : 19000);
    return () => window.clearTimeout(t);
  }, [onDone, reduced]);

  return (
    <div className="lf-cr" role="region" aria-label="Credits">
      <div className="lf-cr-roll">
        <div className={`lf-cr-inner${reduced ? "" : " is-rolling"}`}>
          <h3>{data.showTitle}</h3>
          {credits.map(([r, n]) => (
            <p key={r}>
              <span>{r}</span>
              <b>{n}</b>
            </p>
          ))}
          <p className="lf-cr-note">No hearts were skipped in the making of this show.</p>
          <p className="lf-cr-note">© {data.metYear || "Day one"} – forever · LoveFlix Originals</p>
        </div>
      </div>
      <div className="lf-cr-side">
        <div className="lf-cr-card">
          <span className="lf-cr-heart" aria-hidden>♥</span>
          <span className="lf-cr-k">Officially renewed</span>
          <b>{data.showTitle}: Season {seasonN}</b>
          <span className="lf-cr-s">Now filming. Starring the two of you.</span>
          <button type="button" className="lf-btn is-play" onClick={onDone}>
            {data.letter ? "Open your letter 💌" : "Back to Browse"}
          </button>
        </div>
      </div>
    </div>
  );
}
