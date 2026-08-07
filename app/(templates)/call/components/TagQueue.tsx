// ─── The sender's moderation queue ───────────────────────────────────────────
//
// Her friends' tags land pending and nothing reaches the published card until
// the sender says so — their name is on the page. This panel is where they say
// so, and it is the shared `ModerationQueue` component doing the rendering: the
// only thing this file adds is the transport and the theme.
//
// The poll follows the same three-state rule as everything else in this
// template: tick while visible, stop the moment the tab is hidden, and tear
// everything down on unmount.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ModerationQueue from "@/components/contrib/ModerationQueue";
import type { Contribution } from "@/lib/contrib/types";
import { approveAllTags, fetchTagQueue, setTagStatus } from "./tagApi";
import { CloseGlyph } from "./icons";
import { FONT, LIGHT, TAP } from "./theme";

export interface TagQueueProps {
  shareId: string;
  token: string;
  onClose: () => void;
  onToast: (message: string) => void;
}

const QUEUE_THEME = {
  paper: "#FFFFFF",
  paperDeep: "#F4F6F8",
  edge: "#E4E8EB",
  ink: "#101418",
  inkSoft: "#4C555E",
  inkFaint: "#8B939B",
  accent: "#1DA362",
  accentInk: "#FFFFFF",
  ok: "#1DA362",
  danger: "#E5484D",
  font: FONT,
  serif: FONT,
};

export default function TagQueue({ shareId, token, onClose, onToast }: TagQueueProps) {
  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [approvingAll, setApprovingAll] = useState(false);

  /** Claimed synchronously; `loading` lands a render too late to gate a poll. */
  const inFlight = useRef(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (inFlight.current) return;
      inFlight.current = true;
      const res = await fetchTagQueue(shareId, token, signal);
      inFlight.current = false;
      if (res.ok) setItems(res.data);
      setLoading(false);
    },
    [shareId, token]
  );

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const controller = new AbortController();

    const tick = () => {
      if (!alive) return;
      void load(controller.signal);
    };
    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };
    const start = () => {
      if (timer !== null) return;
      timer = setInterval(tick, 5000);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      tick();
      start();
    };

    tick();
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      controller.abort();
    };
  }, [load]);

  const decide = useCallback(
    async (id: string, status: "approved" | "rejected") => {
      setBusyIds((prev) => [...prev, id]);
      const res = await setTagStatus(id, status, token);
      setBusyIds((prev) => prev.filter((b) => b !== id));
      if (!res.ok) {
        onToast(res.error);
        return;
      }
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    },
    [token, onToast]
  );

  const approveAll = useCallback(async () => {
    setApprovingAll(true);
    const res = await approveAllTags(shareId, token);
    setApprovingAll(false);
    if (!res.ok) {
      onToast(res.error);
      return;
    }
    setItems((prev) => prev.map((c) => (c.status === "pending" ? { ...c, status: "approved" } : c)));
    onToast(res.data.approved === 1 ? "1 tag is on the card" : `${res.data.approved} tags are on the card`);
  }, [shareId, token, onToast]);

  return (
    <div
      role="dialog"
      aria-label="Tags waiting for you"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 260,
        background: "rgba(7,9,11,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "88dvh",
          overflowY: "auto",
          background: "#FFFFFF",
          borderRadius: "22px 22px 0 0",
          padding: "16px 16px calc(24px + env(safe-area-inset-bottom, 0px))",
          fontFamily: FONT,
          color: LIGHT.ink,
        }}
      >
        <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <h2 style={{ margin: 0, flex: 1, fontSize: 18, fontWeight: 700 }}>Tags waiting for you</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              minWidth: TAP,
              minHeight: TAP,
              border: "none",
              background: "transparent",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <CloseGlyph size={18} color={LIGHT.sub} />
          </button>
        </header>

        <ModerationQueue
          items={items}
          loading={loading}
          busyIds={busyIds}
          onApprove={(id) => void decide(id, "approved")}
          onReject={(id) => void decide(id, "rejected")}
          onApproveAll={() => void approveAll()}
          approvingAll={approvingAll}
          emptyTitle="No tags yet"
          emptyBody="Send the tag link to her friends. What they add lands here first — you see it before she does, and nothing reaches the card until you approve it."
          theme={QUEUE_THEME}
        />
      </div>
    </div>
  );
}
