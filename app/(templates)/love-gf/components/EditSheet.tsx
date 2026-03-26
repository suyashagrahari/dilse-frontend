"use client";

import { useRef, useState } from "react";
import { type ContentData, type EditMode, type PhotoItem, type QuizQuestion, type TruthDareItem } from "./types";

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

const STEP_LABELS = ["Names", "Message", "Wish", "Photos", "Gallery", "Quiz", "Games", "Finish"];

// ── Pre-made Truth/Dare libraries ────────────────────────────────────────────

const TRUTH_LIBRARY = [
  "What was your first thought when you saw me? 💭",
  "What's your favorite memory of us together? 🌹",
  "When did you first realize you had feelings for me? 🥰",
  "What do you find most attractive about me? 👀",
  "What song do you think of when you think of me? 🎵",
  "What's one thing I do that makes you feel most loved? 💗",
  "What's the most romantic thing you've ever imagined doing for me? 🌟",
  "If you could relive one moment with me, which would it be? ✨",
  "What quality of mine do you love most? 💖",
  "What's the funniest thing I've ever done? 😂",
  "What's something you've never told me but want to? 🤫",
  "Describe our love story in 3 sentences 📖",
  "What do you miss most when we're apart? 💔",
  "What's your idea of a perfect date with me? 🌙",
  "What small thing do I do that means a lot to you? 🌸",
  "If you could describe me in 3 words, what would they be? 💕",
  "What's one wish you have for our relationship? 🌠",
  "What's your favorite thing we do together? 🥂",
  "What's the first thing you notice about me when I walk in? 👑",
  "What moment with me made you the happiest? 🎉",
];

const DARE_LIBRARY = [
  "Send me a voice note saying 'I love you' in 5 different ways 🎤",
  "Write me a short poem right now and send it 📝",
  "Change your phone wallpaper to a photo of us for a week 📸",
  "Tell me something you love about me for each letter of my name 💌",
  "Describe our love story in exactly 10 words 💬",
  "Name 5 things you're grateful for about me right now ✨",
  "Sing the first line of a song that reminds you of me 🎵",
  "Write a 3-sentence love letter and send it to me right now 💌",
  "Plan our dream date — 3 activities, full details, right now! 🌙",
  "Compliment me 3 times without using the word 'beautiful' 💎",
  "Share a secret you've never told anyone 🤫",
  "Create a nickname for me right now and explain why 🥰",
  "Describe our first meeting like you're narrating a movie 🎬",
  "Tell me the thing about me that always makes your day better ☀️",
  "Text me the most heartfelt thing you've ever wanted to say 💬",
  "List 10 reasons you love me — as fast as you can! 🚀",
  "Say 'I choose you every single day' out loud 3 times 💕",
  "Make a wish for us out loud right now 🌠",
  "Describe your perfect future with me in 30 seconds ⏰",
  "Send me a screenshot of our first conversation 📱",
];

const QUIZ_LIBRARY: QuizQuestion[] = [
  { question: "What's my favorite comfort food? 🍕", options: ["Pizza", "Ice cream", "Chocolate", "Home-cooked meal"], correct: 0 },
  { question: "What color do I love most? 🎨", options: ["Rose pink", "Ocean blue", "Warm gold", "Earthy green"], correct: 0 },
  { question: "How do I like to spend a lazy Sunday? ☀️", options: ["Sleep in all day", "Netflix & cuddles", "Cook together", "Go on a walk"], correct: 1 },
  { question: "What's my go-to mood booster? 💖", options: ["Music 🎵", "Your hugs 🤗", "Chocolate 🍫", "A long walk"], correct: 1 },
  { question: "Which season makes me happiest? 🌸", options: ["Spring flowers", "Summer sun", "Cozy autumn", "Snowy winter"], correct: 0 },
  { question: "My idea of a perfect date is...? 🌙", options: ["Fancy restaurant", "Picnic under stars", "Movie marathon", "Cooking together"], correct: 1 },
  { question: "What do I do first thing every morning? ☕", options: ["Check my phone", "Make coffee/tea", "Think of you 💕", "Stretch & yawn"], correct: 2 },
  { question: "What's my love language? 💝", options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service"], correct: 1 },
  { question: "What kind of music do I love most? 🎵", options: ["Romantic ballads", "Pop hits", "Old classics", "Indie vibes"], correct: 0 },
  { question: "If I could travel anywhere, I'd go to... ✈️", options: ["Paris, France 🗼", "Bali, Indonesia 🌴", "Santorini, Greece 🏛️", "Kyoto, Japan 🌸"], correct: 0 },
  { question: "My biggest dream is to... 🌟", options: ["Travel the world", "Build a cozy home", "Have a family", "Achieve something great"], correct: 1 },
  { question: "What do I love most about relationships? 💕", options: ["Deep conversations", "Silly moments together", "Feeling understood", "Growing together"], correct: 2 },
  { question: "How do I show I care? 🌹", options: ["Surprise gifts", "Acts of kindness", "Heartfelt words", "Just being there"], correct: 3 },
  { question: "What's my guilty pleasure? 😅", options: ["Reality TV", "Eating dessert first", "Replaying old memories", "Online shopping"], correct: 0 },
  { question: "What makes me laugh the most? 😂", options: ["Silly jokes", "Funny movies", "You being goofy 🥰", "Memes"], correct: 2 },
  { question: "My ideal weekend getaway is... 🏕️", options: ["Beach resort", "Mountain cabin", "City adventure", "Road trip"], correct: 1 },
  { question: "What do I value most in a person? 💎", options: ["Loyalty", "Kindness", "Sense of humor", "Ambition"], correct: 0 },
  { question: "When stressed, I usually... 😮‍💨", options: ["Call you first 💕", "Listen to music", "Take a long walk", "Eat comfort food"], correct: 0 },
  { question: "My favorite time of day with you is... ✨", options: ["Morning cuddles", "Afternoon adventures", "Evening talks", "Late night laughs"], correct: 3 },
  { question: "What's my hidden talent? 🌟", options: ["Singing", "Making people smile", "Cooking", "Storytelling"], correct: 1 },
  { question: "Which movie genre do I love? 🎬", options: ["Romantic comedy", "Adventure", "Thriller", "Animated"], correct: 0 },
  { question: "My favorite way to say 'I love you' is... 💌", options: ["A long heartfelt text", "A surprise hug", "Cooking your favorite meal", "Just looking at you"], correct: 3 },
  { question: "What flower represents me best? 🌸", options: ["Rose — passionate", "Sunflower — bright", "Daisy — simple & pure", "Orchid — unique"], correct: 0 },
  { question: "If I were a dessert, I'd be... 🍰", options: ["Warm chocolate lava cake", "Light fruit tart", "Classic vanilla ice cream", "Tiramisu — complex & sweet"], correct: 3 },
  { question: "What do I think about when I miss you? 💭", options: ["Your smile", "Our last hug", "Your voice", "All of the above 💕"], correct: 3 },
  { question: "How do I handle arguments? 🕊️", options: ["Talk it through calmly", "Need space first", "Make you laugh it off", "Write my feelings down"], correct: 0 },
  { question: "What's my favorite thing to do together? 🥂", options: ["Cook and eat", "Watch things together", "Go on spontaneous outings", "Just stay in and talk"], correct: 3 },
  { question: "What kind of texts do I love getting? 📱", options: ["'Thinking of you' texts", "Long heartfelt paragraphs", "Funny memes just for me", "Voice notes"], correct: 0 },
  { question: "My dream home would be... 🏡", options: ["Cozy cottage in the countryside", "Modern apartment in the city", "Beach house by the ocean", "Anywhere as long as you're there 💕"], correct: 3 },
  { question: "What do I believe is the secret to lasting love? 🔑", options: ["Communication always", "Lots of laughter", "Never stopping dating each other", "Being each other's best friend"], correct: 3 },
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

  // Quiz step state
  const [quizEditIdx, setQuizEditIdx] = useState<number | null>(null);

  // Truth/Dare step state
  const [tdTab, setTdTab] = useState<"truth" | "dare">("truth");
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showQuizLibrary, setShowQuizLibrary] = useState(false);
  const darePhotoRef = useRef<HTMLInputElement | null>(null);
  const dareAudioRef = useRef<HTMLInputElement | null>(null);
  const [dareMediaTarget, setDareMediaTarget] = useState<string | null>(null);

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
        {STEP_LABELS.map((lbl, i) => (
          <span key={i} style={{
            fontFamily: CURSIVE, fontSize: 9, letterSpacing: "0.05em",
            color: i <= manualStep ? WARM : "rgb(160,120,80)",
            fontWeight: i === manualStep ? 700 : 400,
            opacity: i <= manualStep ? 1 : 0.45,
          }}>{lbl}</span>
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

  // ── Quiz helpers ─────────────────────────────────────────────────────────

  const quizQuestions: QuizQuestion[] = mf.quizQuestions || [];

  const updateQuizQuestion = (idx: number, update: Partial<QuizQuestion>) => {
    const updated = [...quizQuestions];
    updated[idx] = { ...updated[idx], ...update };
    updateMf("quizQuestions", updated);
  };

  const updateQuizOption = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...quizQuestions];
    const opts = [...(updated[qIdx].options || ["", "", "", ""])];
    opts[oIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    updateMf("quizQuestions", updated);
  };

  const addQuizQuestion = () => {
    if (quizQuestions.length >= 10) return;
    const newQ: QuizQuestion = { question: "", options: ["", "", "", ""], correct: 0 };
    const updated = [...quizQuestions, newQ];
    updateMf("quizQuestions", updated);
    setQuizEditIdx(updated.length - 1);
  };

  const removeQuizQuestion = (idx: number) => {
    const updated = quizQuestions.filter((_, i) => i !== idx);
    updateMf("quizQuestions", updated);
    if (quizEditIdx === idx) setQuizEditIdx(null);
  };

  // ── Truth/Dare helpers ───────────────────────────────────────────────────

  const truthDareQuestions: TruthDareItem[] = mf.truthDareQuestions || [];
  const currentLibrary = tdTab === "truth" ? TRUTH_LIBRARY : DARE_LIBRARY;
  const selectedTexts = new Set(truthDareQuestions.map((q) => q.text));

  const addTdItem = (text: string, type: "truth" | "dare") => {
    if (selectedTexts.has(text)) return;
    updateMf("truthDareQuestions", [...truthDareQuestions, { type, text }]);
  };

  const removeTdItem = (text: string) => {
    updateMf("truthDareQuestions", truthDareQuestions.filter((q) => q.text !== text));
  };

  const addCustomTd = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!selectedTexts.has(trimmed)) {
      updateMf("truthDareQuestions", [...truthDareQuestions, { type: tdTab, text: trimmed }]);
    }
    setCustomInput("");
    setShowCustomInput(false);
  };

  const updateTdItem = (text: string, update: Partial<TruthDareItem>) => {
    const updated = truthDareQuestions.map((q) => q.text === text ? { ...q, ...update } : q);
    updateMf("truthDareQuestions", updated);
  };

  const readAudioAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      if (file.size > 8 * 1024 * 1024) { reject(new Error("Audio too large (max 8MB)")); return; }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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
            AI will write a heartfelt message, wish card, photo captions, quiz questions & truth/dare.
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

    // Step 5: Quiz Questions
    if (manualStep === 5) return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
        <div style={sheet}>
          {hdr("Quiz Questions 🎯")}
          {progressBar}
          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.5 }}>
            Create custom quiz questions for the Games section. Up to 10 questions.
          </p>

          {quizQuestions.length === 0 ? (
            <div style={{
              padding: "24px 0", textAlign: "center",
              fontFamily: CURSIVE, fontSize: 14, color: "rgba(108,74,46,0.45)", lineHeight: 1.6,
            }}>
              No quiz questions yet.<br />
              <span style={{ fontSize: 12, opacity: 0.7 }}>Add custom questions or skip — default ones will be used.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {quizQuestions.map((q, qi) => (
                <div key={qi} style={{
                  borderRadius: 12, border: `1.5px solid ${quizEditIdx === qi ? "rgba(158,126,97,0.55)" : "rgba(158,126,97,0.22)"}`,
                  background: quizEditIdx === qi ? "rgba(158,126,97,0.06)" : "rgba(255,252,246,0.7)",
                  overflow: "hidden",
                }}>
                  {/* Question header row */}
                  <div
                    onClick={() => setQuizEditIdx(quizEditIdx === qi ? null : qi)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", cursor: "pointer",
                    }}
                  >
                    <span style={{
                      fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: WARM,
                      flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {qi + 1}. {q.question || <span style={{ opacity: 0.4 }}>Untitled question</span>}
                    </span>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeQuizQuestion(qi); }}
                        style={{
                          padding: "2px 8px", borderRadius: 6, border: "none",
                          background: "rgba(180,60,50,0.08)",
                          fontFamily: CURSIVE, fontSize: 11, color: "rgba(180,60,50,0.8)", cursor: "pointer",
                        }}>✕</button>
                      <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(108,74,46,0.45)" }}>
                        {quizEditIdx === qi ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded editor */}
                  {quizEditIdx === qi && (
                    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        {label("Question")}
                        <input
                          value={q.question}
                          onChange={(e) => updateQuizQuestion(qi, { question: e.target.value })}
                          placeholder="e.g. What's my favourite movie?"
                          style={INPUT_STYLE}
                        />
                      </div>
                      <div>
                        {label("Options (A/B/C/D) — click radio to mark correct")}
                        {[0, 1, 2, 3].map((oi) => (
                          <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                            <input
                              type="radio"
                              name={`quiz-correct-${qi}`}
                              checked={q.correct === oi}
                              onChange={() => updateQuizQuestion(qi, { correct: oi })}
                              style={{ accentColor: "rgb(158,126,97)", cursor: "pointer", flexShrink: 0 }}
                            />
                            <span style={{ fontFamily: CURSIVE, fontSize: 12, color: WARM, flexShrink: 0, width: 16 }}>
                              {["A", "B", "C", "D"][oi]}
                            </span>
                            <input
                              value={(q.options || ["", "", "", ""])[oi] || ""}
                              onChange={(e) => updateQuizOption(qi, oi, e.target.value)}
                              placeholder={`Option ${["A", "B", "C", "D"][oi]}`}
                              style={{ ...INPUT_STYLE, flex: 1 }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{
                        fontFamily: CURSIVE, fontSize: 11, color: "rgb(70,140,60)",
                        background: "rgba(70,140,60,0.07)", borderRadius: 8, padding: "6px 10px",
                      }}>
                        ✓ Correct answer: Option {["A", "B", "C", "D"][q.correct] || "A"} — {(q.options || [])[q.correct] || "not set"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quiz Library */}
          {showQuizLibrary ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: CURSIVE, fontSize: 12, fontWeight: 700, color: WARM }}>
                  💕 30 Cute Question Templates
                </span>
                <button onClick={() => setShowQuizLibrary(false)} style={{
                  border: "none", background: "transparent", fontFamily: CURSIVE, fontSize: 13, color: WARM, cursor: "pointer",
                }}>✕ Close</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                {QUIZ_LIBRARY.map((q, li) => {
                  const alreadyAdded = quizQuestions.some((existing) => existing.question === q.question);
                  return (
                    <div key={li} style={{
                      padding: "9px 12px", borderRadius: 10,
                      background: alreadyAdded ? "rgba(158,126,97,0.06)" : "rgba(255,252,246,0.8)",
                      border: `1px solid ${alreadyAdded ? "rgba(158,126,97,0.35)" : "rgba(158,126,97,0.18)"}`,
                      display: "flex", alignItems: "flex-start", gap: 8, opacity: alreadyAdded ? 0.55 : 1,
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: WARM, margin: 0, lineHeight: 1.4 }}>{q.question}</p>
                        <p style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.55)", margin: "2px 0 0", lineHeight: 1.3 }}>
                          {q.options.map((o, oi) => (
                            <span key={oi}>{oi > 0 ? " · " : ""}<span style={{ color: oi === q.correct ? "rgb(70,130,60)" : undefined }}>{o}{oi === q.correct ? " ✓" : ""}</span></span>
                          ))}
                        </p>
                      </div>
                      {!alreadyAdded && quizQuestions.length < 10 && (
                        <button
                          onClick={() => {
                            const updated = [...quizQuestions, { ...q }];
                            updateMf("quizQuestions", updated);
                            setQuizEditIdx(updated.length - 1);
                          }}
                          style={{
                            flexShrink: 0, padding: "2px 10px", borderRadius: 6, border: "none",
                            background: "rgba(158,126,97,0.18)", fontFamily: CURSIVE, fontSize: 15,
                            fontWeight: 700, color: WARM, cursor: "pointer", lineHeight: "22px",
                          }}>+</button>
                      )}
                      {alreadyAdded && <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.45)", flexShrink: 0 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowQuizLibrary(true)}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 10, marginBottom: 10,
                border: "1.5px solid rgba(158,126,97,0.30)",
                background: "rgba(158,126,97,0.05)", cursor: "pointer",
                fontFamily: CURSIVE, fontSize: 14, color: WARM,
              }}>
              💕 Browse 30 cute question templates
            </button>
          )}

          {quizQuestions.length < 10 && (
            <button
              onClick={addQuizQuestion}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 10, marginBottom: 16,
                border: "1.5px dashed rgba(158,126,97,0.40)",
                background: "rgba(158,126,97,0.04)", cursor: "pointer",
                fontFamily: CURSIVE, fontSize: 14, color: "rgba(108,74,46,0.65)",
              }}>
              + Create custom question ({quizQuestions.length}/10)
            </button>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {ghostBtn("← Back", () => setManualStep(4))}
            {primaryBtn("Next →", () => setManualStep(6))}
          </div>
        </div>
      </div>
    );

    // Step 6: Truth & Dare
    if (manualStep === 6) {
      const selectedTruths = truthDareQuestions.filter((q) => q.type === "truth");
      const selectedDares = truthDareQuestions.filter((q) => q.type === "dare");

      return (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setEditMode(null)}>
          <div style={sheet}>
            {hdr("Truth & Dare 💕")}
            {progressBar}
            <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(130,95,65)", marginBottom: 14, lineHeight: 1.5 }}>
              Pick questions from the library or add your own. These mix with defaults in the game.
            </p>

            {/* Tab toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["truth", "dare"] as const).map((t) => (
                <button key={t} onClick={() => { setTdTab(t); setShowCustomInput(false); }}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 50,
                    border: tdTab === t ? "1.5px solid rgba(158,126,97,0.55)" : "1px solid rgba(158,126,97,0.25)",
                    background: tdTab === t ? "rgba(158,126,97,0.12)" : "transparent",
                    fontFamily: CURSIVE, fontSize: 14, fontWeight: tdTab === t ? 700 : 400,
                    color: tdTab === t ? WARM : "rgba(108,74,46,0.55)", cursor: "pointer",
                  }}>
                  {t === "truth" ? `💭 Truth (${selectedTruths.length})` : `🎯 Dare (${selectedDares.length})`}
                </button>
              ))}
            </div>

            {/* Selected items for current tab */}
            {(tdTab === "truth" ? selectedTruths : selectedDares).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.55)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Selected ({tdTab === "truth" ? selectedTruths.length : selectedDares.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(tdTab === "truth" ? selectedTruths : selectedDares).map((q) => (
                    <div key={q.text} style={{
                      borderRadius: 10,
                      background: tdTab === "truth" ? "rgba(140,100,180,0.09)" : "rgba(200,130,60,0.09)",
                      border: tdTab === "truth" ? "1px solid rgba(140,100,180,0.22)" : "1px solid rgba(200,130,60,0.22)",
                      overflow: "hidden",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px" }}>
                        <span style={{ fontFamily: CURSIVE, fontSize: 13, color: WARM, flex: 1, lineHeight: 1.4 }}>{q.text}</span>
                        <button onClick={() => removeTdItem(q.text)} style={{
                          border: "none", background: "transparent", cursor: "pointer",
                          fontFamily: CURSIVE, fontSize: 14, color: "rgba(180,60,50,0.7)", flexShrink: 0, lineHeight: 1,
                        }}>×</button>
                      </div>
                      {/* Media attachments for dares */}
                      {tdTab === "dare" && (
                        <div style={{ padding: "0 12px 10px", display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                          {/* Photo attachment */}
                          {q.photoUrl ? (
                            <div style={{ position: "relative", display: "inline-flex" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={q.photoUrl} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
                              <button onClick={() => updateTdItem(q.text, { photoUrl: "" })} style={{
                                position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
                                background: "rgba(180,60,50,0.85)", border: "none", cursor: "pointer",
                                fontFamily: CURSIVE, fontSize: 10, color: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                              }}>×</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setDareMediaTarget(q.text); darePhotoRef.current?.click(); }}
                              style={{
                                padding: "4px 10px", borderRadius: 6,
                                border: "1px dashed rgba(200,130,60,0.40)",
                                background: "rgba(200,130,60,0.06)", cursor: "pointer",
                                fontFamily: CURSIVE, fontSize: 11, color: "rgb(160,90,30)",
                              }}>📸 Add photo</button>
                          )}
                          {/* Audio attachment */}
                          {q.audioUrl ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <audio controls src={q.audioUrl} style={{ height: 28, maxWidth: 140 }} />
                              <button onClick={() => updateTdItem(q.text, { audioUrl: "" })} style={{
                                border: "none", background: "transparent", cursor: "pointer",
                                fontFamily: CURSIVE, fontSize: 13, color: "rgba(180,60,50,0.7)",
                              }}>×</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setDareMediaTarget(q.text); dareAudioRef.current?.click(); }}
                              style={{
                                padding: "4px 10px", borderRadius: 6,
                                border: "1px dashed rgba(200,130,60,0.40)",
                                background: "rgba(200,130,60,0.06)", cursor: "pointer",
                                fontFamily: CURSIVE, fontSize: 11, color: "rgb(160,90,30)",
                              }}>🎤 Add audio</button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden file inputs for dare media */}
            <input
              ref={darePhotoRef}
              type="file" accept="image/*" style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f && dareMediaTarget) {
                  const b64 = await compressToBase64(f);
                  updateTdItem(dareMediaTarget, { photoUrl: b64 });
                  setDareMediaTarget(null);
                }
                e.target.value = "";
              }}
            />
            <input
              ref={dareAudioRef}
              type="file" accept="audio/mp3,audio/mpeg,audio/wav,audio/*" style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f && dareMediaTarget) {
                  try {
                    const b64 = await readAudioAsBase64(f);
                    updateTdItem(dareMediaTarget, { audioUrl: b64 });
                  } catch {
                    // ignore (too large)
                  }
                  setDareMediaTarget(null);
                }
                e.target.value = "";
              }}
            />

            {/* Library */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.55)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Library — tap + to add
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
                {currentLibrary.map((text) => {
                  const isSelected = selectedTexts.has(text);
                  return (
                    <div key={text} style={{
                      display: "flex", alignItems: "flex-start", gap: 8,
                      padding: "8px 12px", borderRadius: 10,
                      background: isSelected ? "rgba(158,126,97,0.06)" : "rgba(255,252,246,0.7)",
                      border: `1px solid ${isSelected ? "rgba(158,126,97,0.35)" : "rgba(158,126,97,0.18)"}`,
                      opacity: isSelected ? 0.55 : 1,
                    }}>
                      <span style={{ fontFamily: CURSIVE, fontSize: 13, color: WARM, flex: 1, lineHeight: 1.4 }}>{text}</span>
                      {!isSelected && (
                        <button onClick={() => addTdItem(text, tdTab)} style={{
                          border: "none",
                          background: tdTab === "truth" ? "rgba(140,100,180,0.14)" : "rgba(200,130,60,0.14)",
                          borderRadius: 6, cursor: "pointer",
                          fontFamily: CURSIVE, fontSize: 16, fontWeight: 700,
                          color: tdTab === "truth" ? "rgb(100,60,140)" : "rgb(160,90,30)",
                          padding: "0 8px", lineHeight: "24px", flexShrink: 0,
                        }}>+</button>
                      )}
                      {isSelected && (
                        <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.5)", flexShrink: 0 }}>✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom question input */}
            {showCustomInput ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomTd()}
                  placeholder={`Your custom ${tdTab} question...`}
                  style={{ ...INPUT_STYLE, flex: 1 }}
                  autoFocus
                />
                <button onClick={addCustomTd} disabled={!customInput.trim()} style={{
                  padding: "10px 16px", borderRadius: 8, border: "none",
                  background: customInput.trim() ? "rgba(158,126,97,0.85)" : "rgba(158,126,97,0.25)",
                  fontFamily: CURSIVE, fontSize: 13, color: "#fff", cursor: customInput.trim() ? "pointer" : "not-allowed",
                }}>Add</button>
                <button onClick={() => { setShowCustomInput(false); setCustomInput(""); }} style={{
                  padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(158,126,97,0.3)",
                  background: "transparent", fontFamily: CURSIVE, fontSize: 13, color: WARM, cursor: "pointer",
                }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setShowCustomInput(true)} style={{
                width: "100%", padding: "9px 0", borderRadius: 10, marginBottom: 14,
                border: "1.5px dashed rgba(158,126,97,0.35)",
                background: "rgba(158,126,97,0.03)", cursor: "pointer",
                fontFamily: CURSIVE, fontSize: 13, color: "rgba(108,74,46,0.60)",
              }}>
                + Custom {tdTab === "truth" ? "Truth" : "Dare"}
              </button>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              {ghostBtn("← Back", () => setManualStep(5))}
              {primaryBtn("Next →", () => setManualStep(7))}
            </div>
          </div>
        </div>
      );
    }

    // Step 7: Password + Save
    if (manualStep === 7) return (
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
              {" · "}
              {quizQuestions.length} quiz question{quizQuestions.length !== 1 ? "s" : ""}
              {" · "}
              {truthDareQuestions.length} truth/dare
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
            {ghostBtn("← Back", () => setManualStep(6))}
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
