"use client";

// "Who's watching?" — the first screen. One profile opens; one is PIN-locked
// (it's the sender's); a third is a joke; "Add Profile" is refused politely.

import { useEffect, useRef, useState } from "react";
import { Avatar, BrandPill, Wordmark } from "./Brand";
import { IcBack, IcLock, IcPencil, IcPlus } from "./icons";
import type { LoveflixData } from "./types";

export default function ProfilePicker({
  data,
  live,
  onPick,
  onFirstGesture,
  toast,
}: {
  data: LoveflixData;
  live: boolean;
  onPick: () => void;
  onFirstGesture: () => void;
  toast: (t: string, icon?: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [pin, setPin] = useState<null | string>(null);
  const [manage, setManage] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);
  const pinWrong = pin !== null && pin.length >= 4;

  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";

  useEffect(() => {
    if (!picking) return;
    const t = window.setTimeout(onPick, 850);
    return () => window.clearTimeout(t);
  }, [picking, onPick]);

  useEffect(() => {
    if (pin === null) return;
    pinRef.current?.focus();
    if (pin.length < 4) return;
    const t = window.setTimeout(() => setPin(null), 2600);
    return () => window.clearTimeout(t);
  }, [pin]);

  const pick = () => {
    onFirstGesture();
    if (manage) {
      toast(`${recipient}'s profile is perfect as it is`, "✨");
      return;
    }
    setPicking(true);
  };

  return (
    <div className="lf-pp">
      <header className="lf-pp-head">
        <Wordmark size={30} />
        <span className="lf-pp-mtitle">Who&apos;s Watching?</span>
        <div className="lf-pp-headR">
          {live && <BrandPill />}
          <button type="button" className="lf-pp-edit" onClick={() => setManage((m) => !m)}>
            {manage ? "Done" : <><IcPencil size={18} /> <span>Edit</span></>}
          </button>
        </div>
      </header>

      <main className="lf-pp-main">
        <h1 className="lf-pp-h1">{manage ? "Manage Profiles:" : "Who's watching?"}</h1>
        <ul className="lf-pp-list">
          <li>
            <button type="button" className="lf-pp-tile is-you" onClick={pick} aria-label={`${recipient} — open profile`}>
              <span className="lf-pp-av">
                <Avatar src={data.recipientPhotoUrl} crop={data.recipientCrop} variant={0} size="100%" />
                {manage && <span className="lf-pp-pen"><IcPencil size={28} /></span>}
                <span className="lf-pp-hint" aria-hidden>it&apos;s you 💗</span>
              </span>
              <span className="lf-pp-name">{recipient}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="lf-pp-tile"
              onClick={() => {
                onFirstGesture();
                setPin("");
              }}
              aria-label={`${sender} — locked profile`}
            >
              <span className="lf-pp-av">
                <Avatar src={data.senderPhotoUrl} crop={data.senderCrop} variant={1} size="100%" />
              </span>
              <span className="lf-pp-name">{sender}</span>
              <span className="lf-pp-lock"><IcLock size={16} /></span>
            </button>
          </li>
          {data.thirdProfile && (
            <li>
              <button
                type="button"
                className="lf-pp-tile"
                onClick={() => toast(`${data.thirdProfile} — coming soon to a home near you`, "🐾")}
              >
                <span className="lf-pp-av">
                  <Avatar variant={2} size="100%" />
                </span>
                <span className="lf-pp-name">{data.thirdProfile}</span>
              </button>
            </li>
          )}
          <li>
            <button
              type="button"
              className="lf-pp-tile is-add"
              onClick={() => toast("This plan allows exactly one favourite person", "💍")}
            >
              <span className="lf-pp-av lf-pp-addav">
                <IcPlus size={56} />
              </span>
              <span className="lf-pp-name">Add Profile</span>
            </button>
          </li>
        </ul>
        <button type="button" className="lf-pp-manage" onClick={() => setManage((m) => !m)}>
          {manage ? "Done" : "Manage Profiles"}
        </button>
      </main>

      {/* The chosen profile, loading — the avatar grows and a ring spins. */}
      {picking && (
        <div className="lf-pp-picking" aria-live="polite">
          <div className="lf-pp-pickav">
            <Avatar src={data.recipientPhotoUrl} crop={data.recipientCrop} variant={0} size="100%" radius={6} />
          </div>
          <span className="lf-spinner" aria-label="Loading" />
        </div>
      )}

      {/* Profile Lock */}
      {pin !== null && (
        <div className="lf-pin" role="dialog" aria-modal="true" aria-label="Profile lock">
          <button type="button" className="lf-pin-x" onClick={() => setPin(null)} aria-label="Back">
            <IcBack size={26} />
          </button>
          <p className="lf-pin-k">Profile Lock is currently on.</p>
          <h2 className="lf-pin-h">
            {pinWrong ? (
              <>Wrong PIN. This profile only opens for {sender}.<br /><span>Go back — someone made all of this for you.</span></>
            ) : (
              <>Enter your PIN to access {sender}&apos;s profile.</>
            )}
          </h2>
          <label className={`lf-pin-boxes${pinWrong ? " is-wrong" : ""}`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`lf-pin-box${pin.length === i ? " is-cur" : ""}`}>
                {pin[i] ? "•" : ""}
              </span>
            ))}
            <input
              ref={pinRef}
              className="lf-sr"
              inputMode="numeric"
              autoComplete="off"
              aria-label="PIN"
              value={pin}
              onChange={(e) => !pinWrong && setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </label>
          <button
            type="button"
            className="lf-pin-forgot"
            onClick={() => toast(`Hint: it's not your profile. ${recipient}'s is the one with the heart eyes.`, "🔐")}
          >
            Forgot PIN?
          </button>
        </div>
      )}
    </div>
  );
}
