"use client";

import { memo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Sparkles, PenLine, Loader2, Eye, EyeOff,
  Upload, Image as ImageIcon, MapPin, ExternalLink, Camera, Zap, Trash2, Plus,
  Lock, ShieldCheck,
} from "lucide-react";
import type { ShaadiData, EditMode, WeddingEvent } from "./types";

const C_ACCENT = "#546B57";
const C_MED    = "#7A9B7E";
const ROSE_GRADIENT = `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`;
const VIOLET_GRADIENT = "linear-gradient(135deg, #8B5CF6, #7C3AED)";

const GALLERY_SPANS = ["col-span-2 row-span-2", "", "", "col-span-2", "", ""];
const MANUAL_STEPS = ["Names & Photos", "Details", "Events", "Gallery", "Descriptions", "Password"];

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const parseTimeToMinutes = (time: string): number => {
  const cleaned = time.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hourRaw = Number(match[1]);
  const mins = Number(match[2] || "0");
  const ampm = match[3];
  let hour = hourRaw % 12;
  if (ampm === "PM") hour += 12;
  return hour * 60 + mins;
};

const parseDateAndTimeToEpoch = (date: string, time: string): number => {
  const trimmedDate = date.trim();
  if (!trimmedDate) return Number.MAX_SAFE_INTEGER;
  const parts = trimmedDate.split(/\s+/);
  if (parts.length < 2) return Number.MAX_SAFE_INTEGER;
  const day = Number(parts[0]);
  const monthIdx = MONTH_MAP[parts[1].toLowerCase()];
  if (!Number.isFinite(day) || monthIdx === undefined) return Number.MAX_SAFE_INTEGER;
  const year = new Date().getFullYear();
  const d = new Date(year, monthIdx, day);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(parseTimeToMinutes(time));
  return d.getTime();
};

const sortWeddingEvents = (events: ShaadiData["events"]) =>
  [...events].sort((a, b) => {
    if (Boolean(a.disabled) !== Boolean(b.disabled)) return a.disabled ? 1 : -1;
    const aEpoch = parseDateAndTimeToEpoch(a.date, a.time);
    const bEpoch = parseDateAndTimeToEpoch(b.date, b.time);
    if (aEpoch === bEpoch) return a.name.localeCompare(b.name);
    return aEpoch - bEpoch;
  });

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  aiName: string; setAiName: (v: string) => void;
  aiSender: string; setAiSender: (v: string) => void;
  aiPrompt: string; setAiPrompt: (v: string) => void;
  aiLoading: boolean;
  extractLoading: boolean;
  mf: ShaadiData;
  manualStep: number; setManualStep: (v: number) => void;
  updateMf: (key: keyof ShaadiData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onStartAi: () => void;
  onStartManual: () => void;
  onCardExtract: (files: File[]) => void;
  onAiGenerate: () => void;
  onAiEditPreview: () => void;
  onManualPreview: () => void;
}

export default memo(function EditSheet({
  editMode, setEditMode,
  aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading,
  extractLoading, mf, manualStep, setManualStep, updateMf,
  pagePassword, setPagePassword,
  onStartAi, onStartManual, onCardExtract, onAiGenerate, onAiEditPreview, onManualPreview,
}: Props) {
  const visible = editMode !== null && editMode !== "preview" && editMode !== "password";

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditMode(null)}
            className="fixed inset-0 z-[60] bg-black/50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div className="w-full max-w-2xl max-h-[78vh] lg:max-h-[90vh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto">
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              {editMode === "choose" && <ChoosePanel setEditMode={setEditMode} onStartAi={onStartAi} onStartManual={onStartManual} />}
              {editMode === "ai" && <AiChoosePanel setEditMode={setEditMode} />}
              {editMode === "ai-card" && (
                <AiCardPanel
                  setEditMode={setEditMode}
                  extractLoading={extractLoading}
                  onExtract={onCardExtract}
                />
              )}
              {editMode === "ai-text" && (
                <AiTextPanel
                  setEditMode={setEditMode}
                  aiName={aiName} setAiName={setAiName}
                  aiSender={aiSender} setAiSender={setAiSender}
                  aiPrompt={aiPrompt} setAiPrompt={setAiPrompt}
                  aiLoading={aiLoading} onGenerate={onAiGenerate}
                  mf={mf} updateMf={updateMf}
                />
              )}
              {editMode === "ai-edit" && (
                <AiEditPanel
                  setEditMode={setEditMode}
                  mf={mf} updateMf={updateMf}
                  onPreview={onAiEditPreview}
                />
              )}
              {editMode === "manual" && (
                <ManualPanel
                  setEditMode={setEditMode}
                  mf={mf} manualStep={manualStep} setManualStep={setManualStep}
                  updateMf={updateMf} onPreview={onManualPreview}
                  pagePassword={pagePassword} setPagePassword={setPagePassword}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ── Choose mode ────────────────────────────────────────────────────────────────
function ChoosePanel({ setEditMode, onStartAi, onStartManual }: {
  setEditMode: (m: EditMode) => void; onStartAi: () => void; onStartManual: () => void;
}) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Customize Your Invitation</h3>
        <button onClick={() => setEditMode(null)} className="p-1 text-muted-foreground"><X size={20} /></button>
      </div>
      <div className="space-y-3">
        <button
          onClick={onStartAi}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
          style={{ background: `${C_ACCENT}08`, border: `1px solid ${C_ACCENT}25` }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: ROSE_GRADIENT }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Generate with AI</p>
            <p className="text-xs text-muted-foreground mt-0.5">Upload your invitation image or describe your wedding</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
        <button
          onClick={onStartManual}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
          style={{ background: `${C_MED}10`, border: `1px solid ${C_MED}30` }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${C_MED}, #E8829A)` }}>
            <PenLine size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Fill Manually</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add photos, events, gallery images yourself</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
      </div>
    </div>
  );
}

// ── AI: choose card vs text ────────────────────────────────────────────────────
function AiChoosePanel({ setEditMode }: { setEditMode: (m: EditMode) => void }) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles size={16} style={{ color: C_ACCENT }} /> AI Options
        </h3>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => setEditMode("ai-card")}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: VIOLET_GRADIENT }}>
            <Upload size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Upload invitation card</p>
            <p className="text-xs text-muted-foreground mt-0.5">AI reads your invitation card & fills all fields automatically</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
        <button
          onClick={() => setEditMode("ai-text")}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
          style={{ background: `${C_ACCENT}08`, border: `1px solid ${C_ACCENT}25` }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: ROSE_GRADIENT }}>
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Describe Your Wedding</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tell AI about the couple & it generates the invitation</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
      </div>
    </div>
  );
}

// ── AI: upload invitation card ────────────────────────────────────────────────
function AiCardPanel({ setEditMode, extractLoading, onExtract }: {
  setEditMode: (m: EditMode) => void;
  extractLoading: boolean;
  onExtract: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = useCallback((selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected).slice(0, 3);
    setFiles(arr);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }, []);

  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setEditMode("ai")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Upload size={16} style={{ color: "#8B5CF6" }} /> Upload invitation
        </h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Upload your wedding invitation card(s). AI will automatically read and extract bride name, groom name, venue, dates, family names, and events.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-border/60 hover:border-rose-400/60 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors mb-4"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: VIOLET_GRADIENT }}>
          <ImageIcon size={22} className="text-white" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">Drop invitation images here</p>
          <p className="text-xs text-muted-foreground mt-0.5">or tap to browse · Up to 3 images</p>
        </div>
        <input
          ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {previews.map((src, i) => (
            <div key={i} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onExtract(files)}
        disabled={extractLoading || files.length === 0}
        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
        style={{ background: VIOLET_GRADIENT }}
      >
        {extractLoading
          ? <><Loader2 size={16} className="animate-spin" /> Reading card…</>
          : <><Sparkles size={16} /> Extract &amp; Auto-Fill ✨</>
        }
      </button>
      <p className="text-center text-[10px] text-muted-foreground mt-2">
        ✨ Powered by AI Vision · Works with most wedding invitations
      </p>
    </div>
  );
}

// ── AI: text description ───────────────────────────────────────────────────────
function AiTextPanel({ setEditMode, aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading, onGenerate, mf, updateMf }: {
  setEditMode: (m: EditMode) => void;
  aiName: string; setAiName: (v: string) => void;
  aiSender: string; setAiSender: (v: string) => void;
  aiPrompt: string; setAiPrompt: (v: string) => void;
  aiLoading: boolean; onGenerate: () => void;
  mf: ShaadiData; updateMf: (k: keyof ShaadiData, v: unknown) => void;
}) {
  const brideRef = useRef<HTMLInputElement>(null);
  const groomRef = useRef<HTMLInputElement>(null);
  const [brideAdj, setBrideAdj] = useState<PhotoAdjust>({ posX: 50, posY: 30, zoom: 100 });
  const [groomAdj, setGroomAdj] = useState<PhotoAdjust>({ posX: 50, posY: 30, zoom: 100 });
  const [photoModal, setPhotoModal] = useState<PhotoModalState>(null);

  const handleFile = useCallback((role: "bride" | "groom", file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert("Image too large. Please use under 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const adj = role === "bride" ? brideAdj : groomAdj;
      setPhotoModal({ role, src, adjust: adj });
    };
    reader.readAsDataURL(file);
  }, [brideAdj, groomAdj]);

  const handleModalConfirm = useCallback((adj: PhotoAdjust) => {
    if (!photoModal) return;
    if (photoModal.role === "bride") {
      updateMf("bride", { ...mf.bride, photo: photoModal.src });
      setBrideAdj(adj);
    } else {
      updateMf("groom", { ...mf.groom, photo: photoModal.src });
      setGroomAdj(adj);
    }
    setPhotoModal(null);
  }, [photoModal, mf.bride, mf.groom, updateMf]);

  const openEditModal = (role: "bride" | "groom") => {
    const photo = role === "bride" ? mf.bride.photo : mf.groom.photo;
    if (!photo) return;
    const adj = role === "bride" ? brideAdj : groomAdj;
    setPhotoModal({ role, src: photo, adjust: adj });
  };

  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setEditMode("ai")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Zap size={16} style={{ color: C_ACCENT }} /> Describe Wedding
        </h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bride Name *">
            <input value={aiName} onChange={(e) => setAiName(e.target.value)} placeholder="e.g. Ananya" className={INPUT_CLS} />
          </Field>
          <Field label="Groom Name *">
            <input value={aiSender} onChange={(e) => setAiSender(e.target.value)} placeholder="e.g. Arjun" className={INPUT_CLS} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PhotoSlot label="Bride Photo (optional)" photo={mf.bride.photo} adjust={brideAdj}
            onTapEmpty={() => brideRef.current?.click()} onTapEdit={() => openEditModal("bride")} />
          <PhotoSlot label="Groom Photo (optional)" photo={mf.groom.photo} adjust={groomAdj}
            onTapEmpty={() => groomRef.current?.click()} onTapEdit={() => openEditModal("groom")} />
        </div>

        <input ref={brideRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile("bride", e.target.files[0]); e.target.value = ""; }} />
        <input ref={groomRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile("groom", e.target.files[0]); e.target.value = ""; }} />

        <Field label="Describe your wedding *">
          <textarea
            value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. A royal Rajasthani wedding in Udaipur with traditional ceremonies, family values, and elegant floral decor..."
            rows={4} className={INPUT_CLS + " resize-none"}
          />
        </Field>
        <button
          onClick={onGenerate}
          disabled={aiLoading || (!aiName.trim() && !aiSender.trim()) || !aiPrompt.trim()}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          style={{ background: ROSE_GRADIENT }}
        >
          {aiLoading
            ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
            : <><Sparkles size={16} /> Generate Invitation ✨</>
          }
        </button>
      </div>

      <AnimatePresence>
        {photoModal && (
          <PhotoAdjustModal src={photoModal.src} initial={photoModal.adjust}
            onConfirm={handleModalConfirm} onCancel={() => setPhotoModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── AI-Edit: review & edit extracted/generated data ────────────────────────────
function AiEditPanel({ setEditMode, mf, updateMf, onPreview }: {
  setEditMode: (m: EditMode) => void;
  mf: ShaadiData; updateMf: (k: keyof ShaadiData, v: unknown) => void;
  onPreview: () => void;
}) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setEditMode("ai")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye size={16} style={{ color: C_ACCENT }} /> Review &amp; Edit
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">AI has filled these details. Review and edit before previewing.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bride Name *">
            <input value={mf.brideName} onChange={(e) => updateMf("brideName", e.target.value)} placeholder="Bride" className={INPUT_CLS} />
          </Field>
          <Field label="Groom Name *">
            <input value={mf.groomName} onChange={(e) => updateMf("groomName", e.target.value)} placeholder="Groom" className={INPUT_CLS} />
          </Field>
        </div>

        <Field label="Wedding Date & Time">
          <input type="datetime-local" value={mf.weddingDate.slice(0, 16)} onChange={(e) => updateMf("weddingDate", e.target.value + ":00+05:30")} className={INPUT_CLS} />
        </Field>

        <Field label="Venue / City">
          <div className="relative">
            <input value={mf.venue} onChange={(e) => updateMf("venue", e.target.value)} placeholder="e.g. Udaipur" className={INPUT_CLS + " pr-10"} />
            {mf.venue.trim() && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mf.venue)}`}
                target="_blank" rel="noopener noreferrer"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: C_ACCENT }}
                title="View on Google Maps"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin size={9} /> Click the icon to preview on Google Maps
          </p>
        </Field>

        <Field label="Sanskrit / Hindi Blessing">
          <input value={mf.blessing} onChange={(e) => updateMf("blessing", e.target.value)} placeholder="ॐ शुभ विवाह" className={INPUT_CLS} />
        </Field>

        <Field label="Bride's Description">
          <textarea value={mf.bride.description} onChange={(e) => updateMf("bride", { ...mf.bride, description: e.target.value })} rows={2} placeholder="About the bride..." className={INPUT_CLS + " resize-none"} />
        </Field>

        <Field label="Groom's Description">
          <textarea value={mf.groom.description} onChange={(e) => updateMf("groom", { ...mf.groom, description: e.target.value })} rows={2} placeholder="About the groom..." className={INPUT_CLS + " resize-none"} />
        </Field>

        <Field label="Bride's Parents">
          <input value={mf.brideFamily.parents} onChange={(e) => updateMf("brideFamily", { ...mf.brideFamily, parents: e.target.value })} placeholder="e.g. Shri Ram & Smt. Sita" className={INPUT_CLS} />
        </Field>

        <Field label="Groom's Parents">
          <input value={mf.groomFamily.parents} onChange={(e) => updateMf("groomFamily", { ...mf.groomFamily, parents: e.target.value })} placeholder="e.g. Shri Mohan & Smt. Meena" className={INPUT_CLS} />
        </Field>

        <button
          onClick={onPreview}
          disabled={!mf.brideName.trim() && !mf.groomName.trim()}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: ROSE_GRADIENT }}
        >
          <Eye size={16} /> Preview Invitation
        </button>
      </div>
    </div>
  );
}

// ── Manual: 6-step form ────────────────────────────────────────────────────────
function ManualPanel({ setEditMode, mf, manualStep, setManualStep, updateMf, onPreview, pagePassword, setPagePassword }: {
  setEditMode: (m: EditMode) => void;
  mf: ShaadiData; manualStep: number; setManualStep: (v: number) => void;
  updateMf: (k: keyof ShaadiData, v: unknown) => void;
  onPreview: () => void;
  pagePassword: string; setPagePassword: (v: string) => void;
}) {
  const canAdvance = manualStep === 0 ? !!(mf.brideName.trim() || mf.groomName.trim()) : true;
  const isPasswordStep = manualStep === 5;

  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <PenLine size={16} style={{ color: C_ACCENT }} /> Manual Edit
        </h3>
      </div>

      <div className="flex gap-1 mb-5">
        {MANUAL_STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => !isPasswordStep && setManualStep(i)}
            className={`flex-1 h-1 rounded-full transition-all`}
            style={{ background: i <= manualStep ? C_ACCENT : "var(--border)" }}
          />
        ))}
      </div>

      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Step {manualStep + 1} of {MANUAL_STEPS.length} — {MANUAL_STEPS[manualStep]}
      </p>

      <AnimatePresence mode="wait">
        {manualStep === 0 && <NamesPhotosStep key="s0" mf={mf} updateMf={updateMf} />}
        {manualStep === 1 && <DetailsStep key="s1" mf={mf} updateMf={updateMf} />}
        {manualStep === 2 && <EventsStep key="s2" mf={mf} updateMf={updateMf} />}
        {manualStep === 3 && <GalleryStep key="s3" mf={mf} updateMf={updateMf} />}
        {manualStep === 4 && <DescriptionsStep key="s4" mf={mf} updateMf={updateMf} />}
        {manualStep === 5 && <ManualPasswordStep key="s5" password={pagePassword} setPassword={setPagePassword} />}
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        {manualStep > 0 && (
          <button onClick={() => setManualStep(manualStep - 1)} className="w-11 h-11 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground">
            <ChevronLeft size={18} />
          </button>
        )}
        {isPasswordStep ? (
          <>
            <button
              onClick={() => { setPagePassword(""); onPreview(); }}
              className="flex-1 py-3 rounded-xl border border-border/60 text-sm font-semibold text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={onPreview}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-1.5"
              style={{ background: ROSE_GRADIENT }}
            >
              <Eye size={14} /> Set &amp; Preview
            </button>
          </>
        ) : manualStep < MANUAL_STEPS.length - 1 ? (
          <button
            onClick={() => setManualStep(manualStep + 1)}
            disabled={!canAdvance}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: ROSE_GRADIENT }}
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ── Step 0: Names + Photos ─────────────────────────────────────────────────────
type PhotoAdjust = { posX: number; posY: number; zoom: number };
type PhotoModalState = { role: "bride" | "groom"; src: string; adjust: PhotoAdjust } | null;

function NamesPhotosStep({ mf, updateMf }: { mf: ShaadiData; updateMf: (k: keyof ShaadiData, v: unknown) => void }) {
  const brideRef = useRef<HTMLInputElement>(null);
  const groomRef = useRef<HTMLInputElement>(null);
  const [brideAdj, setBrideAdj] = useState<PhotoAdjust>({ posX: 50, posY: 30, zoom: 100 });
  const [groomAdj, setGroomAdj] = useState<PhotoAdjust>({ posX: 50, posY: 30, zoom: 100 });
  const [modal, setModal] = useState<PhotoModalState>(null);

  const handleFile = useCallback((role: "bride" | "groom", file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert("Image too large. Please use under 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const adj = role === "bride" ? brideAdj : groomAdj;
      setModal({ role, src, adjust: adj });
    };
    reader.readAsDataURL(file);
  }, [brideAdj, groomAdj]);

  const handleModalConfirm = useCallback((adj: PhotoAdjust) => {
    if (!modal) return;
    if (modal.role === "bride") {
      updateMf("bride", { ...mf.bride, photo: modal.src });
      setBrideAdj(adj);
    } else {
      updateMf("groom", { ...mf.groom, photo: modal.src });
      setGroomAdj(adj);
    }
    setModal(null);
  }, [modal, mf.bride, mf.groom, updateMf]);

  const openEditModal = (role: "bride" | "groom") => {
    const photo = role === "bride" ? mf.bride.photo : mf.groom.photo;
    if (!photo) return;
    const adj = role === "bride" ? brideAdj : groomAdj;
    setModal({ role, src: photo, adjust: adj });
  };

  return (
    <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Bride Name *">
          <input value={mf.brideName} onChange={(e) => updateMf("brideName", e.target.value)} placeholder="e.g. Ananya" className={INPUT_CLS} />
        </Field>
        <Field label="Groom Name *">
          <input value={mf.groomName} onChange={(e) => updateMf("groomName", e.target.value)} placeholder="e.g. Arjun" className={INPUT_CLS} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PhotoSlot label="Bride Photo" photo={mf.bride.photo} adjust={brideAdj}
          onTapEmpty={() => brideRef.current?.click()} onTapEdit={() => openEditModal("bride")} />
        <PhotoSlot label="Groom Photo" photo={mf.groom.photo} adjust={groomAdj}
          onTapEmpty={() => groomRef.current?.click()} onTapEdit={() => openEditModal("groom")} />
      </div>

      <input ref={brideRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile("bride", e.target.files[0]); e.target.value = ""; }} />
      <input ref={groomRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile("groom", e.target.files[0]); e.target.value = ""; }} />

      <AnimatePresence>
        {modal && (
          <PhotoAdjustModal src={modal.src} initial={modal.adjust}
            onConfirm={handleModalConfirm} onCancel={() => setModal(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhotoSlot({ label, photo, adjust, onTapEmpty, onTapEdit }: {
  label: string; photo: string; adjust: PhotoAdjust;
  onTapEmpty: () => void; onTapEdit: () => void;
}) {
  const imgStyle: React.CSSProperties = photo ? {
    width: "100%", height: "100%", objectFit: "cover",
    objectPosition: `${adjust.posX}% ${adjust.posY}%`,
    transform: `scale(${adjust.zoom / 100})`,
    transformOrigin: `${adjust.posX}% ${adjust.posY}%`,
  } : {};

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">{label}</label>
      <div
        onClick={() => (photo ? onTapEdit() : onTapEmpty())}
        className={`w-full rounded-xl border-2 overflow-hidden cursor-pointer transition-colors flex flex-col items-center justify-center relative ${photo ? "" : "border-dashed border-border/60 hover:border-emerald-400/60"}`}
        style={{ aspectRatio: "1 / 1", ...(photo ? { borderColor: `${C_ACCENT}40`, borderStyle: "solid" } : {}) }}
      >
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" style={imgStyle} draggable={false} />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
              <Camera size={20} className="text-white opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Camera size={20} />
            <span className="text-[10px]">Upload photo</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoAdjustModal({ src, initial, onConfirm, onCancel }: {
  src: string; initial: PhotoAdjust;
  onConfirm: (adj: PhotoAdjust) => void; onCancel: () => void;
}) {
  const [posX, setPosX] = useState(initial.posX);
  const [posY, setPosY] = useState(initial.posY);
  const [zoom, setZoom] = useState(initial.zoom);

  const previewStyle: React.CSSProperties = {
    width: "100%", height: "100%", objectFit: "cover",
    objectPosition: `${posX}% ${posY}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${posX}% ${posY}%`,
    transition: "transform 0.12s ease, object-position 0.12s ease",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs bg-background rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="relative w-full overflow-hidden bg-black/10" style={{ aspectRatio: "1/1" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" style={previewStyle} draggable={false} />
        </div>

        <div className="px-4 pt-3 pb-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C_ACCENT }}>Adjust Photo</p>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] shrink-0 font-medium whitespace-nowrap" style={{ color: C_ACCENT, width: 40 }}>Horiz</span>
              <input type="range" min={0} max={100} value={posX} onChange={(e) => setPosX(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: C_ACCENT }} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] shrink-0 font-medium whitespace-nowrap" style={{ color: C_ACCENT, width: 40 }}>Vert</span>
              <input type="range" min={0} max={100} value={posY} onChange={(e) => setPosY(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: C_ACCENT }} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] shrink-0 font-medium whitespace-nowrap" style={{ color: C_ACCENT, width: 40 }}>Zoom</span>
              <input type="range" min={100} max={200} value={zoom} onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: C_ACCENT }} />
              <span className="text-[10px] w-9 text-right shrink-0 tabular-nums font-medium" style={{ color: C_MED }}>{zoom}%</span>
            </div>
          </div>

          {(posX !== 50 || posY !== 30 || zoom !== 100) && (
            <button type="button" onClick={() => { setPosX(50); setPosY(30); setZoom(100); }}
              className="text-[10px] underline" style={{ color: C_MED }}>Reset</button>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border/50 text-sm font-semibold text-muted-foreground hover:bg-muted/30 transition-colors">
              Cancel
            </button>
            <button onClick={() => onConfirm({ posX, posY, zoom })}
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-1.5"
              style={{ background: ROSE_GRADIENT }}>
              ✓ Done
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Step 1: Details ────────────────────────────────────────────────────────────
function DetailsStep({ mf, updateMf }: { mf: ShaadiData; updateMf: (k: keyof ShaadiData, v: unknown) => void }) {
  return (
    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <Field label="Wedding Date & Time">
        <input type="datetime-local" value={mf.weddingDate.slice(0, 16)} onChange={(e) => updateMf("weddingDate", e.target.value + ":00+05:30")} className={INPUT_CLS} />
      </Field>
      <Field label="Main Venue / City">
        <div className="relative">
          <input value={mf.venue} onChange={(e) => updateMf("venue", e.target.value)} placeholder="e.g. Fateh Sagar Palace, Udaipur" className={INPUT_CLS + " pr-10"} />
          {mf.venue.trim() && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mf.venue)}`}
              target="_blank" rel="noopener noreferrer"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: C_ACCENT }}
              title="View on Google Maps"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
        {mf.venue.trim() && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mf.venue)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-[10px] mt-1 flex items-center gap-1 hover:underline"
            style={{ color: C_ACCENT }}
          >
            <MapPin size={9} /> View &ldquo;{mf.venue}&rdquo; on Google Maps
          </a>
        )}
      </Field>
      <Field label="Sanskrit / Hindi Blessing">
        <input value={mf.blessing} onChange={(e) => updateMf("blessing", e.target.value)} placeholder="e.g. ॐ शुभ विवाह" className={INPUT_CLS} />
      </Field>
      <Field label="Bride's Family (Parents)">
        <input value={mf.brideFamily.parents} onChange={(e) => updateMf("brideFamily", { ...mf.brideFamily, parents: e.target.value })} placeholder="e.g. Shri Deepak & Smt. Kavita Mehta" className={INPUT_CLS} />
      </Field>
      <Field label="Groom's Family (Parents)">
        <input value={mf.groomFamily.parents} onChange={(e) => updateMf("groomFamily", { ...mf.groomFamily, parents: e.target.value })} placeholder="e.g. Shri Anil & Smt. Ritu Kapoor" className={INPUT_CLS} />
      </Field>
    </motion.div>
  );
}

// ── Step 2: Events ─────────────────────────────────────────────────────────────
function EventsStep({ mf, updateMf }: { mf: ShaadiData; updateMf: (k: keyof ShaadiData, v: unknown) => void }) {
  const sortedEvents = [...mf.events]
    .map((event, originalIndex) => ({ ...event, originalIndex }))
    .sort((a, b) => {
      if (Boolean(a.disabled) !== Boolean(b.disabled)) return a.disabled ? 1 : -1;
      const aEpoch = parseDateAndTimeToEpoch(a.date, a.time);
      const bEpoch = parseDateAndTimeToEpoch(b.date, b.time);
      if (aEpoch === bEpoch) return a.name.localeCompare(b.name);
      return aEpoch - bEpoch;
    });

  const activeEvents = sortedEvents.filter((ev) => !ev.disabled);
  const disabledEvents = sortedEvents.filter((ev) => ev.disabled);

  const updateEvent = (idx: number, field: keyof WeddingEvent, value: string) => {
    const updated = mf.events.map((ev, i) => (i === idx ? { ...ev, [field]: value } : ev));
    updateMf("events", sortWeddingEvents(updated));
  };

  const setEventDisabled = (idx: number, disabled: boolean) => {
    const updated = mf.events.map((ev, i) => (i === idx ? { ...ev, disabled } : ev));
    updateMf("events", sortWeddingEvents(updated));
  };

  return (
    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <p className="text-xs text-muted-foreground">Fill in details for each wedding event. Leave fields empty to use defaults.</p>
      {activeEvents.map((ev) => (
        <div key={`${ev.name}-${ev.originalIndex}`} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{ev.icon}</span>
            <p className="text-sm font-semibold">{ev.name} <span className="text-muted-foreground font-normal">({ev.hindi})</span></p>
            <button
              type="button"
              onClick={() => setEventDisabled(ev.originalIndex, true)}
              className="ml-auto w-7 h-7 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/40 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={ev.date} onChange={(e) => updateEvent(ev.originalIndex, "date", e.target.value)} placeholder="Date (e.g. 13 Apr)" className={INPUT_CLS_SM} />
            <input value={ev.time} onChange={(e) => updateEvent(ev.originalIndex, "time", e.target.value)} placeholder="Time (e.g. 6 PM)" className={INPUT_CLS_SM} />
          </div>
          <div className="relative">
            <input value={ev.venue} onChange={(e) => updateEvent(ev.originalIndex, "venue", e.target.value)} placeholder="Venue name" className={INPUT_CLS_SM + " pr-8"} />
            {ev.venue.trim() && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue + " " + mf.venue)}`}
                target="_blank" rel="noopener noreferrer"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: C_ACCENT }}
              >
                <ExternalLink size={11} />
              </a>
            )}
          </div>
          <textarea
            value={ev.details || ""}
            onChange={(e) => updateEvent(ev.originalIndex, "details", e.target.value)}
            placeholder="Longer description for guests (shown when they tap the event on the invite)"
            rows={3}
            className={INPUT_CLS_SM + " resize-none"}
          />
        </div>
      ))}

      {disabledEvents.length > 0 && (
        <div className="pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Removed Events</p>
          <div className="space-y-2">
            {disabledEvents.map((ev) => (
              <div key={`${ev.name}-${ev.originalIndex}-disabled`}
                className="rounded-xl border border-border/40 bg-muted/10 px-3 py-2.5 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{ev.icon} {ev.name}</p>
                <button
                  type="button"
                  onClick={() => setEventDisabled(ev.originalIndex, false)}
                  className="w-7 h-7 rounded-lg border flex items-center justify-center"
                  style={{ borderColor: `${C_ACCENT}40`, color: C_ACCENT }}
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Step 3: Gallery ────────────────────────────────────────────────────────────
type AdjustData = { posX: number; posY: number; zoom: number };
type ModalState = { idx: number; src: string; adjust: AdjustData } | null;

function GalleryStep({ mf, updateMf }: { mf: ShaadiData; updateMf: (k: keyof ShaadiData, v: unknown) => void }) {
  const slots = Array.from({ length: 6 });
  const galleryImages = mf.galleryImages;
  const [adjustMap, setAdjustMap] = useState<Record<number, AdjustData>>({});
  const [modal, setModal] = useState<ModalState>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<number>(0);

  const openUploadForSlot = (idx: number) => {
    pendingSlotRef.current = idx;
    fileInputRef.current?.click();
  };

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert("Image too large. Please use under 8 MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const idx = pendingSlotRef.current;
      const existing = adjustMap[idx];
      setModal({ idx, src, adjust: existing ?? { posX: 50, posY: 50, zoom: 100 } });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [adjustMap]);

  const openEditModal = (idx: number) => {
    const img = galleryImages[idx];
    if (!img) return;
    const existing = adjustMap[idx] ?? { posX: 50, posY: 50, zoom: 100 };
    setModal({ idx, src: img.src, adjust: existing });
  };

  const handleModalConfirm = useCallback((adj: AdjustData) => {
    if (!modal) return;
    const updated = [...galleryImages];
    updated[modal.idx] = { src: modal.src, alt: `Photo ${modal.idx + 1}`, span: GALLERY_SPANS[modal.idx] };
    updateMf("galleryImages", updated);
    setAdjustMap((prev) => ({ ...prev, [modal.idx]: adj }));
    setModal(null);
  }, [modal, galleryImages, updateMf]);

  const removeImage = (idx: number) => {
    const updated = [...galleryImages];
    updated.splice(idx, 1);
    updateMf("galleryImages", updated);
    setAdjustMap((prev) => { const n = { ...prev }; delete n[idx]; return n; });
  };

  return (
    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
      <p className="text-xs text-muted-foreground">Upload up to 6 gallery photos. First photo will be featured large.</p>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />

      <div className="grid grid-cols-3 gap-2">
        {slots.map((_, i) => {
          const img = galleryImages[i];
          const adj = adjustMap[i];
          return (
            <GallerySlot
              key={i} index={i} image={img} adjust={adj}
              onTapEmpty={() => openUploadForSlot(i)}
              onTapEdit={() => openEditModal(i)}
              onRemove={() => removeImage(i)}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {modal && (
          <GalleryAdjustModal
            src={modal.src}
            initial={modal.adjust}
            onConfirm={handleModalConfirm}
            onCancel={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GallerySlot({ index, image, adjust, onTapEmpty, onTapEdit, onRemove }: {
  index: number;
  image?: { src: string; alt: string; span?: string };
  adjust?: AdjustData;
  onTapEmpty: () => void;
  onTapEdit: () => void;
  onRemove: () => void;
}) {
  const posX = adjust?.posX ?? 50;
  const posY = adjust?.posY ?? 50;
  const zoom = adjust?.zoom ?? 100;

  const imgStyle: React.CSSProperties = {
    width: "100%", height: "100%", objectFit: "cover" as const,
    objectPosition: `${posX}% ${posY}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${posX}% ${posY}%`,
  };

  return (
    <div
      onClick={() => (image ? onTapEdit() : onTapEmpty())}
      className={`relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${image ? "" : "border-dashed border-border/50 hover:border-emerald-400/50"}`}
      style={image ? { borderColor: `${C_ACCENT}40`, borderWidth: 2, borderStyle: "solid" } : undefined}
    >
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt="" style={imgStyle} draggable={false} />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px] hover:bg-red-500 transition-colors"
          >×</button>
          <button
            onClick={(e) => { e.stopPropagation(); onTapEdit(); }}
            className="absolute bottom-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] transition-colors"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
            title="Adjust photo"
          >✎</button>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
          <ImageIcon size={16} />
          <span className="text-[9px]">Photo {index + 1}</span>
        </div>
      )}
    </div>
  );
}

function GalleryAdjustModal({ src, initial, onConfirm, onCancel }: {
  src: string; initial: AdjustData;
  onConfirm: (adj: AdjustData) => void;
  onCancel: () => void;
}) {
  const [posX, setPosX] = useState(initial.posX);
  const [posY, setPosY] = useState(initial.posY);
  const [zoom, setZoom] = useState(initial.zoom);

  const previewStyle: React.CSSProperties = {
    width: "100%", height: "100%", objectFit: "cover",
    objectPosition: `${posX}% ${posY}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${posX}% ${posY}%`,
    transition: "transform 0.12s ease, object-position 0.12s ease",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs bg-background rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Image preview */}
        <div className="relative w-full overflow-hidden bg-black/10" style={{ aspectRatio: "1/1" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" style={previewStyle} draggable={false} />
        </div>

        {/* Controls */}
        <div className="px-4 pt-3 pb-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C_ACCENT }}>Adjust Photo</p>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] shrink-0 font-medium whitespace-nowrap" style={{ color: C_ACCENT, width: 40 }}>Horiz</span>
              <input type="range" min={0} max={100} value={posX} onChange={(e) => setPosX(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: C_ACCENT }} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] shrink-0 font-medium whitespace-nowrap" style={{ color: C_ACCENT, width: 40 }}>Vert</span>
              <input type="range" min={0} max={100} value={posY} onChange={(e) => setPosY(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: C_ACCENT }} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] shrink-0 font-medium whitespace-nowrap" style={{ color: C_ACCENT, width: 40 }}>Zoom</span>
              <input type="range" min={100} max={200} value={zoom} onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: C_ACCENT }} />
              <span className="text-[10px] w-9 text-right shrink-0 tabular-nums font-medium" style={{ color: C_MED }}>{zoom}%</span>
            </div>
          </div>

          {(posX !== 50 || posY !== 50 || zoom !== 100) && (
            <button type="button" onClick={() => { setPosX(50); setPosY(50); setZoom(100); }}
              className="text-[10px] underline" style={{ color: C_MED }}>Reset</button>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border/50 text-sm font-semibold text-muted-foreground hover:bg-muted/30 transition-colors">
              Cancel
            </button>
            <button onClick={() => onConfirm({ posX, posY, zoom })}
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-1.5"
              style={{ background: ROSE_GRADIENT }}>
              ✓ Done
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Step 4: Descriptions ───────────────────────────────────────────────────────
function DescriptionsStep({ mf, updateMf }: { mf: ShaadiData; updateMf: (k: keyof ShaadiData, v: unknown) => void }) {
  return (
    <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <Field label="Bride's Description">
        <textarea value={mf.bride.description} onChange={(e) => updateMf("bride", { ...mf.bride, description: e.target.value })} rows={3} placeholder="About the bride..." className={INPUT_CLS + " resize-none"} />
      </Field>
      <Field label="Groom's Description">
        <textarea value={mf.groom.description} onChange={(e) => updateMf("groom", { ...mf.groom, description: e.target.value })} rows={3} placeholder="About the groom..." className={INPUT_CLS + " resize-none"} />
      </Field>
      <Field label="Bride's Parents">
        <input value={mf.brideFamily.parents} onChange={(e) => updateMf("brideFamily", { ...mf.brideFamily, parents: e.target.value })} placeholder="e.g. Shri Deepak & Smt. Kavita Mehta" className={INPUT_CLS} />
      </Field>
      <Field label="Bride's Grandparents">
        <input value={mf.brideFamily.grandparents} onChange={(e) => updateMf("brideFamily", { ...mf.brideFamily, grandparents: e.target.value })} placeholder="Optional" className={INPUT_CLS} />
      </Field>
      <Field label="Groom's Parents">
        <input value={mf.groomFamily.parents} onChange={(e) => updateMf("groomFamily", { ...mf.groomFamily, parents: e.target.value })} placeholder="e.g. Shri Anil & Smt. Ritu Kapoor" className={INPUT_CLS} />
      </Field>
      <Field label="Groom's Grandparents">
        <input value={mf.groomFamily.grandparents} onChange={(e) => updateMf("groomFamily", { ...mf.groomFamily, grandparents: e.target.value })} placeholder="Optional" className={INPUT_CLS} />
      </Field>
    </motion.div>
  );
}

// ── Step 5: Password ───────────────────────────────────────────────────────────
function ManualPasswordStep({ password, setPassword }: { password: string; setPassword: (v: string) => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: `${C_ACCENT}06`, borderColor: `${C_ACCENT}20` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C_ACCENT}15` }}>
          <ShieldCheck size={18} style={{ color: C_ACCENT }} />
        </div>
        <div>
          <p className="text-sm font-bold">Protect Your Invitation</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add a password so only invited guests can view it. This is optional.</p>
        </div>
      </div>
      <div className="bg-muted/20 rounded-2xl p-4 border border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={13} className="text-muted-foreground" />
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password (optional)</label>
        </div>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password for guests..."
            className="w-full px-4 py-3 pr-10 rounded-xl bg-background border border-border/50 focus:outline-none text-sm transition-all"
            style={{ borderColor: "var(--border)" }}
          />
          <button type="button" onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {password && (
          <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: C_ACCENT }}>
            <Lock size={10} /> Remember to share this password with your guests
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLS = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm transition-all";
const INPUT_CLS_SM = "w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none text-sm";
