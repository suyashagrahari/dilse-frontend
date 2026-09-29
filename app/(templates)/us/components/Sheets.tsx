"use client";

// Bottom sheets on the phone, centred dialogs on the web — the "Following"
// menu that will not let you unfollow, the followers list, and the ⋯ menu.

import { useState, type ReactNode } from "react";
import Pic from "./Pic";
import { CloseIcon } from "./icons";
import { PALETTE as P, type ProfileData } from "./types";

export function Sheet({ title, onClose, children }: { title?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="us-scrim" onClick={onClose}>
      <div className="us-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title ?? "Options"}>
        <div className="us-grab" />
        {title ? (
          <div className="us-sheet-title" style={{ position: "relative" }}>
            {title}
            <button type="button" onClick={onClose} aria-label="Close" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
              <CloseIcon size={18} />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

const REFUSALS = ["not an option 💍", "nice try 😌", "you're stuck with us", "request denied by management (us)", "no. 🫶"];

export function FollowingMenu({ data, onClose, onToast }: { data: ProfileData; onClose: () => void; onToast: (t: string) => void }) {
  const [tries, setTries] = useState(0);
  const [star, setStar] = useState(true);
  return (
    <Sheet title={data.handle} onClose={onClose}>
      <button type="button" className="us-row" onClick={() => setStar((s) => !s)}>
        <span style={{ flex: 1 }}>{star ? "On your close friends list" : "Add to close friends list"}</span>
        <span aria-hidden style={{ color: star ? "#1CD14F" : P.greyIcon, fontSize: 18 }}>
          ★
        </span>
      </button>
      <button type="button" className="us-row" onClick={() => onToast("already your favourite. obviously ✨")}>
        <span style={{ flex: 1 }}>Add to favourites</span>
        <span aria-hidden>☆</span>
      </button>
      <button type="button" className="us-row" onClick={() => onToast("muting them? in this economy? 🙅")}>
        <span style={{ flex: 1 }}>Mute</span>
        <span aria-hidden>›</span>
      </button>
      <button type="button" className="us-row" onClick={() => onToast("restricted to your heart only 🔒")}>
        <span style={{ flex: 1 }}>Restrict</span>
        <span aria-hidden>›</span>
      </button>
      <button
        key={tries}
        type="button"
        className={`us-row is-red${tries ? " us-shake" : ""}`}
        onClick={() => {
          onToast(REFUSALS[tries % REFUSALS.length]);
          setTries((t) => t + 1);
        }}
      >
        <span style={{ flex: 1 }}>{tries === 0 ? "Unfollow" : tries < 3 ? "Unfollow?? 🥺" : "Unfollow (disabled by love)"}</span>
      </button>
    </Sheet>
  );
}

export function FollowersSheet({ data, onClose, onToast }: { data: ProfileData; onClose: () => void; onToast: (t: string) => void }) {
  const people = [...data.followedBy, ...(data.to ? [data.to.toLowerCase().replace(/[^a-z0-9._]+/g, "_")] : [])];
  const colors = ["#FF8FB1", "#B388FF", "#FFB38A", "#7BC8A4", "#79A7FF", "#FF6F91"];
  return (
    <Sheet title="Followers" onClose={onClose}>
      <div style={{ padding: "6px 0 10px" }}>
        {people.map((h, i) => (
          <div key={h + i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px" }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", background: colors[i % colors.length], color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 }}>
              {h.replace(/[^a-z]/gi, "").charAt(0).toUpperCase() || "♥"}
            </span>
            <div style={{ flex: 1, minWidth: 0, lineHeight: "18px" }}>
              <div style={{ fontWeight: 600 }}>{h}</div>
              <div style={{ color: P.grey, fontSize: 13 }}>{i === people.length - 1 && data.to ? "the reason this account exists" : "ships us, loudly"}</div>
            </div>
            <button type="button" className="us-btn" onClick={() => onToast(`${h} is already obsessed with you two`)}>
              Following
            </button>
          </div>
        ))}
        <div style={{ textAlign: "center", color: P.grey, fontSize: 13, padding: "10px 16px 4px" }}>…and every aunty who has asked &ldquo;when?&rdquo;</div>
      </div>
    </Sheet>
  );
}

export function FollowingSheet({ data, onClose }: { data: ProfileData; onClose: () => void }) {
  return (
    <Sheet title="Following" onClose={onClose}>
      <div style={{ padding: "14px 16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <Pic src={data.avatarUrl} crop={data.avatarCrop} style={{ width: 52, height: 52, borderRadius: "50%" }} />
        <div style={{ flex: 1, lineHeight: "18px" }}>
          <div style={{ fontWeight: 600 }}>{data.to || "you"}</div>
          <div style={{ color: P.grey, fontSize: 13 }}>the only account that matters</div>
        </div>
        <span style={{ fontSize: 22 }} aria-hidden>
          🫶
        </span>
      </div>
      <div style={{ color: P.grey, fontSize: 13, padding: "0 16px 16px", textAlign: "center" }}>
        {data.stats.following > 1 ? `(the other ${data.stats.following - 1} ${data.stats.following === 2 ? "is" : "are"} mom. don't tell.)` : "that's the list."}
      </div>
    </Sheet>
  );
}

export function OptionsMenu({ items, onClose }: { items: { label: string; red?: boolean; onClick: () => void }[]; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      {items.map((it) => (
        <button key={it.label} type="button" className={`us-row${it.red ? " is-red" : ""}`} onClick={it.onClick}>
          <span style={{ flex: 1 }}>{it.label}</span>
        </button>
      ))}
      <button type="button" className="us-row" onClick={onClose}>
        <span style={{ flex: 1 }}>Cancel</span>
      </button>
    </Sheet>
  );
}
