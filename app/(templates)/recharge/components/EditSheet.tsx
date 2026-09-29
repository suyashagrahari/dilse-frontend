"use client";

// ─── The form ────────────────────────────────────────────────────────────────
//
// One scrolling panel, four friendly sections up top (names → photos → letter
// → receipt note) and everything else folded away under "Fine-tune". Phones
// get a tall bottom sheet; from 900px it is a right-hand drawer so the live
// preview stays visible beside it — every keystroke lands on the page behind.
//
// List fields (rows, benefits, banners, the note) are edited one item per
// line. The textarea shows `list.join("\n")` and writes `text.split("\n")`,
// which round-trips exactly, so a half-typed empty line is never eaten.

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhotoField from "./PhotoField";
import {
  LIMITS,
  MAX_BENEFITS,
  MAX_CATEGORIES,
  MAX_PLANS,
  MAX_PROMOS,
  MAX_RECEIPT_LINES,
  MAX_ROWS,
  type Plan,
  type RechargeData,
} from "./types";
import { priceLabel, FONT, INK, MUTED, FAINT, PINK, PINK_DEEP, LINE, BG } from "./ui";

export type EditMode = null | "manual" | "preview";

/** What still needs filling before Save. Exported so the hook says the same thing. */
export function missingFields(d: RechargeData): string[] {
  const out: string[] = [];
  if (!d.subscriber.name.trim()) out.push("their name");
  if (!d.sender.name.trim()) out.push("your name");
  if (!d.plans.some((p) => !p.disabled)) out.push("at least one available plan");
  return out;
}

const lines = (text: string, max: number, count: number) => text.split("\n").slice(0, count).map((l) => l.slice(0, max));

/* ── Primitives ───────────────────────────────────────────────────────────── */

function Field({
  label,
  hint,
  required,
  error,
  children,
  count,
}: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  error?: boolean;
  children: ReactNode;
  count?: string;
}) {
  return (
    <label className={`rce-field${error ? " err" : ""}`}>
      <span className="rce-label">
        {label}
        {required ? <em> *</em> : null}
        {count ? <span className="rce-count">{count}</span> : null}
      </span>
      {children}
      {hint ? <span className="rce-hint">{hint}</span> : null}
    </label>
  );
}

function Section({ n, title, sub, children }: { n: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="rce-sec">
      <div className="rce-sec-head">
        <span className="rce-n">{n}</span>
        <div>
          <h3>{title}</h3>
          {sub ? <p>{sub}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function Fold({ title, sub, children, defaultOpen = false }: { title: string; sub?: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rce-fold${open ? " open" : ""}`}>
      <button type="button" className="rce-fold-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          <b>{title}</b>
          {sub ? <small>{sub}</small> : null}
        </span>
        <span className="rce-chev" aria-hidden="true">
          ▾
        </span>
      </button>
      {open ? <div className="rce-fold-body">{children}</div> : null}
    </div>
  );
}

/* ── One plan ─────────────────────────────────────────────────────────────── */

function PlanEditor({
  plan,
  index,
  data,
  onPatch,
  onRemove,
  canRemove,
}: {
  plan: Plan;
  index: number;
  data: RechargeData;
  onPatch: (p: Partial<Plan>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const tab = data.categories.find((c) => c.id === plan.categoryId)?.label ?? "";
  return (
    <Fold title={`${priceLabel(plan.price)} · ${plan.validity || "no validity"}`} sub={`Plan ${index + 1}${tab ? ` · ${tab}` : ""}${plan.disabled ? " · unavailable" : ""}`}>
      <div className="rce-row2">
        <Field label="Price" hint="Anything goes — ₹∞, ₹84, 1 hug">
          <input value={plan.price} maxLength={LIMITS.price} onChange={(e) => onPatch({ price: e.target.value })} />
        </Field>
        <Field label="Validity">
          <input value={plan.validity} maxLength={LIMITS.validity} onChange={(e) => onPatch({ validity: e.target.value })} placeholder="Lifetime" />
        </Field>
      </div>
      <div className="rce-row2">
        <Field label="Ribbon (optional)">
          <input value={plan.badge ?? ""} maxLength={LIMITS.badge} onChange={(e) => onPatch({ badge: e.target.value })} placeholder="Most Recharged" />
        </Field>
        <Field label="Tab">
          <select value={plan.categoryId} onChange={(e) => onPatch({ categoryId: e.target.value })}>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="What's included" hint="One per line: Label: Value | optional small note. The first two show on the card." count={`${plan.rows.filter(Boolean).length}/${MAX_ROWS}`}>
        <textarea
          rows={4}
          value={plan.rows.join("\n")}
          onChange={(e) => onPatch({ rows: lines(e.target.value, LIMITS.row, MAX_ROWS) })}
          placeholder={"Hugs: Unlimited/day | no fair usage policy\nCalls: Unlimited"}
        />
      </Field>
      <Field label="Extra benefits" hint="One per line — short ones look best as chips." count={`${plan.benefits.filter(Boolean).length}/${MAX_BENEFITS}`}>
        <textarea rows={3} value={plan.benefits.join("\n")} onChange={(e) => onPatch({ benefits: lines(e.target.value, LIMITS.benefit, MAX_BENEFITS) })} />
      </Field>
      <label className="rce-check">
        <input type="checkbox" checked={!!plan.disabled} onChange={(e) => onPatch({ disabled: e.target.checked, disabledReason: plan.disabledReason ?? "" })} />
        Show as unavailable (greyed out, can&apos;t be picked)
      </label>
      {plan.disabled ? (
        <Field label="Why it's unavailable">
          <input value={plan.disabledReason ?? ""} maxLength={LIMITS.reason} onChange={(e) => onPatch({ disabledReason: e.target.value })} placeholder="Discontinued after a 3-day trial" />
        </Field>
      ) : null}
      {canRemove ? (
        <button type="button" className="rce-danger" onClick={onRemove}>
          Delete this plan
        </button>
      ) : null}
    </Fold>
  );
}

/* ── The sheet ────────────────────────────────────────────────────────────── */

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
  mf: RechargeData;
  updateMf: (patch: Partial<RechargeData>) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [tried, setTried] = useState(false);
  const open = editMode === "manual";
  const missing = missingFields(mf);

  const patchPlan = (i: number, p: Partial<Plan>) => updateMf({ plans: mf.plans.map((pl, idx) => (idx === i ? { ...pl, ...p } : pl)) });

  const addPlan = () => {
    if (mf.plans.length >= MAX_PLANS) return;
    const id = `pl-${Date.now().toString(36)}`;
    updateMf({
      plans: [
        ...mf.plans,
        { id, price: "₹99", categoryId: mf.categories[0]?.id ?? "", validity: "28 days", rows: ["Hugs: 1 GB/day"], benefits: ["One surprise date"] },
      ],
    });
  };

  const save = () => {
    setTried(true);
    onSave();
  };

  const err = (k: string) => tried && missing.includes(k);

  return (
    <>
      <style>{CSS}</style>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="rce"
            className="rce-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode(null)}
          >
            <motion.div
              className="rce-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Customise your recharge"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rce-head">
                <div>
                  <h2>Customise your recharge 💗</h2>
                  <p>Changes show live on the page behind. Only the two names are required.</p>
                </div>
                <button type="button" className="rce-x" onClick={() => setEditMode(null)} aria-label="Close editor">
                  ✕
                </button>
              </div>

              <div className="rce-body">
                <Section n="1" title="Who's getting recharged?" sub="Their name sits on the operator card, the PIN screen and the receipt.">
                  <div className="rce-row2">
                    <Field label="Their name" required error={err("their name")}>
                      <input
                        value={mf.subscriber.name}
                        maxLength={LIMITS.name}
                        placeholder="Meera"
                        onChange={(e) => updateMf({ subscriber: { ...mf.subscriber, name: e.target.value } })}
                      />
                    </Field>
                    <Field label="Your name" required error={err("your name")}>
                      <input value={mf.sender.name} maxLength={LIMITS.name} placeholder="Karan" onChange={(e) => updateMf({ sender: { name: e.target.value } })} />
                    </Field>
                  </div>
                  <div className="rce-row2">
                    <Field label="Their number" hint="Make one up — hide your anniversary in it 😉">
                      <input
                        value={mf.subscriber.number}
                        maxLength={LIMITS.number}
                        inputMode="tel"
                        placeholder="+91 98200 14022"
                        onChange={(e) => updateMf({ subscriber: { ...mf.subscriber, number: e.target.value } })}
                      />
                    </Field>
                    <Field label="Their city (circle)">
                      <input
                        value={mf.subscriber.circle}
                        maxLength={LIMITS.circle}
                        placeholder="UP West"
                        onChange={(e) => updateMf({ subscriber: { ...mf.subscriber, circle: e.target.value } })}
                      />
                    </Field>
                  </div>
                </Section>

                <Section n="2" title="Photos" sub="Photo 1 becomes their profile pic. Every photo turns into an offer banner and a polaroid after payment. Tap one to crop & zoom.">
                  <PhotoField photos={mf.photos} onChange={(photos) => updateMf({ photos })} />
                </Section>

                <Section n="3" title="Your letter 💌" sub="Pops up as an envelope in the corner. They tap it, it opens. Write it like you'd say it.">
                  <Field label="Letter" count={`${mf.letter.length}/${LIMITS.letter}`}>
                    <textarea
                      rows={7}
                      value={mf.letter}
                      maxLength={LIMITS.letter}
                      placeholder="I tried to find a plan big enough for you…"
                      onChange={(e) => updateMf({ letter: e.target.value })}
                    />
                  </Field>
                  <Fold title="Ask a question before it opens" sub={mf.lockQuestion ? `“${mf.lockQuestion}”` : "optional · the 'no' button runs away"}>
                    <Field label="Question">
                      <input value={mf.lockQuestion} maxLength={LIMITS.lockQuestion} placeholder="Will you stay on my network forever? 📶" onChange={(e) => updateMf({ lockQuestion: e.target.value })} />
                    </Field>
                    <Field label="The yes button says">
                      <input value={mf.lockAnswer} maxLength={LIMITS.lockAnswer} placeholder="Recharge accepted 💗" onChange={(e) => updateMf({ lockAnswer: e.target.value })} />
                    </Field>
                  </Fold>
                </Section>

                <Section n="4" title="The receipt note" sub="Shows after the green tick. This is where the jokes stop — say the real thing.">
                  <Field label="Note" hint="One paragraph per line." count={`${mf.receipt.message.filter(Boolean).length}/${MAX_RECEIPT_LINES}`}>
                    <textarea
                      rows={4}
                      value={mf.receipt.message.join("\n")}
                      onChange={(e) => updateMf({ receipt: { message: lines(e.target.value, LIMITS.line, MAX_RECEIPT_LINES) } })}
                    />
                  </Field>
                </Section>

                <div className="rce-fine">
                  <div className="rce-fine-title">Fine-tune (optional)</div>

                  <Fold title="Plans" sub={`${mf.plans.length} plans · prices, validity, what's included`}>
                    {mf.plans.map((p, i) => (
                      <PlanEditor
                        key={p.id}
                        plan={p}
                        index={i}
                        data={mf}
                        onPatch={(patch) => patchPlan(i, patch)}
                        onRemove={() => updateMf({ plans: mf.plans.filter((_, idx) => idx !== i) })}
                        canRemove={mf.plans.length > 1}
                      />
                    ))}
                    {mf.plans.length < MAX_PLANS ? (
                      <button type="button" className="rce-add-row" onClick={addPlan}>
                        ＋ Add a plan
                      </button>
                    ) : null}
                  </Fold>

                  <Fold title="Tabs" sub={mf.categories.map((c) => c.label).join(" · ")}>
                    {mf.categories.map((c, i) => (
                      <div key={c.id} className="rce-inline">
                        <input
                          value={c.label}
                          maxLength={LIMITS.label}
                          aria-label={`Tab ${i + 1}`}
                          onChange={(e) => updateMf({ categories: mf.categories.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)) })}
                        />
                        {mf.categories.length > 1 ? (
                          <button type="button" onClick={() => updateMf({ categories: mf.categories.filter((_, idx) => idx !== i) })} aria-label={`Remove tab ${c.label}`}>
                            ✕
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {mf.categories.length < MAX_CATEGORIES ? (
                      <button
                        type="button"
                        className="rce-add-row"
                        onClick={() => updateMf({ categories: [...mf.categories, { id: `cat-${Date.now().toString(36)}`, label: "New tab" }] })}
                      >
                        ＋ Add a tab
                      </button>
                    ) : null}
                  </Fold>

                  <Fold title="Offer banners" sub="the text on each photo banner">
                    <Field label="Banner text" hint="One per line. Banner 1 sits on photo 1, and so on." count={`${mf.promos.filter(Boolean).length}/${MAX_PROMOS}`}>
                      <textarea rows={4} value={mf.promos.join("\n")} onChange={(e) => updateMf({ promos: lines(e.target.value, LIMITS.promo, MAX_PROMOS) })} />
                    </Field>
                  </Fold>

                  <Fold title="Expiry strip" sub={mf.currentPlan.expiresIn || "the red 'expires in' pill"}>
                    <Field label="Pill">
                      <input value={mf.currentPlan.expiresIn} maxLength={LIMITS.expiry} onChange={(e) => updateMf({ currentPlan: { ...mf.currentPlan, expiresIn: e.target.value } })} />
                    </Field>
                    <Field label="Line under it">
                      <input value={mf.currentPlan.note} maxLength={LIMITS.line} onChange={(e) => updateMf({ currentPlan: { ...mf.currentPlan, note: e.target.value } })} />
                    </Field>
                  </Fold>

                  <Fold title="Scratch card prize" sub={mf.cashback.title || "what they win after paying"}>
                    <Field label="They won…">
                      <input value={mf.cashback.title} maxLength={LIMITS.cashTitle} onChange={(e) => updateMf({ cashback: { ...mf.cashback, title: e.target.value } })} />
                    </Field>
                    <Field label="Small print">
                      <input value={mf.cashback.note} maxLength={LIMITS.cashNote} onChange={(e) => updateMf({ cashback: { ...mf.cashback, note: e.target.value } })} />
                    </Field>
                  </Fold>

                  <Fold title="Password" sub={pagePassword ? "on — they'll need it to open" : "off · anyone with the link can open"}>
                    <Field label="Page password" hint="Leave empty for no password.">
                      <input value={pagePassword} maxLength={128} onChange={(e) => setPagePassword(e.target.value)} placeholder="e.g. our song" autoComplete="off" />
                    </Field>
                  </Fold>
                </div>
              </div>

              <div className="rce-foot">
                {missing.length ? (
                  <p className={tried ? "err" : ""}>
                    {tried ? "Still missing: " : "Needs: "}
                    <b>{missing.join(", ")}</b>
                  </p>
                ) : (
                  <p className="ok">All set ✓ Save to preview the full flow.</p>
                )}
                <button type="button" className="rce-save" onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save & preview"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

const CSS = `
.rce-scrim { position: fixed; inset: 0; z-index: 200; background: rgba(20,8,20,.45); display: flex; align-items: flex-end; justify-content: center; font-family: ${FONT}; }
.rce-panel { width: 100%; max-width: 640px; height: 94dvh; background: ${BG}; border-radius: 24px 24px 0 0; display: flex; flex-direction: column; overflow: hidden; color: ${INK}; box-shadow: 0 -20px 60px -20px rgba(0,0,0,.45); }
@media (min-width: 900px) { .rce-scrim { justify-content: flex-end; align-items: stretch; background: rgba(20,8,20,.18); } .rce-panel { max-width: 520px; height: 100dvh; border-radius: 0; } }
.rce-panel *, .rce-panel *::before { box-sizing: border-box; }
.rce-head { display: flex; justify-content: space-between; gap: 12px; padding: 18px 18px 14px; background: #fff; border-bottom: 1px solid ${LINE}; }
.rce-head h2 { margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; }
.rce-head p { margin: 4px 0 0; font-size: 13px; color: ${MUTED}; line-height: 1.4; }
.rce-x { width: 38px; height: 38px; flex: none; border-radius: 12px; border: 0; background: ${BG}; font-size: 15px; cursor: pointer; color: ${INK}; }
.rce-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 14px 14px 28px; display: grid; gap: 12px; align-content: start; }
.rce-sec { background: #fff; border-radius: 20px; padding: 16px; display: grid; gap: 12px; }
.rce-sec-head { display: flex; gap: 11px; align-items: flex-start; }
.rce-n { width: 26px; height: 26px; flex: none; border-radius: 9px; background: ${PINK}; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 13px; }
.rce-sec-head h3 { margin: 2px 0 0; font-size: 16px; font-weight: 800; letter-spacing: -0.01em; }
.rce-sec-head p { margin: 3px 0 0; font-size: 12.5px; color: ${MUTED}; line-height: 1.45; }
.rce-row2 { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 480px) { .rce-row2 { grid-template-columns: 1fr 1fr; } }
.rce-field { display: grid; gap: 6px; min-width: 0; }
.rce-label { font-size: 12.5px; font-weight: 700; color: #3E3848; display: flex; align-items: baseline; gap: 2px; }
.rce-label em { color: ${PINK_DEEP}; font-style: normal; }
.rce-count { margin-left: auto; font-weight: 600; font-size: 11px; color: ${FAINT}; font-variant-numeric: tabular-nums; }
.rce-field input, .rce-field textarea, .rce-field select, .rce-inline input { width: 100%; min-height: 48px; border-radius: 14px; border: 1.5px solid ${LINE}; background: #FDFCFE; padding: 12px 14px; font: 500 16px/1.45 ${FONT}; color: ${INK}; outline: none; transition: border-color .15s, box-shadow .15s; }
.rce-field textarea { resize: vertical; min-height: 96px; }
.rce-field input:focus, .rce-field textarea:focus, .rce-field select:focus, .rce-inline input:focus { border-color: ${PINK}; box-shadow: 0 0 0 4px #FFE8F1; background: #fff; }
.rce-field.err input { border-color: #E5383B; background: #FFF6F6; }
.rce-hint { font-size: 11.5px; color: ${FAINT}; line-height: 1.4; }
.rce-fine { display: grid; gap: 8px; margin-top: 4px; }
.rce-fine-title { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: ${FAINT}; padding: 4px 4px 0; }
.rce-fold { background: #fff; border-radius: 16px; border: 1.5px solid transparent; }
.rce-fold .rce-fold, .rce-sec .rce-fold { border-color: ${LINE}; }
.rce-fold-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border: 0; background: none; text-align: left; cursor: pointer; color: ${INK}; font-family: inherit; }
.rce-fold-head b { display: block; font-size: 14.5px; font-weight: 700; }
.rce-fold-head small { display: block; font-size: 12px; color: ${MUTED}; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rce-fold-head > span:first-child { min-width: 0; }
.rce-chev { transition: transform .2s; color: ${FAINT}; }
.rce-fold.open > .rce-fold-head .rce-chev { transform: rotate(180deg); }
.rce-fold-body { padding: 0 14px 14px; display: grid; gap: 12px; }
.rce-check { display: flex; gap: 10px; align-items: center; font-size: 13.5px; color: #3E3848; }
.rce-check input { width: 20px; height: 20px; accent-color: ${PINK}; }
.rce-danger { justify-self: start; border: 0; background: none; color: #C0392B; font-weight: 700; font-size: 13px; cursor: pointer; padding: 4px 0; }
.rce-add-row { min-height: 46px; border-radius: 14px; border: 2px dashed #F3A9C7; background: #FFF6FA; color: ${PINK_DEEP}; font-weight: 700; font-size: 14px; cursor: pointer; }
.rce-inline { display: flex; gap: 8px; }
.rce-inline button { width: 48px; flex: none; border-radius: 14px; border: 1.5px solid ${LINE}; background: #fff; cursor: pointer; color: ${MUTED}; }
.rce-foot { background: #fff; border-top: 1px solid ${LINE}; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); display: grid; gap: 8px; }
.rce-foot p { margin: 0; font-size: 12.5px; color: ${MUTED}; text-align: center; }
.rce-foot p.err { color: #C0392B; }
.rce-foot p.ok { color: #0F8646; font-weight: 600; }
.rce-save { min-height: 52px; border-radius: 16px; border: 0; background: linear-gradient(180deg, #FF3F8A, ${PINK_DEEP}); color: #fff; font: 800 16px ${FONT}; cursor: pointer; box-shadow: 0 10px 22px -10px rgba(211,18,95,.7); }
.rce-save:active { transform: scale(.98); }
.rce-save:disabled { opacity: .6; }
`;
