"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, Plus, Trash2, X, Check } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW, charmGlyph } from "./theme";
import type { EditMode, RakhiData, RakhiCharm } from "./types";
import { uploadImage } from "./upload";

// ─── The builder ─────────────────────────────────────────────────────────────
//
// Four tabs, matching the house sheet pattern. The Shagun tab is last and every
// field in it is optional — the page is complete and sendable without it, and
// the copy says so rather than implying an unfinished step.

const TABS = [
  { id: "bhai", label: "Bhai" },
  { id: "rakhi", label: "Rakhi" },
  { id: "memories", label: "Memories" },
  { id: "shagun", label: "Shagun" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CHARMS: { id: RakhiCharm; label: string }[] = [
  { id: "om", label: "Om" },
  { id: "swastik", label: "Swastik" },
  { id: "evil-eye", label: "Nazar" },
  { id: "heart", label: "Heart" },
  { id: "star", label: "Star" },
];

const THREADS: [string, string][] = [
  ["#9B2226", "#E8913A"],
  ["#7B2CBF", "#F72585"],
  ["#0E6B6B", "#B08D57"],
  ["#1D3557", "#E63946"],
  ["#2F6B4F", "#F4A261"],
];

const field: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 12,
  border: `1px solid ${RB.hairline}`,
  background: RB.surface,
  color: RB.ink,
  fontSize: 15,
  fontFamily: "inherit",
  minHeight: 44,
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: RB.muted,
  marginBottom: 6,
};

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p className="rb-display" style={{ fontSize: 15, fontWeight: 700, color: RB.ink, margin: "0 0 4px" }}>
        {title}
      </p>
      {hint && <p style={{ fontSize: 12, color: RB.muted, margin: "0 0 10px" }}>{hint}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>{children}</div>
    </div>
  );
}

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
}: {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: RakhiData;
  updateMf: (key: keyof RakhiData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const visible = editMode === "manual" || editMode === "choose";
  const [tab, setTab] = useState<TabId>("bhai");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { accessToken } = useAppSelector((s) => s.auth);

  const heroRef = useRef<HTMLInputElement>(null);
  const memoryRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File, slot: string, onDone: (url: string) => void) => {
    setBusy(slot);
    setErr(null);
    const r = await uploadImage(file, accessToken);
    setBusy(null);
    if (r.ok && r.url) onDone(r.url);
    else setErr(r.error ?? "Upload failed");
  };

  const setRakhi = (patch: Partial<RakhiData["rakhi"]>) =>
    updateMf("rakhi", { ...mf.rakhi, ...patch });
  const setShagun = (patch: Partial<RakhiData["shagun"]>) =>
    updateMf("shagun", { ...mf.shagun, ...patch });

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(43,26,16,0.55)" }}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[61]"
            style={{
              maxHeight: "88dvh",
              display: "flex",
              flexDirection: "column",
              background: RB.paper,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              borderTop: CARD_BORDER,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            {/* Head */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px 10px",
                flexShrink: 0,
              }}
            >
              <p className="rb-display" style={{ fontSize: 17, fontWeight: 700, color: RB.red, margin: 0 }}>
                Make your rakhi page
              </p>
              <button
                onClick={() => setEditMode("preview")}
                aria-label="Close"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: `1px solid ${RB.hairline}`,
                  background: RB.surface,
                  color: RB.ink,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "0 18px 12px",
                flexShrink: 0,
                overflowX: "auto",
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    flexShrink: 0,
                    minHeight: 40,
                    padding: "9px 15px",
                    borderRadius: 999,
                    border: `1px solid ${tab === t.id ? RB.red : RB.hairline}`,
                    background: tab === t.id ? "rgba(155,34,38,0.1)" : RB.surface,
                    color: tab === t.id ? RB.red : RB.muted,
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: "4px 18px 18px", flex: 1 }}>
              {err && (
                <p
                  role="alert"
                  style={{
                    fontSize: 12.5,
                    color: RB.red,
                    background: "rgba(155,34,38,0.08)",
                    padding: "8px 11px",
                    borderRadius: 9,
                    marginBottom: 14,
                  }}
                >
                  {err}
                </p>
              )}

              {/* ── BHAI ── */}
              {tab === "bhai" && (
                <>
                  <Section title="Who is it for?">
                    <div>
                      <label style={label} htmlFor="rb-bro">Your bhai&apos;s name</label>
                      <input
                        id="rb-bro"
                        style={field}
                        value={mf.brotherName}
                        onChange={(e) => updateMf("brotherName", e.target.value)}
                        placeholder="Arjun"
                      />
                    </div>
                    <div>
                      <label style={label} htmlFor="rb-sis">Your name</label>
                      <input
                        id="rb-sis"
                        style={field}
                        value={mf.sisterName}
                        onChange={(e) => updateMf("sisterName", e.target.value)}
                        placeholder="Meera"
                      />
                    </div>
                    <div>
                      <label style={label} htmlFor="rb-city">Where you are (optional)</label>
                      <input
                        id="rb-city"
                        style={field}
                        value={mf.city}
                        onChange={(e) => updateMf("city", e.target.value)}
                        placeholder="Pune"
                      />
                    </div>
                    <div>
                      <label style={label} htmlFor="rb-dist">
                        Distance between you in km (optional)
                      </label>
                      <input
                        id="rb-dist"
                        style={field}
                        type="number"
                        inputMode="numeric"
                        value={mf.distanceKm || ""}
                        onChange={(e) => updateMf("distanceKm", Number(e.target.value) || 0)}
                        placeholder="1847"
                      />
                      <p style={{ fontSize: 11.5, color: RB.muted, marginTop: 5 }}>
                        Shows as &ldquo;tied from 1,847 km away&rdquo;. Leave blank to hide it.
                      </p>
                    </div>
                  </Section>

                  <Section
                    title="A photo of you two"
                    hint="This is the picture on the card you can post to your story."
                  >
                    <button
                      onClick={() => heroRef.current?.click()}
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        maxWidth: 190,
                        borderRadius: 16,
                        border: `2px dashed ${RB.hairline}`,
                        background: mf.photoUrl ? "transparent" : RB.surface,
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative",
                        padding: 0,
                      }}
                    >
                      {busy === "hero" ? (
                        <Loader2 size={22} className="animate-spin" color={RB.muted} />
                      ) : mf.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mf.photoUrl}
                          alt="Your photo"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ display: "grid", placeItems: "center", gap: 7, color: RB.muted }}>
                          <Camera size={22} />
                          <span style={{ fontSize: 12.5 }}>Add photo</span>
                        </span>
                      )}
                    </button>
                    <input
                      ref={heroRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) pick(f, "hero", (url) => updateMf("photoUrl", url));
                        e.target.value = "";
                      }}
                    />
                    {mf.photoUrl && (
                      <button
                        onClick={() => updateMf("photoUrl", "")}
                        style={{
                          alignSelf: "flex-start",
                          minHeight: 40,
                          padding: "8px 13px",
                          borderRadius: 9,
                          border: `1px solid ${RB.hairline}`,
                          background: RB.surface,
                          color: RB.muted,
                          fontSize: 12.5,
                          cursor: "pointer",
                        }}
                      >
                        Remove photo
                      </button>
                    )}
                  </Section>

                  <Section title="What you want to say" hint="One line at a time. He reads them one by one.">
                    {mf.greeting.map((line, i) => (
                      <div key={i} style={{ display: "flex", gap: 8 }}>
                        <input
                          style={field}
                          value={line}
                          onChange={(e) => {
                            const next = [...mf.greeting];
                            next[i] = e.target.value;
                            updateMf("greeting", next);
                          }}
                          placeholder="Every year I tie this thread."
                        />
                        <button
                          onClick={() => updateMf("greeting", mf.greeting.filter((_, j) => j !== i))}
                          aria-label={`Remove line ${i + 1}`}
                          style={{
                            width: 44,
                            minHeight: 44,
                            flexShrink: 0,
                            borderRadius: 11,
                            border: `1px solid ${RB.hairline}`,
                            background: RB.surface,
                            color: RB.muted,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    {mf.greeting.length < 6 && (
                      <button
                        onClick={() => updateMf("greeting", [...mf.greeting, ""])}
                        style={{
                          minHeight: 44,
                          padding: "10px 14px",
                          borderRadius: 11,
                          border: `1px dashed ${RB.hairline}`,
                          background: "transparent",
                          color: RB.muted,
                          fontSize: 13.5,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <Plus size={15} /> Add a line
                      </button>
                    )}
                  </Section>
                </>
              )}

              {/* ── RAKHI ── */}
              {tab === "rakhi" && (
                <>
                  <Section title="The thread">
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {THREADS.map(([a, b]) => {
                        const on = mf.rakhi.threadColorA === a && mf.rakhi.threadColorB === b;
                        return (
                          <button
                            key={a + b}
                            onClick={() => setRakhi({ threadColorA: a, threadColorB: b })}
                            aria-label={`Thread ${a} and ${b}`}
                            aria-pressed={on}
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 999,
                              background: `linear-gradient(135deg, ${a}, ${b})`,
                              border: on ? `3px solid ${RB.ink}` : `2px solid ${RB.hairline}`,
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {on && <Check size={17} color="#fff" />}
                          </button>
                        );
                      })}
                    </div>
                  </Section>

                  <Section title="The charm">
                    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                      {CHARMS.map((c) => {
                        const on = mf.rakhi.charm === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setRakhi({ charm: c.id })}
                            aria-pressed={on}
                            style={{
                              minHeight: 44,
                              padding: "9px 14px",
                              borderRadius: 999,
                              border: `1px solid ${on ? RB.red : RB.hairline}`,
                              background: on ? "rgba(155,34,38,0.1)" : RB.surface,
                              color: on ? RB.red : RB.muted,
                              fontSize: 13.5,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                            }}
                          >
                            <span style={{ fontSize: 15 }}>{charmGlyph[c.id]}</span>
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </Section>

                  <Section title="On the pendant" hint="Your name, or whatever he calls you. Keep it short.">
                    <input
                      style={field}
                      value={mf.rakhi.pendantText}
                      maxLength={16}
                      onChange={(e) => setRakhi({ pendantText: e.target.value })}
                      placeholder="didi"
                    />
                  </Section>

                  <Section title="The ledger" hint="The running jokes. Funny, never a real complaint.">
                    {mf.ledger.map((row, i) => (
                      <div key={i} style={{ display: "flex", gap: 8 }}>
                        <input
                          style={{ ...field, flex: 2 }}
                          value={row.label}
                          onChange={(e) => {
                            const next = [...mf.ledger];
                            next[i] = { ...next[i], label: e.target.value };
                            updateMf("ledger", next);
                          }}
                          placeholder="chocolates owed"
                        />
                        <input
                          style={{ ...field, flex: 1, minWidth: 0 }}
                          value={row.value}
                          onChange={(e) => {
                            const next = [...mf.ledger];
                            next[i] = { ...next[i], value: e.target.value };
                            updateMf("ledger", next);
                          }}
                          placeholder="47"
                        />
                        <button
                          onClick={() => updateMf("ledger", mf.ledger.filter((_, j) => j !== i))}
                          aria-label={`Remove row ${i + 1}`}
                          style={{
                            width: 44,
                            minHeight: 44,
                            flexShrink: 0,
                            borderRadius: 11,
                            border: `1px solid ${RB.hairline}`,
                            background: RB.surface,
                            color: RB.muted,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    {mf.ledger.length < 8 && (
                      <button
                        onClick={() => updateMf("ledger", [...mf.ledger, { label: "", value: "" }])}
                        style={{
                          minHeight: 44,
                          padding: "10px 14px",
                          borderRadius: 11,
                          border: `1px dashed ${RB.hairline}`,
                          background: "transparent",
                          color: RB.muted,
                          fontSize: 13.5,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <Plus size={15} /> Add a row
                      </button>
                    )}
                  </Section>
                </>
              )}

              {/* ── MEMORIES ── */}
              {tab === "memories" && (
                <Section title="Photos" hint="Each one becomes a polaroid with your caption.">
                  {mf.memories.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: 10,
                        borderRadius: 13,
                        background: RB.surface,
                        border: `1px solid ${RB.hairline}`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.imageUrl}
                        alt=""
                        style={{
                          width: 62,
                          height: 62,
                          borderRadius: 9,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
                        <input
                          style={{ ...field, minHeight: 40, padding: "8px 11px", fontSize: 14 }}
                          value={m.caption}
                          onChange={(e) => {
                            const next = [...mf.memories];
                            next[i] = { ...next[i], caption: e.target.value };
                            updateMf("memories", next);
                          }}
                          placeholder="Caption"
                        />
                        <input
                          style={{ ...field, minHeight: 40, padding: "8px 11px", fontSize: 14 }}
                          value={m.year}
                          maxLength={8}
                          onChange={(e) => {
                            const next = [...mf.memories];
                            next[i] = { ...next[i], year: e.target.value };
                            updateMf("memories", next);
                          }}
                          placeholder="2019"
                        />
                      </div>
                      <button
                        onClick={() => updateMf("memories", mf.memories.filter((_, j) => j !== i))}
                        aria-label={`Remove memory ${i + 1}`}
                        style={{
                          width: 40,
                          minHeight: 44,
                          flexShrink: 0,
                          borderRadius: 10,
                          border: `1px solid ${RB.hairline}`,
                          background: "transparent",
                          color: RB.muted,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}

                  {mf.memories.length < 12 && (
                    <>
                      <button
                        onClick={() => memoryRef.current?.click()}
                        disabled={busy === "memory"}
                        style={{
                          minHeight: 46,
                          padding: "12px 15px",
                          borderRadius: 12,
                          border: `1px dashed ${RB.hairline}`,
                          background: "transparent",
                          color: RB.muted,
                          fontSize: 13.5,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        {busy === "memory" ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Plus size={15} />
                        )}
                        {busy === "memory" ? "Uploading…" : "Add a photo"}
                      </button>
                      <input
                        ref={memoryRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f)
                            pick(f, "memory", (url) =>
                              updateMf("memories", [
                                ...mf.memories,
                                { imageUrl: url, caption: "", year: "" },
                              ])
                            );
                          e.target.value = "";
                        }}
                      />
                    </>
                  )}
                </Section>
              )}

              {/* ── SHAGUN ── */}
              {tab === "shagun" && (
                <>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(47,107,79,0.08)",
                      border: `1px solid rgba(47,107,79,0.25)`,
                      marginBottom: 20,
                    }}
                  >
                    <p style={{ fontSize: 12.5, lineHeight: 1.6, color: RB.ink, margin: 0 }}>
                      All optional. Your page works perfectly without any of this
                      — the whole ritual is free either way. If you add it, it
                      shows up <em>after</em> the rakhi is tied, and he is never
                      asked to confirm or reminded about it.
                    </p>
                  </div>

                  <Section title="Your UPI" hint="So he can send shagun in one tap.">
                    <div>
                      <label style={label} htmlFor="rb-upi">UPI ID</label>
                      <input
                        id="rb-upi"
                        style={field}
                        value={mf.shagun.upiId}
                        onChange={(e) => setShagun({ upiId: e.target.value.trim() })}
                        placeholder="meera@okhdfcbank"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </div>

                    <div>
                      <label style={label}>QR code (optional)</label>
                      <button
                        onClick={() => qrRef.current?.click()}
                        style={{
                          width: 130,
                          height: 130,
                          borderRadius: 13,
                          border: `2px dashed ${RB.hairline}`,
                          background: mf.shagun.qrImageUrl ? "#fff" : RB.surface,
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          overflow: "hidden",
                          padding: 0,
                        }}
                      >
                        {busy === "qr" ? (
                          <Loader2 size={19} className="animate-spin" color={RB.muted} />
                        ) : mf.shagun.qrImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mf.shagun.qrImageUrl}
                            alt="Your UPI QR"
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <span style={{ display: "grid", placeItems: "center", gap: 6, color: RB.muted }}>
                            <Camera size={19} />
                            <span style={{ fontSize: 12 }}>Add QR</span>
                          </span>
                        )}
                      </button>
                      <input
                        ref={qrRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) pick(f, "qr", (url) => setShagun({ qrImageUrl: url }));
                          e.target.value = "";
                        }}
                      />
                      {mf.shagun.qrImageUrl && (
                        <button
                          onClick={() => setShagun({ qrImageUrl: "" })}
                          style={{
                            display: "block",
                            marginTop: 8,
                            minHeight: 40,
                            padding: "8px 13px",
                            borderRadius: 9,
                            border: `1px solid ${RB.hairline}`,
                            background: RB.surface,
                            color: RB.muted,
                            fontSize: 12.5,
                            cursor: "pointer",
                          }}
                        >
                          Remove QR
                        </button>
                      )}
                    </div>

                    <div>
                      <label style={label} htmlFor="rb-note">A line to go with it (optional)</label>
                      <input
                        id="rb-note"
                        style={field}
                        value={mf.shagun.note}
                        onChange={(e) => setShagun({ note: e.target.value })}
                        placeholder="Chai ka kharcha 😌"
                      />
                    </div>
                  </Section>

                  <Section title="Lock the page (optional)" hint="Only someone with the word can open it.">
                    <input
                      style={field}
                      value={pagePassword}
                      onChange={(e) => setPagePassword(e.target.value)}
                      placeholder="A word only he knows"
                    />
                  </Section>
                </>
              )}
            </div>

            {/* Foot */}
            <div
              style={{
                padding: "12px 18px calc(14px + env(safe-area-inset-bottom))",
                borderTop: `1px solid ${RB.hairline}`,
                background: RB.paper,
                flexShrink: 0,
              }}
            >
              <button
                onClick={onSave}
                disabled={saving}
                className="rb-display"
                style={{
                  width: "100%",
                  minHeight: 52,
                  padding: "15px 24px",
                  borderRadius: 999,
                  background: BRAND_GRADIENT,
                  color: "#fffdf8",
                  border: CARD_BORDER,
                  boxShadow: CARD_SHADOW,
                  fontSize: 16.5,
                  fontWeight: 700,
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving…" : "Save & preview"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
