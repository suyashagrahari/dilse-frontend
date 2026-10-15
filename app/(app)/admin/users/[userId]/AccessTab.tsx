"use client";

// ─── What this user can see before everybody else ────────────────────────────
//
// The other half of `/admin/early-access`. That screen is template-first — you
// release a template to a list of testers. This one answers the question you
// actually get asked: "what can this client see?" — which the template-first view
// answers only by opening every template in turn.
//
// Read-only apart from revoke. Granting from here would need a template picker
// duplicating the catalogue and the hidden/live state that the early-access screen
// already shows, and a grant made without seeing whether the template is even
// hidden is a grant that quietly does nothing.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { Loader2, Trash2, KeyRound, AlertTriangle } from "lucide-react";
import { C } from "./types";
import { Card, Empty } from "./ui";
import { useToast } from "@/lib/toast/useToast";
import FreeAccessToggle from "../../FreeAccessToggle";
import type { ProfileUser } from "./types";
import TemplateThumb from "@/components/TemplateThumb";
import { templateList, webpageTemplateList } from "@/data/template-registry";

/** Slug → registry entry, for the grant's cover and human title. */
const BY_SLUG = new Map([...templateList, ...webpageTemplateList].map((t) => [t.slug, t]));

interface Grant {
  slug: string;
  grantedByEmail: string;
  note: string;
  createdAt: string | null;
  /** False when the slug no longer matches a template that ships. */
  known: boolean;
}

export default function AccessTab({
  userId,
  hdr,
  user,
  accessToken,
  onFreeAccess,
}: {
  userId: string;
  hdr: () => Record<string, string>;
  /** The profile's user, for the "All templates free" switch. */
  user?: ProfileUser;
  accessToken?: string | null;
  onFreeAccess?: () => void;
}) {
  const { pushToast } = useToast();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/template-grants/user/${userId}`, { headers: hdr() });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      setGrants(json.data.grants || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load early access");
    } finally {
      setLoading(false);
    }
  }, [userId, hdr]);

  useEffect(() => { void load(); }, [load]);

  const revoke = useCallback(
    async (slug: string) => {
      if (busy) return;
      setBusy(slug);
      try {
        const res = await fetch(`${API_URL}/admin/template-grants/${slug}/${userId}`, {
          method: "DELETE",
          headers: hdr(),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to revoke");
        setGrants((p) => p.filter((x) => x.slug !== slug));
        pushToast({ title: `Revoked access to ${slug}`, type: "success" });
      } catch (e) {
        pushToast({ title: e instanceof Error ? e.message : "Could not revoke", type: "error" });
      } finally {
        setBusy(null);
      }
    },
    [busy, userId, hdr, pushToast]
  );

  const fa = user?.freeAccess;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
    {user && (
      <Card title="Free publishing">
        <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: "18px", color: C.muted }}>
          With this on, every priced template publishes free for this person — no paywall, no
          points. Good for influencers and partners. Pages they already published stay live if you
          switch it off.
        </p>
        <FreeAccessToggle
          key={`${userId}:${!!fa?.enabled}`}
          userId={userId}
          enabled={!!fa?.enabled}
          accessToken={accessToken}
          onChange={() => onFreeAccess?.()}
          disabledReason={user.role === "superadmin" ? "Super admins already publish free — see “Pay like a customer” on the Pricing page." : null}
        />
        {fa?.grantedByEmail && (
          <p style={{ margin: "8px 0 0", fontSize: 11.5, color: C.muted, overflowWrap: "anywhere" }}>
            {fa.enabled ? "Granted" : "Last granted"} by {fa.grantedByEmail}
            {fa.grantedAt ? ` · ${new Date(fa.grantedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
            {fa.note ? ` · “${fa.note}”` : ""}
          </p>
        )}
      </Card>
    )}
    <Card
      title="Early access"
      note={loading || error ? undefined : `${grants.length} grant${grants.length === 1 ? "" : "s"}`}
      action={
        <Link
          href="/admin/early-access"
          style={{ fontSize: 12.5, fontWeight: 600, color: C.accent, textDecoration: "none" }}
        >
          Grant access →
        </Link>
      }
    >
      <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: "18px", color: C.muted }}>
        Templates this person can use while they are hidden from everyone else. A
        grant also lets them publish a paid template without being charged.
      </p>

      {loading ? (
        <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
          <Loader2 size={20} className="animate-spin" style={{ color: C.gold }} />
        </div>
      ) : error ? (
        <div
          style={{
            display: "flex", gap: 8, alignItems: "flex-start",
            padding: "10px 12px", borderRadius: 12,
            background: `${C.danger}12`, border: `1px solid ${C.danger}38`,
          }}
        >
          <AlertTriangle size={15} style={{ color: C.danger, flex: "none", marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: C.text }}>{error}</span>
        </div>
      ) : grants.length === 0 ? (
        <Empty>No early access. This user sees only what everyone else sees.</Empty>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {grants.map((gr, i) => (
            <div
              key={gr.slug}
              className="sa-mini"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", animationDelay: `${Math.min(i, 12) * 30}ms`,
              }}
            >
              <TemplateThumb
                src={BY_SLUG.get(gr.slug)?.coverImage}
                width={36}
                radius={8}
                fallbackBg="rgba(201,168,76,.15)"
                fallback={<KeyRound size={14} style={{ color: C.accent }} />}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                {BY_SLUG.get(gr.slug)?.title && (
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text, overflowWrap: "anywhere" }}>
                    {BY_SLUG.get(gr.slug)?.title}
                  </div>
                )}
                <div
                  style={{
                    ...(BY_SLUG.has(gr.slug)
                      ? { fontSize: 11, fontWeight: 500, color: C.faint, marginTop: 1 }
                      : { fontSize: 13, fontWeight: 700, color: C.text }),
                    fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere",
                  }}
                >
                  {gr.slug}
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2, overflowWrap: "anywhere" }}>
                  {gr.grantedByEmail ? `by ${gr.grantedByEmail}` : ""}
                  {gr.createdAt ? ` · ${new Date(gr.createdAt).toLocaleDateString("en-IN")}` : ""}
                  {gr.note ? ` · ${gr.note}` : ""}
                </div>
                {/* A grant can outlive the template it names — a slug renamed or
                    retired. Saying so beats an entry that looks fine and does
                    nothing. */}
                {!gr.known && (
                  <div style={{ fontSize: 11, color: C.warn, marginTop: 3 }}>
                    No template ships under this slug any more — safe to revoke.
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={busy === gr.slug}
                onClick={() => void revoke(gr.slug)}
                title="Revoke"
                aria-label={`Revoke access to ${gr.slug}`}
                style={{
                  width: 36, height: 36, borderRadius: 10, flex: "none",
                  background: "rgba(179,38,30,.07)", border: "1px solid rgba(179,38,30,.22)", color: C.danger,
                  cursor: busy === gr.slug ? "default" : "pointer",
                  display: "grid", placeItems: "center",
                }}
              >
                {busy === gr.slug ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
    </div>
  );
}
