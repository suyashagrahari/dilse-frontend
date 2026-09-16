"use client";

import { useRef, useState, useCallback } from "react";
import {
  type BirthdayData,
  type EditMode,
  type HomeCoverPhoto,
  type PhotoItem,
  type QuizQuestion,
  type TruthDareItem,
  EMPTY_HOME_COVER,
} from "./types";
import { readAudioFileOrToast } from "@/lib/media/readAudioFile";

const BROWN = "#5D3F31";
const BROWN_MID = "rgba(93,63,49,0.55)";
const TERRACOTTA = "#AD684A";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const PAPER = "rgba(245,237,224,0.98)";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1.5px solid rgba(93,63,49,0.30)",
  background: "rgba(255,252,246,0.9)",
  fontFamily: "inherit", fontSize: 14, color: "rgb(50,30,15)",
  outline: "none", boxSizing: "border-box",
};

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE, resize: "vertical" as const, minHeight: 90, lineHeight: 1.6,
};

const STEP_LABELS = ["Names", "Messages", "Photos", "Gallery", "Music", "Quiz", "Truth & Dare", "Surprise", "Share", "Save"];

const DEFAULT_QUIZ: QuizQuestion[] = [
  { question: "What is the birthday person's favourite colour?", options: ["Pink", "Blue", "Green", "Purple"], correct: 0 },
  { question: "What would the birthday person pick as a birthday dessert?", options: ["Chocolate cake", "Ice cream", "Cheesecake", "Cupcakes"], correct: 0 },
  { question: "What superpower would the birthday person choose?", options: ["Flying", "Teleportation", "Mind reading", "Time travel"], correct: 3 },
];

const TRUTH_LIBRARY = [
  "What's your favourite memory of the birthday person?",
  "What quality do you admire most about them?",
  "What's the funniest thing they've ever done?",
  "What gift would you give them if money was no object?",
  "What's one birthday wish you'd make for them?",
  "What's something they've taught you?",
  "Describe them in three birthday-themed words!",
  "What's your favourite inside joke with them?",
  "If you wrote them a birthday card right now, what would it say?",
  "What's one adventure you'd love to go on with them?",
  "What birthday tradition do you love sharing with them?",
  "What makes them the best person to celebrate birthdays with?",
  "What is the most embarrassing thing that happened to you this year?",
  "What is your biggest dream for this coming year?",
  "Who is the last person you texted today?",
];

const DARE_LIBRARY = [
  "Sing Happy Birthday in the most dramatic way possible!",
  "Do your best impression of the birthday person right now!",
  "Send them a voice note saying why they're amazing!",
  "List 5 reasons they deserve the best birthday!",
  "Do a birthday dance move for 10 seconds!",
  "Make a birthday toast out loud — be heartfelt!",
  "Call or text them a birthday surprise message right now!",
  "Take the most festive selfie you can and show everyone!",
  "Plan their perfect birthday day in 60 seconds!",
  "Dedicate a birthday song to them — sing the chorus!",
  "Write a birthday limerick about them on the spot!",
  "Give them your best birthday wish using only emojis!",
];

async function compressToBase64(file: File, maxDim = 900): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── PhotoAdjustModal ──────────────────────────────────────────────────────────

type PhotoAdjust = { posX: number; posY: number; zoom: number };

function PhotoAdjustModal({
  src, adjust, onConfirm, onCancel, title,
}: {
  src: string;
  adjust: PhotoAdjust;
  onConfirm: (a: PhotoAdjust) => void;
  onCancel: () => void;
  title?: string;
}) {
  const [posX, setPosX] = useState(adjust.posX);
  const [posY, setPosY] = useState(adjust.posY);
  const [zoom, setZoom] = useState(adjust.zoom);

  const isDefault = posX === 50 && posY === 50 && zoom === 100;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(20,10,5,0.70)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 380, background: PAPER,
        borderRadius: 20, padding: "24px 20px", boxShadow: "0 20px 60px rgba(40,20,10,0.35)",
      }}>
        <h3 style={{ fontFamily: CURSIVE, fontSize: 18, fontWeight: 700, color: BROWN, margin: "0 0 16px", textAlign: "center" }}>
          {title || "Adjust Photo"}
        </h3>

        {/* Preview */}
        <div style={{
          width: "100%", paddingTop: "100%", position: "relative",
          borderRadius: 14, overflow: "hidden", marginBottom: 18,
          border: "1.5px solid rgba(93,63,49,0.20)",
          background: "rgba(93,63,49,0.06)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src} alt="preview"
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover",
              objectPosition: `${posX}% ${posY}%`,
              transform: `scale(${zoom / 100})`,
              transition: "transform 0.15s, object-position 0.15s",
            }}
          />
        </div>

        {/* Sliders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Horizontal", value: posX, set: setPosX, min: 0, max: 100 },
            { label: "Vertical", value: posY, set: setPosY, min: 0, max: 100 },
            { label: "Zoom", value: zoom, set: setZoom, min: 100, max: 200 },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: CURSIVE, fontSize: 12, color: BROWN }}>{s.label}</span>
                <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(93,63,49,0.50)" }}>{s.value}</span>
              </div>
              <input
                type="range" min={s.min} max={s.max} value={s.value}
                onChange={(e) => s.set(Number(e.target.value))}
                style={{ width: "100%", accentColor: TERRACOTTA }}
              />
            </div>
          ))}
        </div>

        {!isDefault && (
          <button
            onClick={() => { setPosX(50); setPosY(50); setZoom(100); }}
            style={{
              fontFamily: CURSIVE, fontSize: 12, color: TERRACOTTA,
              background: "none", border: "none", cursor: "pointer",
              display: "block", margin: "8px auto 0",
            }}
          >
            Reset to default
          </button>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px 0", borderRadius: 50,
            border: `1.5px solid ${BROWN_MID}`, background: "transparent",
            fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.75)", cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => onConfirm({ posX, posY, zoom })} style={{
            flex: 1, padding: "11px 0", borderRadius: 50, border: "none",
            background: "linear-gradient(135deg, #AD684A 0%, #5D3F31 100%)",
            fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(93,63,49,0.30)",
          }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ── PhotoSlot ─────────────────────────────────────────────────────────────────

function PhotoSlot({
  src, adjust, label, height = 100,
  onTapEmpty, onTapEdit, onRemove,
}: {
  src: string;
  adjust?: PhotoAdjust;
  label: string;
  height?: number;
  onTapEmpty: () => void;
  onTapEdit: () => void;
  onRemove: () => void;
}) {
  const a = adjust || { posX: 50, posY: 50, zoom: 100 };
  return (
    <div>
      <div
        onClick={src ? onTapEdit : onTapEmpty}
        style={{
          width: "100%", height: src ? height : 80,
          border: "1.5px dashed rgba(93,63,49,0.35)",
          borderRadius: 12, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", background: "rgba(93,63,49,0.04)",
          position: "relative",
          transition: "height 0.2s",
        }}
      >
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src} alt={label}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                objectPosition: `${a.posX}% ${a.posY}%`,
                transform: `scale(${a.zoom / 100})`,
              }}
            />
            <div style={{
              position: "absolute", bottom: 6, right: 6,
              background: "rgba(0,0,0,0.50)", backdropFilter: "blur(4px)",
              borderRadius: 6, padding: "3px 8px",
              fontFamily: CURSIVE, fontSize: 10, color: "#fff",
            }}>✎ Adjust</div>
          </>
        ) : (
          <span style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.55)" }}>
            📸 {label}
          </span>
        )}
      </div>
      {src && (
        <button onClick={onRemove} style={{
          fontFamily: CURSIVE, fontSize: 12, color: "#c0392b",
          background: "transparent", border: "none", cursor: "pointer", marginTop: 4,
        }}>Remove</button>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  aiName: string; setAiName: (s: string) => void;
  aiSender: string; setAiSender: (s: string) => void;
  aiPrompt: string; setAiPrompt: (s: string) => void;
  aiLoading: boolean;
  mf: BirthdayData;
  manualStep: number;
  setManualStep: (n: number) => void;
  updateMf: (k: keyof BirthdayData, v: unknown) => void;
  onStartAi: () => void;
  onStartManual: () => void;
  onAiGenerate: () => void;
  onSaveWithPassword: (data: BirthdayData, pw: string) => void;
  saving: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditSheet({
  editMode, setEditMode,
  aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading,
  mf, manualStep, setManualStep, updateMf,
  onStartAi, onStartManual, onAiGenerate, onSaveWithPassword, saving,
}: Props) {
  const homeCoverRef = useRef<HTMLInputElement | null>(null);
  const homePhoto1Ref = useRef<HTMLInputElement | null>(null);
  const homePhoto2Ref = useRef<HTMLInputElement | null>(null);
  const galleryFileRef = useRef<HTMLInputElement | null>(null);
  const sharePhotoRef = useRef<HTMLInputElement | null>(null);

  const [pw, setPw] = useState("");
  const [quizEditIdx, setQuizEditIdx] = useState<number | null>(null);

  // Photo adjust modal state
  type PhotoModalRole = "cover" | "photo1" | "photo2";
  const [photoModal, setPhotoModal] = useState<{ role: PhotoModalRole; src: string; adjust: PhotoAdjust } | null>(null);
  const [photoAdjusts, setPhotoAdjusts] = useState<Record<PhotoModalRole, PhotoAdjust>>({
    cover: { posX: 50, posY: 50, zoom: 100 },
    photo1: { posX: 50, posY: 50, zoom: 100 },
    photo2: { posX: 50, posY: 50, zoom: 100 },
  });

  // Gallery adjust modal state
  const [galleryModal, setGalleryModal] = useState<{ idx: number; src: string; adjust: PhotoAdjust } | null>(null);
  const [galleryAdjusts, setGalleryAdjusts] = useState<Record<number, PhotoAdjust>>({});
  const pendingGallerySlotRef = useRef<number>(0);

  // Truth/Dare editing state
  const [tdTab, setTdTab] = useState<"truth" | "dare">("truth");
  const [customTdText, setCustomTdText] = useState("");

  // ── All hooks must be before any early return ───────────────────────────────

  const hc: HomeCoverPhoto = mf.homeCoverPhoto ?? EMPTY_HOME_COVER;

  const handlePhotoFile = useCallback(async (file: File, role: "cover" | "photo1" | "photo2") => {
    const b64 = await compressToBase64(file);
    const defaultAdj: PhotoAdjust = { posX: 50, posY: role === "cover" ? 30 : 50, zoom: 100 };
    setPhotoModal({ role, src: b64, adjust: defaultAdj });
  }, []);

  const handlePhotoModalConfirm = useCallback((adj: PhotoAdjust) => {
    if (!photoModal) return;
    const { role, src } = photoModal;
    setPhotoAdjusts((prev) => ({ ...prev, [role]: adj }));
    if (role === "cover") {
      updateMf("homeCoverPhoto", { url: src, cropX: adj.posX, cropY: adj.posY, scale: adj.zoom });
    } else if (role === "photo1") {
      updateMf("homePhoto1", src);
    } else {
      updateMf("homePhoto2", src);
    }
    setPhotoModal(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoModal]);

  const openPhotoEditModal = useCallback((role: "cover" | "photo1" | "photo2") => {
    const src = role === "cover" ? hc.url : role === "photo1" ? mf.homePhoto1 : mf.homePhoto2;
    if (!src) return;
    const adj = role === "cover"
      ? { posX: hc.cropX, posY: hc.cropY, zoom: hc.scale }
      : photoAdjusts[role];
    setPhotoModal({ role, src, adjust: adj });
  }, [hc, mf.homePhoto1, mf.homePhoto2, photoAdjusts]);

  const galleryPhotos: PhotoItem[] = mf.galleryPhotos || [];

  const handleGalleryFile = useCallback(async (file: File, slotIdx: number) => {
    const b64 = await compressToBase64(file);
    setGalleryModal({ idx: slotIdx, src: b64, adjust: { posX: 50, posY: 50, zoom: 100 } });
  }, []);

  const handleGalleryModalConfirm = useCallback((adj: PhotoAdjust) => {
    if (!galleryModal) return;
    const { idx, src } = galleryModal;
    setGalleryAdjusts((prev) => ({ ...prev, [idx]: adj }));
    const updated = [...galleryPhotos];
    if (idx < updated.length) {
      updated[idx] = { ...updated[idx], url: src, cropX: adj.posX, cropY: adj.posY };
    } else {
      updated.push({ url: src, caption: "", cropX: adj.posX, cropY: adj.posY });
    }
    updateMf("galleryPhotos", updated);
    setGalleryModal(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryModal, galleryPhotos]);

  if (!editMode || editMode === "preview" || editMode === "password") return null;

  const isReview = editMode === "ai-review";
  const isManualOrReview = editMode === "manual" || isReview;

  // ── Layout helpers ──────────────────────────────────────────────────────────

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(30,15,5,0.55)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  };
  const sheet: React.CSSProperties = {
    width: "100%", maxWidth: 520, background: PAPER,
    borderRadius: "20px 20px 0 0", padding: "28px 24px 40px",
    maxHeight: "90svh", overflowY: "auto",
    boxShadow: "0 -20px 60px rgba(60,30,10,0.25)",
  };

  const hdr = (title: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h2 style={{ fontFamily: CURSIVE, fontSize: 22, fontWeight: 700, color: BROWN, margin: 0 }}>{title}</h2>
      <button onClick={() => setEditMode(null)} style={{
        border: "none", background: "transparent", cursor: "pointer",
        fontFamily: CURSIVE, fontSize: 20, color: "rgba(93,63,49,0.65)", lineHeight: 1,
      }}>✕</button>
    </div>
  );

  const primaryBtn = (label: string, onClick: () => void, disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, padding: "12px 0", borderRadius: 50, border: "none",
      background: disabled ? "rgba(93,63,49,0.25)" : "linear-gradient(135deg, #AD684A 0%, #5D3F31 100%)",
      fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: "#fff",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 4px 16px rgba(93,63,49,0.30)",
      letterSpacing: "0.03em",
    }}>{label}</button>
  );

  const ghostBtn = (label: string, onClick: () => void) => (
    <button onClick={onClick} style={{
      flex: 1, padding: "12px 0", borderRadius: 50,
      border: `1.5px solid ${BROWN_MID}`, background: "transparent",
      fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.75)", cursor: "pointer",
    }}>{label}</button>
  );

  const lbl = (text: string) => (
    <label style={{ fontFamily: CURSIVE, fontSize: 14, color: BROWN, display: "block", marginBottom: 6 }}>{text}</label>
  );

  const progressBar = (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        {STEP_LABELS.map((l, i) => (
          <span key={i} style={{
            fontFamily: CURSIVE, fontSize: 9, letterSpacing: "0.05em",
            color: i <= manualStep ? BROWN : "rgba(93,63,49,0.50)",
            fontWeight: i === manualStep ? 700 : 400,
            opacity: i <= manualStep ? 1 : 0.45,
          }}>{l}</span>
        ))}
      </div>
      <div style={{ height: 3, background: "rgba(93,63,49,0.12)", borderRadius: 2 }}>
        <div style={{
          height: "100%", borderRadius: 2,
          width: `${((manualStep + 1) / STEP_LABELS.length) * 100}%`,
          background: "linear-gradient(90deg, rgba(173,104,74,0.6), #5D3F31)",
          transition: "width 0.3s ease",
        }} />
      </div>
    </div>
  );

  // ── Photo upload helpers ────────────────────────────────────────────────────
  // (handlePhotoFile, handlePhotoModalConfirm, openPhotoEditModal, handleGalleryFile,
  //  handleGalleryModalConfirm are declared before the early return above)

  // ── Share photo helper ──────────────────────────────────────────────────────

  const handleSharePhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateMf("sharePhoto", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // ── Gallery helpers ─────────────────────────────────────────────────────────

  const updateGalleryCaption = (idx: number, caption: string) => {
    const updated = galleryPhotos.map((p, i) => i === idx ? { ...p, caption } : p);
    updateMf("galleryPhotos", updated);
  };

  const removeGalleryPhoto = (idx: number) => {
    updateMf("galleryPhotos", galleryPhotos.filter((_, i) => i !== idx));
    setGalleryAdjusts((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const openGalleryEditModal = (idx: number) => {
    const p = galleryPhotos[idx];
    if (!p) return;
    const adj = galleryAdjusts[idx] || { posX: p.cropX, posY: p.cropY, zoom: 100 };
    setGalleryModal({ idx, src: p.url, adjust: adj });
  };

  // ── Music helpers ───────────────────────────────────────────────────────────

  const musicTracks = mf.musicTracks || [];

  const addTrack = () => {
    if (musicTracks.length >= 5) return;
    updateMf("musicTracks", [...musicTracks, { title: "", artist: "", src: "" }]);
  };

  const updateTrack = (idx: number, key: "title" | "artist", val: string) => {
    const updated = musicTracks.map((t, i) => i === idx ? { ...t, [key]: val } : t);
    updateMf("musicTracks", updated);
  };

  const removeTrack = (idx: number) => {
    updateMf("musicTracks", musicTracks.filter((_, i) => i !== idx));
  };

  // ── Quiz helpers ────────────────────────────────────────────────────────────

  const quizQuestions: QuizQuestion[] = mf.quizQuestions?.length ? mf.quizQuestions : DEFAULT_QUIZ;

  const updateQuestion = (idx: number, question: string) => {
    const updated = [...quizQuestions];
    updated[idx] = { ...updated[idx], question };
    updateMf("quizQuestions", updated);
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...quizQuestions];
    const opts = [...(updated[qIdx].options || ["", "", "", ""])];
    opts[oIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    updateMf("quizQuestions", updated);
  };

  const setCorrect = (qIdx: number, oIdx: number) => {
    const updated = [...quizQuestions];
    updated[qIdx] = { ...updated[qIdx], correct: oIdx };
    updateMf("quizQuestions", updated);
  };

  const addQuestion = () => {
    if (quizQuestions.length >= 10) return;
    const newQ: QuizQuestion = { question: "", options: ["", "", "", ""], correct: 0 };
    const updated = [...quizQuestions, newQ];
    updateMf("quizQuestions", updated);
    setQuizEditIdx(updated.length - 1);
  };

  const removeQuestion = (idx: number) => {
    updateMf("quizQuestions", quizQuestions.filter((_, i) => i !== idx));
    if (quizEditIdx === idx) setQuizEditIdx(null);
  };

  // ── Truth/Dare helpers ──────────────────────────────────────────────────────

  const tdQuestions: TruthDareItem[] = mf.truthDareQuestions || [];

  const addTdFromLibrary = (type: "truth" | "dare", text: string) => {
    if (tdQuestions.some((q) => q.text === text)) return;
    updateMf("truthDareQuestions", [...tdQuestions, { type, text }]);
  };

  const removeTd = (idx: number) => {
    updateMf("truthDareQuestions", tdQuestions.filter((_, i) => i !== idx));
  };

  const addCustomTd = () => {
    const text = customTdText.trim();
    if (!text) return;
    updateMf("truthDareQuestions", [...tdQuestions, { type: tdTab, text }]);
    setCustomTdText("");
  };

  // ── CHOOSE MODE ───────────────────────────────────────────────────────────

  if (editMode === "choose") {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Create your birthday page 🎂")}
          <p style={{ fontFamily: CURSIVE, fontSize: 15, color: "rgba(93,63,49,0.75)", marginBottom: 20, lineHeight: 1.6 }}>
            Make something beautiful for their special day.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "✨", label: "AI Magic", sub: "Describe the birthday person — AI writes the wishes, messages & quiz", action: onStartAi },
              { icon: "✏️", label: "Write Manually", sub: "Step-by-step form — your words, your photos, your story", action: onStartManual },
            ].map((opt) => (
              <button key={opt.label} onClick={opt.action} style={{
                padding: "16px 20px", borderRadius: 14,
                border: "1.5px solid rgba(93,63,49,0.28)",
                background: "rgba(93,63,49,0.05)", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ fontFamily: CURSIVE, fontSize: 17, fontWeight: 700, color: BROWN, marginBottom: 4 }}>
                  {opt.icon} {opt.label}
                </div>
                <div style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.70)", lineHeight: 1.5 }}>
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── AI INPUT MODE ─────────────────────────────────────────────────────────

  if (editMode === "ai") {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("✨ AI Magic")}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.70)", marginBottom: 16, lineHeight: 1.6 }}>
            AI will write a heartfelt birthday wish, personal message & quiz questions.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              {lbl("Their name *")}
              <input value={aiName} onChange={(e) => setAiName(e.target.value)}
                placeholder="e.g. Priya, Sarah, Maya..." style={INPUT_STYLE} />
            </div>
            <div>
              {lbl("Your name")}
              <input value={aiSender} onChange={(e) => setAiSender(e.target.value)}
                placeholder="e.g. Arjun, James..." style={INPUT_STYLE} />
            </div>
            <div>
              {lbl("Tell us about them & what makes this birthday special *")}
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. She loves sunsets, turning 25, best friend for 10 years, obsessed with travel..."
                style={{ ...TEXTAREA_STYLE, minHeight: 110 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {ghostBtn("← Back", () => setEditMode("choose"))}
              {primaryBtn(aiLoading ? "Writing... ✨" : "Generate ✨", onAiGenerate, aiLoading || !aiName.trim() || !aiPrompt.trim())}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MANUAL / AI-REVIEW STEPS ──────────────────────────────────────────────

  if (isManualOrReview) {

    // ── Step 0: Names + Birthday Date ──────────────────────────────────────
    if (manualStep === 0) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr(isReview ? "Review & Edit 🎂" : "Birthday Details")}
          {progressBar}
          {isReview && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 16,
              background: "rgba(173,104,74,0.08)", border: "1px solid rgba(93,63,49,0.22)",
              fontFamily: CURSIVE, fontSize: 13, color: BROWN, lineHeight: 1.5,
            }}>
              ✨ AI has written your messages! Review each step, then save.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              {lbl("Their name *")}
              <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)}
                placeholder="Birthday person's name..." style={INPUT_STYLE} />
            </div>
            <div>
              {lbl("Your name")}
              <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)}
                placeholder="Your name..." style={INPUT_STYLE} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {ghostBtn("← Back", () => setEditMode(isReview ? "ai" : "choose"))}
              {primaryBtn("Next →", () => setManualStep(1), !mf.recipientName.trim())}
            </div>
          </div>
        </div>
      </div>
    );

    // ── Step 1: Messages ───────────────────────────────────────────────────
    if (manualStep === 1) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Birthday Messages")}
          {progressBar}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              {lbl("Birthday wish")}
              <textarea value={mf.birthdayWish}
                onChange={(e) => updateMf("birthdayWish", e.target.value)}
                placeholder="Write a heartfelt birthday wish..."
                style={TEXTAREA_STYLE} />
            </div>
            <div>
              {lbl("Personal message")}
              <textarea value={mf.personalMessage}
                onChange={(e) => updateMf("personalMessage", e.target.value)}
                placeholder="Share a personal note or memory..."
                style={{ ...TEXTAREA_STYLE, minHeight: 110 }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {ghostBtn("← Back", () => setManualStep(0))}
              {primaryBtn("Next →", () => setManualStep(2))}
            </div>
          </div>
        </div>
      </div>
    );

    // ── Step 2: Photos (with crop modal) ──────────────────────────────────
    if (manualStep === 2) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Home Photos")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.65)", marginBottom: 14, lineHeight: 1.5 }}>
            Upload photos and adjust their alignment with the crop tool.
          </p>

          {/* Hidden file inputs */}
          <input ref={homeCoverRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handlePhotoFile(f, "cover"); e.target.value = ""; }} />
          <input ref={homePhoto1Ref} type="file" accept="image/*" style={{ display: "none" }}
            onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handlePhotoFile(f, "photo1"); e.target.value = ""; }} />
          <input ref={homePhoto2Ref} type="file" accept="image/*" style={{ display: "none" }}
            onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handlePhotoFile(f, "photo2"); e.target.value = ""; }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              {lbl("Main cover photo")}
              <PhotoSlot
                src={hc.url}
                adjust={{ posX: hc.cropX, posY: hc.cropY, zoom: hc.scale }}
                label="Upload cover photo"
                height={140}
                onTapEmpty={() => homeCoverRef.current?.click()}
                onTapEdit={() => openPhotoEditModal("cover")}
                onRemove={() => updateMf("homeCoverPhoto", { ...EMPTY_HOME_COVER })}
              />
            </div>
            <div>
              {lbl("Top-right photo")}
              <PhotoSlot
                src={mf.homePhoto1}
                adjust={photoAdjusts.photo1}
                label="Upload top-right photo"
                onTapEmpty={() => homePhoto1Ref.current?.click()}
                onTapEdit={() => openPhotoEditModal("photo1")}
                onRemove={() => updateMf("homePhoto1", "")}
              />
            </div>
            <div>
              {lbl("Bottom-left photo")}
              <PhotoSlot
                src={mf.homePhoto2}
                adjust={photoAdjusts.photo2}
                label="Upload bottom-left photo"
                onTapEmpty={() => homePhoto2Ref.current?.click()}
                onTapEdit={() => openPhotoEditModal("photo2")}
                onRemove={() => updateMf("homePhoto2", "")}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {ghostBtn("← Back", () => setManualStep(1))}
              {primaryBtn("Next →", () => setManualStep(3))}
            </div>
          </div>
        </div>

        {/* Photo adjust modal */}
        {photoModal && (
          <PhotoAdjustModal
            src={photoModal.src}
            adjust={photoModal.adjust}
            title={photoModal.role === "cover" ? "Adjust Cover Photo" : photoModal.role === "photo1" ? "Adjust Top-Right Photo" : "Adjust Bottom-Left Photo"}
            onConfirm={handlePhotoModalConfirm}
            onCancel={() => setPhotoModal(null)}
          />
        )}
      </div>
    );

    // ── Step 3: Gallery (with crop modal) ─────────────────────────────────
    if (manualStep === 3) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Gallery Photos")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.65)", marginBottom: 14, lineHeight: 1.5 }}>
            Add up to 8 photos. Tap any photo to adjust its alignment.
          </p>

          <input ref={galleryFileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await handleGalleryFile(f, pendingGallerySlotRef.current);
              e.target.value = "";
            }} />

          {/* Gallery grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {Array.from({ length: Math.min(galleryPhotos.length + 1, 8) }).map((_, idx) => {
              const photo = galleryPhotos[idx];
              const adj = galleryAdjusts[idx] || (photo ? { posX: photo.cropX, posY: photo.cropY, zoom: 100 } : undefined);
              return (
                <div key={idx} style={{ position: "relative" }}>
                  <div
                    onClick={() => {
                      if (photo) {
                        openGalleryEditModal(idx);
                      } else {
                        pendingGallerySlotRef.current = idx;
                        galleryFileRef.current?.click();
                      }
                    }}
                    style={{
                      width: "100%", paddingTop: "100%", position: "relative",
                      borderRadius: 10, overflow: "hidden", cursor: "pointer",
                      border: photo ? "1px solid rgba(93,63,49,0.20)" : "1.5px dashed rgba(93,63,49,0.30)",
                      background: "rgba(93,63,49,0.04)",
                    }}
                  >
                    {photo ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.url} alt="" style={{
                          position: "absolute", inset: 0, width: "100%", height: "100%",
                          objectFit: "cover",
                          objectPosition: adj ? `${adj.posX}% ${adj.posY}%` : `${photo.cropX}% ${photo.cropY}%`,
                          transform: adj ? `scale(${adj.zoom / 100})` : undefined,
                        }} />
                        <div style={{
                          position: "absolute", bottom: 3, right: 3,
                          background: "rgba(0,0,0,0.50)", borderRadius: 4,
                          padding: "1px 5px", fontSize: 9, color: "#fff",
                        }}>✎</div>
                      </>
                    ) : (
                      <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontFamily: CURSIVE, fontSize: 20, color: "rgba(93,63,49,0.35)",
                      }}>+</div>
                    )}
                  </div>
                  {photo && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeGalleryPhoto(idx); }}
                      style={{
                        position: "absolute", top: -4, right: -4,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "rgba(180,50,40,0.85)", border: "none",
                        cursor: "pointer", color: "#fff", fontSize: 11,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 5,
                      }}
                    >×</button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Captions */}
          {galleryPhotos.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {galleryPhotos.map((p, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(93,63,49,0.15)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <input
                    value={p.caption}
                    onChange={(e) => updateGalleryCaption(idx, e.target.value)}
                    placeholder={`Caption for photo ${idx + 1}...`}
                    style={{ ...INPUT_STYLE, fontSize: 12, flex: 1 }}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {ghostBtn("← Back", () => setManualStep(2))}
            {primaryBtn("Next →", () => setManualStep(4))}
          </div>
        </div>

        {/* Gallery adjust modal */}
        {galleryModal && (
          <PhotoAdjustModal
            src={galleryModal.src}
            adjust={galleryModal.adjust}
            title={`Adjust Photo ${galleryModal.idx + 1}`}
            onConfirm={handleGalleryModalConfirm}
            onCancel={() => setGalleryModal(null)}
          />
        )}
      </div>
    );

    // ── Step 4: Music Tracks ──────────────────────────────────────────────
    if (manualStep === 4) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Songs 🎵")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.65)", marginBottom: 16, lineHeight: 1.5 }}>
            Your birthday playlist — songs added to the Songs tab will appear here.
          </p>

          {musicTracks.length === 0 ? (
            <div style={{
              padding: "28px 16px", borderRadius: 12, textAlign: "center",
              border: "1.5px dashed rgba(93,63,49,0.25)", background: "rgba(93,63,49,0.03)",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎵</div>
              <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.50)", margin: 0 }}>
                No songs added yet. You can add songs from the Songs tab after publishing.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {musicTracks.map((track, idx) => (
                <div key={idx} style={{
                  padding: "10px 14px", borderRadius: 10,
                  border: "1px solid rgba(93,63,49,0.18)", background: "rgba(93,63,49,0.04)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(173,104,74,0.20), rgba(93,63,49,0.12))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>🎵</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: CURSIVE, fontSize: 14, color: BROWN, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {track.title || "Untitled"}
                    </p>
                    {track.artist && (
                      <p style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(93,63,49,0.55)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {track.artist}
                      </p>
                    )}
                  </div>
                  <span style={{ fontFamily: CURSIVE, fontSize: 10, color: "rgba(93,63,49,0.38)", flexShrink: 0 }}>
                    {idx + 1}/{musicTracks.length}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {ghostBtn("← Back", () => setManualStep(3))}
            {primaryBtn("Next →", () => setManualStep(5))}
          </div>
        </div>
      </div>
    );

    // ── Step 5: Quiz Questions ────────────────────────────────────────────
    if (manualStep === 5) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Quiz Questions 🧁")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.65)", marginBottom: 14, lineHeight: 1.5 }}>
            Customise quiz questions about the birthday person (up to 10).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} style={{
                borderRadius: 10, border: "1px solid rgba(93,63,49,0.20)",
                background: "rgba(93,63,49,0.04)", overflow: "hidden",
              }}>
                <div style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onClick={() => setQuizEditIdx(quizEditIdx === qIdx ? null : qIdx)}>
                  <span style={{ fontFamily: CURSIVE, fontSize: 13, color: BROWN, flex: 1, marginRight: 8 }}>
                    {q.question || `Question ${qIdx + 1}`}
                  </span>
                  <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(93,63,49,0.55)" }}>
                    {quizEditIdx === qIdx ? "▲" : "▼"}
                  </span>
                </div>
                {quizEditIdx === qIdx && (
                  <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <input value={q.question} onChange={(e) => updateQuestion(qIdx, e.target.value)}
                      placeholder="Enter question..." style={{ ...INPUT_STYLE, fontSize: 13 }} />
                    {(q.options || ["", "", "", ""]).map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="radio" name={`correct-${qIdx}`}
                          checked={q.correct === oIdx} onChange={() => setCorrect(qIdx, oIdx)}
                          style={{ accentColor: BROWN, flexShrink: 0 }} />
                        <span style={{ fontFamily: CURSIVE, fontSize: 12, color: TERRACOTTA, fontWeight: 600, width: 16, flexShrink: 0 }}>
                          {["A", "B", "C", "D"][oIdx]}
                        </span>
                        <input value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${["A", "B", "C", "D"][oIdx]}...`}
                          style={{ ...INPUT_STYLE, fontSize: 12, flex: 1 }} />
                      </div>
                    ))}
                    <p style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(93,63,49,0.55)", margin: 0 }}>
                      Select radio = correct answer
                    </p>
                    <button onClick={() => removeQuestion(qIdx)} style={{
                      fontFamily: CURSIVE, fontSize: 12, color: "#c0392b",
                      background: "transparent", border: "none", cursor: "pointer", alignSelf: "flex-start",
                    }}>Remove question</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {quizQuestions.length < 10 && (
            <button onClick={addQuestion} style={{
              width: "100%", padding: "10px 0", borderRadius: 10, marginBottom: 16,
              border: "1.5px dashed rgba(93,63,49,0.35)", background: "rgba(93,63,49,0.04)",
              fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.65)", cursor: "pointer",
            }}>
              + Add Question ({quizQuestions.length}/10)
            </button>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            {ghostBtn("← Back", () => setManualStep(4))}
            {primaryBtn("Next →", () => setManualStep(6))}
          </div>
        </div>
      </div>
    );

    // ── Step 6: Truth & Dare ──────────────────────────────────────────────
    if (manualStep === 6) {
      const selectedTruths = tdQuestions.filter((q) => q.type === "truth");
      const selectedDares = tdQuestions.filter((q) => q.type === "dare");
      const currentList = tdTab === "truth" ? selectedTruths : selectedDares;
      const library = tdTab === "truth" ? TRUTH_LIBRARY : DARE_LIBRARY;

      return (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
          <div style={sheet}>
            {hdr("Truth & Dare 🎲")}
            {progressBar}
            <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.65)", marginBottom: 14, lineHeight: 1.5 }}>
              Pick from the library or add your own custom questions.
            </p>

            {/* Truth / Dare toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {(["truth", "dare"] as const).map((t) => (
                <button key={t} onClick={() => setTdTab(t)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10,
                  border: tdTab === t ? `1.5px solid rgba(93,63,49,0.45)` : `1px solid rgba(93,63,49,0.20)`,
                  background: tdTab === t ? "rgba(93,63,49,0.12)" : "rgba(93,63,49,0.04)",
                  fontFamily: CURSIVE, fontSize: 14, fontWeight: 700,
                  color: tdTab === t ? BROWN : "rgba(93,63,49,0.50)", cursor: "pointer",
                }}>
                  {t === "truth" ? "💭 Truth" : "🎲 Dare"} ({t === "truth" ? selectedTruths.length : selectedDares.length})
                </button>
              ))}
            </div>

            {/* Selected items */}
            {currentList.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontFamily: CURSIVE, fontSize: 12, color: BROWN, fontWeight: 600, display: "block", marginBottom: 6 }}>
                  Selected ({currentList.length})
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {currentList.map((item, i) => {
                    const globalIdx = tdQuestions.indexOf(item);
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 10px", borderRadius: 8,
                        background: "rgba(93,63,49,0.06)", border: "1px solid rgba(93,63,49,0.15)",
                      }}>
                        <span style={{ fontFamily: CURSIVE, fontSize: 12, color: BROWN, flex: 1, lineHeight: 1.4 }}>
                          {item.text}
                        </span>
                        <button onClick={() => removeTd(globalIdx)} style={{
                          flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                          background: "rgba(180,50,40,0.12)", border: "none",
                          cursor: "pointer", color: "#c0392b", fontSize: 12,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>×</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom input */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <input
                value={customTdText}
                onChange={(e) => setCustomTdText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomTd()}
                placeholder={`Add custom ${tdTab}...`}
                style={{ ...INPUT_STYLE, fontSize: 13, flex: 1 }}
              />
              <button onClick={addCustomTd} disabled={!customTdText.trim()} style={{
                padding: "0 16px", borderRadius: 8, border: "none",
                background: customTdText.trim() ? `linear-gradient(135deg, ${TERRACOTTA}, ${BROWN})` : "rgba(93,63,49,0.15)",
                fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "#fff",
                cursor: customTdText.trim() ? "pointer" : "not-allowed",
              }}>Add</button>
            </div>

            {/* Library */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(93,63,49,0.55)", display: "block", marginBottom: 6 }}>
                📚 Library — tap to add
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
                {library.map((text, i) => {
                  const isAdded = tdQuestions.some((q) => q.text === text);
                  return (
                    <button key={i} disabled={isAdded}
                      onClick={() => addTdFromLibrary(tdTab, text)}
                      style={{
                        padding: "8px 10px", borderRadius: 8, textAlign: "left",
                        border: "1px solid rgba(93,63,49,0.12)",
                        background: isAdded ? "rgba(93,63,49,0.08)" : "rgba(255,252,246,0.8)",
                        fontFamily: CURSIVE, fontSize: 12,
                        color: isAdded ? "rgba(93,63,49,0.40)" : "rgba(93,63,49,0.75)",
                        cursor: isAdded ? "default" : "pointer",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isAdded ? "rgba(80,140,60,0.15)" : "rgba(173,104,74,0.10)",
                        fontSize: 11, color: isAdded ? "rgb(80,140,60)" : TERRACOTTA,
                      }}>
                        {isAdded ? "✓" : "+"}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.4 }}>{text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {ghostBtn("← Back", () => setManualStep(5))}
              {primaryBtn("Next →", () => setManualStep(7))}
            </div>
          </div>
        </div>
      );
    }

    // ── Step 7: Surprise Content ──────────────────────────────────────────
    if (manualStep === 7) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Surprise Card 🎁")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.65)", marginBottom: 14, lineHeight: 1.5 }}>
            Add a special photo and voice note. The viewer will scratch to reveal your surprise!
          </p>

          <div style={{
            padding: "10px 12px", borderRadius: 10, marginBottom: 16,
            background: "rgba(173,104,74,0.06)", border: "1px solid rgba(173,104,74,0.18)",
            fontFamily: CURSIVE, fontSize: 12, color: "rgba(93,63,49,0.60)", lineHeight: 1.5,
          }}>
            💡 If you add a photo or audio here, a "Surprise" tab will appear when you share the page. If left empty, the tab won&apos;t show.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontFamily: CURSIVE, fontSize: 14, color: BROWN, display: "block", marginBottom: 6 }}>
                Surprise Photo (optional)
              </label>
              {mf.surprisePhoto ? (
                <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mf.surprisePhoto} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12 }} />
                  <button onClick={() => updateMf("surprisePhoto", "")} style={{
                    position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>×</button>
                </div>
              ) : (
                <label style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "20px 0", borderRadius: 12, border: "1.5px dashed rgba(93,63,49,0.35)",
                  background: "rgba(93,63,49,0.04)", cursor: "pointer",
                  fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.65)",
                }}>
                  📸 Add Photo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) { const b64 = await compressToBase64(f, 900); updateMf("surprisePhoto", b64); }
                    e.target.value = "";
                  }} />
                </label>
              )}
            </div>

            <div>
              <label style={{ fontFamily: CURSIVE, fontSize: 14, color: BROWN, display: "block", marginBottom: 6 }}>
                Birthday Voice Note / Song (optional)
              </label>
              {mf.surpriseAudioUrl ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(93,63,49,0.06)", border: "1px solid rgba(93,63,49,0.18)" }}>
                  <span style={{ fontSize: 20 }}>🎤</span>
                  <span style={{ fontFamily: CURSIVE, fontSize: 13, color: BROWN, flex: 1 }}>Audio added ✓</span>
                  <button onClick={() => updateMf("surpriseAudioUrl", "")} style={{
                    background: "rgba(200,60,50,0.10)", border: "none", borderRadius: "50%",
                    width: 22, height: 22, cursor: "pointer", color: "rgba(200,60,50,0.70)", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>×</button>
                </div>
              ) : (
                <label style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "20px 0", borderRadius: 12, border: "1.5px dashed rgba(93,63,49,0.35)",
                  background: "rgba(93,63,49,0.04)", cursor: "pointer",
                  fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.65)",
                }}>
                  🎵 Add Audio
                  <input type="file" accept="audio/*" style={{ display: "none" }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      void readAudioFileOrToast(f).then((dataUrl) => {
                        if (dataUrl) updateMf("surpriseAudioUrl", dataUrl);
                      });
                    }
                    e.target.value = "";
                  }} />
                </label>
              )}
              <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(93,63,49,0.50)", marginTop: 6 }}>
                Record yourself singing Happy Birthday or upload a special song!
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {ghostBtn("← Back", () => setManualStep(6))}
            {primaryBtn("Next →", () => setManualStep(8))}
          </div>
        </div>
      </div>
    );

    // ── Step 8: Share Photo ───────────────────────────────────────────────────
    if (manualStep === 8) {
      const hasSharePhoto = !!mf.sharePhoto;
      return (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
          <div style={sheet}>
            {hdr("Share Photo 📸")}
            {progressBar}

            <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.70)", marginBottom: 20, lineHeight: 1.6 }}>
              Add a photo that {mf.recipientName ? `${mf.recipientName} will see` : "they'll see"} the moment they open your surprise link — make it unforgettable ✨
            </p>

            <input ref={sharePhotoRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleSharePhotoFile(f);
                e.target.value = "";
              }}
            />

            {!hasSharePhoto ? (
              /* ── Empty upload slot ── */
              <div
                onClick={() => sharePhotoRef.current?.click()}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 14, height: 186,
                  borderRadius: 20, border: "2px dashed rgba(173,104,74,0.38)",
                  background: "rgba(245,237,224,0.55)", cursor: "pointer",
                  marginBottom: 20, transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: 68, height: 68, borderRadius: "50%",
                  background: "rgba(173,104,74,0.12)",
                  border: "1.5px solid rgba(173,104,74,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30,
                }}>
                  📸
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: CURSIVE, fontSize: 16, fontWeight: 700, color: BROWN, margin: 0 }}>
                    Tap to add your photo
                  </p>
                  <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(93,63,49,0.45)", margin: "5px 0 0" }}>
                    jpg, png, webp · max 20MB
                  </p>
                </div>
              </div>
            ) : (
              /* ── Preview card ── */
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontFamily: CURSIVE, fontSize: 11, color: "rgba(93,63,49,0.40)",
                  letterSpacing: "0.09em", textTransform: "uppercase" as const,
                  marginBottom: 10, textAlign: "center" as const,
                }}>
                  Preview — how it looks to them
                </p>

                <div style={{
                  borderRadius: 20,
                  background: "rgba(252,248,242,0.98)",
                  border: "1px solid rgba(173,104,74,0.20)",
                  boxShadow: "0 8px 28px rgba(93,63,49,0.13)",
                  overflow: "hidden",
                }}>
                  {/* Top accent bar */}
                  <div style={{ height: 4, background: "linear-gradient(90deg, #AD684A, #5D3F31, #AD684A)" }} />

                  <div style={{ padding: "16px 18px" }}>
                    {/* Photo + heading row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <div style={{
                        width: 76, height: 76, borderRadius: "50%",
                        overflow: "hidden",
                        border: "3px solid rgba(173,104,74,0.30)",
                        flexShrink: 0,
                        boxShadow: "0 4px 16px rgba(93,63,49,0.22)",
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mf.sharePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: CURSIVE, fontSize: 17, fontWeight: 700, color: BROWN, margin: 0, lineHeight: 1.2 }}>
                          🎂 Birthday Surprise!
                        </p>
                        <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.60)", margin: "5px 0 0", lineHeight: 1.5 }}>
                          {mf.recipientName ? `${mf.recipientName}, ` : ""}someone made you something special 🎉
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "rgba(173,104,74,0.14)", marginBottom: 12 }} />

                    {/* Message */}
                    <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.55)", margin: "0 0 12px", lineHeight: 1.6 }}>
                      {mf.senderName || "Someone special"} made you a birthday page full of love, memories &amp; surprises. Open it now! 🎁
                    </p>

                    {/* Link pill */}
                    <div style={{
                      borderRadius: 999,
                      background: "linear-gradient(135deg, #AD684A, #5D3F31)",
                      padding: "9px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(252,248,242,0.88)" }}>
                        🔗 subhsandesh.in/...
                      </span>
                      <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(252,248,242,0.65)" }}>
                        Tap to open ↗
                      </span>
                    </div>
                  </div>
                </div>

                {/* Change / Remove */}
                <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
                  <button
                    onClick={() => sharePhotoRef.current?.click()}
                    style={{
                      fontFamily: CURSIVE, fontSize: 13, color: TERRACOTTA,
                      background: "none", border: "1px solid rgba(173,104,74,0.35)",
                      borderRadius: 999, padding: "5px 16px", cursor: "pointer",
                    }}
                  >
                    Change photo
                  </button>
                  <button
                    onClick={() => updateMf("sharePhoto", "")}
                    style={{
                      fontFamily: CURSIVE, fontSize: 13, color: "rgba(93,63,49,0.42)",
                      background: "none", border: "1px solid rgba(93,63,49,0.18)",
                      borderRadius: 999, padding: "5px 16px", cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setManualStep(7)}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 50,
                  border: "1.5px solid rgba(93,63,49,0.28)",
                  background: "rgba(93,63,49,0.06)",
                  fontFamily: CURSIVE, fontSize: 15, fontWeight: 600,
                  color: "rgba(93,63,49,0.65)", cursor: "pointer",
                  letterSpacing: "0.02em",
                  boxShadow: "0 2px 8px rgba(93,63,49,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                ← Back
              </button>

              {hasSharePhoto
                ? (
                  <button
                    onClick={() => setManualStep(9)}
                    style={{
                      flex: 1, padding: "13px 0", borderRadius: 50, border: "none",
                      background: "linear-gradient(135deg, #AD684A 0%, #5D3F31 100%)",
                      fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: "#fff",
                      cursor: "pointer", letterSpacing: "0.03em",
                      boxShadow: "0 4px 16px rgba(93,63,49,0.30)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => setManualStep(9)}
                    style={{
                      flex: 1, padding: "13px 0", borderRadius: 50,
                      border: "1.5px solid rgba(173,104,74,0.40)",
                      background: "linear-gradient(135deg, rgba(173,104,74,0.10) 0%, rgba(93,63,49,0.06) 100%)",
                      fontFamily: CURSIVE, fontSize: 15, fontWeight: 600,
                      color: TERRACOTTA, cursor: "pointer",
                      letterSpacing: "0.02em",
                      boxShadow: "0 2px 10px rgba(173,104,74,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    Skip →
                  </button>
                )
              }
            </div>
          </div>
        </div>
      );
    }

    // ── Step 9: Password + Save ───────────────────────────────────────────
    if (manualStep === 9) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Save Your Page 🎂")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgba(93,63,49,0.70)", marginBottom: 16, lineHeight: 1.6 }}>
            Add an optional password to protect this page, then preview — you can publish from the main page.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontFamily: CURSIVE, fontSize: 14, color: BROWN, display: "block", marginBottom: 6 }}>
                Password (optional)
              </label>
              <input type="text" value={pw} onChange={(e) => setPw(e.target.value)}
                placeholder="Leave blank for no password..." style={INPUT_STYLE} />
              <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(93,63,49,0.50)", marginTop: 6 }}>
                Viewers will need this password to see the page.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {ghostBtn("← Back", () => setManualStep(8))}
              {primaryBtn(saving ? "Saving..." : "Save & Preview 🎂", () => onSaveWithPassword(mf, pw), saving)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
