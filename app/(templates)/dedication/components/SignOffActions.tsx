"use client";

// ─── Sign-off actions — share, and the call back ─────────────────────────────
//
// The call back is the loop: the recipient records a reply into the same booth
// the sender used, on the same station. Recording works end to end today.
//
// DELIVERY IS STUBBED. See the TODO in `handleReply` — there is no upload
// endpoint on the client and no reply route on the API yet, so the blob stays
// an object URL in this tab. The button says so rather than pretending; a
// "sent!" toast over a message that went nowhere is the one outcome worse than
// no button at all.

import { useCallback, useState } from "react";
import { PhoneCall, Share2, Check } from "lucide-react";
import { BODY_FACE, PALETTE, TAP_TARGET_PX, type RadioShow } from "./types";
import Booth, { type Recording } from "./Booth";

export interface SignOffActionsProps {
  show: RadioShow;
  shareId?: string;
  mode: "demo" | "live";
}

export default function SignOffActions({ show, shareId, mode }: SignOffActionsProps) {
  const [callingBack, setCallingBack] = useState(false);
  const [replied, setReplied] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      void navigator.share({ title: `${show.station.name} — ${show.station.frequency} MHz`, url }).catch(() => {});
      return;
    }
    void navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => {},
    );
  }, [show.station.name, show.station.frequency]);

  const handleReply = useCallback((rec: Recording) => {
    // TODO(delivery): upload `rec.blob` (mime `rec.mimeType`) to media storage
    // and POST the resulting URL to /dedication-pages/share/<shareId>/reply so
    // the sender is notified. Neither the upload helper nor the reply route
    // exists yet — both live outside this template directory.
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[dedication] call-back recorded: ${rec.blob.size} bytes, ${rec.mimeType}, ${Math.round(rec.durationMs / 1000)}s. Delivery is stubbed.`,
      );
    }
    setCallingBack(false);
    setReplied(true);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-3" style={{ maxWidth: 400 }}>
      <div className="flex items-center gap-2 w-full">
        {(shareId || mode === "live") && (
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px]"
            style={{
              minHeight: TAP_TARGET_PX,
              fontFamily: BODY_FACE,
              background: "rgba(232,220,192,.1)",
              color: PALETTE.cream,
              border: "1px solid rgba(232,220,192,.24)",
            }}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "link copied" : "share the station"}
          </button>
        )}

        <button
          type="button"
          onClick={() => setCallingBack((v) => !v)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px]"
          style={{
            minHeight: TAP_TARGET_PX,
            fontFamily: BODY_FACE,
            background: callingBack ? "rgba(232,220,192,.1)" : PALETTE.amber,
            color: callingBack ? PALETTE.cream : PALETTE.ink,
            border: callingBack ? "1px solid rgba(232,220,192,.24)" : "none",
          }}
        >
          <PhoneCall size={16} />
          {callingBack ? "never mind" : "call back"}
        </button>
      </div>

      {callingBack && (
        <div className="w-full">
          <Booth
            heading={`Call back to ${show.sender.name || "the station"}`}
            showTextFallback={false}
            onKeep={handleReply}
          />
        </div>
      )}

      {replied && (
        <p
          className="text-[11px] text-center leading-relaxed"
          style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.6)" }}
          role="status"
        >
          recorded — but delivery isn&apos;t wired up yet, so it hasn&apos;t left this tab.
        </p>
      )}
    </div>
  );
}
