"use client";

import React, { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera, ChevronDown, Eye, FileText, HelpCircle, IdCard, Image as ImageIcon,
  Link2, ListTree, Lock, Plus, Search, Trash2, X,
} from "lucide-react";
import type { PaaItem, SearchData, SearchResult } from "./types";
import type { EditMode } from "../hooks/useSearchedEditor";
import {
  MAX_FACTS, MAX_IMAGES, MAX_PAA, MAX_RELATED, MAX_RESERVE, MAX_RESULTS, MAX_SUGGESTIONS,
} from "../hooks/useSearchedEditor";

/* ── Editor frame ───────────────────────────────────────────────────────────
 *
 * An ordinary product form, in the template's violet. The greyscale
 * search-page look belongs to the preview underneath — if the form adopted it
 * too, nobody would be able to tell which surface they were editing.
 */
const VIOLET = "#6D28D9";
const VIOLET_GRAD = "linear-gradient(135deg,#7C3AED,#4F46E5)";
const INK = "#1F1B2E";
const MUTED = "#7A7391";
const RULE = "#E6E0F5";

/** 16px on every input: anything smaller makes iOS zoom the page on focus. */
const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 16,
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${RULE}`,
  background: "#fff",
  color: INK,
  outline: "none",
  minHeight: 44,
};

const smallLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: MUTED,
  display: "block",
  marginBottom: 5,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={smallLabel}>{label}</span>
      {children}
    </label>
  );
}

function Section({
  icon, title, blurb, children,
}: { icon: React.ReactNode; title: string; blurb: string; children: React.ReactNode }) {
  return (
    <section style={{ border: `1px solid ${RULE}`, borderRadius: 16, padding: 14, background: "rgba(250,248,255,.7)" }}>
      <h4 style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>
        <span style={{ color: VIOLET, display: "grid", placeItems: "center" }} aria-hidden>{icon}</span>
        {title}
      </h4>
      <p style={{ fontSize: 11.5, color: MUTED, margin: "3px 0 12px", lineHeight: 1.5 }}>{blurb}</p>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </section>
  );
}

function RowShell({ index, onRemove, children }: { index: number; onRemove?: () => void; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${RULE}`, borderRadius: 12, padding: 11, background: "#fff", display: "grid", gap: 9 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>#{index + 1}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove item ${index + 1}`}
            style={{ border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 6, minHeight: 32 }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 14px",
        borderRadius: 10, border: `1px dashed ${RULE}`, background: "#fff",
        color: disabled ? MUTED : VIOLET, fontSize: 13, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
      }}
    >
      <Plus size={14} /> {label}
    </button>
  );
}

const linesToArray = (v: string): string[] => v.split("\n").map((s) => s.replace(/\s+$/, ""));
const arrayToLines = (a: string[]): string => a.join("\n");

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: SearchData;
  updateMf: (next: Partial<SearchData> | ((cur: SearchData) => SearchData)) => void;
  setRecipientName: (name: string) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
}

export default function EditSheet({
  editMode, setEditMode, mf, updateMf, setRecipientName, pagePassword, setPagePassword, onSave,
}: EditSheetProps) {
  const open = editMode === "manual";

  const patchResult = useCallback(
    (i: number, patch: Partial<SearchResult>) =>
      updateMf((cur) => ({ ...cur, results: cur.results.map((r, j) => (j === i ? { ...r, ...patch } : r)) })),
    [updateMf],
  );

  const patchPaa = useCallback(
    (key: "paa" | "paaReserve", i: number, patch: Partial<PaaItem>) =>
      updateMf((cur) => ({ ...cur, [key]: cur[key].map((p, j) => (j === i ? { ...p, ...patch } : p)) })),
    [updateMf],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250]"
          style={{ background: "rgba(24,18,40,.45)" }}
          onClick={() => setEditMode(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            onClick={(ev) => ev.stopPropagation()}
            className="absolute inset-x-0 bottom-0 flex flex-col"
            style={{
              background: "#fff",
              borderRadius: "22px 22px 0 0",
              maxHeight: "92dvh",
              maxWidth: 620,
              margin: "0 auto",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderBottom: `1px solid ${RULE}`, flex: "0 0 auto",
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: 0 }}>Write the results page</h3>
                <p style={{ fontSize: 11.5, color: MUTED, margin: "2px 0 0" }}>
                  The last result should be the letter. Nobody clicks the last one.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditMode(null)}
                aria-label="Close"
                style={{ border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 8 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: 16, display: "grid", gap: 14, flex: 1 }}>
              <Section icon={<IdCard size={15} />} title="Who it's for" blurb="Their name becomes the wordmark, the search box and the panel. Changing it rewrites the copy.">
                <Field label="Their name">
                  <input
                    style={inputStyle}
                    value={mf.recipient.name}
                    maxLength={40}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Meera Verma"
                  />
                </Field>
                <Field label="Your name">
                  <input
                    style={inputStyle}
                    value={mf.sender.name}
                    maxLength={40}
                    onChange={(e) => updateMf({ sender: { name: e.target.value } })}
                  />
                </Field>
                <Field label="Photo URL">
                  <input
                    style={inputStyle}
                    value={mf.recipient.photoUrl}
                    onChange={(e) => updateMf({ recipient: { ...mf.recipient, photoUrl: e.target.value } })}
                    placeholder="https://…  (blank is fine — the panel draws their initial)"
                  />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Results count">
                    <input
                      style={inputStyle}
                      value={mf.resultCount}
                      maxLength={16}
                      onChange={(e) => updateMf({ resultCount: e.target.value })}
                      placeholder="8,47,000"
                    />
                  </Field>
                  <Field label="Seconds">
                    <input
                      style={inputStyle}
                      value={mf.searchSeconds}
                      maxLength={6}
                      onChange={(e) => updateMf({ searchSeconds: e.target.value })}
                      placeholder="0.42"
                    />
                  </Field>
                </div>
                <Field label="Did you mean… (optional)">
                  <input
                    style={inputStyle}
                    value={mf.didYouMean ?? ""}
                    maxLength={60}
                    onChange={(e) => updateMf({ didYouMean: e.target.value })}
                    placeholder="Meera Varma"
                  />
                </Field>
              </Section>

              <Section icon={<Search size={15} />} title="Autocomplete" blurb={`Funniest first. Start each with their name so it completes as they type. Up to ${MAX_SUGGESTIONS}.`}>
                <textarea
                  style={{ ...inputStyle, minHeight: 132, lineHeight: 1.6, resize: "vertical" }}
                  value={arrayToLines(mf.autocomplete)}
                  onChange={(e) => updateMf({ autocomplete: linesToArray(e.target.value).slice(0, MAX_SUGGESTIONS) })}
                  placeholder={"Meera Verma is always right\nMeera Verma near me"}
                />
              </Section>

              <Section icon={<ListTree size={15} />} title="Results" blurb={`Breadcrumb, title, snippet. Wrap matched words in <b>…</b>. A page body makes the result clickable. Up to ${MAX_RESULTS}.`}>
                {mf.results.map((r, i) => (
                  <RowShell
                    key={r.id || i}
                    index={i}
                    onRemove={() => updateMf((cur) => ({ ...cur, results: cur.results.filter((_, j) => j !== i) }))}
                  >
                    <Field label="Breadcrumb URL">
                      <input style={inputStyle} value={r.url} onChange={(e) => patchResult(i, { url: e.target.value })} placeholder="meera-verma.in › about" />
                    </Field>
                    <Field label="Title">
                      <input style={inputStyle} value={r.title} onChange={(e) => patchResult(i, { title: e.target.value })} />
                    </Field>
                    <Field label="Snippet">
                      <textarea
                        style={{ ...inputStyle, minHeight: 74, resize: "vertical" }}
                        value={r.snippet}
                        onChange={(e) => patchResult(i, { snippet: e.target.value })}
                      />
                    </Field>
                    <Field label='Badge (e.g. "Ad") — optional'>
                      <input style={inputStyle} value={r.badge ?? ""} maxLength={16} onChange={(e) => patchResult(i, { badge: e.target.value })} />
                    </Field>
                    <Field label="Page — one paragraph per line. Blank = not clickable.">
                      <textarea
                        style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
                        value={arrayToLines(r.page?.body ?? [])}
                        onChange={(e) =>
                          patchResult(i, {
                            page: {
                              title: r.page?.title || r.title,
                              url: r.page?.url || r.url,
                              body: linesToArray(e.target.value).filter((l, idx, all) => l.trim() || idx < all.length - 1),
                              ...(r.page?.imageUrl ? { imageUrl: r.page.imageUrl } : {}),
                            },
                          })
                        }
                      />
                    </Field>
                  </RowShell>
                ))}
                <AddButton
                  label="Add a result"
                  disabled={mf.results.length >= MAX_RESULTS}
                  onClick={() =>
                    updateMf((cur) => ({
                      ...cur,
                      results: [...cur.results, { id: `r${Date.now()}`, title: "", url: "", snippet: "" }],
                    }))
                  }
                />
              </Section>

              <Section icon={<HelpCircle size={15} />} title="People also ask" blurb={`The first ${MAX_PAA} show; the reserve appears two at a time as they open them.`}>
                {mf.paa.map((p, i) => (
                  <RowShell key={i} index={i} onRemove={() => updateMf((cur) => ({ ...cur, paa: cur.paa.filter((_, j) => j !== i) }))}>
                    <Field label="Question">
                      <input style={inputStyle} value={p.question} onChange={(e) => patchPaa("paa", i, { question: e.target.value })} />
                    </Field>
                    <Field label="Answer">
                      <textarea style={{ ...inputStyle, minHeight: 84, resize: "vertical" }} value={p.answer} onChange={(e) => patchPaa("paa", i, { answer: e.target.value })} />
                    </Field>
                    <Field label="Source line — optional">
                      <input style={inputStyle} value={p.source ?? ""} onChange={(e) => patchPaa("paa", i, { source: e.target.value })} placeholder="arjun.exe › feelings" />
                    </Field>
                  </RowShell>
                ))}
                <AddButton
                  label="Add a question"
                  disabled={mf.paa.length >= MAX_PAA}
                  onClick={() => updateMf((cur) => ({ ...cur, paa: [...cur.paa, { question: "", answer: "" }] }))}
                />

                <p style={{ ...smallLabel, marginTop: 4 }}>Held back (appear as they expand)</p>
                {mf.paaReserve.map((p, i) => (
                  <RowShell key={i} index={i} onRemove={() => updateMf((cur) => ({ ...cur, paaReserve: cur.paaReserve.filter((_, j) => j !== i) }))}>
                    <Field label="Question">
                      <input style={inputStyle} value={p.question} onChange={(e) => patchPaa("paaReserve", i, { question: e.target.value })} />
                    </Field>
                    <Field label="Answer">
                      <textarea style={{ ...inputStyle, minHeight: 74, resize: "vertical" }} value={p.answer} onChange={(e) => patchPaa("paaReserve", i, { answer: e.target.value })} />
                    </Field>
                  </RowShell>
                ))}
                <AddButton
                  label="Add a held-back question"
                  disabled={mf.paaReserve.length >= MAX_RESERVE}
                  onClick={() => updateMf((cur) => ({ ...cur, paaReserve: [...cur.paaReserve, { question: "", answer: "" }] }))}
                />
              </Section>

              <Section icon={<FileText size={15} />} title="Knowledge panel" blurb="The card people screenshot. Facts are label and value — keep the values short.">
                <Field label="Subtitle">
                  <input style={inputStyle} value={mf.knowledgePanel.subtitle} onChange={(e) => updateMf({ knowledgePanel: { ...mf.knowledgePanel, subtitle: e.target.value } })} />
                </Field>
                <Field label="Description">
                  <textarea
                    style={{ ...inputStyle, minHeight: 92, resize: "vertical" }}
                    value={mf.knowledgePanel.description}
                    onChange={(e) => updateMf({ knowledgePanel: { ...mf.knowledgePanel, description: e.target.value } })}
                  />
                </Field>
                {mf.knowledgePanel.facts.map((f, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr auto", gap: 7, alignItems: "center" }}>
                    <input
                      style={inputStyle}
                      value={f.label}
                      placeholder="Born"
                      onChange={(e) =>
                        updateMf((cur) => ({
                          ...cur,
                          knowledgePanel: { ...cur.knowledgePanel, facts: cur.knowledgePanel.facts.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) },
                        }))
                      }
                    />
                    <input
                      style={inputStyle}
                      value={f.value}
                      placeholder="14 March"
                      onChange={(e) =>
                        updateMf((cur) => ({
                          ...cur,
                          knowledgePanel: { ...cur.knowledgePanel, facts: cur.knowledgePanel.facts.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) },
                        }))
                      }
                    />
                    <button
                      type="button"
                      aria-label={`Remove fact ${i + 1}`}
                      onClick={() =>
                        updateMf((cur) => ({
                          ...cur,
                          knowledgePanel: { ...cur.knowledgePanel, facts: cur.knowledgePanel.facts.filter((_, j) => j !== i) },
                        }))
                      }
                      style={{ border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 8 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <AddButton
                  label="Add a fact"
                  disabled={mf.knowledgePanel.facts.length >= MAX_FACTS}
                  onClick={() =>
                    updateMf((cur) => ({ ...cur, knowledgePanel: { ...cur.knowledgePanel, facts: [...cur.knowledgePanel.facts, { label: "", value: "" }] } }))
                  }
                />
                <Field label="Quote — optional">
                  <input style={inputStyle} value={mf.knowledgePanel.quote ?? ""} onChange={(e) => updateMf({ knowledgePanel: { ...mf.knowledgePanel, quote: e.target.value } })} />
                </Field>
                <Field label="People also search for — one name per line">
                  <textarea
                    style={{ ...inputStyle, minHeight: 78, resize: "vertical" }}
                    value={arrayToLines(mf.knowledgePanel.alsoSearchFor)}
                    onChange={(e) => updateMf({ knowledgePanel: { ...mf.knowledgePanel, alsoSearchFor: linesToArray(e.target.value) } })}
                  />
                </Field>
              </Section>

              <Section icon={<Link2 size={15} />} title="Related searches" blurb={`Two-column pills at the bottom. Up to ${MAX_RELATED}, one per line.`}>
                <textarea
                  style={{ ...inputStyle, minHeight: 108, resize: "vertical" }}
                  value={arrayToLines(mf.relatedSearches)}
                  onChange={(e) => updateMf({ relatedSearches: linesToArray(e.target.value).slice(0, MAX_RELATED) })}
                />
              </Section>

              <Section icon={<ImageIcon size={15} />} title="Images tab" blurb={`URL and caption. Leave it empty and the tab says so. Up to ${MAX_IMAGES}.`}>
                {mf.images.map((im, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <input
                        style={inputStyle}
                        value={im.url}
                        placeholder="https://…"
                        onChange={(e) => updateMf((cur) => ({ ...cur, images: cur.images.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) }))}
                      />
                      <input
                        style={{ ...inputStyle, minHeight: 40 }}
                        value={im.caption ?? ""}
                        placeholder="caption"
                        onChange={(e) => updateMf((cur) => ({ ...cur, images: cur.images.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) }))}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove image ${i + 1}`}
                      onClick={() => updateMf((cur) => ({ ...cur, images: cur.images.filter((_, j) => j !== i) }))}
                      style={{ border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 8 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <AddButton
                  label="Add an image"
                  disabled={mf.images.length >= MAX_IMAGES}
                  onClick={() => updateMf((cur) => ({ ...cur, images: [...cur.images, { url: "", caption: "" }] }))}
                />
              </Section>

              <Section icon={<Lock size={15} />} title="Password" blurb="Optional. They'll be asked for it before the page opens.">
                <input
                  style={inputStyle}
                  value={pagePassword}
                  onChange={(e) => setPagePassword(e.target.value)}
                  placeholder="leave blank for no password"
                />
              </Section>

              <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.55, margin: 0 }}>
                <Camera size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
                Nothing here is saved to this device. Close the tab and the draft is gone — which is the point, given what
                you are about to write.
              </p>
            </div>

            <div style={{ flex: "0 0 auto", padding: 14, borderTop: `1px solid ${RULE}`, display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setEditMode("preview")}
                style={{
                  minHeight: 46, padding: "0 16px", borderRadius: 12, border: `1px solid ${RULE}`,
                  background: "#fff", color: INK, fontWeight: 600, fontSize: 14, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <Eye size={15} /> Preview
              </button>
              <button
                type="button"
                onClick={onSave}
                style={{
                  flex: 1, minHeight: 46, borderRadius: 12, border: "none", background: VIOLET_GRAD,
                  color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <ChevronDown size={16} style={{ transform: "rotate(-90deg)" }} /> Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
