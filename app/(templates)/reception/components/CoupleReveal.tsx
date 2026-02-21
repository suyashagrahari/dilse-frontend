"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import type { ReceptionData, PersonInfo } from "./types";
import { REC_GLASS, REC_CARD } from "./styles";

interface Props {
  data: ReceptionData;
}

function PersonCard({
  person,
  accentColor,
  glowVar,
  delay,
  families,
}: {
  person: PersonInfo;
  accentColor: string;
  glowVar: string;
  delay: number;
  families: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const open = useCallback(() => setShowModal(true), []);
  const close = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [showModal]);

  return (
    <>
      <motion.button
        className="w-full rounded-3xl overflow-hidden relative group text-left"
        style={{
          ...REC_CARD,
          background: "hsl(var(--rec-surface))",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        onClick={open}
      >
        <div className="relative h-52 md:h-64 overflow-hidden">
          <Image src={person.photo} alt={person.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="50vw" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, hsl(var(--rec-surface)) 5%, transparent 60%)` }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          />
        </div>

        <div className="p-5 pt-3">
          <p
            className="text-[9px] tracking-[0.4em] uppercase mb-1"
            style={{ color: accentColor }}
          >
            {person.role}
          </p>
          <h3
            className="text-2xl md:text-3xl font-light mb-2"
            style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          >
            {person.name}
          </h3>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "hsl(var(--rec-muted-fg))" }}>
            {person.description}
          </p>

          <div className="flex items-center gap-1.5 mt-3">
            {person.tags.map((tag) => (
              <span
                key={tag.label}
                className="px-2.5 py-1 rounded-lg text-[10px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  color: "hsl(var(--rec-muted-fg))",
                }}
              >
                {tag.emoji} {tag.label}
              </span>
            ))}
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            style={{ background: "rgba(11,15,26,0.8)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="relative w-full max-w-sm rounded-3xl overflow-hidden"
              style={{
                background: "hsl(var(--rec-surface))",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 80px ${glowVar}`,
              }}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={close} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full z-20" style={REC_GLASS}>
                <X size={14} style={{ color: "hsl(var(--rec-muted-fg))" }} />
              </button>

              <div className="relative h-48">
                <Image src={person.photo} alt={person.name} fill className="object-cover" sizes="400px" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, hsl(var(--rec-surface)) 0%, transparent 60%)` }} />
              </div>

              <div className="px-5 pb-5 -mt-8 relative z-10">
                <p className="text-[9px] tracking-[0.4em] uppercase mb-1" style={{ color: accentColor }}>{person.role}</p>
                <h3 className="text-2xl font-light mb-2" style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}>{person.name}</h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "hsl(var(--rec-muted-fg))" }}>{person.description}</p>

                <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-1.5" style={{ color: accentColor }}>Family</p>
                  <p className="text-sm font-light" style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}>{families}</p>
                </div>

                <div className="flex items-center gap-1.5 mt-3">
                  {person.tags.map((tag) => (
                    <span key={tag.label} className="px-2.5 py-1 rounded-lg text-[10px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "hsl(var(--rec-muted-fg))" }}>
                      {tag.emoji} {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const CoupleReveal = memo(function CoupleReveal({ data }: Props) {
  return (
    <section className="min-h-screen relative flex items-center py-10 pt-20 lg:pt-24 px-4 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <motion.div className="text-center mb-10 lg:mb-14" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[9px] md:text-[10px] tracking-[0.6em] uppercase mb-2" style={{ color: "var(--rec-accent)" }}>
            The Couple
          </p>
          <h2
            className="text-3xl md:text-5xl font-light"
            style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          >
            Two souls, one celebration
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <PersonCard
            person={data.bride}
            accentColor="var(--rec-rose)"
            glowVar="var(--rec-rose-glow)"
            delay={0.2}
            families={data.families.bride}
          />
          <PersonCard
            person={data.groom}
            accentColor="var(--rec-sage)"
            glowVar="var(--rec-sage-glow)"
            delay={0.35}
            families={data.families.groom}
          />
        </div>
      </div>
    </section>
  );
});

export default CoupleReveal;
