"use client";

import { useRef, useState } from "react";
import { type ContentData, type EditMode, type PhotoItem } from "./types";

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
  ...INPUT_STYLE, resize: "vertical" as const, minHeight: 90, lineHeight: 1.6,
};

const STEP_LABELS = ["Names", "Message", "Wish", "Photos", "Gallery", "Finish"];

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
  onAiGenerate: () => void;
  onSaveWithPassword: (data: ContentData, pw: string) => void;
  saving: boolean;
}

export default function EditSheet({
  editMode, setEditMode,
  aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading,
  mf, manualStep, setManualStep, updateMf,
  onStartAi, onStartManual, onAiGenerate, onSaveWithPassword, saving,
}: Props) {
  const homeFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const galleryFileRef = useRef<HTMLInputElement | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");

  if (!editMode || editMode === "preview" || editMode === "password") return null;

  const isReview = editMode === "ai-review";
  const isManualOrReview = editMode === "manual" || isReview;

  // ── Helpers ────────────────────────────────────────────────────────────

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(40, 25, 10, 0.55)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  };
  const sheet: React.CSSProperties = {
    width: "100%", maxWidth: 520, background: PAPER,
    borderRadius: "20px 20px 0 0", padding: "28px 24px 40px",
    maxHeight: "90svh", overflowY: "auto",
    boxShadow: "0 -20px 60px rgba(80,50,20,0.25)",
  };

  const hdr = (title: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h2 style={{ fontFamily: CURSIVE, fontSize: 22, fontWeight: 700, color: WARM, margin: 0 }}>{title}</h2>
      <button onClick={() => setEditMode(null)} style={{
        border: "none", background: "transparent", cursor: "pointer",
        fontFamily: CURSIVE, fontSize: 20, color: "rgb(140,105,75)", lineHeight: 1,
      }}>✕</button>
    </div>
  );

  const primaryBtn = (label: string, onClick: () => void, disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, padding: "12px 0", borderRadius: 50, border: "none",
      background: disabled ? "rgba(158,126,97,0.3)" : "linear-gradient(135deg, rgb(158,126,97) 0%, rgb(120,85,55) 100%)",
      fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: "#fff",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 4px 16px rgba(108,74,46,0.30)",
      letterSpacing: "0.03em",
    }}>{label}</button>
  );

  const ghostBtn = (label: string, onClick: () => void) => (
    <button onClick={onClick} style={{
      flex: 1, padding: "12px 0", borderRadius: 50,
      border: `1.5px solid ${WARM_MID}`, background: "transparent",
      fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", cursor: "pointer",
    }}>{label}</button>
  );

  const progressBar = (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        {STEP_LABELS.map((label, i) => (
          <span key={i} style={{
            fontFamily: CURSIVE, fontSize: 10, letterSpacing: "0.05em",
            color: i <= manualStep ? WARM : "rgb(160,120,80)",
            fontWeight: i === manualStep ? 700 : 400,
            opacity: i <= manualStep ? 1 : 0.45,
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

  const label = (text: string) => (
    <label style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, display: "block", marginBottom: 6 }}>{text}</label>
  );

  // ── Gallery photo helpers ───────────────────────────────────────────────

  const galleryPhotos: PhotoItem[] = mf.galleryPhotos || [];
  const currentGalleryPhoto: PhotoItem = galleryPhotos[galleryIdx] ?? { url: "", letter: "", cropX: 50, cropY: 50 };

  const updateGalleryPhoto = (update: Partial<PhotoItem>) => {
    const updated = [...galleryPhotos];
    while (updated.length <= galleryIdx) updated.push({ url: "", letter: "", cropX: 50, cropY: 50 });
    updated[galleryIdx] = { ...updated[galleryIdx], ...update };
    updateMf("galleryPhotos", updated);
  };

  const handleGalleryUpload = async (file: File) => {
    const b64 = await compressToBase64(file);
    updateGalleryPhoto({ url: b64 });
  };

  const removeGalleryPhoto = () => {
    const updated = galleryPhotos.filter((_, i) => i !== galleryIdx);
    updateMf("galleryPhotos", updated);
    if (galleryIdx >= updated.length && galleryIdx > 0) setGalleryIdx(galleryIdx - 1);
  };

  const homePhotos: string[] = mf.homePhotos || [];

  const handleHomePhotoUpload = async (index: number, file: File) => {
    const b64 = await compressToBase64(file);
    const updated = [...homePhotos];
    while (updated.length <= index) updated.push("");
    updated[index] = b64;
    updateMf("homePhotos", updated);
  };

  // ── CHOOSE MODE ──────────────────────────────────────────────────────────

  if (editMode === "choose") {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Create your love page ♡")}
          <p style={{ fontFamily: CURSIVE, fontSize: 15, color: "rgb(130,95,65)", marginBottom: 20, lineHeight: 1.6 }}>
            Tell your love story, beautifully.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                icon: "✨", label: "AI Magic",
                sub: "Describe your love in a few words — AI writes the messages, captions & quizzes",
                action: onStartAi,
              },
              {
                icon: "✍", label: "Write yourself",
                sub: "Step-by-step form — your words, your photos, your story",
                action: onStartManual,
              },
            ].map((opt) => (
              <button key={opt.label} onClick={opt.action} style={{
                padding: "16px 20px", borderRadius: 14,
                border: "1.5px solid rgba(158,126,97,0.35)",
                background: "rgba(158,126,97,0.06)", cursor: "pointer", textAlign: "left",
                transition: "background 0.15s",
              }}>
                <div style={{ fontFamily: CURSIVE, fontSize: 17, fontWeight: 700, color: WARM, marginBottom: 4 }}>
                  {opt.icon} {opt.label}
                </div>
                <div style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgb(130,95,65)", opacity: 0.85, lineHeight: 1.5 }}>
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── AI INPUT MODE ────────────────────────────────────────────────────────

  if (editMode === "ai") {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("✨ AI Magic")}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 16, lineHeight: 1.6 }}>
            AI will write a heartfelt message, wish card, photo captions & quiz questions.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              {label("Their name *")}
              <input value={aiName} onChange={(e) => setAiName(e.target.value)}
                placeholder="e.g. Priya, Sarah, Maya..." style={INPUT_STYLE} />
            </div>
            <div>
              {label("Your name")}
              <input value={aiSender} onChange={(e) => setAiSender(e.target.value)}
                placeholder="e.g. Arjun, James..." style={INPUT_STYLE} />
            </div>
            <div>
              {label("What makes your love special? *")}
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. She always makes me laugh, we love hiking, 2 years together, her favourite thing is..."
                style={{ ...TEXTAREA_STYLE, minHeight: 110 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {ghostBtn("← Back", () => setEditMode("choose"))}
              {primaryBtn(
                aiLoading ? "Writing... ✨" : "Generate ✨",
                onAiGenerate,
                aiLoading || !aiName.trim() || !aiPrompt.trim(),
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MANUAL / AI-REVIEW STEPS ─────────────────────────────────────────────

  if (isManualOrReview) {
    const reviewTitle = isReview ? "Review ♡" : "Your Story";

    // Step 0: Names + Date
    if (manualStep === 0) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr(isReview ? "Review & Edit ♡" : "Your Story")}
          {progressBar}
          {isReview && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 16,
              background: "rgba(158,126,97,0.08)", border: "1px solid rgba(158,126,97,0.25)",
              fontFamily: CURSIVE, fontSize: 13, color: "rgb(120,85,55)", lineHeight: 1.5,
            }}>
              ✨ AI has written your messages! Review and edit each step, then save.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              {label("Their name *")}
              <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)}
                placeholder="Your love's name..." style={INPUT_STYLE} />
            </div>
            <div>
              {label("Your name")}
              <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)}
                placeholder="Your name..." style={INPUT_STYLE} />
            </div>
            <div>
              {label("Special date (optional)")}
              <input type="date" value={mf.loveDate} onChange={(e) => updateMf("loveDate", e.target.value)} style={INPUT_STYLE} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {ghostBtn("← Back", () => setEditMode(isReview ? "ai" : "choose"))}
              {primaryBtn("Next →", () => setManualStep(1), !mf.recipientName.trim())}
            </div>
          </div>
        </div>
      </div>
    );

    // Step 1: Personal Message
    if (manualStep === 1) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr(isReview ? `${reviewTitle} — Message` : "Love Message")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.6 }}>
            A heartfelt message shown on the home page.
          </p>
          <textarea value={mf.personalMessage} onChange={(e) => updateMf("personalMessage", e.target.value)}
            placeholder="Every moment with you..." style={{ ...TEXTAREA_STYLE, minHeight: 140 }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {ghostBtn("← Back", () => setManualStep(0))}
            {primaryBtn("Next →", () => setManualStep(2))}
          </div>
        </div>
      </div>
    );

    // Step 2: Wish Message
    if (manualStep === 2) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr(isReview ? `${reviewTitle} — Wish Card` : "Wish Card")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.6 }}>
            A tender note for the wish section.
          </p>
          <textarea value={mf.wishMessage} onChange={(e) => updateMf("wishMessage", e.target.value)}
            placeholder="To the one who holds my heart..." style={{ ...TEXTAREA_STYLE, minHeight: 120 }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {ghostBtn("← Back", () => setManualStep(1))}
            {primaryBtn("Next →", () => setManualStep(3))}
          </div>
        </div>
      </div>
    );

    // Step 3: Home Photos (4 scrapbook polaroids)
    if (manualStep === 3) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Home Scrapbook ♡")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.6 }}>
            Upload 4 photos — they appear as polaroids in the scrapbook home page.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[0, 1, 2, 3].map((i) => {
              const photo = homePhotos[i] || "";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div
                    onClick={() => homeFileRefs.current[i]?.click()}
                    style={{
                      aspectRatio: "3/4", borderRadius: 10,
                      border: `2px dashed rgba(158,126,97,${photo ? "0.55" : "0.30"})`,
                      background: photo ? "transparent" : "rgba(158,126,97,0.04)",
                      cursor: "pointer", overflow: "hidden", position: "relative",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, opacity: 0.35, marginBottom: 4 }}>📷</div>
                        <div style={{ fontFamily: CURSIVE, fontSize: 11, color: WARM, opacity: 0.5 }}>
                          Photo {i + 1}
                        </div>
                      </div>
                    )}
                    {photo && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.15s",
                      }}>
                        <span style={{
                          fontFamily: CURSIVE, fontSize: 11, color: "#fff", opacity: 0,
                          background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "2px 8px",
                        }}>change</span>
                      </div>
                    )}
                    <input
                      ref={(el) => { homeFileRefs.current[i] = el; }}
                      type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHomePhotoUpload(i, f); }}
                    />
                  </div>
                  {photo && (
                    <button onClick={() => {
                      const updated = [...homePhotos];
                      updated[i] = "";
                      updateMf("homePhotos", updated);
                    }} style={{
                      padding: "3px 0", border: "none", background: "transparent",
                      fontFamily: CURSIVE, fontSize: 11, color: "rgba(180,60,50,0.7)", cursor: "pointer",
                    }}>✕ remove</button>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {ghostBtn("← Back", () => setManualStep(2))}
            {primaryBtn("Next →", () => setManualStep(4))}
          </div>
        </div>
      </div>
    );

    // Step 4: Gallery Photos (up to 10, with crop + letter)
    if (manualStep === 4) {
      const photoCount = galleryPhotos.length;
      const canAddMore = photoCount < 10;

      return (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
          <div style={sheet}>
            {hdr("Gallery Photos 📷")}
            {progressBar}
            <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.5 }}>
              Upload up to 10 photos. Adjust crop position and add a love letter for each.
            </p>

            {/* Thumbnail strip */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14, paddingBottom: 4 }}>
              {galleryPhotos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  style={{
                    flexShrink: 0, width: 52, height: 52, borderRadius: 10,
                    border: `2px solid ${i === galleryIdx ? "rgb(158,126,97)" : "rgba(158,126,97,0.3)"}`,
                    overflow: "hidden", padding: 0, cursor: "pointer", background: "transparent",
                    boxShadow: i === galleryIdx ? "0 2px 8px rgba(108,74,46,0.30)" : "none",
                  }}>
                  {p.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt="" style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      objectPosition: `${p.cropX}% ${p.cropY}%`,
                    }} />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: "rgba(158,126,97,0.06)",
                      fontFamily: CURSIVE, fontSize: 10, color: WARM,
                    }}>{i + 1}</div>
                  )}
                </button>
              ))}
              {canAddMore && (
                <button
                  onClick={() => {
                    const updated = [...galleryPhotos, { url: "", letter: "", cropX: 50, cropY: 50 }];
                    updateMf("galleryPhotos", updated);
                    setGalleryIdx(updated.length - 1);
                  }}
                  style={{
                    flexShrink: 0, width: 52, height: 52, borderRadius: 10,
                    border: "2px dashed rgba(158,126,97,0.35)",
                    background: "rgba(158,126,97,0.04)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: CURSIVE, fontSize: 22, color: WARM, opacity: 0.6,
                  }}>+</button>
              )}
            </div>

            {galleryPhotos.length === 0 ? (
              <div style={{
                padding: "32px 0", textAlign: "center",
                fontFamily: CURSIVE, fontSize: 14, color: "rgba(108,74,46,0.45)",
                lineHeight: 1.6,
              }}>
                No photos yet.<br />
                <button
                  onClick={() => {
                    updateMf("galleryPhotos", [{ url: "", letter: "", cropX: 50, cropY: 50 }]);
                    setGalleryIdx(0);
                  }}
                  style={{
                    marginTop: 10, padding: "8px 20px", borderRadius: 50,
                    border: "1.5px solid rgba(158,126,97,0.4)",
                    background: "transparent", fontFamily: CURSIVE, fontSize: 14,
                    color: WARM, cursor: "pointer",
                  }}>+ Add your first photo</button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(108,74,46,0.6)", marginBottom: 8, textAlign: "right" }}>
                  Photo {galleryIdx + 1} of {galleryPhotos.length}
                </div>

                {/* Photo preview + upload */}
                <div
                  onClick={() => galleryFileRef.current?.click()}
                  style={{
                    width: "100%", aspectRatio: "4/3", borderRadius: 12,
                    border: `2px dashed rgba(158,126,97,${currentGalleryPhoto.url ? "0.50" : "0.30"})`,
                    overflow: "hidden", position: "relative", cursor: "pointer",
                    background: currentGalleryPhoto.url ? "transparent" : "rgba(158,126,97,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 12,
                  }}>
                  {currentGalleryPhoto.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentGalleryPhoto.url} alt=""
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        objectPosition: `${currentGalleryPhoto.cropX}% ${currentGalleryPhoto.cropY}%`,
                      }} />
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 8 }}>📷</div>
                      <div style={{ fontFamily: CURSIVE, fontSize: 13, color: WARM, opacity: 0.55 }}>
                        Tap to upload photo {galleryIdx + 1}
                      </div>
                    </div>
                  )}
                  {currentGalleryPhoto.url && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(0,0,0,0.0)",
                      display: "flex", alignItems: "flex-end", justifyContent: "center",
                      padding: "0 0 10px",
                    }}>
                      <span style={{
                        fontFamily: CURSIVE, fontSize: 12, color: "#fff",
                        background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
                        borderRadius: 6, padding: "3px 12px",
                      }}>tap to change</span>
                    </div>
                  )}
                  <input
                    ref={galleryFileRef}
                    type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGalleryUpload(f); }}
                  />
                </div>

                {/* Crop controls (only if photo uploaded) */}
                {currentGalleryPhoto.url && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: CURSIVE, fontSize: 12, color: WARM }}>Horizontal position</span>
                        <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.6)" }}>{currentGalleryPhoto.cropX}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={currentGalleryPhoto.cropX}
                        onChange={(e) => updateGalleryPhoto({ cropX: Number(e.target.value) })}
                        style={{ width: "100%", accentColor: "rgb(158,126,97)" }}
                      />
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: CURSIVE, fontSize: 12, color: WARM }}>Vertical position</span>
                        <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.6)" }}>{currentGalleryPhoto.cropY}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={currentGalleryPhoto.cropY}
                        onChange={(e) => updateGalleryPhoto({ cropY: Number(e.target.value) })}
                        style={{ width: "100%", accentColor: "rgb(158,126,97)" }}
                      />
                    </div>
                  </div>
                )}

                {/* Letter for this photo */}
                <div>
                  {label("Letter for this photo (optional)")}
                  <textarea
                    value={currentGalleryPhoto.letter}
                    onChange={(e) => updateGalleryPhoto({ letter: e.target.value })}
                    placeholder="Write a caption or love letter for this photo..."
                    style={{ ...TEXTAREA_STYLE, minHeight: 80 }}
                  />
                </div>

                {/* Navigation between photos */}
                <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "space-between", alignItems: "center" }}>
                  <button onClick={() => setGalleryIdx((i) => Math.max(0, i - 1))} disabled={galleryIdx === 0}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: `1px solid rgba(158,126,97,0.3)`,
                      background: "transparent", fontFamily: CURSIVE, fontSize: 13, color: WARM,
                      cursor: galleryIdx === 0 ? "not-allowed" : "pointer", opacity: galleryIdx === 0 ? 0.35 : 1,
                    }}>← Prev</button>

                  <button onClick={removeGalleryPhoto}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      background: "rgba(180,60,50,0.08)",
                      fontFamily: CURSIVE, fontSize: 12, color: "rgba(180,60,50,0.8)", cursor: "pointer",
                    }}>✕ Remove</button>

                  <button onClick={() => setGalleryIdx((i) => Math.min(galleryPhotos.length - 1, i + 1))}
                    disabled={galleryIdx === galleryPhotos.length - 1}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: `1px solid rgba(158,126,97,0.3)`,
                      background: "transparent", fontFamily: CURSIVE, fontSize: 13, color: WARM,
                      cursor: galleryIdx === galleryPhotos.length - 1 ? "not-allowed" : "pointer",
                      opacity: galleryIdx === galleryPhotos.length - 1 ? 0.35 : 1,
                    }}>Next →</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {ghostBtn("← Back", () => setManualStep(3))}
              {primaryBtn("Next →", () => setManualStep(5))}
            </div>
          </div>
        </div>
      );
    }

    // Step 5: Password + Save
    if (manualStep === 5) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Save your page ♡")}
          {progressBar}

          {/* Summary card */}
          <div style={{
            padding: "14px 16px", borderRadius: 12, marginBottom: 20,
            background: "rgba(158,126,97,0.07)", border: "1px solid rgba(158,126,97,0.22)",
          }}>
            <div style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: WARM, marginBottom: 6 }}>
              For {mf.recipientName || "your love"} ♡
            </div>
            <div style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgb(130,95,65)", lineHeight: 1.6 }}>
              {homePhotos.filter(Boolean).length} home photo{homePhotos.filter(Boolean).length !== 1 ? "s" : ""}
              {" · "}
              {(mf.galleryPhotos || []).filter((p) => p.url).length} gallery photo{(mf.galleryPhotos || []).filter((p) => p.url).length !== 1 ? "s" : ""}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            {label("Password (optional)")}
            <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgb(130,95,65)", marginBottom: 10, lineHeight: 1.5 }}>
              Add a password so only your special someone can view this page.
            </p>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Leave blank for no password"
                style={{ ...INPUT_STYLE, paddingRight: 56 }}
              />
              <button onClick={() => setShowPw((v) => !v)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                border: "none", background: "transparent",
                fontFamily: CURSIVE, fontSize: 13, color: WARM, cursor: "pointer", opacity: 0.6,
              }}>{showPw ? "hide" : "show"}</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {ghostBtn("← Back", () => setManualStep(4))}
            {primaryBtn(
              saving ? "Saving..." : "Save ♡",
              () => onSaveWithPassword({ ...mf }, pw),
              saving,
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
