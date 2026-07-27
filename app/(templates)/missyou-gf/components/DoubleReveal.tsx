"use client";

import { useState } from "react";

const QUESTIONS = [
  { a: "morning cuddles", b: "late-night talks" },
  { a: "beach at sunset", b: "cabin in the snow" },
  { a: "slow dance in the kitchen", b: "long drive with our playlist" },
];

type Pick = "a" | "b" | null;

// Dual "this or that": both sides lock a choice blind, then reveal together —
// match or happy-opposites. A tiny vulnerability game for two.
export default function DoubleReveal() {
  const [idx, setIdx] = useState(0);
  const [mine, setMine] = useState<Pick>(null);
  const [yours, setYours] = useState<Pick>(null);

  const q = QUESTIONS[idx];
  const revealed = mine && yours;
  const match = revealed && mine === yours;

  const next = () => {
    setIdx((i) => (i + 1) % QUESTIONS.length);
    setMine(null);
    setYours(null);
  };

  return (
    <div>
      <p className="mu-serif text-center text-xl italic sm:text-2xl">
        {q.a} <span className="mu-muted">or</span> {q.b}?
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChoiceCard who="my pick" value={mine} onPick={setMine} q={q} revealed={!!revealed} />
        <ChoiceCard who="your pick" value={yours} onPick={setYours} q={q} revealed={!!revealed} />
      </div>

      {revealed && (
        <div className="mu-anim-fade-up mt-6 text-center">
          <p className="mu-script text-3xl mu-rose-deep">{match ? "we matched ♥" : "opposites attract 😉"}</p>
          <button onClick={next} className="mu-serif mt-3 text-sm mu-muted underline">next question</button>
        </div>
      )}
    </div>
  );
}

function ChoiceCard({
  who,
  value,
  onPick,
  q,
  revealed,
}: {
  who: string;
  value: Pick;
  onPick: (v: "a" | "b") => void;
  q: { a: string; b: string };
  revealed: boolean;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--mu-paper)", border: "1px solid var(--mu-paper-edge)" }}>
      <p className="text-xs uppercase tracking-widest mu-muted">{who}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["a", "b"] as const).map((k) => {
          const active = value === k;
          return (
            <button
              key={k}
              onClick={() => onPick(k)}
              className="mu-serif rounded-xl px-3 py-3 text-sm transition"
              style={
                active
                  ? { background: "linear-gradient(135deg,var(--mu-rose),var(--mu-rose-deep))", color: "#fff" }
                  : { background: "var(--mu-blush)", color: "var(--mu-ink)" }
              }
            >
              {value === null || active || revealed ? q[k] : "•••"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
