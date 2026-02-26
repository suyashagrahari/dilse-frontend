"use client";

import { memo, useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Users, X, Sparkles, Heart } from "lucide-react";
import type { WeddingData, FamilyInfo } from "./types";
import { GLASS_CARD, GLASS_STRONG } from "./styles";

interface Props {
  data: WeddingData;
}

const BRIDE_FALLBACK_PHOTO = "/assets/couple1.jpeg";
const GROOM_FALLBACK_PHOTO = "/assets/couple2.jpeg";

const SHLOKAS = [
  "सप्तपदी — सात फेरों का बंधन, सात जन्मों का वचन",
  "गृहलक्ष्मी — गृह की शोभा, प्रेम की ज्योति",
];

const MODAL_OVERLAY: React.CSSProperties = {
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const GLOSSY_CARD: React.CSSProperties = {
  background:
    "linear-gradient(145deg, var(--wed-glass-strong) 0%, var(--wed-glass) 50%, var(--wed-glass-strong) 100%)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "1px solid var(--wed-glass-border)",
  boxShadow:
    "0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 80px var(--wed-gold-glow)",
};

function FamilyModal({
  family,
  person,
  shloka,
  onClose,
}: {
  family: FamilyInfo;
  person: WeddingData["bride"];
  shloka: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={MODAL_OVERLAY}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-3xl p-6 overflow-hidden"
        style={GLOSSY_CARD}
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 40 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)",
          }}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full z-10 transition-all active:scale-90"
          style={GLASS_CARD}
        >
          <X size={14} style={{ color: "hsl(var(--wed-muted-fg))" }} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div
              className="w-20 h-20 rounded-full overflow-hidden relative z-10"
              style={{ border: "2px solid var(--wed-glass-border)" }}
            >
              <Image
                src={person.photo || (person.role === "The Groom" ? GROOM_FALLBACK_PHOTO : BRIDE_FALLBACK_PHOTO)}
                alt={person.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div
              className="absolute inset-[-4px] rounded-full"
              style={{
                border: "1px solid var(--wed-glass-border)",
                animation: "wed-rotate-slow 15s linear infinite",
              }}
            />
          </div>

          <h3
            className="text-lg mb-0.5"
            style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
          >
            {person.name}
          </h3>
          <p
            className="text-xs italic mb-4"
            style={{ color: "var(--wed-accent-gold)", fontFamily: "'Cormorant Garamond', serif" }}
          >
            {person.role}
          </p>

          <div className="w-full rounded-2xl p-5" style={GLASS_CARD}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={11} style={{ color: "var(--wed-accent-gold)" }} />
              <p
                className="text-[11px] tracking-[0.3em] uppercase font-medium"
                style={{ color: "var(--wed-accent-gold)" }}
              >
                {family.title}
              </p>
              <Sparkles size={11} style={{ color: "var(--wed-accent-gold)" }} />
            </div>

            <div
              className="flex items-center justify-center gap-2 mb-2"
              style={{ color: "hsl(var(--wed-muted-fg))" }}
            >
              <div className="h-px w-10" style={{ background: "var(--wed-glass-border)" }} />
              <Heart size={10} style={{ color: "var(--wed-accent-gold)" }} fill="currentColor" />
              <div className="h-px w-10" style={{ background: "var(--wed-glass-border)" }} />
            </div>

            <p
              className="text-base font-medium mb-1"
              style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Cormorant Garamond', serif" }}
            >
              {family.parents}
            </p>
            <p className="text-xs" style={{ color: "hsl(var(--wed-muted-fg))" }}>
              {family.grandparents}
            </p>
          </div>

          <div className="w-full mt-4 pt-4" style={{ borderTop: "1px solid var(--wed-glass-border)" }}>
            <p
              className="text-xs italic leading-relaxed"
              style={{
                color: "var(--wed-accent-gold)",
                opacity: 0.8,
                fontFamily: "'Noto Serif Devanagari', serif",
              }}
            >
              &ldquo;{shloka}&rdquo;
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MobileProfileCard({
  person,
  family,
  shloka,
  delay,
}: {
  person: WeddingData["bride"];
  family: FamilyInfo;
  shloka: string;
  delay: number;
}) {
  const [showFamily, setShowFamily] = useState(false);
  const open = useCallback(() => setShowFamily(true), []);
  const close = useCallback(() => setShowFamily(false), []);

  return (
    <>
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
      >
        <div className="relative mb-4">
          <div
            className="w-32 h-32 rounded-full overflow-hidden relative z-10"
            style={{ border: "2px solid var(--wed-glass-border)" }}
          >
            <Image
              src={person.photo || (person.role === "The Groom" ? GROOM_FALLBACK_PHOTO : BRIDE_FALLBACK_PHOTO)}
              alt={person.name}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <div
            className="absolute inset-[-5px] rounded-full"
            style={{
              border: "1px solid var(--wed-glass-border)",
              animation: "wed-rotate-slow 20s linear infinite",
            }}
          />
        </div>

        <h3
          className="text-xl mb-0.5"
          style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
        >
          {person.name}
        </h3>
        <p
          className="text-sm italic mb-2"
          style={{ color: "var(--wed-accent-gold)", fontFamily: "'Cormorant Garamond', serif" }}
        >
          {person.role}
        </p>
        <p className="text-xs leading-relaxed max-w-[260px] mb-3" style={{ color: "hsl(var(--wed-muted-fg))" }}>
          {person.description}
        </p>

        <div className="flex items-center gap-2 mb-3 text-[10px]" style={{ color: "hsl(var(--wed-muted-fg))" }}>
          {person.tags.map((tag) => (
            <span
              key={tag.label}
              className="px-2.5 py-1 rounded-full"
              style={GLASS_CARD}
            >
              {tag.emoji} {tag.label}
            </span>
          ))}
        </div>

        <button
          onClick={open}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all active:scale-95"
          style={{
            ...GLASS_STRONG,
            color: "var(--wed-accent-gold)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2), 0 0 30px var(--wed-gold-glow)",
          }}
        >
          <Users size={12} />
          {family.title}
        </button>
      </motion.div>

      <AnimatePresence>
        {showFamily && (
          <FamilyModal family={family} person={person} shloka={shloka} onClose={close} />
        )}
      </AnimatePresence>
    </>
  );
}

function DesktopProfileCard({
  person,
  delay,
  direction,
}: {
  person: WeddingData["bride"];
  delay: number;
  direction: "left" | "right";
}) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, x: direction === "left" ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay }}
    >
      <div className="relative mb-6">
        <div
          className="w-56 h-56 rounded-full overflow-hidden relative z-10"
          style={{ border: "2px solid var(--wed-glass-border)" }}
        >
          <Image
            src={person.photo || (person.role === "The Groom" ? GROOM_FALLBACK_PHOTO : BRIDE_FALLBACK_PHOTO)}
            alt={person.name}
            fill
            className="object-cover"
            sizes="224px"
          />
        </div>
        <div
          className="absolute inset-[-6px] rounded-full"
          style={{ border: "1px solid var(--wed-glass-border)", animation: "wed-rotate-slow 20s linear infinite" }}
        />
        <div
          className="absolute inset-[-12px] rounded-full"
          style={{ border: "1px solid var(--wed-glass-border)", animation: "wed-rotate-slow 30s linear infinite reverse", opacity: 0.5 }}
        />
      </div>
      <h3 className="text-3xl mb-1" style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}>
        {person.name}
      </h3>
      <p className="text-lg italic mb-3" style={{ color: "var(--wed-accent-gold)", fontFamily: "'Cormorant Garamond', serif" }}>
        {person.role}
      </p>
      <p className="text-sm max-w-xs leading-relaxed" style={{ color: "hsl(var(--wed-muted-fg))" }}>
        {person.description}
      </p>
      <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: "hsl(var(--wed-muted-fg))" }}>
        {person.tags.map((tag) => (
          <span key={tag.label} className="px-3 py-1.5 rounded-full" style={GLASS_CARD}>
            {tag.emoji} {tag.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

const CoupleSection = memo(function CoupleSection({ data }: Props) {
  const families = useMemo(
    () => [
      { ...data.brideFamily, delay: 0.6 },
      { ...data.groomFamily, delay: 0.8 },
    ],
    [data.brideFamily, data.groomFamily],
  );

  return (
    <section className="min-h-[calc(100vh-5rem)] lg:min-h-screen relative flex items-center py-8 lg:py-12 px-4 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.p
          className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-center mb-6 lg:mb-8"
          style={{ color: "var(--wed-accent-gold)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          The Couple
        </motion.p>

        {/* --- MOBILE: compact single-page layout --- */}
        <div className="lg:hidden">
          <div className="space-y-8">
            <MobileProfileCard person={data.bride} family={data.brideFamily} shloka={SHLOKAS[0]} delay={0.15} />

            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <div className="h-px flex-1 max-w-[60px]" style={{ background: "var(--wed-glass-border)" }} />
              <span className="text-2xl" style={{ color: "var(--wed-accent-gold)" }}>∞</span>
              <div className="h-px flex-1 max-w-[60px]" style={{ background: "var(--wed-glass-border)" }} />
            </motion.div>

            <MobileProfileCard person={data.groom} family={data.groomFamily} shloka={SHLOKAS[1]} delay={0.3} />
          </div>

          <motion.p
            className="text-center text-sm italic mt-6"
            style={{ color: "hsl(var(--wed-muted-fg))", fontFamily: "'Cormorant Garamond', serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            &quot;Two souls, one story&quot;
          </motion.p>
        </div>

        {/* --- DESKTOP: original two-column layout --- */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-16 items-center">
            <DesktopProfileCard person={data.bride} delay={0.2} direction="left" />
            <DesktopProfileCard person={data.groom} delay={0.4} direction="right" />
          </div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-3xl mb-2" style={{ color: "var(--wed-accent-gold)" }}>∞</div>
            <p className="text-lg italic" style={{ color: "hsl(var(--wed-muted-fg))", fontFamily: "'Cormorant Garamond', serif" }}>
              &quot;Two souls, one story&quot;
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 mt-12">
            {families.map((fam) => (
              <motion.div
                key={fam.title}
                className="rounded-2xl p-6 text-center"
                style={GLASS_CARD}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fam.delay }}
              >
                <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--wed-accent-gold)" }}>
                  {fam.title}
                </p>
                <p className="text-lg" style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Cormorant Garamond', serif" }}>
                  {fam.parents}
                </p>
                <p className="text-xs mt-1" style={{ color: "hsl(var(--wed-muted-fg))" }}>{fam.grandparents}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default CoupleSection;
