"use client";

// ─── Theme picker (editor) ───────────────────────────────────────────────────
//
// One card per theme: a mini mock of the page in that theme's colours, its
// name and vibe. Exactly one is selected; the preview behind the sheet and the
// published page both use it.

import { Check } from "lucide-react";

import type { LoveTheme } from "../theme";

export default function ThemePicker({ themes, value, onChange }: { themes: readonly LoveTheme[]; value: string; onChange: (id: string) => void }) {
  const current = themes.find((t) => t.id === value)?.id ?? themes[0]?.id;
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2.5">
      {themes.map((t) => {
        const on = t.id === current;
        const c = t.colors;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(t.id)}
            className="relative rounded-2xl overflow-hidden text-left border-2 transition-transform active:scale-[.98]"
            style={{ borderColor: on ? c.a1 : "#eadfe4", boxShadow: on ? `0 10px 24px -12px ${c.a1}` : undefined }}
          >
            {/* Mini page mock in the theme's own colours. */}
            <span className="block relative h-[86px]" style={{ background: c.bg }}>
              <span className="absolute left-2.5 top-2.5 h-2 w-16 rounded-full" style={{ background: c.ink, opacity: 0.85 }} />
              <span className="absolute left-2.5 top-6 h-1.5 w-10 rounded-full" style={{ background: c.soft, opacity: 0.8 }} />
              <span className="absolute left-2.5 bottom-2.5 h-5 w-20 rounded-full" style={{ background: `linear-gradient(115deg, ${c.a1}, ${c.a2}, ${c.a3})` }} />
              <span className="absolute right-2.5 top-2.5 h-[60px] w-[46px] rounded-lg" style={{ background: c.paper, transform: "rotate(5deg)", boxShadow: "0 6px 12px rgba(0,0,0,.2)" }} />
              <span className="absolute right-[54px] bottom-2.5 h-4 w-8 rounded-full" style={{ background: c.chip }} />
              <span className="absolute right-2 bottom-1.5 text-lg" aria-hidden>
                {t.emoji}
              </span>
            </span>
            <span className="block px-2.5 py-2 bg-white">
              <span className="block text-[13px] font-bold leading-tight text-foreground">{t.name}</span>
              <span className="block text-[11px] leading-snug text-muted-foreground">{t.vibe}</span>
            </span>
            {on && (
              <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full grid place-items-center text-white" style={{ background: c.a1 }}>
                <Check size={14} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
