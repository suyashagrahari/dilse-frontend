"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/strapi";

export default function FAQAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <section className="mt-14">
      <h2 className="mb-5 text-2xl" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#2a0a0e" }}>
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={faq.id ?? i}
              className="overflow-hidden rounded-xl"
              style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(61,12,17,0.12)" }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-semibold" style={{ color: "#2a0a0e" }}>
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  style={{ color: "#9a3324", transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: "rgba(42,10,14,0.8)" }}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
