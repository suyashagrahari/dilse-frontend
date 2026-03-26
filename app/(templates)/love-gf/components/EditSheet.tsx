"use client";

import { useRef } from "react";
import { type ContentData, type EditMode } from "./types";

const WARM = "rgb(108, 74, 46)";
const WARM_MID = "rgba(108, 74, 46, 0.55)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const PAPER = "rgba(250, 246, 240, 0.98)";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1.5px solid rgba(158, 126, 97, 0.35)",
  background: "rgba(255,252,246,0.9)",
  fontFamily: "inherit", fontSize: 14, color: "rgb(60, 40, 20)",
  outline: "none", boxSizing: "border-box",
};

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE, resize: "vertical", minHeight: 90, lineHeight: 1.6,
};

const STEP_LABELS = ["Names", "Message", "Wish Card", "Photos", "Password"];

async function compressToBase64(file: File, maxDim = 800): Promise<string> {
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

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  aiName: string; setAiName: (v: string) => void;
  aiSender: string; setAiSender: (v: string) => void;
  aiPrompt: string; setAiPrompt: (v: string) => void;
  aiLoading: boolean;
  mf: ContentData; manualStep: number; setManualStep: (n: number) => void;
  updateMf: (k: keyof ContentData, v: unknown) => void;
  onStartAi: () => void; onStartManual: () => void;
  onAiGenerate: () => void; onManualPreview: () => void;
}

export default function EditSheet({
  editMode, setEditMode,
  aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading,
  mf, manualStep, setManualStep, updateMf,
  onStartAi, onStartManual, onAiGenerate, onManualPreview,
}: Props) {
  const fileInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  if (!editMode || editMode === "preview" || editMode === "password") return null;

  const handlePhotoUpload = async (index: number, file: File) => {
    const b64 = await compressToBase64(file);
    const photos = [...(mf.galleryPhotos || [])];
    while (photos.length <= index) photos.push("");
    photos[index] = b64;
    updateMf("galleryPhotos", photos);
  };

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(40, 25, 10, 0.55)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  };

  const sheet: React.CSSProperties = {
    width: "100%", maxWidth: 520,
    background: PAPER,
    borderRadius: "20px 20px 0 0",
    padding: "28px 24px 40px",
    maxHeight: "88svh",
    overflowY: "auto",
    boxShadow: "0 -20px 60px rgba(80,50,20,0.25)",
  };

  const hdr = (title: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <h2 style={{ fontFamily: CURSIVE, fontSize: 22, fontWeight: 700, color: WARM, margin: 0 }}>{title}</h2>
      <button onClick={() => setEditMode(null)} style={{
        border: "none", background: "transparent", cursor: "pointer",
        fontFamily: CURSIVE, fontSize: 20, color: "rgb(140,105,75)", lineHeight: 1,
      }}>✕</button>
    </div>
  );

  const btn = (label: string, onClick: () => void, primary = false, disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, padding: "11px 0", borderRadius: 50,
      border: primary ? "none" : `1.5px solid ${WARM_MID}`,
      background: primary
        ? "linear-gradient(135deg, rgb(158,126,97) 0%, rgb(120,85,55) 100%)"
        : "transparent",
      fontFamily: CURSIVE, fontSize: 15, fontWeight: 700,
      color: primary ? "#fff" : WARM,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      boxShadow: primary ? "0 4px 16px rgba(108,74,46,0.30)" : "none",
      letterSpacing: "0.03em",
    }}>{label}</button>
  );

  const progressBar = (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        {STEP_LABELS.map((label, i) => (
          <span key={i} style={{
            fontFamily: CURSIVE, fontSize: 10, letterSpacing: "0.05em",
            color: i <= manualStep ? WARM : "rgb(160,120,80)",
            fontWeight: i === manualStep ? 700 : 400, opacity: i <= manualStep ? 1 : 0.50,
          }}>{label}</span>
        ))}
      </div>
      <div style={{ height: 3, background: "rgba(158,126,97,0.15)", borderRadius: 2 }}>
        <div style={{
          height: "100%", borderRadius: 2,
          width: `${((manualStep + 1) / STEP_LABELS.length) * 100}%`,
          background: "linear-gradient(90deg, rgba(158,126,97,0.6), rgb(158,126,97))",
          transition: "width 0.3s ease",
        }} />
      </div>
    </div>
  );

  const backBtn = () => (
    <button onClick={() => setManualStep(manualStep - 1)} style={{
      flex: 1, padding: "11px 0", borderRadius: 50,
      border: `1.5px solid ${WARM_MID}`, background: "transparent",
      fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", cursor: "pointer",
    }}>← Back</button>
  );

  // ── CHOOSE MODE ──────────────────────────────────────────────────────────
  if (editMode === "choose") {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Create your love page ♡")}
          <p style={{ fontFamily: CURSIVE, fontSize: 15, color: "rgb(130,95,65)", marginBottom: 20, lineHeight: 1.6 }}>
            Tell your love story beautifully.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "✨ AI Magic", sub: "Write names + a few words — AI crafts a beautiful love message", action: onStartAi },
              { label: "✍ Write yourself", sub: "Fill step by step — your words, your photos, your story", action: onStartManual },
            ].map((opt) => (
              <button key={opt.label} onClick={opt.action} style={{
                padding: "16px 20px", borderRadius: 12,
                border: "1.5px solid rgba(158,126,97,0.35)",
                background: "rgba(158,126,97,0.06)", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ fontFamily: CURSIVE, fontSize: 17, fontWeight: 700, color: WARM, marginBottom: 4 }}>{opt.label}</div>
                <div style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgb(130,95,65)", opacity: 0.85 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── AI MODE ──────────────────────────────────────────────────────────────
  if (editMode === "ai") {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("✨ AI Magic")}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Their name *", value: aiName, set: setAiName, placeholder: "e.g. Priya, Sarah, Maya..." },
              { label: "Your name", value: aiSender, set: setAiSender, placeholder: "e.g. Arjun, James..." },
            ].map((f) => (
              <div key={f.label}>
                <label style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} style={INPUT_STYLE} />
              </div>
            ))}
            <div>
              <label style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, display: "block", marginBottom: 6 }}>
                What makes your love special? *
              </label>
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. She always makes me laugh, we love hiking, 2 years together..."
                style={TEXTAREA_STYLE} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditMode("choose")} style={{
                flex: 1, padding: "11px 0", borderRadius: 50,
                border: `1.5px solid ${WARM_MID}`, background: "transparent",
                fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", cursor: "pointer",
              }}>← Back</button>
              {btn(aiLoading ? "Writing..." : "✨ Generate", onAiGenerate, true, aiLoading || !aiName.trim() || !aiPrompt.trim())}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MANUAL MODE ──────────────────────────────────────────────────────────
  if (editMode === "manual") {
    if (manualStep === 0) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Your Story")}
          {progressBar}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, display: "block", marginBottom: 6 }}>Their name *</label>
              <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)}
                placeholder="Your love's name..." style={INPUT_STYLE} />
            </div>
            <div>
              <label style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, display: "block", marginBottom: 6 }}>Your name</label>
              <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)}
                placeholder="Your name..." style={INPUT_STYLE} />
            </div>
            <div>
              <label style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, display: "block", marginBottom: 6 }}>Special date (optional)</label>
              <input type="date" value={mf.loveDate} onChange={(e) => updateMf("loveDate", e.target.value)} style={INPUT_STYLE} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => setEditMode("choose")} style={{
                flex: 1, padding: "11px 0", borderRadius: 50,
                border: `1.5px solid ${WARM_MID}`, background: "transparent",
                fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", cursor: "pointer",
              }}>← Back</button>
              {btn("Next →", () => setManualStep(1), true, !mf.recipientName.trim())}
            </div>
          </div>
        </div>
      </div>
    );

    if (manualStep === 1) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Love Message")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.6 }}>
            A heartfelt message that appears on the main page.
          </p>
          <textarea value={mf.personalMessage} onChange={(e) => updateMf("personalMessage", e.target.value)}
            placeholder="Every moment with you..." style={{ ...TEXTAREA_STYLE, minHeight: 130 }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {backBtn()}
            {btn("Next →", () => setManualStep(2), true)}
          </div>
        </div>
      </div>
    );

    if (manualStep === 2) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Wish Card")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.6 }}>
            A tender note for the wish card section.
          </p>
          <textarea value={mf.wishMessage} onChange={(e) => updateMf("wishMessage", e.target.value)}
            placeholder="To the one who holds my heart..." style={{ ...TEXTAREA_STYLE, minHeight: 110 }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {backBtn()}
            {btn("Next →", () => setManualStep(3), true)}
          </div>
        </div>
      </div>
    );

    if (manualStep === 3) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Your Photos ♡")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.6 }}>
            Upload up to 4 couple photos — they appear as polaroids in the scrapbook.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[0, 1, 2, 3].map((i) => {
              const photo = (mf.galleryPhotos || [])[i];
              return (
                <div key={i} onClick={() => fileInputsRef.current[i]?.click()} style={{
                  aspectRatio: "3/4", borderRadius: 8,
                  border: `2px dashed rgba(158,126,97,${photo ? "0.5" : "0.3"})`,
                  background: photo ? "transparent" : "rgba(158,126,97,0.04)",
                  cursor: "pointer", overflow: "hidden", position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, opacity: 0.4, marginBottom: 4 }}>📷</div>
                      <div style={{ fontFamily: CURSIVE, fontSize: 11, color: WARM, opacity: 0.55 }}>Photo {i + 1}</div>
                    </div>
                  )}
                  <input ref={(el) => { fileInputsRef.current[i] = el; }} type="file" accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(i, f); }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {backBtn()}
            {btn("Next →", () => setManualStep(4), true)}
          </div>
        </div>
      </div>
    );

    if (manualStep === 4) {
      const pwKey = "_manualPw" as keyof ContentData;
      return (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
          <div style={sheet}>
            {hdr("Password (optional)")}
            {progressBar}
            <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.6 }}>
              Add a password so only your special someone can view this page.
            </p>
            <input type="text"
              value={(((mf as unknown as Record<string, unknown>)[pwKey as string] as string | undefined) || "")}
              onChange={(e) => updateMf(pwKey, e.target.value)}
              placeholder="Leave blank for no password"
              style={INPUT_STYLE} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {backBtn()}
              {btn("Preview ♡", onManualPreview, true)}
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
}
