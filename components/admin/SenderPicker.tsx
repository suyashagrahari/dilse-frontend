"use client";

// ─── Which of our addresses this reply leaves from ───────────────────────────
//
// One picker, shared by the conversation panel and the unfinished-drafts
// composer. It was written inline in `/admin/threads` first; the drafts
// composer needed exactly the same control, and two copies of a control that
// decides what a customer sees in their inbox is how the two quietly drift
// apart.
//
// ── WHY IT SENDS AN ID AND SHOWS AN ADDRESS ─────────────────────────────────
//
// The value handed back is `option.id`, never the address. SES sends only from
// a verified identity, and the chosen value is interpolated into a mail header
// where a newline is header injection — so the server owns the address and the
// client owns the choice. The address is still PRINTED on every chip, because
// "Feedback" and "Support" are not what the recipient sees; `feedback@…` is.
//
// ── WHY REPLY-TO SITS RIGHT UNDER IT ────────────────────────────────────────
//
// From is a choice. Reply-To is not, and never can be: the apex domain's MX is
// GoDaddy's and carries all company mail, so a reply sent back to
// `feedback@subhsandesh.in` lands in a mailbox this application cannot read.
// Only `reply.subhsandesh.in` reaches SES. Showing the two together is the only
// way that asymmetry reads as deliberate instead of broken.

import { BRAND } from "@/lib/brand";

export interface SenderOption {
  id: string;
  address: string;
  label: string;
  description: string;
  isDefault?: boolean;
}

export default function SenderPicker({
  options,
  value,
  onChange,
  replyToAddress,
  /** Overridden by the drafts composer, where the mail is a follow-up rather than a reply. */
  replyNote,
}: {
  options: SenderOption[];
  value: string;
  onChange: (id: string) => void;
  replyToAddress?: string;
  replyNote?: string;
}) {
  if (options.length === 0) return null;
  const chosen = options.find((o) => o.id === value);

  return (
    <div style={{ marginBottom: 10 }}>
      <p
        style={{
          margin: "0 0 6px", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em",
          textTransform: "uppercase", color: BRAND.faint,
        }}
      >
        Send as
      </p>

      <div
        role="radiogroup"
        aria-label="Which address this is sent from"
        style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
      >
        {options.map((o) => {
          const on = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              title={o.description}
              onClick={() => onChange(o.id)}
              style={{
                // 34px rather than the 30 this started at: it is tapped on a
                // phone, beside a Send button, and a mis-tap here sends the
                // mail from the wrong address.
                minHeight: 34, padding: "6px 11px", borderRadius: 999, cursor: "pointer",
                border: `1px solid ${on ? BRAND.accentStrong : BRAND.border}`,
                background: on ? BRAND.accentStrong : BRAND.surface,
                color: on ? "#fff" : BRAND.muted,
                fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
                touchAction: "manipulation",
              }}
            >
              {o.label}
              <span style={{ fontSize: 11, fontWeight: 600, opacity: on ? 0.78 : 0.62 }}>
                {o.address}
              </span>
            </button>
          );
        })}
      </div>

      {/* The chosen option's own sentence, so the choice is explained where it
          is made rather than in a tooltip nobody hovers on a phone. */}
      {chosen?.description && (
        <p style={{ margin: "7px 0 0", fontSize: 11.5, color: BRAND.faint, lineHeight: 1.5 }}>
          {chosen.description}
        </p>
      )}

      {replyToAddress && (
        <p style={{ margin: "6px 0 0", fontSize: 11.5, color: BRAND.faint, lineHeight: 1.5 }}>
          {replyNote || "Their reply comes back to"}{" "}
          <span style={{ fontWeight: 700, color: BRAND.muted }}>{replyToAddress}</span>{" "}
          whichever address you send as — that is the only one this panel can read.
        </p>
      )}
    </div>
  );
}
