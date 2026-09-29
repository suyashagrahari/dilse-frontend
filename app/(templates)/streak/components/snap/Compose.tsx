"use client";

// After the shutter: the snap preview with the real app's editing rail, a
// caption band for today's word, then "Send To" — a sheet with the one friend
// who matters pre-selected, their streak beside their name, and an optional
// secret line that stays sealed until they send theirs.

import { useRef, useState } from "react";
import type { Ctx } from "./ctx";
import { C, photoStyle } from "./tokens";
import Bitmoji from "./Bitmoji";
import { LENSES, LensFx } from "./Camera";
import { IcClip, IcClose, IcCrop, IcDownload, IcLock, IcMusic, IcPen, IcScissors, IcSend, IcSticker, IcText, IcTimer } from "./icons";
import { LIMITS } from "../types";

const STICKERS = ["🔥", "💛", "🥺", "😘", "🫶", "✨", "🙈", "💌"];

export default function Compose({ ctx, photoIndex, lens, onClose }: { ctx: Ctx; photoIndex: number; lens: number; onClose: () => void }) {
  const photos = ctx.photos;
  const photo = photos.length ? photos[photoIndex % photos.length] : undefined;
  const L = LENSES[lens] ?? LENSES[0];
  const [word, setWord] = useState("");
  const [note, setNote] = useState("");
  const [stickers, setStickers] = useState<number[]>([]);
  const [step, setStep] = useState<"edit" | "send">("edit");
  const [timer, setTimer] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const already = ctx.todayView.mineIn;

  const doSend = () => {
    ctx.send(word.trim() || (L.emoji ? `${L.emoji}` : "🔥"), note.trim(), photo?.url);
    onClose();
  };

  return (
    <div className="snCompose" role="dialog" aria-modal="true" aria-label="Your snap">
      <div className="snComposeFrame">
        <div className="snCamFeed" style={{ filter: L.filter }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt="" draggable={false} className="snCamImg is-still" style={photoStyle(photo)} />
          ) : (
            <div className="snCamEmpty">
              <Bitmoji preset={ctx.meAvatar} side={ctx.me} size={140} mood="love" />
            </div>
          )}
        </div>
        <LensFx fx={L.fx} today={ctx.today} />
        {stickers.map((s, i) => (
          <span key={i} className="snStickerOn" style={{ left: `${14 + ((i * 37) % 64)}%`, top: `${16 + ((i * 23) % 40)}%` }} aria-hidden>
            {STICKERS[s % STICKERS.length]}
          </span>
        ))}

        <div className="snCaptionBand" onClick={() => inputRef.current?.focus()}>
          <input
            ref={inputRef}
            value={word}
            maxLength={LIMITS.word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="today in one word…"
            aria-label="Today's word"
            enterKeyHint="send"
            onKeyDown={(e) => { if (e.key === "Enter") setStep("send"); }}
          />
        </div>

        <button type="button" className="snComposeX" onClick={onClose} aria-label="Discard snap">
          <IcClose size={26} color="#fff" strokeWidth={2.6} />
        </button>

        <div className="snEditRail">
          <button type="button" onClick={() => inputRef.current?.focus()} aria-label="Text"><IcText size={24} color="#fff" /></button>
          <button type="button" onClick={() => ctx.toast("doodle mode is just vibes today ✏️")} aria-label="Draw"><IcPen size={22} color="#fff" /></button>
          <button type="button" onClick={() => setStickers((s) => [...s.slice(-5), s.length])} aria-label="Add a sticker"><IcSticker size={23} color="#fff" /></button>
          <button type="button" onClick={() => ctx.toast("cut out: everyone except them ✂️")} aria-label="Scissors"><IcScissors size={22} color="#fff" /></button>
          <button type="button" onClick={() => ctx.toast("🎵 added: the song you both screamed in the car")} aria-label="Music"><IcMusic size={22} color="#fff" /></button>
          <button type="button" onClick={() => ctx.toast("🔗 link attached: my heart")} aria-label="Attach"><IcClip size={22} color="#fff" /></button>
          <button type="button" onClick={() => ctx.toast("cropped: just the good parts")} aria-label="Crop"><IcCrop size={22} color="#fff" /></button>
          <button type="button" onClick={() => setTimer((t) => (t + 1) % 3)} aria-label="Timer" className="snTimerTool">
            <IcTimer size={22} color="#fff" />
            <small>{["∞", "3", "10"][timer]}</small>
          </button>
        </div>

        <div className="snComposeBar">
          <button type="button" className="snComposeSave" onClick={() => ctx.toast("saved to Memories 💾")} aria-label="Save">
            <IcDownload size={20} color="#fff" />
          </button>
          <button type="button" className="snComposeStory" onClick={() => ctx.toast("posted to your story (only they can see it) 👀")}>
            <Bitmoji preset={ctx.meAvatar} side={ctx.me} size={22} /> Story
          </button>
          <button type="button" className="snSendTo" onClick={() => setStep("send")}>
            Send To <IcSend size={17} color="#fff" fill />
          </button>
        </div>
      </div>

      {step === "send" && (
        <div className="snSendSheetWrap" onClick={() => setStep("edit")}>
          <div className="snSendSheet" onClick={(e) => e.stopPropagation()}>
            <div className="snSheetGrab" aria-hidden />
            <div className="snSendSearch">Send to…</div>
            <p className="snSendHead">Best Friends</p>
            <div className="snSendRow is-on">
              <Bitmoji preset={ctx.themAvatar} side={ctx.them} photoUrl={ctx.themP.photoUrl} size={42} />
              <div className="snSendWho">
                <b>{ctx.themP.name || "them"}</b>
                <span>
                  {ctx.view.count > 0 && <>🔥 {ctx.view.count} </>}
                  {ctx.bff.emoji} {ctx.bff.label}
                </span>
              </div>
              <span className="snCheck" aria-hidden>✓</span>
            </div>

            {!already && (
              <label className="snSecret">
                <span className="snSecretHead"><IcLock size={14} color={C.purple} /> a secret line <em>(optional)</em></span>
                <input
                  value={note}
                  maxLength={LIMITS.note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="it stays locked till they send theirs 🤫"
                />
              </label>
            )}
            {already && <p className="snSendNote">you already sent today&apos;s snap — this one&apos;s a bonus 💛</p>}

            <button type="button" className="snSendBar" onClick={doSend}>
              <span className="snSendNames">{ctx.themP.name || "them"}</span>
              <span className="snSendGo" aria-label="Send">
                <IcSend size={22} color="#fff" fill />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
