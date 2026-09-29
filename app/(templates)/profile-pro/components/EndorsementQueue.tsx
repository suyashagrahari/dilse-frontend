"use client";

// ─── EndorsementQueue — both lanes, one screen ───────────────────────────────
//
// This link goes into a group chat and it is about a real person whose name is
// on the page. So NOTHING PUBLISHES WITHOUT APPROVAL — not the one-tap
// endorsements, not the written recommendations. Both land `pending` and both
// wait here.
//
// ── THE TWO LANES ARE MODERATED DIFFERENTLY ON PURPOSE ───────────────────────
//
// An endorsement is one tap and one name on the way in. Fifteen of them are
// fifteen taps for the friends and would be fifteen approvals for the sender,
// which is the point at which they stop approving and the page stays empty. So
// endorsements get "Approve all".
//
// A recommendation is a paragraph a person wrote about somebody else. There is
// no bulk action on this tab and there should never be one: the whole reason
// moderation exists is the sentence nobody read. Each one is approved on its
// own, which costs the sender ten seconds and is the only thing standing
// between the recipient and a joke that did not land.
//
// ── THIS IS A SKIN, NOT A QUEUE ──────────────────────────────────────────────
//
// The rows, the decisions, the flag marker, the empty state and the reduced-
// motion handling all live in `components/contrib/ModerationQueue`. This file
// picks the palette, splits the two streams, and adds the nudge. If you find
// yourself writing a row renderer here, stop — the shared one takes a
// `renderBody`.
//
// ── THE NUDGE IS THE DIFFERENCE BETWEEN 4 AND 15 ─────────────────────────────
//
// A sender who publishes and then has to think of a way to ask gets four
// contributions. A sender handed a pre-written WhatsApp message gets fifteen.
// The button is one tap and the words are already in it.

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import ModerationQueue from "@/components/contrib/ModerationQueue";
import { whatsappNudgeUrl } from "@/components/contrib/ContributorShell";
import useContributions from "@/hooks/useContributions";
import { approveAllContributions, setContributionStatus } from "@/lib/contrib/api";
import type {
  Contribution,
  ContributionKind,
  ContributionStatus,
  ContribTheme,
} from "@/lib/contrib/types";
import { useAppSelector } from "@/store/hooks";

import { ACCENT_TINT, Card, PP } from "./theme";

const MUTED = "#666";
const TAP = 44;
const WRAP = { overflowWrap: "anywhere" as const, wordBreak: "break-word" as const };

/**
 * The shared queue's palette, in this template's colours.
 *
 * `serif` is deliberately the same sans as everything else: this genre has no
 * serif anywhere, and one appearing inside the moderation card would read as a
 * different product bolted on.
 */
const QUEUE_THEME: Partial<ContribTheme> = {
  paper: PP.card,
  paperDeep: PP.page,
  edge: PP.edge,
  ink: PP.ink,
  inkSoft: MUTED,
  inkFaint: "#8A8A8A",
  accent: PP.accent,
  accentInk: PP.accentInk,
  ok: PP.accent,
  danger: "#B3261E",
  warn: "#B07213",
  font: PP.font,
  serif: PP.font,
};

function messageFor(status: number, serverError: string): string {
  switch (status) {
    case 0:
      return "Couldn't reach the server — check your connection and try that again.";
    case 401:
    case 403:
      return "That decision needs you signed in again.";
    case 404:
      return "That one has already gone.";
    default:
      return serverError || "Couldn't save that — try again in a moment.";
  }
}

/* ── One stream ────────────────────────────────────────────────────────────── */

interface Stream {
  items: Contribution[];
  pending: number;
  loading: boolean;
  busyIds: string[];
  approvingAll: boolean;
  error: string;
  approve: (id: string) => void;
  reject: (id: string) => void;
  approveAll: () => void;
}

/**
 * An answered decision the poll has not caught up with yet.
 *
 * It records what the row said BEFORE, not just what it should say now, and it
 * only applies while the server still reports that older status. That is what
 * makes it self-expiring: the moment the poll carries the decision back — or
 * carries a different one, made on the sender's other device — the override
 * stops matching and drops out of the render on its own. No effect prunes it,
 * so nothing here sets state from an effect body and the list never cascades.
 */
interface Override {
  from: ContributionStatus;
  to: ContributionStatus;
}

/**
 * Polling plus decisions for one kind.
 *
 * `useContributions` owns the list and the interval — including stopping it on
 * `visibilitychange` and on unmount — and is not extended here. Decisions are
 * applied optimistically so a tapped row flips at once instead of sitting
 * unchanged for up to five seconds while the sender taps it again.
 */
function useStream(shareId: string, kind: ContributionKind, token: string | null): Stream {
  const { items, loading, refresh } = useContributions({
    shareId,
    kind,
    scope: "owner",
    token,
    enabled: Boolean(shareId && token),
  });

  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [approvingAll, setApprovingAll] = useState(false);
  const [error, setError] = useState("");

  const decide = useCallback(
    async (id: string, status: ContributionStatus) => {
      if (!token || !shareId) return;
      const before = items.find((c) => c.id === id)?.status ?? "pending";

      setError("");
      setBusyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

      const res = await setContributionStatus(shareId, kind, id, status, token);

      setBusyIds((prev) => prev.filter((x) => x !== id));
      if (!res.ok) {
        setError(messageFor(res.status, res.error));
        return;
      }
      setOverrides((prev) => ({ ...prev, [res.data.id]: { from: before, to: res.data.status } }));
      refresh();
    },
    [shareId, kind, token, refresh, items]
  );

  const approve = useCallback((id: string) => void decide(id, "approved"), [decide]);
  const reject = useCallback((id: string) => void decide(id, "rejected"), [decide]);

  const approveAll = useCallback(() => {
    if (!token || !shareId) return;
    setError("");
    setApprovingAll(true);

    void approveAllContributions(shareId, kind, token).then((res) => {
      setApprovingAll(false);
      if (!res.ok) {
        setError(messageFor(res.status, res.error));
        return;
      }
      // The call answers with the whole updated set, which IS the new truth —
      // so every optimistic override is now either confirmed by it or
      // superseded by it. Either way they are stale, and dropping them all is
      // correct where rewriting them would re-assert a guess over a fact.
      setOverrides({});
      refresh();
    });
  }, [shareId, kind, token, refresh]);

  const merged = useMemo(
    () =>
      items.map((c) => {
        const forced = overrides[c.id];
        // Self-expiring, as the Override doc says: the override applies only
        // while the server still reports the status the decision was made
        // against. Once the poll carries the decision back, `from` stops
        // matching and the row renders from the server on its own.
        return forced && forced.from === c.status ? { ...c, status: forced.to } : c;
      }),
    [items, overrides]
  );

  return {
    items: merged,
    pending: merged.filter((c) => c.status === "pending").length,
    loading,
    busyIds,
    approvingAll,
    error,
    approve,
    reject,
    approveAll,
  };
}

/* ── Bits ──────────────────────────────────────────────────────────────────── */

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        minHeight: TAP,
        padding: "0 2px",
        border: "none",
        borderBottom: `2px solid ${active ? PP.accent : "transparent"}`,
        background: "transparent",
        color: active ? PP.accent : MUTED,
        fontFamily: PP.font,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      {count > 0 ? `${label} (${count})` : label}
    </button>
  );
}

/** WhatsApp's own glyph is not ours to draw. A plain send mark, inline. */
function SendMark(): React.JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M21 3L10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8 21 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Nudge({ href, label }: { href: string; label: string }): React.JSX.Element | null {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: TAP,
        padding: "0 16px",
        borderRadius: 8,
        border: `1px solid ${PP.accent}`,
        background: PP.accent,
        color: PP.accentInk,
        fontFamily: PP.font,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        touchAction: "manipulation",
      }}
    >
      <SendMark />
      {label}
    </a>
  );
}

/** An endorsement carries a skill, not a sentence. It gets a pill, not a paragraph. */
function endorsementBody(item: Contribution): React.ReactNode {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        background: ACCENT_TINT,
        color: PP.accent,
        fontFamily: PP.font,
        fontSize: 13,
        fontWeight: 600,
        ...WRAP,
      }}
    >
      {item.body}
    </span>
  );
}

/* ── The queue ─────────────────────────────────────────────────────────────── */

const noopSubscribe = () => () => {};

export function EndorsementQueue(props: { shareId: string }): React.JSX.Element {
  const { shareId } = props;
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
  const token = isAuthenticated ? accessToken : null;

  const [tab, setTab] = useState<"endorsement" | "recommendation">("endorsement");

  // Built after mount: the origin is not knowable on the server, and rendering
  // half a URL on the first paint would hydrate mismatched.
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );

  const endorsements = useStream(shareId, "endorsement", token);
  const recommendations = useStream(shareId, "recommendation", token);

  const endorseLink = origin && shareId ? `${origin}/profile-pro/endorse/${encodeURIComponent(shareId)}` : "";
  const recommendLink = origin && shareId ? `${origin}/profile-pro/recommend/${encodeURIComponent(shareId)}` : "";

  const nudgeHref = useMemo(() => {
    if (tab === "endorsement") {
      return endorseLink
        ? whatsappNudgeUrl(
            "Two taps and your name — endorse a few of her more questionable skills:",
            endorseLink
          )
        : "";
    }
    return recommendLink
      ? whatsappNudgeUrl("Write her a recommendation. Keep a straight face:", recommendLink)
      : "";
  }, [tab, endorseLink, recommendLink]);

  const active = tab === "endorsement" ? endorsements : recommendations;

  if (!token) {
    return (
      <Card>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: PP.ink }}>
          Waiting for you
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: "20px", color: MUTED, ...WRAP }}>
          Sign in as the person who made this page to see what people have added. Nothing they
          send appears here or anywhere else until you have read it.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: PP.ink }}>Waiting for you</h2>
      <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: "19px", color: MUTED, ...WRAP }}>
        Everything lands here first. Nothing goes on the profile until you approve it.
      </p>

      <div
        role="tablist"
        aria-label="Contributions waiting"
        style={{
          display: "flex",
          gap: 20,
          marginTop: 8,
          borderBottom: `1px solid ${PP.edge}`,
        }}
      >
        <TabButton
          label="Endorsements"
          count={endorsements.pending}
          active={tab === "endorsement"}
          onClick={() => setTab("endorsement")}
        />
        <TabButton
          label="Recommendations"
          count={recommendations.pending}
          active={tab === "recommendation"}
          onClick={() => setTab("recommendation")}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        {tab === "recommendation" ? (
          <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: "19px", color: MUTED, ...WRAP }}>
            These are approved one at a time. Somebody wrote each of them about a real person —
            read it properly.
          </p>
        ) : null}

        {active.error ? (
          <p
            style={{ margin: "0 0 12px", fontSize: 13, color: "#B3261E", ...WRAP }}
            aria-live="polite"
          >
            {active.error}
          </p>
        ) : null}

        {tab === "endorsement" ? (
          <ModerationQueue
            items={endorsements.items}
            loading={endorsements.loading}
            busyIds={endorsements.busyIds}
            onApprove={endorsements.approve}
            onReject={endorsements.reject}
            // Bulk, and only here. See the note at the top of the file.
            onApproveAll={endorsements.approveAll}
            approvingAll={endorsements.approvingAll}
            renderBody={endorsementBody}
            emptyTitle="No endorsements yet"
            emptyBody="The moment somebody taps a skill, it lands here. You see it before anyone else, and it only goes on the profile when you say so."
            theme={QUEUE_THEME}
          />
        ) : (
          <ModerationQueue
            items={recommendations.items}
            loading={recommendations.loading}
            busyIds={recommendations.busyIds}
            onApprove={recommendations.approve}
            onReject={recommendations.reject}
            // No `onApproveAll` — deliberate. Written text gets read.
            emptyTitle="Nothing written yet"
            emptyBody="Recommendations take a minute to write, so they arrive slower than the taps. When one does, you read it here first."
            theme={QUEUE_THEME}
          />
        )}

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <Nudge
            href={nudgeHref}
            label={tab === "endorsement" ? "Share the endorsement link" : "Share the writing link"}
          />
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: "18px", color: MUTED, ...WRAP }}>
            {tab === "endorsement"
              ? "One link, as many people as you like. Endorsing takes two taps, which is why it is the one to send first."
              : "Same link for everybody. Whoever opens it can write one, and it still waits for you."}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default EndorsementQueue;
