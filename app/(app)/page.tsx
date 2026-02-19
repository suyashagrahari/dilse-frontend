"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Heart,
  Send,
  Palette,
  Star,
  Users,
  Zap,
  ChevronRight,
  Gift,
  Wand2,
  Share2,
  Quote,
} from "lucide-react";
import { templateTypes } from "@/data/template-registry";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HomeData {
  stats: { label: string; value: string; icon: string }[];
  testimonials: { id: number; name: string; text: string; avatar: string; rating: number }[];
  featured: { slug: string; title: string; emoji: string; gradient: string; description: string }[];
}

const iconMap: Record<string, typeof Send> = {
  send: Send,
  palette: Palette,
  users: Users,
  star: Star,
};

const steps = [
  {
    icon: Palette,
    title: "Pick a Template",
    description: "Browse our curated collection of beautiful, occasion-specific templates",
    step: "01",
  },
  {
    icon: Wand2,
    title: "Personalize It",
    description: "Add your heartfelt message, photos, and music to make it truly yours",
    step: "02",
  },
  {
    icon: Share2,
    title: "Share the Love",
    description: "Send your creation instantly with a beautiful shareable link",
    step: "03",
  },
];

function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const numericPart = value.replace(/[^0-9.]/g, "");
    const suffix = value.replace(/[0-9.]/g, "");
    const target = parseFloat(numericPart);

    if (isNaN(target)) {
      setDisplay(value);
      return;
    }

    const startTime = Date.now();
    const durationMs = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target * 10) / 10;

      if (target >= 1) {
        setDisplay(Math.floor(eased * target) + suffix);
      } else {
        setDisplay(current.toFixed(1) + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 7,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function Particle({ index }: { index: number }) {
  const size = 2 + Math.random() * 3;
  const left = Math.random() * 100;
  const animDelay = Math.random() * 5;
  const duration = 4 + Math.random() * 4;

  return (
    <motion.div
      className="absolute rounded-full bg-primary/20 dark:bg-primary/30"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        bottom: -10,
      }}
      animate={{
        y: [0, -600 - Math.random() * 400],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        delay: animDelay,
        repeat: Infinity,
        ease: "easeOut",
      }}
      key={index}
    />
  );
}

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!data?.testimonials.length) return;
    const timer = setInterval(() => {
      setActiveTestimonial((p) => (p + 1) % data.testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [data?.testimonials.length]);

  return (
    <div className="overflow-hidden">
      {/* Floating Theme Toggle */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <ThemeToggle />
      </motion.div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex items-center justify-center px-4 mesh-gradient"
      >
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </div>

        {/* Floating Orbs */}
        <FloatingOrb
          className="w-32 h-32 md:w-48 md:h-48 top-16 -left-8 bg-gradient-to-br from-primary/15 to-accent/10 blur-3xl"
          delay={0}
        />
        <FloatingOrb
          className="w-24 h-24 md:w-36 md:h-36 top-32 right-4 bg-gradient-to-br from-sky/15 to-lavender/10 blur-2xl"
          delay={1.5}
        />
        <FloatingOrb
          className="w-20 h-20 md:w-32 md:h-32 bottom-32 left-12 bg-gradient-to-br from-gold/10 to-coral/10 blur-2xl"
          delay={3}
        />
        <FloatingOrb
          className="w-28 h-28 md:w-40 md:h-40 bottom-20 right-8 bg-gradient-to-br from-rose/10 to-peach/10 blur-3xl"
          delay={2}
        />
        <FloatingOrb
          className="w-16 h-16 md:w-24 md:h-24 top-1/2 left-1/3 bg-gradient-to-br from-mint/10 to-sky/10 blur-xl"
          delay={4}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-primary/20 text-primary text-sm font-semibold mb-8 animate-border-glow">
              <Sparkles size={15} className="animate-pulse-soft" />
              Create & Share Beautiful Wishes
              <ChevronRight size={14} />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6"
          >
            Make Every
            <br />
            <span className="text-gradient glow-text">Moment</span>{" "}
            <span className="relative inline-block">
              Special
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full gradient-hero opacity-60"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Create stunning personalized pages for birthdays, anniversaries,
            apologies, and more. Share your feelings with a{" "}
            <span className="text-foreground font-medium">beautiful link</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <Link href="/templates">
              <motion.div
                className="group gradient-hero text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-elevated hover:shadow-[0_25px_70px_-15px_hsl(350_80%_58%_/_0.35)] transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10">Explore Templates</span>
                <ArrowRight
                  size={20}
                  className="relative z-10 transition-transform group-hover:translate-x-1"
                />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              </motion.div>
            </Link>
            <a href="#how-it-works">
              <motion.div
                className="group glass px-8 py-4 rounded-2xl text-lg font-bold text-foreground hover:bg-card/80 transition-all text-center flex items-center justify-center gap-2 border-border/50"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                How It Works
                <Zap size={18} className="text-gold" />
              </motion.div>
            </a>
          </motion.div>

          {/* Stats Row */}
          {data?.stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-10"
            >
              {data.stats.map((stat) => {
                const Icon = iconMap[stat.icon] || Sparkles;
                return (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg sm:text-xl font-extrabold text-foreground leading-tight">
                        <AnimatedCounter value={stat.value} />
                      </div>
                      <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
            Scroll
          </span>
          <motion.div
            className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 rounded-full bg-primary"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Template Categories Marquee */}
      <section className="py-10 md:py-14 border-b border-border/50">
        <div className="container mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Templates for every occasion
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 px-4"
        >
          {templateTypes.map((type, i) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
            >
              <Link href={`/templates?type=${type.id}`}>
                <motion.div
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-card shadow-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
                  whileHover={{ y: -4, scale: 1.04, boxShadow: "0 20px 40px -10px hsl(350 80% 58% / 0.15)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <span className="font-bold text-foreground">{type.label}</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Templates */}
      {data?.featured && (
        <section className="py-16 md:py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                  Popular
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
                  Featured <span className="text-gradient">Templates</span>
                </h2>
              </div>
              <Link
                href="/templates"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                View All <ArrowRight size={14} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {data.featured.map((item, i) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                >
                  <Link href={`/${item.slug}`}>
                    <motion.div
                      className="group relative bg-card rounded-3xl overflow-hidden shadow-card border border-border/50 hover:border-primary/20 transition-all h-52 sm:h-56 flex flex-col items-center justify-center p-5 text-center"
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500`} />
                      <motion.span
                        className="text-5xl mb-3"
                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.emoji}
                      </motion.span>
                      <h3 className="font-bold text-foreground text-sm mb-1">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {item.description}
                      </p>
                      <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={12} className="text-primary" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <Link
              href="/templates"
              className="sm:hidden flex items-center justify-center gap-1.5 text-sm font-semibold text-primary mt-6 hover:underline underline-offset-4"
            >
              View All Templates <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 relative mesh-gradient">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-14"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Simple & Easy
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              Three simple steps to create something that touches hearts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-7 md:p-8 border border-border/50 hover:border-primary/20 transition-all text-center group h-full"
                    whileHover={{ y: -8, boxShadow: "0 25px 50px -12px hsl(350 80% 58% / 0.15)" }}
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-black shadow-soft">
                      {step.step}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/15 dark:to-accent/15 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon size={28} className="text-primary" />
                    </div>
                    <h3 className="font-extrabold text-lg mb-2 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {data?.testimonials && data.testimonials.length > 0 && (
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="text-center mb-12"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                Loved by thousands
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
                What People <span className="text-gradient">Say</span>
              </h2>
            </motion.div>

            {/* Testimonial Carousel */}
            <div className="max-w-2xl mx-auto">
              <div className="relative min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                    className="bg-card rounded-3xl p-8 md:p-10 shadow-card border border-border/50 text-center relative"
                  >
                    <Quote size={32} className="text-primary/15 absolute top-6 left-6" />
                    <p className="text-foreground text-base md:text-lg leading-relaxed mb-6 relative z-10">
                      &ldquo;{data.testimonials[activeTestimonial].text}&rdquo;
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
                        {data.testimonials[activeTestimonial].avatar}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground text-sm">
                          {data.testimonials[activeTestimonial].name}
                        </p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: data.testimonials[activeTestimonial].rating }).map(
                            (_, j) => (
                              <Star
                                key={j}
                                size={12}
                                className="fill-gold text-gold"
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {data.testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeTestimonial
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Marquee Row */}
            <div className="mt-14 relative">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              <div className="overflow-hidden">
                <motion.div
                  className="flex gap-4 whitespace-nowrap"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                  {[...data.testimonials, ...data.testimonials].map((t, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-card border border-border/50 shadow-sm flex-shrink-0"
                    >
                      <div className="w-7 h-7 rounded-full gradient-warm flex items-center justify-center text-white text-[10px] font-bold">
                        {t.avatar}
                      </div>
                      <span className="text-sm text-foreground font-medium max-w-[200px] truncate">
                        {t.text}
                      </span>
                      <div className="flex gap-0.5 ml-1">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} size={10} className="fill-gold text-gold" />
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            className="relative rounded-[2rem] overflow-hidden"
          >
            <div className="gradient-sunset p-10 md:p-20 text-center relative">
              <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />

              {/* Decorative elements */}
              <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
              <div className="absolute bottom-8 right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
              <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white/5 blur-lg" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Gift size={48} className="text-white/80 mx-auto mb-6" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
                >
                  Ready to Create
                  <br />
                  <span className="font-script font-normal text-4xl sm:text-5xl md:text-6xl">
                    Something Beautiful?
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-white/80 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed"
                >
                  Pick a template, pour your heart into it, and share it with
                  someone who means the world to you.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/templates">
                    <motion.div
                      className="group inline-flex items-center gap-3 bg-white dark:bg-card text-foreground px-9 py-5 rounded-2xl text-lg font-bold shadow-elevated transition-all"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Start Creating Now
                      <Heart
                        size={20}
                        className="text-primary fill-primary group-hover:scale-125 transition-transform"
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container text-center">
          <p className="text-muted-foreground text-sm">
            Made with{" "}
            <Heart size={12} className="inline text-primary fill-primary" />{" "}
            for people who care
          </p>
        </div>
      </footer>

      {/* Bottom spacing for nav */}
      <div className="h-4" />
    </div>
  );
}
