// ─── How the recipient may answer a question day ─────────────────────────────
//
// The sender picks it in the form (extras.answerMode / extras.noTries, declared
// by the days that offer it — Be My Dandiya Partner today):
//   • "yesOnly"      — the No button dodges forever (the engine's default, and
//                      what every page without the setting keeps doing);
//   • "noAfterTries" — No dodges `noTries` times (4 or 5), then it can be
//                      pressed, asks "Are you sure?", and records a gentle no.
// The server only accepts `answer: "no"` on a page whose extras allow it
// (valentineDays.ts answerAllows), first write wins.

import type { ValentineReactions } from "../types";

export type AnswerMode = "yesOnly" | "noAfterTries";

export interface AnswerRule {
  mode: AnswerMode;
  /** Dodges before No can be pressed (noAfterTries only). */
  tries: number;
}

export function answerRuleOf(extras: Record<string, unknown> | null | undefined): AnswerRule {
  const x = extras ?? {};
  const mode: AnswerMode = x.answerMode === "noAfterTries" ? "noAfterTries" : "yesOnly";
  const tries = String(x.noTries) === "5" ? 5 : 4;
  return { mode, tries };
}

/** "just now" · "5 min ago" · "3 h ago" · "12 Oct, 9:41 pm". */
export function answeredWhen(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** The owner's one-line outcome, or null while there is no answer. */
export function answerChip(r: Pick<ValentineReactions, "answer" | "answeredAt"> | null | undefined, yes = "Said YES 💛"): { text: string; tone: "yes" | "no" } | null {
  if (!r || !r.answer) return null;
  const when = answeredWhen(r.answeredAt);
  return r.answer === "no"
    ? { text: `Said no 💔${when ? ` · ${when}` : ""}`, tone: "no" }
    : { text: `${yes}${when ? ` · ${when}` : ""}`, tone: "yes" };
}
