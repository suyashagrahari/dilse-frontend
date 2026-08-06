"use client";

import { Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import PlaceholderArt from "./PlaceholderArt";
import { sfxUiTap } from "./loveflixAudio";
import {
  ACCENT,
  BG,
  BG_CARD,
  CARD_RADIUS,
  FONT_BODY,
  FONT_DISPLAY,
  HAIRLINE,
  TAP,
  TEXT,
  TEXT_DIM,
} from "./theme";
import { LOCKED_PROFILE_JOKE, type LoveflixData } from "./types";

export interface ProfileGateProps {
  data: LoveflixData;
  /** Recipient tile chosen; fire AFTER the profile-loading beat. */
  onSelect: () => void;
  onFirstGesture: () => void;
  reducedMotion: boolean;
}

/**
 * "Who's watching?" — the quiet, typographic screen between the intro and the
 * catalogue.
 *
 * Two tiles, and only one of them works. The sender's is locked, and tapping it
 * answers with one dry line rather than an error: it is a joke, so there is no
 * shake, no red, no "denied" styling. The line is re-triggerable, because the
 * first thing anybody does with a locked button is press it twice.
 *
 * The recipient's tile unlocks audio, taps, and then holds a short loading beat
 * before handing over to browse — the pause is what makes the rest of the
 * template read as an app rather than a slideshow.
 *
 * Reduced motion removes the scale transition, the spinner's rotation and the
 * fade on the joke. It removes nothing that can be pressed: the border still
 * marks the selection, the loading beat still happens (statically), the joke
 * still appears and still goes away, and the screen is still completable.
 */

/** Slightly softer than a rail card — these read as tiles, not as artwork. */
const TILE_RADIUS = CARD_RADIUS * 2;
const BEAT_MS = 820;
const JOKE_MS = 2200;

const CSS = `
.lfx-pg-tile{
  position:relative;display:block;padding:0;margin:0;
  border:3px solid transparent;border-radius:${TILE_RADIUS}px;
  background:${BG_CARD};color:inherit;cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  transition:transform 200ms ease,border-color 200ms ease;
}
.lfx-pg-tile:hover,.lfx-pg-tile:focus-visible,.lfx-pg-tile:active{
  border-color:${TEXT};transform:scale(1.06);
}
.lfx-pg-tile:focus-visible{outline:none;}
.lfx-pg-tile.lfx-pg-on{border-color:${TEXT};}
.lfx-pg-tile.lfx-pg-still{transition:border-color 200ms ease;}
.lfx-pg-tile.lfx-pg-still:hover,
.lfx-pg-tile.lfx-pg-still:focus-visible,
.lfx-pg-tile.lfx-pg-still:active{transform:none;}
.lfx-pg-spin{animation:lfx-pg-rot 760ms linear infinite;}
@keyframes lfx-pg-rot{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.lfx-pg-joke{animation:lfx-pg-say ${JOKE_MS}ms ease forwards;}
@keyframes lfx-pg-say{0%{opacity:0}10%{opacity:1}74%{opacity:1}100%{opacity:0}}
.lfx-pg-veil{animation:lfx-pg-in 180ms ease forwards;}
@keyframes lfx-pg-in{from{opacity:0}to{opacity:1}}
`;

interface TileProps {
  name: string;
  photoUrl: string;
  locked: boolean;
  selected: boolean;
  reducedMotion: boolean;
  onActivate: () => void;
}

function ProfileTile({ name, photoUrl, locked, selected, reducedMotion, onActivate }: TileProps) {
  const label = locked
    ? `${name} — this profile is locked and cannot be selected`
    : `Continue as ${name}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <button
        type="button"
        onClick={onActivate}
        aria-label={label}
        aria-disabled={locked || undefined}
        className={[
          "lfx-pg-tile",
          reducedMotion ? "lfx-pg-still" : "",
          selected ? "lfx-pg-on" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          width: "clamp(116px, 34vw, 168px)",
          height: "clamp(116px, 34vw, 168px)",
          minWidth: TAP,
          minHeight: TAP,
        }}
      >
        <PlaceholderArt
          src={photoUrl}
          title={name}
          variant="avatar"
          seedSalt={locked ? "sender" : "recipient"}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            borderRadius: TILE_RADIUS - 3,
            opacity: locked ? 0.55 : 1,
          }}
        >
          {locked && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: 8,
                top: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: 999,
                background: "rgba(13,13,13,0.72)",
                border: `1px solid ${HAIRLINE}`,
                color: TEXT_DIM,
              }}
            >
              <Lock size={12} strokeWidth={2.2} />
            </span>
          )}
        </PlaceholderArt>
      </button>

      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: 13,
          letterSpacing: "0.06em",
          color: locked ? TEXT_DIM : TEXT,
          maxWidth: "clamp(116px, 34vw, 168px)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
    </div>
  );
}

export default function ProfileGate({
  data,
  onSelect,
  onFirstGesture,
  reducedMotion,
}: ProfileGateProps) {
  const [selecting, setSelecting] = useState(false);
  const [jokeOn, setJokeOn] = useState(false);
  /** Bumped on every tap so the fade restarts rather than ignoring a re-tap. */
  const [jokeTick, setJokeTick] = useState(0);

  const jokeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Every timer this screen owns is cleared on unmount; the loading beat in
  // particular would otherwise call onSelect() after the screen had gone.
  useEffect(
    () => () => {
      if (jokeTimer.current) clearTimeout(jokeTimer.current);
      if (beatTimer.current) clearTimeout(beatTimer.current);
    },
    [],
  );

  const tapLocked = useCallback(() => {
    onFirstGesture();
    sfxUiTap();
    if (jokeTimer.current) clearTimeout(jokeTimer.current);
    setJokeTick((n) => n + 1);
    setJokeOn(true);
    jokeTimer.current = setTimeout(() => setJokeOn(false), JOKE_MS);
  }, [onFirstGesture]);

  const tapRecipient = useCallback(() => {
    if (selecting) return;
    onFirstGesture();
    sfxUiTap();
    setSelecting(true);
    beatTimer.current = setTimeout(() => onSelect(), BEAT_MS);
  }, [onFirstGesture, onSelect, selecting]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(28px, 7vh, 56px)",
        padding: "48px 20px calc(48px + env(safe-area-inset-bottom, 0px))",
        background: BG,
        textAlign: "center",
      }}
    >
      <style>{CSS}</style>

      <h1
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontWeight: 400,
          fontSize: "clamp(26px, 7vw, 46px)",
          lineHeight: 1.1,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: TEXT,
        }}
      >
        Who&rsquo;s watching?
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "clamp(20px, 8vw, 56px)",
          pointerEvents: selecting ? "none" : undefined,
        }}
      >
        <ProfileTile
          name={data.recipientName}
          photoUrl={data.recipientPhotoUrl}
          locked={false}
          selected={selecting}
          reducedMotion={reducedMotion}
          onActivate={tapRecipient}
        />
        <ProfileTile
          name={data.senderName}
          photoUrl={data.senderPhotoUrl}
          locked
          selected={false}
          reducedMotion={reducedMotion}
          onActivate={tapLocked}
        />
      </div>

      {/* Reserved so the line arriving never nudges the tiles. */}
      <div
        aria-live="polite"
        style={{
          minHeight: 20,
          fontFamily: FONT_BODY,
          fontSize: 13,
          letterSpacing: "0.04em",
          color: TEXT_DIM,
        }}
      >
        {jokeOn && (
          <span key={jokeTick} className={reducedMotion ? undefined : "lfx-pg-joke"}>
            {LOCKED_PROFILE_JOKE}
          </span>
        )}
      </div>

      {selecting && (
        <div
          className={reducedMotion ? undefined : "lfx-pg-veil"}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BG,
          }}
        >
          <span role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Loading profile
          </span>
          <span
            aria-hidden
            className={reducedMotion ? undefined : "lfx-pg-spin"}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: `2px solid ${HAIRLINE}`,
              borderTopColor: ACCENT,
              ...(reducedMotion ? { borderColor: ACCENT, opacity: 0.55 } : null),
            }}
          />
        </div>
      )}
    </div>
  );
}
