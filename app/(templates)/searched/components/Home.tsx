// ─── The home page ───────────────────────────────────────────────────────────
//
// The doodle, the pill box with its mic and lens, and the two grey buttons.
// A moment after it opens the box focuses itself and types the recipient's
// name one letter at a time, the autocomplete dropping in under it with the
// completions in bold — the first joke lands before anyone presses Search.
// Touching the box hands it over; on a phone that opens the full-screen search
// the real mobile site uses.

import { useCallback, useEffect, useRef, useState } from "react";
import Doodle from "./Doodle";
import { AccountButton, AppsButton } from "./HeaderBits";
import { ArrowUpLeft, BackIcon, ClockIcon, CloseIcon, LensIcon, MicIcon, SearchIcon, Sparkle } from "./icons";
import { firstNameOf, LUCKY_ROLL, matchSuggestions, splitSuggestion, type SearchData, type Tab } from "./types";

export interface HomeProps {
  data: SearchData;
  narrow: boolean;
  autoType: boolean;
  autoSubmit: boolean;
  reduce: boolean;
  dark: boolean;
  onSearch: (q: string) => void;
  onLucky: () => void;
  onTab: (t: Tab) => void;
  onLetter: () => void;
  onDark: () => void;
  onToast: (msg: string) => void;
}

const LANGS = ["हिन्दी", "বাংলা", "తెలుగు", "मराठी", "தமிழ்", "ગુજરાતી", "Pyaar", "Gen-Z"];

export default function Home(p: HomeProps) {
  const { data, narrow } = p;
  const name = data.recipient.name.trim() || "you";
  const first = firstNameOf(name) || "you";
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [apps, setApps] = useState(false);
  const [acct, setAcct] = useState(false);
  const [roll, setRoll] = useState(-1);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const ovInputRef = useRef<HTMLInputElement>(null);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const takeOver = useCallback(() => {
    touched.current = true;
    clearTimers();
  }, []);

  // ── The ghost typist ────────────────────────────────────────────────────────
  const started = useRef(false);
  useEffect(() => {
    if (!p.autoType || started.current) return;
    started.current = true;
    const start = p.reduce ? 600 : 1500;
    later(() => {
      if (touched.current) return;
      setFocused(true);
      const full = name;
      if (p.reduce) {
        setQ(full);
      } else {
        let at = 140;
        [...full].forEach((_, i) => {
          at += 85 + ((i * 37) % 60);
          later(() => {
            if (!touched.current) setQ(full.slice(0, i + 1));
          }, at);
        });
      }
      const typed = p.reduce ? 0 : 140 + full.length * 120;
      later(() => !touched.current && setNudge(true), typed + 900);
      if (p.autoSubmit) later(() => !touched.current && p.onSearch(full), typed + 3400);
    }, start);
    // Runs once per mount (the parent remounts on every save).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.autoType]);
  useEffect(() => clearTimers, []);

  const suggestions = matchSuggestions(q, data.autocomplete, name);
  const submit = (text?: string) => {
    // Pressing Search while the ghost is still typing searches the whole name.
    const ghost = !touched.current;
    takeOver();
    const v = (text ?? (ghost && q ? name : q)).trim();
    if (!v) {
      inputRef.current?.focus();
      p.onToast("type something. preferably your name.");
      return;
    }
    setOverlay(false);
    p.onSearch(v);
  };

  const openOverlay = () => {
    takeOver();
    if (narrow) {
      setOverlay(true);
      window.setTimeout(() => ovInputRef.current?.focus(), 30);
    } else {
      setFocused(true);
    }
  };

  const showDrop = focused && !overlay && suggestions.length > 0;
  const luckyLabel = roll >= 0 ? LUCKY_ROLL[roll % LUCKY_ROLL.length] : LUCKY_ROLL[0];

  const rollLucky = () => {
    if (p.reduce || roll >= 0) return;
    let i = 0;
    const step = () => {
      i += 1;
      setRoll(i);
      if (i < LUCKY_ROLL.length - 2 + (first.length % 3)) later(step, 110 + i * 25);
    };
    later(step, 10);
  };

  return (
    <div className="srHome">
      <header className="srTop">
        <div className="srTopL">
          {narrow ? (
            <>
              <button type="button" className="srTopLink is-on">All</button>
              <button type="button" className="srTopLink" onClick={() => p.onTab("images")}>Images</button>
            </>
          ) : (
            <>
              <button type="button" className="srTopLink" onClick={() => p.onToast(`about us: it's mostly about ${first}.`)}>About</button>
              <button type="button" className="srTopLink" onClick={() => p.onTab("shopping")}>Store</button>
            </>
          )}
        </div>
        <div className="srTopR">
          {!narrow && (
            <>
              <button type="button" className="srTopLink" onClick={() => p.onToast(`1 unread: "have you eaten?" — ${firstNameOf(data.sender.name) || "me"}`)}>Mail</button>
              <button type="button" className="srTopLink" onClick={() => p.onTab("images")}>Images</button>
            </>
          )}
          <AppsButton open={apps} setOpen={setApps} onTab={p.onTab} onLetter={p.onLetter} onDark={p.onDark} hasLetter={!!data.letter.trim()} />
          <AccountButton open={acct} setOpen={setAcct} name={name} sender={data.sender.name} photo={data.photos[0]} />
        </div>
      </header>

      <main className="srHomeMain">
        <Doodle name={name} photo={data.photos[0]} title={data.doodleTitle} onClick={() => submit(name)} />

        <div className={`srBoxWrap${showDrop ? " is-open" : ""}`}>
          <div className={`srBox${showDrop ? " is-open" : ""}`} onClick={() => (narrow ? openOverlay() : inputRef.current?.focus())}>
            <span className="srBoxIc"><SearchIcon size={20} /></span>
            <input
              ref={inputRef}
              className="srBoxIn"
              value={q}
              readOnly={narrow}
              aria-label="Search"
              autoComplete="off"
              spellCheck={false}
              placeholder={narrow ? "Search" : ""}
              onFocus={() => {
                if (!narrow) {
                  takeOver();
                  setFocused(true);
                }
              }}
              onChange={(e) => {
                takeOver();
                setQ(e.target.value);
                setNudge(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") setFocused(false);
              }}
            />
            {q && (
              <button type="button" className="srBoxBtn srBoxClear" aria-label="Clear" onClick={(e) => { e.stopPropagation(); takeOver(); setQ(""); setNudge(false); }}>
                <CloseIcon size={22} />
              </button>
            )}
            {q && <span className="srBoxSep" aria-hidden />}
            <button type="button" className="srBoxBtn" aria-label="Search by voice" onClick={(e) => { e.stopPropagation(); p.onToast("listening… all I hear is your name 🎙️"); }}>
              <MicIcon size={24} />
            </button>
            <button type="button" className="srBoxBtn" aria-label="Search by image" onClick={(e) => { e.stopPropagation(); p.onTab("images"); }}>
              <LensIcon size={24} />
            </button>
          </div>

          {showDrop && (
            <div className="srDrop" role="listbox" aria-label="Suggestions">
              <div className="srDropLine" />
              {suggestions.map((s, i) => {
                const parts = splitSuggestion(s, q);
                return (
                  <button
                    key={s + i}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className={`srSug${nudge && i === 0 ? " is-nudge" : ""}`}
                    style={{ animationDelay: `${i * 45}ms` }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => submit(s)}
                  >
                    <span className="srSugIc">{i === 0 ? <ClockIcon size={20} /> : <SearchIcon size={20} />}</span>
                    <span className="srSugTx">
                      {parts.typed}
                      <b>{parts.rest}</b>
                    </span>
                    {i === 0 && <span className="srSugRm">Remove</span>}
                  </button>
                );
              })}
              {(
                <>
                  <div className="srBtns srBtns--drop">
                    <button type="button" className="srBtn" onMouseDown={(e) => e.preventDefault()} onClick={() => submit()}>{first} Search</button>
                    <button type="button" className="srBtn" onMouseDown={(e) => e.preventDefault()} onClick={p.onLucky}>I&apos;m Feeling Lucky</button>
                  </div>
                  {!narrow && <p className="srDropFoot">Report inappropriate predictions <span>(they&apos;re all accurate)</span></p>}
                </>
              )}
            </div>
          )}
        </div>

        {!showDrop && (
          <div className="srBtns">
            <button type="button" className="srBtn" onClick={() => submit(q || name)}>{first} Search</button>
            <button type="button" className="srBtn srLucky" onMouseEnter={rollLucky} onFocus={rollLucky} onClick={p.onLucky} aria-label="I'm Feeling Lucky">
              <span className="srLuckyRoll" key={luckyLabel}>{luckyLabel}</span>
            </button>
          </div>
        )}

        <button type="button" className="srAiChip" onClick={() => p.onTab("ai")}>
          <Sparkle size={18} id="srSpkHome" /> AI Mode
        </button>

        <p className="srOffered">
          {first} offered in:{" "}
          {LANGS.map((l) => (
            <button key={l} type="button" onClick={() => p.onToast(l === "Gen-Z" ? "no cap, it's giving soulmate fr 💅" : l === "Pyaar" ? "pyaar mode: always on 💗" : `${l}: ❤️`)}>
              {l}
            </button>
          ))}
        </p>
      </main>

      <footer className="srFoot">
        <div className="srFootRow srFootLoc">India · In {firstNameOf(data.sender.name) || "someone"}&apos;s heart</div>
        <div className="srFootRow srFootLinks">
          <span>
            <button type="button" onClick={() => p.onToast(`about: 100% ${first}.`)}>About</button>
            <button type="button" onClick={() => p.onToast("no ads. just feelings.")}>Advertising</button>
            <button type="button" onClick={() => p.onToast("how love works: you show up. every day.")}>How Search works</button>
          </span>
          <span>
            <button type="button" onClick={() => p.onToast("privacy: none. we share everything, even fries.")}>Privacy</button>
            <button type="button" onClick={() => p.onToast("terms: forever. no cancellation.")}>Terms</button>
            <button type="button" onClick={p.onDark}>{p.dark ? "Light theme" : "Dark theme"}</button>
          </span>
        </div>
      </footer>

      {overlay && (
        <div className="srOverlay" role="dialog" aria-modal="true" aria-label="Search">
          <div className="srOvTop">
            <button type="button" className="srIconBtn" aria-label="Back" onClick={() => setOverlay(false)}>
              <BackIcon size={24} />
            </button>
            <input
              ref={ovInputRef}
              className="srOvIn"
              value={q}
              aria-label="Search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search or type URL"
              enterKeyHint="search"
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {q ? (
              <button type="button" className="srIconBtn" aria-label="Clear" onClick={() => setQ("")}>
                <CloseIcon size={22} />
              </button>
            ) : (
              <span className="srIconBtn" aria-hidden><MicIcon size={22} /></span>
            )}
          </div>
          <div className="srOvList">
            {(q ? suggestions : data.autocomplete.slice(0, 5)).map((s, i) => {
              const parts = splitSuggestion(s, q);
              return (
                <div key={s + i} className="srOvRow" style={{ animationDelay: `${i * 45}ms` }}>
                  <button type="button" className="srOvRowMain" onClick={() => submit(s)}>
                    <span className="srSugIc">{!q || i === 0 ? <ClockIcon size={20} /> : <SearchIcon size={20} />}</span>
                    <span className="srSugTx">
                      {parts.typed}
                      <b>{parts.rest}</b>
                    </span>
                  </button>
                  <button type="button" className="srOvFill" aria-label={`Fill "${s}"`} onClick={() => { setQ(s); ovInputRef.current?.focus(); }}>
                    <ArrowUpLeft size={20} />
                  </button>
                </div>
              );
            })}
            {!q && <p className="srOvHint">Go on. Type your name. The internet has opinions.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
