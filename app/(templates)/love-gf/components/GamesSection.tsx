"use client";

import { memo, useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RotateCcw, Shuffle } from "lucide-react";
import type { ContentData, QuizQuestion } from "./types";

const QUIZ_POOL: QuizQuestion[] = [
  { question: "What's their favorite thing about you?", options: ["Your smile 😊", "Your laugh 😄", "Your kindness 💗", "Your eyes 👀"], correct: 0 },
  { question: "Where is your dream date?", options: ["Paris 🗼", "Bali 🌴", "Maldives 🏖️", "Local cafe ☕"], correct: 2 },
  { question: "What's the most romantic thing they did?", options: ["Surprise visit 🚗", "Love letter 💌", "Cooked dinner 🍝", "Star walk 🌟"], correct: 1 },
  { question: "What's their love language?", options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service"], correct: 1 },
  { question: "What's their favorite season?", options: ["Spring 🌸", "Summer ☀️", "Autumn 🍂", "Winter ❄️"], correct: 0 },
  { question: "Who said 'I love you' first?", options: ["I did! 🙋", "They did 🥰", "We both did! 💕", "Still waiting 😅"], correct: 0 },
  { question: "What's their comfort food?", options: ["Pizza 🍕", "Ice cream 🍦", "Chocolate 🍫", "Home cooking 🥘"], correct: 3 },
  { question: "What do they do when stressed?", options: ["Listen to music 🎵", "Take a walk 🚶", "Talk to you 💬", "Sleep it off 😴"], correct: 2 },
  { question: "What's their hidden talent?", options: ["Singing 🎤", "Cooking 👩‍🍳", "Dancing 💃", "Making you laugh 😂"], correct: 3 },
  { question: "What's their favorite movie genre?", options: ["Romance 💕", "Comedy 😂", "Action 💥", "Thriller 🔍"], correct: 0 },
  { question: "What do they like most about weekends?", options: ["Sleeping in 😴", "Date time 💕", "Lazy mornings ☕", "Adventures 🏔️"], correct: 1 },
  { question: "What's their zodiac sign?", options: ["Fire sign ♈", "Earth sign ♉", "Air sign ♊", "Water sign ♋"], correct: 0 },
  { question: "What's their favorite flower?", options: ["Roses 🌹", "Sunflowers 🌻", "Tulips 🌷", "Lilies 🌺"], correct: 0 },
  { question: "How do they show love?", options: ["Hugs & kisses 🤗", "Thoughtful gifts 🎁", "Cooking for you 🍳", "Sweet texts 💌"], correct: 0 },
  { question: "What's their favorite holiday?", options: ["Valentine's Day 💕", "Christmas 🎄", "New Year's 🎆", "Their birthday 🎂"], correct: 0 },
  { question: "What makes them laugh the most?", options: ["Your jokes 😂", "Memes 📱", "Funny movies 🎬", "Inside jokes 🤭"], correct: 3 },
  { question: "What's their ideal vacation?", options: ["Beach resort 🏖️", "Mountain cabin 🏔️", "City exploring 🌆", "Road trip 🚗"], correct: 0 },
  { question: "What's their morning routine like?", options: ["Early bird ☀️", "Snooze master 😴", "Coffee first ☕", "Phone check 📱"], correct: 2 },
  { question: "What nickname do they call you?", options: ["Baby 👶", "Honey 🍯", "Love 💕", "Something unique ✨"], correct: 3 },
  { question: "What's their pet peeve?", options: ["Being late ⏰", "Messy rooms 🧹", "Loud chewing 😤", "Ignored texts 📵"], correct: 3 },
  { question: "What's their favorite dessert?", options: ["Cake 🎂", "Ice cream 🍨", "Cookies 🍪", "Tiramisu ☕"], correct: 1 },
  { question: "What would be their superpower?", options: ["Time travel ⏳", "Mind reading 🧠", "Teleportation 🌀", "Invisibility 👻"], correct: 2 },
  { question: "What song reminds them of you?", options: ["Perfect ✨", "All of Me 🎹", "Thinking Out Loud 🎸", "A Thousand Years 🕊️"], correct: 0 },
  { question: "What's their biggest dream?", options: ["Travel world 🌍", "Start business 💼", "Happy family 👨‍👩‍👧", "Creative career 🎨"], correct: 2 },
  { question: "What do they value most?", options: ["Honesty 💎", "Loyalty 🤝", "Humor 😄", "Kindness 💗"], correct: 1 },
  { question: "What's their go-to drink?", options: ["Coffee ☕", "Tea 🍵", "Bubble tea 🧋", "Smoothie 🥤"], correct: 2 },
  { question: "What would they do with a free day?", options: ["Netflix binge 📺", "Outdoor adventure 🏕️", "Spa day 💆", "Cook together 👨‍🍳"], correct: 3 },
  { question: "First thing they notice about someone?", options: ["Smile 😊", "Eyes 👀", "Personality 💫", "Style 👗"], correct: 0 },
  { question: "Their dream dinner guest?", options: ["Celebrity crush 🌟", "Historical figure 📚", "Fictional character 🧙", "Future self 🔮"], correct: 3 },
  { question: "How they handle disagreements?", options: ["Talk it out 🗣️", "Give space first 🌿", "Write feelings down ✍️", "Hug it out 🤗"], correct: 0 },
];

const CORRECT_MSGS = [
  "You know me so well! 💕", "Are you reading my mind? ✨", "Perfect match! 💗",
  "You really pay attention! 🥰", "Soulmate energy! 💫", "That's exactly right! 🎯",
  "You truly get me! 💖", "We're so in sync! 🦋", "Love that you know this! 💕",
  "Mind = Blown! You nailed it! ⭐",
];

const WRONG_MSGS = [
  "Close but not quite! Let's try again 😘", "Someone needs a study date! 💌",
  "Aww, we need more pillow talks! 🛋️", "Guess we need another date night! 🌙",
  "Love isn't about perfection! 💕", "That was a tricky one! 🤭",
  "Time for more quality time! ☕", "Don't worry, I still love you! 💗",
  "Good guess though! Keep trying! ✨", "Let me tell you all about it tonight 🥰",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function LoveQuiz({ questions: customQs }: { questions: QuizQuestion[] }) {
  const [sessionQs, setSessionQs] = useState<QuizQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const pool = customQs.length >= 10 ? customQs : QUIZ_POOL;
    setSessionQs(pickRandom(pool, 10));
  }, [customQs]);

  const q = sessionQs[step];

  const handleAnswer = useCallback((i: number) => {
    if (selected !== null || !q) return;
    setSelected(i);
    const isCorrect = i === q.correct;
    if (isCorrect) { setScore((s) => s + 1); setFeedback(CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)]); }
    else { setFeedback(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)]); }
    setTimeout(() => {
      setFeedback("");
      if (step + 1 < sessionQs.length) { setStep((s) => s + 1); setSelected(null); }
      else setDone(true);
    }, 1500);
  }, [selected, q, step, sessionQs.length]);

  const restart = () => {
    setSessionQs(pickRandom(QUIZ_POOL, 10));
    setStep(0); setScore(0); setSelected(null); setDone(false); setFeedback("");
  };

  if (!q) return null;

  if (done) {
    const pct = score / sessionQs.length;
    const emoji = pct === 1 ? "👑" : pct >= 0.7 ? "💕" : pct >= 0.4 ? "💖" : "💝";
    const msg = pct === 1 ? "PERFECT! You know each other inside out!" : pct >= 0.7 ? "Amazing! You two are soulmates!" : pct >= 0.4 ? "Pretty good! More date nights coming!" : "Time for some heart-to-hearts! 💌";
    return (
      <div className="text-center py-5">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl inline-block mb-2">{emoji}</motion.span>
        <h3 className="text-lg font-bold text-foreground">{score}/{sessionQs.length}</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-5">{msg}</p>
        <button onClick={restart} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-semibold active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, hsl(338 80% 60%), hsl(350 85% 55%))" }}>
          <RotateCcw size={13} /> New Round 💕
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] lg:text-xs text-muted-foreground font-medium">Question {step + 1} of {sessionQs.length}</span>
        <span className="text-[10px] lg:text-xs text-muted-foreground flex items-center gap-1"><Heart size={9} className="fill-pink-500 text-pink-500" />{score}</span>
      </div>
      <div className="flex gap-0.5 mb-4 lg:mb-5">
        {sessionQs.map((_, i) => (
          <div key={i} className={`h-1 lg:h-1.5 flex-1 rounded-full transition-all ${i < step ? "bg-pink-500" : i === step ? "bg-pink-300" : "bg-muted"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
          <p className="text-sm lg:text-lg font-semibold text-foreground mb-4 lg:mb-5">{q.question}</p>
          <div className="grid grid-cols-2 gap-2 lg:gap-3">
            {q.options.map((opt, i) => (
              <motion.button key={i} whileTap={{ scale: 0.96 }} onClick={() => handleAnswer(i)}
                className={`p-2.5 lg:p-4 rounded-xl text-xs lg:text-sm font-medium text-left border transition-all ${
                  selected === null ? "bg-muted/50 border-border/40 hover:border-pink-300 dark:hover:border-pink-700"
                    : i === q.correct ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-400"
                    : selected === i ? "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-400"
                    : "bg-muted/30 border-border/20 opacity-40"
                }`}>{opt}</motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`text-xs font-medium italic text-center mt-3 ${selected !== null && q && selected === q.correct ? "text-emerald-500" : "text-pink-500"}`}>
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const TRUTHS = [
  "What's your favorite memory of us? 💭", "What made you fall for me? 💕", "What's your biggest dream for us? 🌟",
  "What song reminds you of me? 🎵", "What's one thing you love most about me? 💖", "When did you first know you loved me? 🥰",
  "What's the funniest thing I've done? 😂", "What do you miss most when we're apart? 💔", "What's your favorite date we've had? 🌹",
  "If you could relive one moment with us, which? ✨", "What's your favorite thing I cook? 🍳", "What about me surprised you the most? 🤔",
  "What's the best gift I've given you? 🎁", "Describe me in three words 💕", "What's something you've never told me? 🤫",
];

const DARES = [
  "Send a voice message saying 'I love you'! 🎤", "Change your profile pic to us for a day! 📸",
  "Write me a 3-line poem right now! 📝", "Do your best impression of me! 🎭",
  "Send a virtual hug emoji 5 times! 🤗", "Call me and sing our song! 🎵",
  "Write 5 things you love about me! ✍️", "Post a story tagging me with a heart! 📱",
  "Give me your best pick-up line! 💬", "Record yourself doing a silly dance! 💃",
  "Make me laugh in 10 seconds! 😂", "Text my best friend about how much you love me! 📱",
  "Plan our next date right now! 📅", "Send me the cutest selfie! 🤳", "Recreate our first photo together! 📸",
];

function TruthOrDare() {
  const [mode, setMode] = useState<"truth" | "dare" | null>(null);
  const [card, setCard] = useState("");
  const [used, setUsed] = useState<Set<string>>(new Set());

  const pick = (m: "truth" | "dare") => {
    setMode(m);
    const arr = m === "truth" ? TRUTHS : DARES;
    const available = arr.filter((t) => !used.has(t));
    const pool = available.length > 0 ? available : arr;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setCard(choice);
    setUsed((prev) => new Set(prev).add(choice));
  };

  return (
    <div className="text-center">
      <AnimatePresence mode="wait">
        {card ? (
          <motion.div key={card}
            initial={{ scale: 0.85, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`rounded-2xl border p-5 mb-4 ${mode === "truth" ? "bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800/30" : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30"}`}
          >
            <div className="text-3xl lg:text-4xl mb-2 lg:mb-3">{mode === "truth" ? "💭" : "🎯"}</div>
            <p className="font-semibold text-foreground text-sm lg:text-base">{card}</p>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-border/30 bg-card p-5 lg:p-8 mb-4 flex items-center justify-center min-h-[100px] lg:min-h-[140px]">
            <p className="text-muted-foreground text-xs lg:text-sm">Pick Truth or Dare to start 💕</p>
          </div>
        )}
      </AnimatePresence>
      <div className="flex gap-2 lg:gap-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => pick("truth")}
          className="flex-1 py-2.5 lg:py-3.5 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30 text-violet-600 dark:text-violet-400 font-semibold text-xs lg:text-sm">
          💭 Truth
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => pick("dare")}
          className="flex-1 py-2.5 lg:py-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 font-semibold text-xs lg:text-sm">
          🎯 Dare
        </motion.button>
      </div>
      {used.size > 0 && (
        <button onClick={() => { setUsed(new Set()); setCard(""); setMode(null); }}
          className="mt-3 lg:mt-4 text-[10px] lg:text-xs text-muted-foreground flex items-center gap-1 mx-auto hover:text-foreground">
          <Shuffle size={10} /> Shuffle all
        </button>
      )}
    </div>
  );
}

const GAMES = [
  { id: "quiz", label: "Love Quiz", emoji: "🧠", desc: "10 random questions each round!" },
  { id: "tod", label: "Truth or Dare", emoji: "🎲", desc: "New challenges every time!" },
];

interface Props { data: ContentData; }

export default memo(function GamesSection({ data }: Props) {
  const [activeGame, setActiveGame] = useState("quiz");

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      className="h-screen flex flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-b from-pink-50/40 via-background to-background dark:from-pink-950/10"
    >
      <div className="flex-1 px-4 pt-7 pb-24 lg:pt-10 lg:max-w-5xl lg:mx-auto lg:w-full lg:px-8">
        <div className="text-center mb-5 lg:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-0.5"
            style={{ background: "linear-gradient(135deg, hsl(338 80% 60%), hsl(280 60% 55%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Love Games 🎮
          </h2>
          <p className="text-muted-foreground text-[11px] lg:text-sm">Play together, grow closer</p>
        </div>

        <div className="lg:flex lg:gap-8 lg:items-start">
          {/* Game picker — sidebar on desktop */}
          <div className="grid grid-cols-2 gap-2.5 mb-5 lg:flex lg:flex-col lg:w-56 lg:shrink-0 lg:mb-0 lg:gap-3">
            {GAMES.map((g) => (
              <motion.button key={g.id} whileTap={{ scale: 0.97 }} onClick={() => setActiveGame(g.id)}
                className={`rounded-2xl border p-3.5 lg:p-4 text-left transition-all ${
                  activeGame === g.id ? "bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-800/30" : "bg-card border-border/30 hover:border-pink-200/50 dark:hover:border-pink-800/20"
                }`}>
                <div className="text-xl lg:text-2xl mb-1">{g.emoji}</div>
                <p className="font-semibold text-xs lg:text-sm text-foreground">{g.label}</p>
                <p className="text-[9px] lg:text-xs text-muted-foreground mt-0.5">{g.desc}</p>
              </motion.button>
            ))}
          </div>

          {/* Game content — fills remaining space */}
          <motion.div key={activeGame} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/30 bg-card p-4 lg:p-6 shadow-sm lg:flex-1">
            {activeGame === "quiz" ? <LoveQuiz questions={data.quizQuestions} /> : <TruthOrDare />}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
