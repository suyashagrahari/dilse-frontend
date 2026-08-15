"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { templateList } from "@/data/template-registry";
import { API_URL, IS_NGROK } from "@/lib/config";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HERO_CARDS = [
  {
    id: 1,
    img: "https://cdn.subhsandesh.in/gifts-media/assets/hero-bg.webp",
    icon: "💕",
    phIcon: "ph-bold ph-heart",
    label: "Love",
    title: "Love You Forever",
    desc: "A romantic love page with games, gallery & music to share anytime.",
    href: "/love-gf",
  },
  {
    id: 2,
    img: "https://cdn.subhsandesh.in/gifts-media/assets/Aniversary/aniversary.webp",
    icon: "💍",
    phIcon: "ph-bold ph-rings",
    label: "Anniversary",
    title: "Our Anniversary",
    desc: "Celebrate your love story with interactive timelines & memories.",
    href: "/anniversary-gf",
  },
  {
    id: 3,
    img: "https://cdn.subhsandesh.in/gifts-media/assets/marriage/weeding.webp",
    icon: "👰",
    phIcon: "ph-bold ph-church",
    label: "Wedding",
    title: "Royal Indian Wedding",
    desc: "A luxury digital invitation with events, blessings & RSVP.",
    href: "/wedding-shaadi",
  },
];

const HERO_WORDS = ["Love.", "Forever.", "Eternity."];
const HERO_DESCS = [
  "The world's most advanced platform for creating cinematic, personalized web experiences.",
  "Mark every milestone with interactive timelines, curated galleries, and spatial audio.",
  "Create luxury digital invitations with live events, blessings walls, and cinematic RSVP.",
];

const GALLERY_CARDS = [
  {
    img: "https://cdn.subhsandesh.in/gifts-media/assets/Aniversary/aniversary.webp",
    iconEl: <span className="text-lg">💍</span>,
    label: "Anniversary",
    labelClass: "bg-accent1\\/20 text-accent1 border border-accent1\\/30",
    title: "Our Anniversary",
    desc: "Celebrate your love story with games, gallery & music.",
    href: "/anniversary-gf",
    alt: "Anniversary",
  },
  {
    img: "https://cdn.subhsandesh.in/gifts-media/assets/hero-bg.webp",
    iconEl: <span className="text-lg">💕</span>,
    label: "Love",
    labelClass: "bg-pink-500\\/20 text-pink-300 border border-pink-400\\/30",
    title: "Love You Forever",
    desc: "A romantic love page with interactive stars and timelines.",
    href: "/love-gf",
    alt: "Love",
  },
  {
    img: "https://cdn.subhsandesh.in/gifts-media/assets/marriage/weeding.webp",
    iconEl: <span className="text-lg">👰</span>,
    label: "Wedding",
    labelClass: "bg-amber-500\\/20 text-amber-300 border border-amber-400\\/30",
    title: "Royal Indian Wedding",
    desc: "A luxury digital invitation with events & blessings wall.",
    href: "/wedding-shaadi",
    alt: "Wedding",
  },
  {
    img: "https://cdn.subhsandesh.in/gifts-media/assets/Eid/hero_eid.webp",
    iconEl: <span className="text-lg">🌙</span>,
    label: "Festival",
    labelClass: "bg-yellow-500\\/20 text-yellow-300 border border-yellow-400\\/30",
    title: "Eid Mubarak",
    desc: "A beautiful digital greeting with duas, playlist & blessings.",
    href: "/eid-mubarak",
    alt: "Eid",
  },
  {
    img: "https://cdn.subhsandesh.in/gifts-media/assets/Holi/hero_holi.webp",
    iconEl: <span className="text-lg">🎨</span>,
    label: "Festival",
    labelClass: "bg-pink-500\\/20 text-pink-300 border border-pink-400\\/30",
    title: "Happy Holi",
    desc: "A vibrant Holi digital greeting with colors, playlist & wishes.",
    href: "/holi",
    alt: "Holi",
  },
  {
    img: "https://cdn.subhsandesh.in/gifts-media/assets/Reception/reception.webp",
    iconEl: <span className="text-lg">🥂</span>,
    label: "Wedding",
    labelClass: "bg-amber-500\\/20 text-amber-300 border border-amber-400\\/30",
    title: "Luxury Reception Night",
    desc: "A cinematic, ultra-modern reception invitation with blessings wall.",
    href: "/reception",
    alt: "Reception",
  },
];

// Slugs currently treated as coming soon in templates list.
const FORCE_COMING_SOON_ROUTES = new Set(["/anniversary-gf", "/love-gf"]);
const AVAILABLE_TEMPLATE_ROUTES = new Set(templateList.map((t) => `/${t.slug}`));

const TESTIMONIALS = [
  {
    initials: "AR", name: "Arjun", role: "Anniversary Creator",
    quote: "She cried in the first 20 seconds. The music fade, memory transitions, and timing felt like a movie trailer made just for us.",
    rating: "5.0 • Magic",
  },
  {
    initials: "ZS", name: "Zoya", role: "Wedding Invite Designer",
    quote: "I sent a simple link and it felt premium on every phone. No lag, no broken layout, just pure wow from start to finish.",
    rating: "4.9 • Smooth",
  },
  {
    initials: "KM", name: "Kabir", role: "Personal Story Builder",
    quote: "I used it for an apology page with voice notes and photos. It looked handcrafted, emotional, and surprisingly cinematic.",
    rating: "5.0 • Heartfelt",
  },
  {
    initials: "NV", name: "Naina", role: "Wedding Host",
    quote: "Our wedding invite felt premium and alive. Family members across devices saw the same smooth animations and personalized timeline.",
    rating: "5.0 • Premium",
  },
  {
    initials: "RP", name: "Riya", role: "Birthday Creator",
    quote: "The birthday template looked like a mini cinematic app. The recipient replayed it three times and shared it with friends instantly.",
    rating: "4.9 • Replay",
  },
  {
    initials: "AM", name: "Amaan", role: "Festival Storymaker",
    quote: "I built a festival wish in minutes. The typography, music sync, and transitions delivered exactly the emotional punch I imagined.",
    rating: "5.0 • Delight",
  },
];

const FOOTER_WORDS = ["Unforgettable.", "Legendary.", "Cinematic.", "Magical.", "Eternal."];
const FOOTER_BG_WORDS = ["CREATE", "DREAM", "INSPIRE", "IMAGINE", "DESIGN"];
const GALLERY_MORPH = ["Moment.", "Story.", "Memory.", "Forever.", "Journey.", "Dream."];

const TESTI_CHIPS = ["Anniversary", "Love Letter", "Wedding Invite", "Apology Story", "Birthday Bash", "Festival Wish"];

type PlatformTotals = {
  totalSharedLinks: number;
  totalVisitors: number;
  totalInstalls: number;
};

const DEFAULT_PLATFORM_TOTALS = {
  totalSharedLinks: 10000,
  totalVisitors: 15000,
  totalInstalls: 3000,
};

// ─── Component ───────────────────────────────────────────────────────────────

function HomePage() {
  const router = useRouter();
  const { setTheme: setNextTheme } = useTheme();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [showPreloader, setShowPreloader] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [mobileHeroIndex, setMobileHeroIndex] = useState(0);
  const [footerWordIdx, setFooterWordIdx] = useState(0);
  const [footerBgWordIdx, setFooterBgWordIdx] = useState(0);
  const [galleryMorphIdx, setGalleryMorphIdx] = useState(0);
  const [navHidden, setNavHidden] = useState(false);
  const [metric74, setMetric74] = useState(0);
  const [metric98, setMetric98] = useState(0);
  const [stepsActive, setStepsActive] = useState(-1);
  const [beamWidth, setBeamWidth] = useState("0");
  const [heroPaused, setHeroPaused] = useState(false);
  const [platformTotals, setPlatformTotals] = useState<PlatformTotals>(DEFAULT_PLATFORM_TOTALS);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isBraveBrowser, setIsBraveBrowser] = useState(false);
  const [isChromeBrowser, setIsChromeBrowser] = useState(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const metricsTriggered = useRef(false);
  const stepsTriggered = useRef(false);
  const canvasRunning = useRef(false);
  const canvasRAF = useRef(0);
  const stepsTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const openTemplate = React.useCallback(
    (href: string) => {
      if (!AVAILABLE_TEMPLATE_ROUTES.has(href) || FORCE_COMING_SOON_ROUTES.has(href)) {
        router.push("/templates");
        return;
      }
      router.push(href);
    },
    [router]
  );

  const openManifesto = React.useCallback(() => {
    router.push("/manifesto");
  }, [router]);

  const handleDownloadApp = React.useCallback(async () => {
    if (deferredInstallPrompt) {
      try {
        setIsInstalling(true);
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setDeferredInstallPrompt(null);
        }
      } catch {
        // Fall back to manual steps when prompt invocation fails.
        setShowInstallHelp(true);
      } finally {
        setIsInstalling(false);
      }
      return;
    }

    setShowInstallHelp(true);
  }, [deferredInstallPrompt]);

  const formatStatValue = React.useCallback((value: number) => value.toLocaleString("en-IN"), []);

  const heroStats = [
    { value: formatStatValue(platformTotals.totalSharedLinks), label: "Shared Links" },
    { value: formatStatValue(platformTotals.totalVisitors), label: "Website Visitors" },
    { value: formatStatValue(platformTotals.totalInstalls), label: "App Downloads" },
    { value: "100%", label: "Safe & Secure" },
  ];

  // ── Theme init
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      setNextTheme(stored);
    }
    // No OS preference fallback — default is light
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ── Browser + install prompt detection
  useEffect(() => {
    const ua = navigator.userAgent;
    const chromeLike = /Chrome|CriOS/i.test(ua) && !/Edg|OPR|SamsungBrowser/i.test(ua);
    const safariLike = /Safari/i.test(ua) && !/Chrome|CriOS|Edg|OPR/i.test(ua);
    const iosDevice = /iPhone|iPad|iPod/i.test(ua);

    setIsChromeBrowser(chromeLike);
    setIsSafariBrowser(safariLike);
    setIsIOS(iosDevice);

    const navWithBrave = navigator as Navigator & {
      brave?: { isBrave?: () => Promise<boolean> };
    };

    if (navWithBrave.brave?.isBrave) {
      navWithBrave.brave
        .isBrave()
        .then((value) => setIsBraveBrowser(Boolean(value)))
        .catch(() => setIsBraveBrowser(false));
    }
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setShowInstallHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  // ── Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // ── Platform analytics stats
  useEffect(() => {
    let cancelled = false;

    const fetchPlatformStats = async () => {
      try {
        const headers: Record<string, string> = {};
        if (IS_NGROK) headers["ngrok-skip-browser-warning"] = "true";

        const response = await fetch(`${API_URL}/analytics/overview`, { headers, cache: "no-store" });
        const payload = await response.json();

        if (!response.ok || !payload?.success || !payload?.data?.totals) return;
        if (cancelled) return;

        setPlatformTotals({
          totalSharedLinks: Number(payload.data.totals.totalSharedLinks) || DEFAULT_PLATFORM_TOTALS.totalSharedLinks,
          totalVisitors: Number(payload.data.totals.totalVisitors) || DEFAULT_PLATFORM_TOTALS.totalVisitors,
          totalInstalls: Number(payload.data.totals.totalInstalls) || DEFAULT_PLATFORM_TOTALS.totalInstalls,
        });
      } catch {
        // Keep default seeded values when API is unavailable.
      }
    };

    fetchPlatformStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Preloader
  useEffect(() => {
    let mounted = true;
    let progress = 0;
    const iv = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress > 100) progress = 100;
      if (mounted) setLoaderProgress(progress);
      if (progress === 100) {
        clearInterval(iv);
        setTimeout(() => {
          if (!mounted) return;
          setShowPreloader(false);
          setTimeout(() => {
            document.querySelectorAll(".reveal").forEach((el) => {
              const obs = new IntersectionObserver((entries) => {
                entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); });
              }, { threshold: 0.1 });
              obs.observe(el);
            });
          }, 100);
        }, 400);
      }
    }, 60);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  // ── Hero auto-rotate
  useEffect(() => {
    if (heroPaused) return;
    const iv = setInterval(() => setHeroIndex((p) => (p + 1) % HERO_CARDS.length), 3000);
    return () => clearInterval(iv);
  }, [heroPaused]);

  // ── Mobile hero auto-rotate
  useEffect(() => {
    const iv = setInterval(() => setMobileHeroIndex((p) => (p + 1) % HERO_CARDS.length), 2800);
    return () => clearInterval(iv);
  }, []);

  // ── Gallery morph
  useEffect(() => {
    const iv = setInterval(() => setGalleryMorphIdx((p) => (p + 1) % GALLERY_MORPH.length), 2500);
    return () => clearInterval(iv);
  }, []);

  // ── Footer word rotator
  useEffect(() => {
    const iv = setInterval(() => {
      setFooterWordIdx((p) => {
        const n = (p + 1) % FOOTER_WORDS.length;
        setFooterBgWordIdx(n % FOOTER_BG_WORDS.length);
        return n;
      });
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  // ── Custom cursor
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const c = document.getElementById("cursor");
    const t = document.getElementById("cursor-trail");
    if (!c || !t) return;
    const onMove = (e: MouseEvent) => {
      c.style.left = e.clientX + "px";
      c.style.top = e.clientY + "px";
      setTimeout(() => {
        t.style.left = e.clientX + "px";
        t.style.top = e.clientY + "px";
      }, 80);
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  // ── Nav hide on scroll
  useEffect(() => {
    let lastY = 0;
    const onScroll = () => {
      if (window.innerWidth >= 768) setNavHidden(window.scrollY > lastY && window.scrollY > 100);
      lastY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  // ── Metrics counter on scroll
  useEffect(() => {
    const section = metricsRef.current;
    if (!section) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !metricsTriggered.current) {
        metricsTriggered.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1500, 1);
          const e = 1 - Math.pow(1 - p, 3);
          setMetric74(parseFloat((7.4 * e).toFixed(1)));
          setMetric98(Math.round(98 * e));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.2 });
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // ── Steps beam animation
  useEffect(() => {
    const section = stepsRef.current;
    if (!section) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !stepsTriggered.current) {
        stepsTriggered.current = true;
        const t1 = setTimeout(() => setStepsActive(0), 300);
        const t2 = setTimeout(() => setBeamWidth("50%"), 600);
        const t3 = setTimeout(() => setStepsActive(1), 1200);
        const t4 = setTimeout(() => setBeamWidth("100%"), 1500);
        const t5 = setTimeout(() => setStepsActive(2), 2100);
        stepsTimers.current = [t1, t2, t3, t4, t5];
      } else if (!entries[0].isIntersecting && stepsTriggered.current) {
        stepsTriggered.current = false;
        stepsTimers.current.forEach(clearTimeout);
        setStepsActive(-1);
        setBeamWidth("0");
      }
    }, { threshold: 0.2 });
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // ── Canvas beam
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = metricsRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, t = 0;
    let left: { y: number; s: number }[] = [];
    let right: { y: number; s: number }[] = [];
    const resize = () => {
      w = canvas.width = section.clientWidth;
      h = canvas.height = section.clientHeight;
      left = Array.from({ length: 12 }, () => ({ y: Math.random() * h, s: Math.random() * 0.015 + 0.008 }));
      right = Array.from({ length: 12 }, () => ({ y: Math.random() * h, s: Math.random() * 0.015 + 0.008 }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      if (!canvasRunning.current) return;
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      ctx.lineWidth = 1;
      const ce = dark ? "rgba(57,255,20,0.18)" : "rgba(0,0,0,0.1)";
      const cs = dark ? "rgba(57,255,20,0)" : "rgba(0,0,0,0)";
      const dc = dark ? "#39FF14" : "#111";
      for (let i = 0; i < left.length; i++) {
        const ly = left[i].y + Math.sin(t * left[i].s + i) * 40;
        ctx.beginPath(); ctx.moveTo(0, ly);
        ctx.bezierCurveTo(w * 0.25, ly, w * 0.25, cy, cx - 120, cy);
        const g = ctx.createLinearGradient(0, 0, cx, 0);
        g.addColorStop(0, cs); g.addColorStop(1, ce);
        ctx.strokeStyle = g; ctx.stroke();
      }
      for (let j = 0; j < right.length; j++) {
        const ry = right[j].y + Math.cos(t * right[j].s + j) * 40;
        ctx.beginPath(); ctx.moveTo(w, ry);
        ctx.bezierCurveTo(w * 0.75, ry, w * 0.75, cy, cx + 120, cy);
        const g2 = ctx.createLinearGradient(w, 0, cx, 0);
        g2.addColorStop(0, cs); g2.addColorStop(1, ce);
        ctx.strokeStyle = g2; ctx.stroke();
      }
      ctx.fillStyle = dc;
      ctx.beginPath(); ctx.arc(cx - 120, cy, 2, 0, 6.28); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 120, cy, 2, 0, 6.28); ctx.fill();
      t++;
      canvasRAF.current = requestAnimationFrame(draw);
    };
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { canvasRunning.current = true; draw(); }
      else { canvasRunning.current = false; cancelAnimationFrame(canvasRAF.current); }
    }, { threshold: 0.05 });
    obs.observe(section);
    return () => {
      canvasRunning.current = false;
      cancelAnimationFrame(canvasRAF.current);
      window.removeEventListener("resize", resize);
      obs.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Theme toggle with View Transition
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = theme === "dark" ? "light" : "dark";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vt = (document as any).startViewTransition?.bind(document);
    if (vt) {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
      const maxR = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const trans = vt(() => setTheme(newTheme));
      trans.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`] },
          { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
        );
      });
    } else {
      setTheme(newTheme);
    }
    localStorage.setItem("theme", newTheme);
    setNextTheme(newTheme);
  };

  const galleryDouble = [...GALLERY_CARDS, ...GALLERY_CARDS];
  const testiDouble = [...TESTIMONIALS, ...TESTIMONIALS];

  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Script src="https://unpkg.com/@phosphor-icons/web" strategy="afterInteractive" />

      {/* ── All CSS ─────────────────────────────────── */}
      <style>{`
        :root, [data-theme="light"] {
          --c-bg: 242 241 235;
          --c-surface: 255 255 255;
          --c-accent1: 255 51 102;
          --c-accent2: 79 70 229;
          --c-borderLight: rgba(0,0,0,0.08);
        }
        [data-theme="dark"] {
          --c-bg: 10 10 10;
          --c-surface: 18 18 18;
          --c-accent1: 57 255 20;
          --c-accent2: 0 229 255;
          --c-borderLight: rgba(57,255,20,0.1);
        }
        /* Utility */
        html, body { background-color: rgb(var(--c-bg)); }
        .pg-bg { background-color: rgb(var(--c-bg)); color: #111; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .font-display { font-family: 'Space Grotesk', sans-serif !important; }
        .bg-bg { background-color: rgb(var(--c-bg)); }
        .bg-surface { background-color: rgb(var(--c-surface)); }
        .bg-dark { background-color: #111111; }
        .text-dark { color: #111111; }
        .text-dark\\/50 { color: rgba(17,17,17,0.5); }
        .text-dark\\/55 { color: rgba(17,17,17,0.55); }
        .text-dark\\/60 { color: rgba(17,17,17,0.6); }
        .text-dark\\/70 { color: rgba(17,17,17,0.7); }
        .text-accent1 { color: rgb(var(--c-accent1)); }
        .text-accent2 { color: rgb(var(--c-accent2)); }
        .bg-accent1 { background-color: rgb(var(--c-accent1)); }
        .bg-accent2 { background-color: rgb(var(--c-accent2)); }
        .bg-accent1\\/10 { background-color: rgba(var(--c-accent1),0.1); }
        .bg-accent1\\/20 { background-color: rgba(var(--c-accent1),0.2); }
        .bg-accent1\\/30 { background-color: rgba(var(--c-accent1),0.3); }
        .border-borderLight { border-color: var(--c-borderLight) !important; }
        .border-dark\\/20 { border-color: rgba(17,17,17,0.2); }
        .bg-dark\\/10 { background-color: rgba(17,17,17,0.1); }
        .hover\\:text-accent1:hover { color: rgb(var(--c-accent1)); }
        .hover\\:bg-accent1:hover { background-color: rgb(var(--c-accent1)); }
        .hover\\:border-accent1:hover { border-color: rgb(var(--c-accent1)); }
        @keyframes float-anim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .animate-float { animation: float-anim 6s ease-in-out infinite; }
        /* Meteors */

        /* View Transition */
        ::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
        ::view-transition-old(root) { z-index: 1; }
        ::view-transition-new(root) { z-index: 9999; }
        /* Scrollbar */
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        /* Preloader */
        #preloader { position: fixed; inset: 0; background: rgb(var(--c-bg)); z-index: 10000; display: flex; flex-direction: column; justify-content: flex-end; padding: 4rem; transition: opacity 0.6s ease; }
        #preloader.hide { opacity: 0; pointer-events: none; }
        /* Scroll reveal */
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal.d1 { transition-delay: 0.1s; } .reveal.d2 { transition-delay: 0.2s; }
        .reveal.d3 { transition-delay: 0.3s; } .reveal.d4 { transition-delay: 0.4s; }
        .reveal.from-left { transform: translateX(-40px); } .reveal.from-left.visible { transform: translateX(0); }
        .reveal.from-right { transform: translateX(40px); } .reveal.from-right.visible { transform: translateX(0); }
        .reveal.scale-in { transform: scale(0.9); } .reveal.scale-in.visible { transform: scale(1); }
        /* Mobile */
        .app-carousel { scroll-snap-type: x mandatory; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        .carousel-item { scroll-snap-align: center; }
        .tap-effect:active { transform: scale(0.95); }
        .mobile-app-screen { min-height: calc(100svh - 6.5rem); }
        @media (max-width: 900px) {
          .mobile-home-hero { min-height: auto !important; padding-top: 5.5rem !important; padding-bottom: 0.75rem !important; }
        }
        /* Glass */
        .glass-badge { background: rgba(255,255,255,0.15); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3); }
        /* Bento */
        .bento-box { transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .bento-box:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.06); transform: translateY(-4px); }
        /* Mobile dock */
        .mobile-dock { background: rgba(15,15,15,0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); color: white; }
        /* Gallery marquee */
        @keyframes gallery-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .gallery-track { animation: gallery-marquee 35s linear infinite; }
        .gallery-track:hover { animation-play-state: paused; }
        .gallery-card { transition: transform 0.3s ease; }
        .gallery-card:hover { transform: scale(1.03); z-index: 10; }
        .gallery-card-inner { border-radius: 1.5rem; overflow: hidden; position: relative; }
        .gallery-card:hover img { transform: scale(1.05); }
        .gallery-card img { transition: transform 0.5s ease; }
        .gallery-card-cta { opacity: 0; transition: opacity 0.2s ease; }
        .gallery-card:hover .gallery-card-cta { opacity: 1; }
        /* Gallery morph */
        .gallery-morph-wrap { position: relative; display: inline-block; min-width: 3ch; }
        .gallery-morph-text { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transition: opacity 0.4s ease; }
        .gallery-morph-text.is-active { position: relative; opacity: 1; }
        /* Hero card stack */
        .hero-card-stack { position: relative; width: 100%; aspect-ratio: 4/5; border-radius: 2rem; overflow: hidden; }
        @media (min-width: 1024px) { .hero-card-stack { aspect-ratio: 3/4; } }
        .hero-showcase-card { position: absolute; inset: 0; overflow: hidden; opacity: 0; transition: opacity 0.7s ease; z-index: 0; }
        .hero-showcase-card.is-active { opacity: 1; z-index: 5; }
        .mobile-feature-stack { position: relative; height: 65vh; border-radius: 2rem; overflow: hidden; }
        .mobile-feature-card { position: absolute; inset: 0; opacity: 0; transition: opacity 0.65s ease; z-index: 0; }
        .mobile-feature-card.is-active { opacity: 1; z-index: 2; }
        /* Hero dots */
        .hero-dots { display: flex; gap: 10px; margin-top: 1.5rem; }
        .hero-dot { width: 40px; height: 3px; border-radius: 3px; background: rgba(var(--c-accent1),0.15); overflow: hidden; cursor: pointer; }
        .hero-dot-fill { height: 100%; width: 0; border-radius: 3px; background: rgb(var(--c-accent1)); }
        .hero-dot.is-active .hero-dot-fill { animation: hero-fill 3s linear forwards; }
        .hero-dot.is-done .hero-dot-fill { width: 100%; }
        @keyframes hero-fill { from { width: 0; } to { width: 100%; } }
        /* Ticker strips */
        @keyframes strip-fwd { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes strip-rev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .steps-marquee.is-infinite { animation: strip-fwd 20s linear infinite; width: max-content; will-change: transform; }
        .steps-marquee.is-infinite.rev { animation: strip-rev 20s linear infinite; }
        .steps-strip-word { font-family: 'Space Grotesk', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -0.03em; margin: 0 1rem; white-space: nowrap; font-size: clamp(2.6rem, 8vw, 6rem); color: rgba(17,17,17,0.08); }
        .steps-strip-sep { font-family: 'Space Grotesk', sans-serif; font-weight: 900; margin: 0 1rem; white-space: nowrap; font-size: clamp(2.6rem, 8vw, 6rem); color: rgba(var(--c-accent1),0.18); }
        [data-theme="dark"] .steps-strip-word { color: rgba(232,232,232,0.13); }
        [data-theme="dark"] .steps-strip-sep { color: rgba(57,255,20,0.34); text-shadow: 0 0 8px rgba(57,255,20,0.22); }
        /* Steps beam */
        @keyframes beam-pulse { 0%,100%{box-shadow:0 0 8px rgba(var(--c-accent1),0.6)} 50%{box-shadow:0 0 20px rgba(var(--c-accent1),0.9),0 0 40px rgba(var(--c-accent1),0.3)} }
        @keyframes node-ring { 0%{box-shadow:0 0 0 0 rgba(var(--c-accent1),0.4)} 100%{box-shadow:0 0 0 14px rgba(var(--c-accent1),0)} }
        #steps-beam-fill { background: rgb(var(--c-accent1)); box-shadow: 0 0 12px rgba(var(--c-accent1),0.5),0 0 30px rgba(var(--c-accent1),0.15); transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
        #steps-beam-fill::after { content:''; position:absolute; right:-6px; top:50%; width:12px; height:12px; border-radius:50%; background:rgb(var(--c-accent1)); box-shadow:0 0 12px rgba(var(--c-accent1),0.8),0 0 30px rgba(var(--c-accent1),0.4); transform:translateY(-50%); animation:beam-pulse 1.2s ease-in-out infinite; }
        .step-col { position:relative; display:flex; flex-direction:column; align-items:center; }
        .step-node-dot { width:52px; height:52px; border-radius:50%; background:rgb(var(--c-surface)); border:2.5px solid var(--c-borderLight); display:flex; align-items:center; justify-content:center; transition: all 0.5s cubic-bezier(0.16,1,0.3,1); position:relative; z-index:10; flex-shrink:0; }
        .step-node-dot span { font-size:14px; font-weight:900; font-family:'Space Grotesk',sans-serif; color:rgba(var(--c-accent1),0.3); transition:color 0.4s ease; }
        .step-node-dot.active { border-color:rgb(var(--c-accent1)); background:rgb(var(--c-accent1)); box-shadow:0 0 24px rgba(var(--c-accent1),0.5),0 0 60px rgba(var(--c-accent1),0.12); transform:scale(1.1); animation: node-ring 1s ease-out; }
        .step-node-dot.active span { color:#000; }
        .step-connector-v { width:2px; height:28px; flex-shrink:0; background:var(--c-borderLight); transition:background 0.4s ease, box-shadow 0.4s ease; }
        .step-connector-v.active { background:rgb(var(--c-accent1)); box-shadow:0 0 8px rgba(var(--c-accent1),0.3); }
        .step-card-box { opacity:0; transform:translateY(20px) scale(0.97); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); width:100%; }
        .step-card-box.active { opacity:1; transform:translateY(0) scale(1); }
        [data-theme="dark"] .step-node-dot { background:rgb(var(--c-surface)); }
        [data-theme="dark"] .step-node-dot.active { background:#39FF14; border-color:#39FF14; }
        [data-theme="dark"] .step-node-dot.active span { color:#000; }
        /* Steps bg word + cross */
        .steps-bg-word { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); font-family: 'Space Grotesk',sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -0.04em; line-height: 0.82; font-size: clamp(6rem, 24vw, 22rem); color: rgba(0,0,0,0.03); white-space: nowrap; user-select: none; pointer-events: none; z-index: 0; }
        [data-theme="dark"] .steps-bg-word { color: rgba(255,255,255,0.03); }
        .steps-cross-wrap { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .steps-cross-line { position: absolute; left: 50%; top: 50%; width: 180vw; height: 2px; transform-origin: center center; background: linear-gradient(90deg, transparent 0%, rgba(var(--c-accent1),0.08) 25%, rgba(var(--c-accent1),0.08) 75%, transparent 100%); }
        .steps-cross-line::before { content: ''; position: absolute; top: 50%; width: 120px; height: 2px; transform: translateY(-50%); background: linear-gradient(90deg, transparent 0%, rgba(var(--c-accent1),0.95) 55%, transparent 100%); box-shadow: 0 0 20px rgba(var(--c-accent1),0.45); }
        .steps-cross-line.a { transform: translate(-50%,-50%) rotate(22deg); }
        .steps-cross-line.b { transform: translate(-50%,-50%) rotate(-22deg); }
        .steps-cross-line.a::before { animation: steps-cross-a 4.8s linear infinite; }
        .steps-cross-line.b::before { animation: steps-cross-b 4.8s linear infinite; }
        @keyframes steps-cross-a { 0% { left: 105%; } 100% { left: -15%; } }
        @keyframes steps-cross-b { 0% { left: -15%; } 100% { left: 105%; } }
        /* Testimonials */
        @keyframes testi-ambient-drift { 0%,100%{transform:translate3d(0,0,0) scale(1);opacity:0.2} 50%{transform:translate3d(0,-14px,0) scale(1.08);opacity:0.38} }
        @keyframes testi-template-marquee { 0% { transform: translateX(-33.333%); } 100% { transform: translateX(0); } }
        @keyframes testi-cards-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .testi-ambient { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .testi-ambient::before,.testi-ambient::after { content: ''; position: absolute; width: min(42vw,520px); aspect-ratio: 1; border-radius: 9999px; filter: blur(48px); animation: testi-ambient-drift 8s ease-in-out infinite; }
        .testi-ambient::before { left: -8%; top: -12%; background: radial-gradient(circle, rgba(var(--c-accent1),0.2), rgba(var(--c-accent1),0)); }
        .testi-ambient::after { right: -10%; bottom: -18%; background: radial-gradient(circle, rgba(var(--c-accent2),0.16), rgba(var(--c-accent2),0)); animation-delay: 1.2s; }
        .testi-templates-wrap { overflow: hidden; margin-bottom: 1.6rem; mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
        .testi-templates-track { width: max-content; display: flex; align-items: center; white-space: nowrap; animation: testi-template-marquee 28s linear infinite; will-change: transform; }
        .testi-templates-group { display: flex; align-items: center; gap: 0.8rem; padding-right: 0.8rem; }
        .testi-template-chip { display: inline-flex; align-items: center; gap: 0.55rem; border: 1px solid var(--c-borderLight); border-radius: 9999px; padding: 0.52rem 0.92rem; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 800; color: rgba(17,17,17,0.72); background: rgba(var(--c-surface),0.78); }
        .testi-template-chip i { font-style: normal; color: rgb(var(--c-accent1)); font-size: 0.62rem; }
        .testi-cards-wrap { position: relative; overflow: hidden; z-index: 2; mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
        .testi-cards-wrap::before { content: ''; position: absolute; left: 0; right: 0; top: 20px; height: 2px; background: linear-gradient(90deg, transparent, rgba(var(--c-accent1),0.15), transparent); pointer-events: none; z-index: 1; }
        .testi-cards-track { position: relative; z-index: 2; width: max-content; display: flex; align-items: stretch; gap: 1rem; animation: testi-cards-marquee 34s linear infinite; will-change: transform; padding: 0.2rem 0 0.8rem; }
        .testi-cards-track:hover { animation-play-state: paused; }
        .testi-cards-track .testi-card { width: min(88vw,390px); flex-shrink: 0; }
        @media (min-width: 900px) { .testi-cards-track .testi-card { width: 360px; } }
        .testi-card { border: 1px solid var(--c-borderLight); border-radius: 1.5rem; background: rgba(var(--c-surface),0.88); backdrop-filter: blur(10px); padding: 1.25rem; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.45s ease; box-shadow: 0 8px 28px rgba(0,0,0,0.05); }
        .testi-card:hover { transform: translateY(-7px) scale(1.025); border-color: rgba(var(--c-accent1),0.48); box-shadow: 0 18px 56px rgba(var(--c-accent1),0.18); }
        .testi-quote { font-size: clamp(1.08rem,1.3vw,1.3rem); line-height: 1.75; color: rgba(17,17,17,0.74); margin-bottom: 1rem; min-height: 8.6rem; }
        .testi-meta { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; border-top: 1px solid var(--c-borderLight); padding-top: 0.9rem; }
        .testi-user { display: flex; align-items: center; gap: 0.7rem; }
        .testi-avatar { width: 2.35rem; height: 2.35rem; border-radius: 9999px; display: grid; place-items: center; font-weight: 900; font-size: 0.82rem; color: #000; background: rgb(var(--c-accent1)); box-shadow: 0 0 0 4px rgba(var(--c-accent1),0.14); }
        .testi-name { font-weight: 800; letter-spacing: 0.02em; color: #111; font-size: 0.88rem; text-transform: uppercase; }
        .testi-role { font-size: 0.72rem; color: rgba(17,17,17,0.52); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 0.1rem; }
        .testi-rating { font-size: 0.82rem; letter-spacing: 0.08em; color: rgba(var(--c-accent1),0.92); font-weight: 900; text-transform: uppercase; white-space: nowrap; }
        [data-theme="dark"] .testi-template-chip { border-color: rgba(57,255,20,0.18); color: rgba(232,232,232,0.72); background: rgba(16,16,16,0.82); }
        [data-theme="dark"] .testi-template-chip i { color: #39FF14; }
        [data-theme="dark"] .testi-cards-wrap::before { background: linear-gradient(90deg, transparent, rgba(57,255,20,0.18), transparent); }
        [data-theme="dark"] .testi-card { background: rgba(16,16,16,0.82); border-color: rgba(57,255,20,0.12); box-shadow: 0 8px 28px rgba(0,0,0,0.35); }
        [data-theme="dark"] .testi-card:hover { background: rgba(14,14,14,0.94); border-color: rgba(57,255,20,0.45); box-shadow: 0 16px 52px rgba(57,255,20,0.16); }
        [data-theme="dark"] .testi-quote { color: rgba(232,232,232,0.82); }
        [data-theme="dark"] .testi-name { color: #e9e9e9; }
        [data-theme="dark"] .testi-role { color: rgba(232,232,232,0.52); }
        [data-theme="dark"] .testi-rating { color: #39FF14; }
        [data-theme="dark"] .testi-meta { border-top-color: rgba(57,255,20,0.14); }
        /* Footer rotator */
        .footer-rotator { position: relative; width: 100%; display: flex; align-items: center; justify-content: center; height: 100%; }
        .footer-rotate-word { position: absolute; font-family: 'Space Grotesk',sans-serif; font-weight: 900; font-size: clamp(3.5rem,14vw,11rem); line-height: 0.9; letter-spacing: -0.04em; text-transform: uppercase; color: rgb(var(--c-accent1)); white-space: nowrap; opacity: 0; transition: opacity 0.4s ease; }
        .footer-rotate-word.is-active { position: relative; opacity: 1; }
        /* Theme transitions */
        body, header, section, button, .bento-box, .mobile-dock, nav { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
        /* Dark overrides */
        [data-theme="dark"] body { color: #E0E0E0; }
        [data-theme="dark"] .text-dark { color: #E8E8E8 !important; }
        [data-theme="dark"] .text-dark\\/70 { color: rgba(232,232,232,0.65) !important; }
        [data-theme="dark"] .text-dark\\/60 { color: rgba(232,232,232,0.6) !important; }
        [data-theme="dark"] .text-dark\\/55 { color: rgba(232,232,232,0.55) !important; }
        [data-theme="dark"] .text-dark\\/50 { color: rgba(232,232,232,0.45) !important; }
        [data-theme="dark"] .border-dark\\/20 { border-color: rgba(57,255,20,0.15) !important; }
        [data-theme="dark"] .bg-dark\\/10 { background-color: rgba(57,255,20,0.1) !important; }
        [data-theme="dark"] button.bg-dark { background-color: #39FF14 !important; color: #000 !important; }
        [data-theme="dark"] button.bg-dark:hover { background-color: #fff !important; color: #000 !important; }
        [data-theme="dark"] header .bg-dark:not(button), [data-theme="dark"] span.bg-dark { background-color: #39FF14 !important; color: #000 !important; }
        [data-theme="dark"] #loader-bar { background-color: #39FF14 !important; }
        [data-theme="dark"] .bento-box.bg-dark { background-color: #0E0E0E !important; color: white !important; border-color: rgba(57,255,20,0.1) !important; }
        [data-theme="dark"] #desktop-nav { border-color: rgba(57,255,20,0.08); }
        [data-theme="dark"] #desktop-nav nav { background-color: rgba(18,18,18,0.9); border-color: rgba(57,255,20,0.1); }
        [data-theme="dark"] .mobile-dock { border-color: rgba(57,255,20,0.12); }
        #footer-bg-word { color: rgba(0,0,0,0.1) !important; -webkit-text-stroke: none; }
        [data-theme="dark"] #footer-bg-word { color: rgba(255,255,255,0.07) !important; -webkit-text-stroke: none !important; }
        .theme-toggle { transition: all 0.3s ease; }
        [data-theme="dark"] .theme-toggle { background-color: rgba(57,255,20,0.1) !important; border-color: rgba(57,255,20,0.25) !important; color: #39FF14 !important; }
        /* Custom cursor */
        @media (pointer: fine) {
          body { cursor: none; }
          #cursor { position: fixed; top: 0; left: 0; width: 18px; height: 18px; border-radius: 9999px; background: #ff2d55; box-shadow: 0 0 14px rgba(255,45,85,0.38); pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); transition: width 0.2s ease, height 0.2s ease; }
          #cursor-trail { position: fixed; top: 0; left: 0; width: 50px; height: 50px; border-radius: 9999px; border: 3px solid rgba(255,45,85,0.55); pointer-events: none; z-index: 9997; transform: translate(-50%,-50%); transition: left 0.12s ease, top 0.12s ease, width 0.2s ease, height 0.2s ease; }
          body:has(a:hover) #cursor, body:has(button:hover) #cursor { width: 28px; height: 28px; }
          body:has(a:hover) #cursor-trail, body:has(button:hover) #cursor-trail { width: 82px; height: 82px; }
          [data-theme="dark"] #cursor { background: #39FF14; box-shadow: 0 0 14px rgba(57,255,20,0.45); }
          [data-theme="dark"] #cursor-trail { border-color: rgba(57,255,20,0.65); }
        }
      `}</style>

      {/* ── Meteors ─────────────────────────────────── */}

      {/* ── Custom Cursor ───────────────────────────── */}
      <div id="cursor" />
      <div id="cursor-trail" />

      {/* ── Preloader ───────────────────────────────── */}
      {showPreloader && (
        <div id="preloader">
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end border-b border-dark/20 pb-4 gap-4">
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter text-dark">
              System<br />Boot.
            </h1>
            <div className="text-left md:text-right">
              <div id="loader-text" className="text-6xl md:text-8xl font-black text-dark">{loaderProgress}%</div>
              <div className="text-xs uppercase tracking-widest text-dark/50 mt-2 font-bold">Compiling Emotional Engine</div>
            </div>
          </div>
          <div className="w-full h-[3px] bg-dark/10 mt-1 relative overflow-hidden">
            <div id="loader-bar" className="absolute top-0 left-0 h-full bg-dark transition-all duration-300" style={{ width: `${loaderProgress}%` }} />
          </div>
        </div>
      )}

      {/* ── Desktop Nav ─────────────────────────────── */}
      <header
        id="desktop-nav"
        className="hidden md:flex fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-md border-b border-borderLight px-10 py-5 justify-between items-center"
        style={{ transform: navHidden ? "translateY(-100%)" : "translateY(0)", transition: "transform 0.3s ease" }}
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-white font-display font-bold text-lg">M</div>
          <span className="font-display font-bold tracking-tight text-xl text-dark">Moments OS</span>
        </div>
        <nav className="flex gap-2 bg-surface px-3 py-2 rounded-full border border-borderLight shadow-sm">
          <Link href="/templates" className="flex items-center gap-2 text-sm font-semibold text-dark hover:text-accent1 transition-colors px-5 py-2 rounded-full hover:bg-accent1/10">
            <i className="ph-bold ph-layout text-base" />
            Templates
          </Link>
          <Link href="/favorites" className="flex items-center gap-2 text-sm font-semibold text-dark hover:text-accent1 transition-colors px-5 py-2 rounded-full hover:bg-accent1/10">
            <i className="ph-bold ph-bookmark-simple text-base" />
            Favorites
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="theme-toggle w-10 h-10 rounded-full bg-surface border border-borderLight flex items-center justify-center hover:scale-110 transition-all text-dark" aria-label="Toggle theme">
            <i className={`${theme === "dark" ? "ph-bold ph-sun" : "ph-bold ph-moon"} text-lg`} />
          </button>
          <Link href="/profile" className="w-10 h-10 rounded-full bg-surface border border-borderLight flex items-center justify-center hover:scale-110 transition-all text-dark" aria-label="Profile">
            <i className="ph-bold ph-user text-lg" />
          </Link>
          <button
            type="button"
            onClick={handleDownloadApp}
            className="bg-dark text-white px-8 py-3 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-lg"
            style={
              theme === "dark"
                ? {
                    background: "#39FF14",
                    color: "#04130a",
                    boxShadow: "0 0 0 1px rgba(57,255,20,0.35), 0 8px 30px rgba(57,255,20,0.35)",
                  }
                : undefined
            }
          >
            {isInstalling ? "Installing..." : "Download App"}
          </button>
        </div>
      </header>

      {/* ── Mobile Header ───────────────────────────── */}
      <header className="md:hidden fixed top-0 w-full z-40 bg-bg/90 backdrop-blur-md border-b border-borderLight px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-dark flex items-center justify-center text-white font-display font-bold shadow-lg">M</div>
          <div className="flex flex-col">
            <span className="text-[9px] text-dark/50 uppercase tracking-widest font-bold">Workspace</span>
            <span className="text-sm font-bold text-dark">Mobile Studio</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="theme-toggle w-9 h-9 rounded-full bg-surface flex items-center justify-center tap-effect border border-borderLight shadow-sm text-dark" aria-label="Toggle theme">
            <i className={`${theme === "dark" ? "ph-bold ph-sun" : "ph-bold ph-moon"} text-lg`} />
          </button>
          <button
            type="button"
            onClick={handleDownloadApp}
            className="theme-toggle w-9 h-9 rounded-full bg-surface flex items-center justify-center tap-effect border border-borderLight text-dark"
            aria-label="Download app"
          >
            <i className="ph-bold ph-download-simple text-lg" />
          </button>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────── */}
      <div id="main-content" className="relative z-10 w-full flex flex-col items-center pg-bg">

        {/* ════ HERO ════ */}
        <section className="w-full min-h-screen mobile-app-screen mobile-home-hero flex flex-col justify-center px-5 md:px-12 pt-28 pb-16 reveal max-w-[1600px] mx-auto">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* Hero Text */}
            <div className="lg:col-span-7 flex flex-col z-10">
              <div className="reveal mb-6">
                <div className="inline-flex items-center gap-3 bg-surface border border-borderLight px-4 py-2 rounded-full shadow-sm">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent1 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent1" />
                  </span>
                  <span className="text-xs md:text-sm uppercase tracking-[0.2em] font-display font-bold text-dark">
                    Platform Update &apos;25
                  </span>
                </div>
              </div>

              <h1 className="text-[14vw] lg:text-[7.5vw] font-display font-black leading-[0.85] tracking-tighter uppercase text-dark mb-8">
                <div className="reveal block">Engineered</div>
                <div className="reveal block">
                  For <span className="text-accent1">{HERO_WORDS[heroIndex]}</span>
                </div>
              </h1>

              <div className="reveal mb-12">
                <p className="text-lg md:text-2xl text-dark/70 max-w-2xl font-medium leading-relaxed">
                  {HERO_DESCS[heroIndex]}
                </p>
              </div>

              <div className="flex flex-row gap-3 md:gap-4 reveal">
                <Link href="/templates" className="bg-dark text-white px-4 md:px-10 py-4 md:py-5 rounded-full font-bold text-[11px] md:text-sm tracking-wide hover:bg-accent1 transition-colors flex-1 md:flex-none flex items-center justify-center gap-2 shadow-xl whitespace-nowrap">
                  Explore Templates <i className="ph-bold ph-arrow-right" />
                </Link>
                <button
                  type="button"
                  onClick={openManifesto}
                  className="bg-surface border border-borderLight text-dark px-4 md:px-10 py-4 md:py-5 rounded-full font-bold text-[11px] md:text-sm tracking-wide flex-1 md:flex-none flex items-center justify-center gap-2 whitespace-nowrap hover:border-accent1 hover:text-accent1 transition-colors"
                >
                  Read The Manifesto
                </button>
              </div>

              <div className="mt-16 hidden md:grid grid-cols-4 gap-6 border-t border-borderLight pt-8 reveal">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <h4 className="text-3xl md:text-4xl font-display font-black text-dark">{stat.value}</h4>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-dark/50 font-bold mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Card Showcase – Desktop */}
            <div
              className="hidden md:block lg:col-span-5 relative reveal"
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
            >
              <div className="hero-card-stack border border-borderLight shadow-2xl">
                {HERO_CARDS.map((card, idx) => (
                  <div
                    key={card.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openTemplate(card.href)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openTemplate(card.href);
                      }
                    }}
                    className={`hero-showcase-card${idx === heroIndex ? " is-active" : ""}`}
                    aria-label={`Open ${card.title} template`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.img} className="w-full h-full object-cover" alt={card.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/5" />
                    <div className="absolute top-6 left-6 w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg animate-float">
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                    <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                      <i className={`${card.phIcon} text-white text-xl`} />
                    </div>
                    <div className="absolute bottom-8 left-8 right-8 card-content">
                      <span className="glass-badge px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-white mb-4 inline-block">{card.label}</span>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">{card.title}</h3>
                      <p className="text-sm text-white/80 max-w-sm font-medium mb-6 line-clamp-2">{card.desc}</p>
                      <span className="text-white font-bold text-sm tracking-widest flex items-center gap-2 uppercase">
                        Open <i className="ph-bold ph-arrow-right" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Timer dots */}
              <div className="hero-dots">
                {HERO_CARDS.map((card, idx) => (
                  <div
                    key={card.id}
                    className={`hero-dot${idx === heroIndex ? " is-active" : idx < heroIndex ? " is-done" : ""}`}
                    onClick={() => setHeroIndex(idx)}
                  >
                    <div className="hero-dot-fill" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════ MOBILE HERO PAGE 2 ════ */}
        <section className="md:hidden w-full bg-bg px-5 pb-8 pt-6 reveal">
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-borderLight pt-6">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <h4 className="text-3xl font-display font-black text-dark">{stat.value}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-dark/50 font-bold mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 mobile-feature-stack bg-dark border border-borderLight shadow-2xl">
              {HERO_CARDS.map((card, idx) => (
                <div
                  key={card.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openTemplate(card.href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openTemplate(card.href);
                    }
                  }}
                  className={`mobile-feature-card${idx === mobileHeroIndex ? " is-active" : ""}`}
                  aria-label={`Open ${card.title} template`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.img} className="absolute inset-0 w-full h-full object-cover opacity-90" alt={card.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-5 left-5 w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/25">
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  <div className="absolute top-5 right-5 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                    <i className="ph-bold ph-heart" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <span className="glass-badge px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold text-white mb-3 inline-block">{card.label}</span>
                    <h3 className="font-bold text-4xl text-white mb-2 tracking-tight">{card.title}</h3>
                    <p className="text-sm text-white/75 font-medium mb-5">{card.desc}</p>
                    <span className="text-white font-bold text-sm tracking-widest flex items-center gap-2 uppercase">
                      Open <i className="ph-bold ph-arrow-right" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ TICKER STRIPS ════ */}
        <div className="reveal mb-3 md:mb-4 overflow-hidden w-full">
          <div className="steps-marquee is-infinite flex whitespace-nowrap">
            {["Design The Moment", "Layer In Memories", "Send With Spark", "Design The Moment", "Layer In Memories", "Send With Spark", "Design The Moment", "Layer In Memories", "Send With Spark"].map((txt, i) => (
              i % 3 === 2
                ? <React.Fragment key={i}><span className="steps-strip-word">{txt}</span><span className="steps-strip-sep">&bull;</span></React.Fragment>
                : <span key={i} className="steps-strip-word">{txt}</span>
            ))}
          </div>
        </div>
        <div className="reveal overflow-hidden w-full mb-0">
          <div className="steps-marquee is-infinite rev flex whitespace-nowrap">
            {["Build The Vibe", "Add Heartbeat", "Launch The Surprise", "Build The Vibe", "Add Heartbeat", "Launch The Surprise", "Build The Vibe", "Add Heartbeat", "Launch The Surprise"].map((txt, i) => (
              i % 3 === 2
                ? <React.Fragment key={i}><span className="steps-strip-word">{txt}</span><span className="steps-strip-sep">&bull;</span></React.Fragment>
                : <span key={i} className="steps-strip-word">{txt}</span>
            ))}
          </div>
        </div>

        {/* ════ METRICS SECTION ════ */}
        <section
          id="metrics-section"
          className="w-full min-h-screen relative overflow-hidden reveal border-y border-borderLight bg-surface flex items-center"
          ref={metricsRef as React.RefObject<HTMLElement>}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

          <div className="max-w-[1600px] mx-auto px-5 md:px-12 py-24 relative z-10 w-full">
            <div className="text-center mb-20">
              <p className="reveal text-xs uppercase tracking-[0.3em] font-bold text-accent2 mb-5">Performance Metrics</p>
              <h2 className="font-display font-black tracking-tighter uppercase text-dark">
                <span className="reveal d1 block text-4xl md:text-7xl lg:text-8xl">The Anatomy of</span>
                <span className="reveal d2 block text-4xl md:text-7xl lg:text-8xl">a Perfect <span className="text-accent1">Wish.</span></span>
              </h2>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-0 items-center">
              {/* Left stat */}
              <div className="text-center md:text-left reveal from-left d2">
                <div className="inline-flex items-baseline gap-1">
                  <h3 className="text-7xl md:text-8xl lg:text-9xl font-black text-dark tracking-tighter">{metric74.toFixed(1)}</h3>
                  <span className="text-4xl md:text-5xl font-black text-accent1">x</span>
                </div>
                <p className="text-sm font-bold text-dark/60 uppercase tracking-widest mt-3">Higher Emotional Impact</p>
                <div className="w-16 h-[2px] bg-accent1/30 mt-4 mb-4 md:mx-0 mx-auto" />
                <p className="text-sm text-dark/60 leading-relaxed font-medium max-w-xs md:mx-0 mx-auto">Our WebGL experiences trigger significantly higher joy responses than standard text messages.</p>
              </div>

              {/* Center VS cards */}
              <div className="relative flex justify-center items-center py-8 reveal scale-in d3">
                <div className="w-44 h-60 md:w-52 md:h-72 bg-bg rounded-2xl p-2 shadow-2xl border border-borderLight rotate-[-8deg] hover:rotate-[-2deg] transition-all duration-500 absolute -translate-x-6 md:-translate-x-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl grayscale" alt="Standard" />
                  <div className="absolute -top-3 -left-3 bg-surface border border-borderLight px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400" /> Generic
                  </div>
                </div>
                <div className="w-52 h-[17rem] md:w-60 md:h-80 bg-dark rounded-2xl p-2 shadow-[0_30px_80px_rgba(var(--c-accent1),0.25)] border border-white/10 z-10 rotate-[4deg] hover:rotate-[0deg] transition-all duration-500 translate-x-6 md:translate-x-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl" alt="Premium" />
                  <div className="absolute -top-3 -right-3 bg-accent1 text-black px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" /> Moments OS
                  </div>
                </div>
                <div className="absolute z-20 w-12 h-12 rounded-full bg-surface border-2 border-borderLight shadow-xl flex items-center justify-center">
                  <span className="text-xs font-black text-dark tracking-wider">VS</span>
                </div>
              </div>

              {/* Right stat */}
              <div className="text-center md:text-right reveal from-right d4">
                <div className="inline-flex items-baseline gap-0 md:justify-end">
                  <h3 className="text-7xl md:text-8xl lg:text-9xl font-black text-dark tracking-tighter">{metric98}</h3>
                  <span className="text-4xl md:text-5xl font-black text-accent1">%</span>
                </div>
                <p className="text-sm font-bold text-dark/60 uppercase tracking-widest mt-3">Completion Rate</p>
                <div className="w-16 h-[2px] bg-accent1/30 mt-4 mb-4 md:ml-auto md:mx-0 mx-auto" />
                <p className="text-sm text-dark/60 leading-relaxed font-medium max-w-xs md:ml-auto md:mx-0 mx-auto">Recipients spend an average of 4.2 minutes interacting with galleries, music, and hidden messages.</p>
              </div>
            </div>

            {/* Bottom bar stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                ["4.2", "min", "Avg. Session", "d1"],
                ["12", "+", "Interactions", "d2"],
                ["3", "x", "Re-visit Rate", "d3"],
                ["92", "%", "Share Rate", "d4"],
              ].map(([val, suf, label, d]) => (
                <div key={label} className={`reveal ${d} bg-bg/50 border border-borderLight rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-300`}>
                  <h4 className="text-2xl md:text-3xl font-black text-dark font-display">{val}<span className="text-accent1 text-lg">{suf}</span></h4>
                  <p className="text-[10px] uppercase tracking-widest text-dark/50 font-bold mt-2">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ DESKTOP GALLERY ════ */}
        <section className="gallery-section w-full relative min-h-screen hidden md:flex border-y border-borderLight overflow-hidden">
          <div className="w-full flex flex-col justify-center py-16">
            {/* Header row */}
            <div className="px-12 mb-8 max-w-[1600px] mx-auto w-full flex items-end justify-between gap-6">
              <h2 className="font-display font-black tracking-tighter uppercase leading-none text-6xl md:text-7xl lg:text-[6.5vw] whitespace-nowrap">
                <span className="text-dark">Choose Your </span>
                <span className="gallery-morph-wrap text-accent1">
                  {GALLERY_MORPH.map((w, i) => (
                    <span key={w} className={`gallery-morph-text${i === galleryMorphIdx ? " is-active" : ""}`}>{w}</span>
                  ))}
                </span>
              </h2>
              <div className="hidden lg:block shrink-0">
                <Link href="/templates" className="bg-dark text-white px-7 py-3.5 rounded-full font-bold text-sm tracking-wide hover:bg-accent1 transition-colors flex items-center gap-2 shadow-xl">
                  View All <i className="ph-bold ph-arrow-right" />
                </Link>
              </div>
            </div>

            {/* Category chips */}
            <div className="flex gap-3 px-12 mb-8 overflow-x-auto">
              <div className="shrink-0 border border-accent1 bg-accent1/10 text-accent1 rounded-full px-5 py-2.5 text-sm flex items-center gap-2 font-bold cursor-pointer">
                <i className="ph-fill ph-sparkle" /> All Types
              </div>
              {[
                { icon: "ph-fill ph-heart text-red-400", label: "Valentine" },
                { icon: "ph-fill ph-hands-praying text-yellow-500", label: "Sorry" },
                { icon: "ph-fill ph-shooting-star text-yellow-300", label: "Miss You" },
                { icon: "ph-fill ph-rings text-gray-400", label: "Anniversary" },
                { icon: "ph-fill ph-heart text-pink-400", label: "Love" },
                { icon: "ph-fill ph-confetti text-blue-400", label: "Wedding" },
                { icon: "ph-fill ph-moon-stars text-yellow-400", label: "Festival" },
              ].map(({ icon, label }) => (
                <div key={label} className="shrink-0 border border-borderLight rounded-full px-5 py-2.5 text-sm flex items-center gap-2 font-medium text-dark/70 hover:border-accent1 hover:text-accent1 transition-colors cursor-pointer bg-surface">
                  <i className={icon} /> {label}
                </div>
              ))}
            </div>

            {/* Infinite gallery marquee */}
            <div id="gallery-track" className="gallery-track flex gap-8 w-max">
              {galleryDouble.map((card, idx) => (
                <button
                  key={`${card.alt}-${idx}`}
                  type="button"
                  onClick={() => openTemplate(card.href)}
                  className="gallery-card w-[340px] h-[560px] shrink-0 text-left"
                  aria-label={`Open ${card.title} template`}
                >
                  <div className="gallery-card-inner h-full border border-borderLight shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.img} className="absolute inset-0 w-full h-full object-cover" loading="lazy" alt={card.alt} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />
                    <div className="absolute top-5 left-5 w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center border border-white/25">
                      {card.iconEl}
                    </div>
                    <div className="absolute top-5 right-5 w-9 h-9 bg-white/10 rounded-full flex items-center justify-center border border-white/20 hover:bg-accent1/30 transition-colors cursor-pointer">
                      <i className="ph-bold ph-heart text-white" />
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <span className={`${card.labelClass} px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold mb-2 inline-block`}>{card.label}</span>
                      <h3 className="font-bold text-xl text-white mb-1 tracking-tight">{card.title}</h3>
                      <p className="text-xs text-white/70 mb-3 line-clamp-2">{card.desc}</p>
                      <span className="gallery-card-cta bg-white text-black px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                        Open <i className="ph-bold ph-arrow-right" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ════ MOBILE CAROUSEL ════ */}
        <section className="md:hidden w-full reveal py-16 bg-bg">
          <div className="px-5 mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-display font-black tracking-tight mb-1 uppercase text-dark">Template Library</h2>
              <p className="text-sm text-dark/60 font-medium">Swipe to explore</p>
            </div>
            <Link href="/templates" className="text-[10px] font-bold uppercase tracking-widest text-accent1 tap-effect bg-accent1/10 px-3 py-1.5 rounded-full">View All</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 app-carousel pb-8 px-5">
            {GALLERY_CARDS.map((card) => (
              <button
                key={card.alt}
                type="button"
                onClick={() => openTemplate(card.href)}
                className="carousel-item flex-shrink-0 w-[85vw] h-[65vh] rounded-[2rem] bg-dark relative overflow-hidden group tap-effect shadow-xl border border-borderLight text-left"
                aria-label={`Open ${card.title} template`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.img} className="absolute inset-0 w-full h-full object-cover opacity-90" alt={card.alt} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                <div className="absolute top-5 left-5 w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                  {card.iconEl}
                </div>
                <div className="absolute top-5 right-5 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                  <i className="ph-bold ph-heart text-base" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <span className="glass-badge px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold text-white mb-3 inline-block">{card.label}</span>
                  <h3 className="font-bold text-3xl text-white mb-1">{card.title}</h3>
                  <p className="text-sm text-white/70 font-medium mb-4">{card.desc}</p>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/90">OPEN →</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ════ STEPS SECTION ════ */}
        <section
          id="steps-section"
          ref={stepsRef}
          className="w-full min-h-screen relative bg-surface border-y border-borderLight overflow-hidden flex flex-col justify-center py-20 md:py-28"
        >
          <div className="steps-cross-wrap">
            <div className="steps-cross-line a" />
            <div className="steps-cross-line b" />
          </div>
          <div className="steps-bg-word">MAGIC</div>

          {/* Marquee */}
          <div className="reveal mb-16 md:mb-24 overflow-hidden">
            <div className="steps-marquee is-infinite flex whitespace-nowrap">
              {["Pick Your Canvas", "Inject Emotion", "Share The Magic", "Pick Your Canvas", "Inject Emotion", "Share The Magic", "Pick Your Canvas", "Inject Emotion", "Share The Magic"].map((txt, i) => (
                i % 3 === 2
                  ? <React.Fragment key={i}><span className="steps-strip-word">{txt}</span><span className="steps-strip-sep">&bull;</span></React.Fragment>
                  : <span key={i} className="steps-strip-word">{txt}</span>
              ))}
            </div>
          </div>

          {/* Section header */}
          <div className="max-w-[1600px] mx-auto px-5 md:px-12 w-full mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-3 h-3 rounded-full bg-accent1 animate-pulse" />
              <p className="reveal text-xs uppercase tracking-[0.3em] font-bold text-accent2">How It Works</p>
              <div className="h-px flex-1 bg-borderLight" />
            </div>
            <h2 className="font-display font-black tracking-tighter uppercase text-dark leading-[0.85]">
              <span className="reveal text-4xl md:text-6xl lg:text-7xl">Three </span>
              <span className="reveal text-4xl md:text-6xl lg:text-7xl">Steps </span>
              <span className="reveal text-4xl md:text-6xl lg:text-7xl">to </span>
              <span className="reveal text-4xl md:text-6xl lg:text-7xl text-accent1">Magic.</span>
            </h2>
          </div>

          {/* Steps grid */}
          <div className="max-w-[1600px] mx-auto px-5 md:px-12 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">

              {/* Horizontal beam (desktop) */}
              <div className="steps-beam-track hidden md:block absolute top-[26px] left-[calc(100%/6)] right-[calc(100%/6)] z-0">
                <div className="relative w-full h-[2px]">
                  <div className="absolute inset-0 h-[2px] bg-borderLight rounded-full top-1/2 -translate-y-1/2" />
                  <div id="steps-beam-fill" className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 rounded-full" style={{ width: beamWidth }} />
                </div>
              </div>

              {/* Step 1 */}
              <div className="step-col">
                <div className={`step-node-dot${stepsActive >= 0 ? " active" : ""}`}><span>01</span></div>
                <div className={`step-connector-v${stepsActive >= 0 ? " active" : ""}`} />
                <div className={`step-card-box group${stepsActive >= 0 ? " active" : ""}`}>
                  <div className="relative bg-bg rounded-3xl border border-borderLight overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(var(--c-accent1),0.12)] hover:-translate-y-1">
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Step 1" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                        <span className="text-xs uppercase tracking-widest font-bold text-white/70">Foundation</span>
                        <div className="flex gap-1.5">
                          {["ph-cards", "ph-palette", "ph-layout"].map((ic) => (
                            <div key={ic} className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                              <i className={`ph-bold ${ic} text-white text-xs`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 md:p-6">
                      <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight text-dark mb-2">Pick Your Canvas.</h3>
                      <p className="text-sm text-dark/55 leading-relaxed font-medium">Select from 50+ premium templates engineered to captivate before a single word is read.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="step-col">
                <div className={`step-node-dot${stepsActive >= 1 ? " active" : ""}`}><span>02</span></div>
                <div className={`step-connector-v${stepsActive >= 1 ? " active" : ""}`} />
                <div className={`step-card-box group${stepsActive >= 1 ? " active" : ""}`}>
                  <div className="relative bg-bg rounded-3xl border border-borderLight overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(var(--c-accent1),0.12)] hover:-translate-y-1">
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=800&auto=format&fit=crop" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Step 2" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                        <span className="text-xs uppercase tracking-widest font-bold text-white/70">Personalization</span>
                        <div className="flex gap-1.5">
                          {["ph-pencil-simple", "ph-image", "ph-music-note"].map((ic) => (
                            <div key={ic} className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                              <i className={`ph-bold ${ic} text-white text-xs`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 md:p-6">
                      <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight text-dark mb-2">Inject Emotion.</h3>
                      <p className="text-sm text-dark/55 leading-relaxed font-medium">Type feelings, upload memories, add spatial audio. Our engine syncs it all with cinematic effects.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="step-col">
                <div className={`step-node-dot${stepsActive >= 2 ? " active" : ""}`}><span>03</span></div>
                <div className={`step-connector-v${stepsActive >= 2 ? " active" : ""}`} />
                <div className={`step-card-box group${stepsActive >= 2 ? " active" : ""}`}>
                  <div className="relative bg-bg rounded-3xl border border-borderLight overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(var(--c-accent1),0.12)] hover:-translate-y-1">
                    <div className="relative h-48 md:h-56 overflow-hidden bg-accent2">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:24px_24px]" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl animate-[pulse_2s_infinite]">
                          <i className="ph-bold ph-paper-plane-tilt text-2xl text-accent2" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                        <span className="text-xs uppercase tracking-widest font-bold text-white/70">Deployment</span>
                        <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold tracking-wide">moments.os/l/x8y</div>
                      </div>
                    </div>
                    <div className="p-5 md:p-6">
                      <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight text-dark mb-2">Share The Magic.</h3>
                      <p className="text-sm text-dark/55 leading-relaxed font-medium">One click deploys globally. Generate a secure link that delivers instantly to their device.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════ PLATFORM ARCHITECTURE / BENTO ════ */}
        <section className="w-full max-w-[1600px] mx-auto px-5 md:px-12 py-16 md:py-32 reveal">
          <div className="flex flex-col md:flex-row gap-12 mb-16 items-start">
            <div className="reveal md:w-1/2">
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-accent2 mb-4">Platform Architecture</p>
              <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none text-dark">The Global<br />Standard.</h2>
            </div>
            <div className="md:w-1/2 reveal">
              <p className="text-lg md:text-xl text-dark/70 font-medium leading-relaxed">
                In a world where digital communication often feels cold and transactional, we built a sanctuary for genuine human connection.
                Moments OS isn&apos;t just a site builder; it&apos;s a dedicated engine engineered to translate your deepest feelings into highly secure,
                flawlessly animated digital experiences.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="bento-box bg-surface rounded-3xl p-8 md:p-12 border border-borderLight md:col-span-2 flex flex-col justify-between overflow-hidden relative reveal">
              <div className="relative z-10">
                <i className="ph-fill ph-rocket text-4xl text-accent1 mb-6 block" />
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight text-dark">Blazing Edge Delivery</h3>
                <p className="text-dark/70 text-base md:text-lg font-medium max-w-xl">
                  When you hit &ldquo;Publish,&rdquo; our system compiles your custom assets, audio, and WebGL code into a static, highly optimized bundle.
                  Deployed instantly across 275+ global edge nodes, your recipient experiences zero loading screens. Just instant, buttery-smooth emotion.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-accent1/10 to-transparent rounded-tl-full pointer-events-none" />
            </div>

            {/* Box 2 */}
            <div className="bento-box bg-dark text-white rounded-3xl p-8 md:p-12 border border-dark flex flex-col justify-between reveal shadow-2xl">
              <div>
                <i className="ph-fill ph-lock-key text-4xl text-accent2 mb-6 block" />
                <h3 className="text-3xl font-display font-bold mb-4 tracking-tight">Military Grade Privacy</h3>
                <p className="text-white/70 text-base font-medium">
                  Your personal photos, inside jokes, and heartfelt confessions are deeply personal. Every generated link utilizes one-way cryptographic hashing.
                  No search engines. No data mining. Only for the eyes you choose.
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bento-box bg-surface rounded-3xl p-8 md:p-12 border border-borderLight reveal">
              <i className="ph-fill ph-device-mobile text-4xl text-dark mb-6 block" />
              <h3 className="text-3xl font-display font-bold mb-4 tracking-tight text-dark">Native Feel</h3>
              <p className="text-dark/70 text-base font-medium">
                Forget clunky websites. Our templates utilize advanced touch-event listeners to provide swipeable galleries and haptic-like visual feedback
                that mirrors premium iOS and Android apps.
              </p>
            </div>

            {/* Box 4 */}
            <div className="bento-box bg-surface rounded-3xl p-8 md:p-12 border border-borderLight md:col-span-2 reveal flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2">
                <i className="ph-fill ph-music-notes text-4xl text-accent1 mb-6 block" />
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight text-dark">Spatial Audio Sync</h3>
                <p className="text-dark/70 text-base font-medium">
                  Sight is only half the experience. Upload your &ldquo;our song&rdquo; or choose from our curated ambient tracks. The audio engine intelligently
                  fades and swells as the user scrolls through your timeline of memories.
                </p>
              </div>
              <div className="w-full md:w-1/2 h-48 bg-bg rounded-2xl flex items-center justify-center border border-borderLight relative overflow-hidden">
                <div className="flex items-end gap-1 h-20 px-4">
                  {[["20%","bg-dark","1s","0.1s"], ["60%","bg-dark","1.2s","0.2s"], ["100%","bg-accent1","0.8s","0.3s"], ["40%","bg-dark","1.1s","0.4s"], ["80%","bg-dark","0.9s","0.5s"], ["30%","bg-accent1","1.3s","0.6s"]].map(([h, col, dur, delay], i) => (
                    <div key={i} className={`w-2 ${col} rounded-t-sm`} style={{ height: h, animation: `bounce ${dur} infinite ${delay}` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════ TESTIMONIALS ════ */}
        <section id="testimonials-section" className="w-full relative overflow-hidden border-t border-borderLight bg-surface py-20 md:py-28">
          <div className="testi-ambient" />
          <div className="max-w-[1600px] mx-auto px-5 md:px-12 relative z-10">
            <div className="mb-10 md:mb-14">
              <p className="reveal text-xs uppercase tracking-[0.28em] font-bold text-accent2 mb-4">Loved Worldwide</p>
              <h2 className="reveal font-display font-black tracking-tighter uppercase text-dark leading-[0.88] text-5xl md:text-7xl lg:text-8xl">
                Real Stories.<br /><span className="text-accent1">Real Emotion.</span>
              </h2>
            </div>

            {/* Template chips marquee */}
            <div className="testi-templates-wrap reveal d1">
              <div className="testi-templates-track">
                {[0, 1, 2].map((g) => (
                  <div key={g} className="testi-templates-group" aria-hidden={g > 0 ? "true" : undefined}>
                    {TESTI_CHIPS.map((chip) => (
                      <span key={chip} className="testi-template-chip"><i>✦</i> {chip}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial cards marquee */}
            <div className="testi-cards-wrap reveal d2">
              <div className="testi-cards-track">
                {testiDouble.map((item, idx) => (
                  <article key={`${item.name}-${idx}`} className="testi-card">
                    <p className="testi-quote">&ldquo;{item.quote}&rdquo;</p>
                    <div className="testi-meta">
                      <div className="testi-user">
                        <div className="testi-avatar">{item.initials}</div>
                        <div>
                          <div className="testi-name">{item.name}</div>
                          <div className="testi-role">{item.role}</div>
                        </div>
                      </div>
                      <div className="testi-rating">{item.rating}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════ FOOTER CTA ════ */}
        <section id="footer-cta" className="w-full min-h-screen flex flex-col items-center justify-center text-center px-5 relative overflow-hidden reveal border-t border-borderLight bg-bg">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <span id="footer-bg-word" className="text-[28vw] md:text-[22vw] font-display font-black leading-none whitespace-nowrap uppercase transition-all duration-700">
              {FOOTER_BG_WORDS[footerBgWordIdx]}
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-[15vw] md:text-[10vw] font-display font-black uppercase tracking-tighter leading-[0.85] text-dark mb-2 md:mb-4 reveal">
              Make It
            </h2>

            <div className="relative overflow-hidden" style={{ height: "clamp(4rem, 15vw, 12rem)" }}>
              <div className="footer-rotator">
                {FOOTER_WORDS.map((word, idx) => (
                  <span key={word} className={`footer-rotate-word${idx === footerWordIdx ? " is-active" : ""}`}>{word}</span>
                ))}
              </div>
            </div>

            <div className="mt-12 md:mt-16 reveal">
              <button
                type="button"
                onClick={handleDownloadApp}
                className="hidden md:flex bg-dark text-white px-14 py-7 rounded-full font-bold uppercase tracking-widest text-base hover:scale-105 hover:bg-accent1 transition-all duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.25)] items-center gap-3"
                style={
                  theme === "dark"
                    ? {
                        background: "#39FF14",
                        color: "#04130a",
                        boxShadow: "0 0 0 1px rgba(57,255,20,0.35), 0 14px 45px rgba(57,255,20,0.32)",
                      }
                    : undefined
                }
              >
                {isInstalling ? "Installing..." : "Download App"} <i className="ph-bold ph-download-simple text-xl" />
              </button>
              <button
                type="button"
                onClick={handleDownloadApp}
                className="md:hidden tap-effect bg-dark text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl w-full max-w-sm"
                style={
                  theme === "dark"
                    ? {
                        background: "#39FF14",
                        color: "#04130a",
                        boxShadow: "0 0 0 1px rgba(57,255,20,0.35), 0 14px 45px rgba(57,255,20,0.32)",
                      }
                    : undefined
                }
              >
                {isInstalling ? "Installing..." : "Download App"}
              </button>
            </div>
          </div>
        </section>

      </div>{/* end #main-content */}

      {/* ── Mobile Bottom Dock ──────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 pb-6 pt-2 px-4 pointer-events-none">
        <nav className="mobile-dock w-full rounded-[2rem] px-3 py-3 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] pointer-events-auto">
          <Link href="/manifesto" className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl tap-effect text-white/80 hover:text-white transition-colors">
            <i className="ph-bold ph-scroll text-2xl" />
            <span className="text-[8px] font-bold uppercase mt-1">Manifesto</span>
          </Link>
          <Link href="/templates" className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl tap-effect text-white/50 hover:text-white transition-colors">
            <i className="ph-bold ph-compass text-2xl" />
            <span className="text-[8px] font-bold uppercase mt-1">Explore</span>
          </Link>
          <Link href="/" className="relative -top-6 w-16 h-16 rounded-full bg-accent1 text-white flex items-center justify-center tap-effect shadow-[0_10px_30px_rgba(255,51,102,0.4)] border-4 border-[#1a1a1a]">
            <i className="ph-fill ph-house text-3xl" />
          </Link>
          <Link href="/favorites" className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl tap-effect text-white/70 hover:text-white transition-colors">
            <i className="ph-bold ph-bookmark-simple text-2xl" />
            <span className="text-[8px] font-bold uppercase mt-1">Saved</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl tap-effect text-white/50 hover:text-white transition-colors">
            <i className="ph-bold ph-user text-2xl" />
            <span className="text-[8px] font-bold uppercase mt-1">Profile</span>
          </Link>
        </nav>
      </div>

      {showInstallHelp && (
        <div className="fixed inset-0 z-[220] flex items-end md:items-center justify-center">
          <button
            type="button"
            className="absolute inset-0"
            style={{
              background: theme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(17,17,17,0.68)",
            }}
            onClick={() => setShowInstallHelp(false)}
            aria-label="Close install help"
          />
          <div
            className="relative w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 md:p-7"
            style={{
              background: theme === "dark" ? "#0b0b0b" : "#ffffff",
              border: "1px solid var(--app-border)",
            }}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-5 md:hidden" style={{ background: "var(--app-border)" }} />
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold mb-2" style={{ color: "var(--app-accent)" }}>
                  Install App
                </p>
                <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--app-text)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Add Gifts To Your Home Screen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallHelp(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--app-bg)", color: "var(--app-text-muted)" }}
                aria-label="Close"
              >
                <i className="ph-bold ph-x text-sm" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {isIOS || isSafariBrowser ? (
                <>
                  <div className="rounded-2xl p-3.5" style={{ background: "var(--app-bg)", border: "1px solid var(--app-border-faint)" }}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--app-accent)" }}>Step 1</p>
                    <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
                      Tap the <strong>Share</strong> icon in your browser.
                    </p>
                  </div>
                  <div className="rounded-2xl p-3.5" style={{ background: "var(--app-bg)", border: "1px solid var(--app-border-faint)" }}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--app-accent)" }}>Step 2</p>
                    <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
                      Select <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                  <div className="rounded-2xl p-3.5" style={{ background: "var(--app-bg)", border: "1px solid var(--app-border-faint)" }}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--app-accent)" }}>Step 3</p>
                    <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
                      Confirm by tapping <strong>Add</strong>.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl p-3.5" style={{ background: "var(--app-bg)", border: "1px solid var(--app-border-faint)" }}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--app-accent)" }}>Step 1</p>
                    <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
                      Open browser menu (<strong>⋮</strong>) on the top-right.
                    </p>
                  </div>
                  <div className="rounded-2xl p-3.5" style={{ background: "var(--app-bg)", border: "1px solid var(--app-border-faint)" }}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--app-accent)" }}>Step 2</p>
                    <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </p>
                  </div>
                  <div className="rounded-2xl p-3.5" style={{ background: "var(--app-bg)", border: "1px solid var(--app-border-faint)" }}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--app-accent)" }}>Step 3</p>
                    <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
                      Confirm installation to finish setup.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl p-3.5 mb-5" style={{ background: "var(--app-accent-a08)", border: "1px solid var(--app-accent-a20)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--app-text)" }}>
                {isBraveBrowser || isChromeBrowser
                  ? "Tip: On Brave/Chrome, this installs as a fast full-screen app."
                  : "Tip: Use Chrome or Brave for one-tap install prompt support."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallHelp(false)}
              className="w-full py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default dynamic(() => Promise.resolve(HomePage), { ssr: false });
