"use client";

import { useState, useEffect, useCallback, useRef, ComponentType, useMemo } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, HeartCrack, X, Sparkles, PenLine, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import AuthModal from "@/components/AuthModal";
import { usePwa } from "@/components/PwaProvider";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (IS_NGROK) headers["ngrok-skip-browser-warning"] = "true";
  return headers;
}

// ── Skeleton shown while a heavy viewer chunk downloads ─────────────────────
function ViewerSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-pink-50/30 to-white dark:from-slate-950 dark:via-rose-950/20 dark:to-slate-950">
      <div className="text-center">
        <div className="text-5xl mb-6 animate-bounce">🎁</div>
        <Loader2 size={20} className="animate-spin text-rose-400 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Unwrapping your surprise...</p>
      </div>
    </div>
  );
}

// ── Lazy-load heavy viewer components (~1000 lines / ~40KB each) ─────────────
// Only the viewer matching the current share page's template type is downloaded.
const HoliViewer = dynamic(() => import("./HoliViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const EidViewer = dynamic(() => import("./EidViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const WeddingViewer = dynamic(() => import("./WeddingViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ReceptionViewer = dynamic(() => import("./ReceptionViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ShaadiCardViewer = dynamic(() => import("./ShaadiCardViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ChristianWeddingViewer = dynamic(() => import("./ChristianWeddingViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ChristianWedding2Viewer = dynamic(() => import("./ChristianWedding2Viewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const LoveGfViewer = dynamic(() => import("./LoveGfViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const DarlingViewer = dynamic(() => import("./DarlingViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const BirthdayGfViewer = dynamic(() => import("./BirthdayGfViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ApologyDashboardViewer = dynamic(() => import("./ApologyDashboardViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const MissYouGfViewer = dynamic(() => import("./MissYouGfViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const BouquetGfViewer = dynamic(() => import("./BouquetGfViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const RakshaBandhanViewer = dynamic(() => import("./RakshaBandhanViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ProductViewer = dynamic(() => import("./ProductViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const WatchViewer = dynamic(() => import("./WatchViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const CallViewer = dynamic(() => import("./CallViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const RechargeViewer = dynamic(() => import("./RechargeViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ChallanViewer = dynamic(() => import("./ChallanViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const NutritionViewer = dynamic(() => import("./NutritionViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const AppViewer = dynamic(() => import("./AppViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ProfileProViewer = dynamic(() => import("./ProfileProViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const CourtOfLoveViewer = dynamic(() => import("./CourtOfLoveViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const ProposalViewer = dynamic(() => import("./ProposalViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const CourtMarriageViewer = dynamic(() => import("./CourtMarriageViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const HoldMyHandViewer = dynamic(() => import("./HoldMyHandViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const TrainTicketViewer = dynamic(() => import("./TrainTicketViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const LegalNoticeViewer = dynamic(() => import("./LegalNoticeViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const KundliMilanViewer = dynamic(() => import("./KundliMilanViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const VendingMachineViewer = dynamic(() => import("./VendingMachineViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const CatchViewer = dynamic(() => import("./CatchViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const FlagsViewer = dynamic(() => import("./FlagsViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const DateInvitationViewer = dynamic(() => import("./DateInvitationViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const PhotoPuzzleViewer = dynamic(() => import("./PhotoPuzzleViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const LoveflixViewer = dynamic(() => import("./LoveflixViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const RewindViewer = dynamic(() => import("./RewindViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const StreakViewer = dynamic(() => import("./StreakViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const DedicationViewer = dynamic(() => import("./DedicationViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const SearchedViewer = dynamic(() => import("./SearchedViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const CapsuleViewer = dynamic(() => import("./CapsuleViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});
const UsViewer = dynamic(() => import("./UsViewer"), {
  ssr: false,
  loading: ViewerSkeleton,
});

// ── Lazy-load template-specific content (birthday / valentine) ───────────────
const BirthdayContent = dynamic(
  () => import("@/app/(templates)/birthday-gf/components/BirthdayContent")
);
const BirthdayNav = dynamic(
  () => import("@/app/(templates)/birthday-gf/components/BirthdayNav")
);
const ValentineContent = dynamic(
  () => import("@/app/(templates)/valentine-gf/components/ValentineContent")
);
const ValentineNav = dynamic(
  () => import("@/app/(templates)/valentine-gf/components/ValentineNav")
);

interface ContentRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  tab: string;
  onTabChange: (t: string) => void;
}

interface NavRendererProps {
  mode: "viewer";
  tab: string;
  onTabChange: (t: string) => void;
  onEdit: () => void;
  lockedTabs?: Set<string>;
  onInstall?: () => void;
}

interface TemplateEntry {
  Content: ComponentType<ContentRendererProps>;
  Nav: ComponentType<NavRendererProps>;
  bg: string;
  label: string;
  mapData: (raw: Record<string, unknown>) => Record<string, unknown>;
  defaultTab: string;
  protectedTabs: string[];
  verifyRoute: string;
}

const TEMPLATE_REGISTRY: Record<string, TemplateEntry> = {
  birthday: {
    Content: BirthdayContent as ComponentType<ContentRendererProps>,
    Nav: BirthdayNav as ComponentType<NavRendererProps>,
    bg: "bg-gradient-to-b from-rose-50 via-pink-50/30 to-white dark:from-slate-950 dark:via-rose-950/20 dark:to-slate-950",
    label: "birthday",
    defaultTab: "cover",
    protectedTabs: ["final"],
    verifyRoute: "birthday-pages",
    mapData: (raw) => ({
      recipientName: raw.recipientName,
      senderName: raw.senderName,
      personalMessage: raw.personalMessage,
      wishes: raw.wishes,
      photos: raw.photos,
      theme: raw.theme || "romantic",
    }),
  },
  valentine: {
    Content: ValentineContent as ComponentType<ContentRendererProps>,
    Nav: ValentineNav as ComponentType<NavRendererProps>,
    bg: "bg-gradient-to-b from-red-50 via-pink-50/30 to-white dark:from-slate-950 dark:via-red-950/20 dark:to-slate-950",
    label: "valentine",
    defaultTab: "cover",
    protectedTabs: [],
    verifyRoute: "",
    mapData: (raw) => ({
      recipientName: raw.recipientName,
      senderName: raw.senderName,
      personalMessage: raw.personalMessage,
      promises: raw.promises,
      photos: raw.photos,
      theme: raw.theme || "romantic",
    }),
  },
};

const SESSION_KEY = (id: string) => `unlocked_${id}`;

export default function SharePage({ shareIdOverride }: { shareIdOverride?: string } = {}) {
  const params = useParams();
  const router = useRouter();
  const shareId = shareIdOverride || (params.shareId as string) || (params.id as string);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { isStandalone, platform, triggerInstall } = usePwa();

  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const [entry, setEntry] = useState<TemplateEntry | null>(null);
  const [editorRoute, setEditorRoute] = useState("/");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [templateType, setTemplateType] = useState<string>("");
  const [templateVariant, setTemplateVariant] = useState<string>("");
  const [tab, setTab] = useState("cover");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showEditChoice, setShowEditChoice] = useState(false);
  const [installToast, setInstallToast] = useState<string | null>(null);
  const [senderUserId, setSenderUserId] = useState<string | null>(null);

  const [hasPassword, setHasPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwValue, setShowPwValue] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/share/${shareId}`, { headers: apiHeaders() });
        const result = await res.json();
        if (result.success && result.data && result.templateType) {
          setTemplateType(result.templateType);
          setTemplateVariant(
            (result.templateVariant as string) ||
            ((result.data as Record<string, unknown>)?.templateVariant as string) ||
            "",
          );
          setHasPassword(!!result.hasPassword);
          setSenderUserId(result.senderUserId || null);

          // Holi, Eid, Wedding, Reception, Shaadi, Love-GF and Darling have their own full-page viewers — just store raw data
          if (result.templateType === "holi" || result.templateType === "eid" || result.templateType === "wedding" || result.templateType === "reception" || result.templateType === "shaadi" || result.templateType === "christian-wedding" || result.templateType === "love-gf" || result.templateType === "darling" || result.templateType === "birthday-gf" || result.templateType === "apology-dashboard" || result.templateType === "missyou-gf" || result.templateType === "bouquet-gf" || result.templateType === "court-of-love" || result.templateType === "proposal" || result.templateType === "court-marriage" || result.templateType === "hold-my-hand" || result.templateType === "train-ticket" || result.templateType === "legal-notice" || result.templateType === "kundli-milan" || result.templateType === "vending-machine" || result.templateType === "catch" || result.templateType === "flags" || result.templateType === "date-invitation" || result.templateType === "photo-puzzle" || result.templateType === "loveflix" || result.templateType === "rewind" || result.templateType === "streak" || result.templateType === "dedication" || result.templateType === "searched" || result.templateType === "capsule" || result.templateType === "us" || result.templateType === "product" || result.templateType === "watch" || result.templateType === "call" || result.templateType === "recharge" || result.templateType === "challan" || result.templateType === "nutrition" || result.templateType === "app" || result.templateType === "profile-pro" || result.templateType === "raksha-bandhan") {
            setData(result.data);
            setLoading(false);
            return;
          }

          const matched = TEMPLATE_REGISTRY[result.templateType];
          if (matched) {
            setEntry(matched);
            setEditorRoute(result.editorRoute || "/");
            setData(matched.mapData(result.data));
            setTab(matched.defaultTab);
            const stored = sessionStorage.getItem(SESSION_KEY(shareId));
            if (stored === "true") setIsUnlocked(true);
          } else { setError(true); }
        } else { setError(true); }
      } catch { setError(true); }
      finally { setLoading(false); }
    }
    if (shareId) load();
  }, [shareId]);

  // A published page was successfully opened. Instrumented here rather than in
  // each viewer because every template — including the ones with their own
  // full-page viewers below — resolves templateType through this component, so
  // this single effect covers all of them and new ones automatically.
  //
  // page_path cannot carry this: all share URLs normalise to /share/:shareId to
  // keep cardinality bounded, so `template` has to come from the loaded payload.
  const viewTracked = useRef(false);
  useEffect(() => {
    if (!templateType || viewTracked.current) return;
    viewTracked.current = true;
    track(EVENTS.RECIPIENT_VIEWED, {
      template: templateType,
      has_password: hasPassword,
      // Anonymous viewers are true recipients; a signed-in viewer is usually the
      // creator checking their own page. Needed to keep the two populations apart.
      is_authenticated: isAuthenticated,
    });
  }, [templateType, hasPassword, isAuthenticated]);

  useEffect(() => {
    if (showAuth && isAuthenticated && accessToken) {
      fetch(`${API_URL}/share/${shareId}/access`, {
        method: "POST",
        headers: apiHeaders({ Authorization: `Bearer ${accessToken}` }),
      }).catch(() => {});
      setShowAuth(false);
      router.push("/");
    }
  }, [isAuthenticated, showAuth, router, accessToken, shareId]);

  const handleEditClick = () => {
    if (isAuthenticated) {
      if (accessToken) {
        fetch(`${API_URL}/share/${shareId}/access`, {
          method: "POST",
          headers: apiHeaders({ Authorization: `Bearer ${accessToken}` }),
        }).catch(() => {});
      }
      setShowEditChoice(true);
    } else {
      setShowAuth(true);
    }
  };

  const handleInstall = useCallback(async () => {
    if (isStandalone) return;
    const outcome = await triggerInstall();
    if (outcome === "accepted") {
      fetch(`${API_URL}/share/${shareId}/install`, { method: "POST" }).catch(() => {});
    } else if (outcome === "unsupported") {
      const msg =
        platform === "ios"
          ? "Tap the Share button ↑ then \"Add to Home Screen\""
          : "Open browser menu (⋮) → \"Install app\"";
      setInstallToast(msg);
      setTimeout(() => setInstallToast(null), 4000);
    }
  }, [isStandalone, triggerInstall, shareId, platform]);

  const lockedTabs = useMemo(() => {
    if (!entry || !hasPassword || isUnlocked) return new Set<string>();
    return new Set<string>(entry.protectedTabs);
  }, [entry, hasPassword, isUnlocked]);

  const handleTabChange = useCallback(
    (t: string) => {
      if (lockedTabs.has(t)) {
        setPendingTab(t);
        setPwInput("");
        setPwError("");
        setShowPwValue(false);
        setShowPwModal(true);
        return;
      }
      setTab(t);
    },
    [lockedTabs]
  );

  const handleVerify = async () => {
    if (!entry || !pwInput.trim()) return;
    setPwLoading(true);
    setPwError("");
    try {
      const res = await fetch(`${API_URL}/${entry.verifyRoute}/share/${shareId}/verify`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ password: pwInput }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        setIsUnlocked(true);
        sessionStorage.setItem(SESSION_KEY(shareId), "true");
        setShowPwModal(false);
        if (pendingTab) setTab(pendingTab);
        setPendingTab(null);
        if (isAuthenticated && accessToken) {
          fetch(`${API_URL}/share/${shareId}/pw-verified`, {
            method: "POST",
            headers: apiHeaders({ Authorization: `Bearer ${accessToken}` }),
          }).catch(() => {});
        }
      } else {
        setPwError("Wrong password. Try again!");
      }
    } catch {
      setPwError("Something went wrong");
    } finally { setPwLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-pink-50/30 to-white dark:from-slate-950 dark:via-rose-950/20 dark:to-slate-950">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-6"
          >
            🎁
          </motion.div>
          <Loader2 size={20} className="animate-spin text-rose-400 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Unwrapping your surprise...</p>
        </motion.div>
      </div>
    );
  }

  // Holi has its own full-page viewer
  if (!loading && templateType === "holi" && data) {
    return <HoliViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Eid has its own full-page viewer
  if (!loading && templateType === "eid" && data) {
    return <EidViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Wedding has its own full-page viewer
  if (!loading && templateType === "wedding" && data) {
    return <WeddingViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Reception has its own full-page viewer
  if (!loading && templateType === "reception" && data) {
    return <ReceptionViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Shaadi Card has its own full-page viewer
  if (!loading && templateType === "shaadi" && data) {
    return <ShaadiCardViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Christian wedding — scroll edition (christian-wedding-2)
  if (!loading && templateType === "christian-wedding" && templateVariant === "scroll" && data) {
    return <ChristianWedding2Viewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Christian wedding (same API as Shaadi card, distinct theme)
  if (!loading && templateType === "christian-wedding" && data) {
    return <ChristianWeddingViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Love GF has its own full-page viewer
  if (!loading && templateType === "love-gf" && data) {
    return <LoveGfViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Darling has its own full-page viewer
  if (!loading && templateType === "darling" && data) {
    return <DarlingViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Court Marriage Certificate has its own full-page viewer
  if (!loading && templateType === "court-marriage" && data) {
    return <CourtMarriageViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Hold My Hand has its own full-page viewer
  if (!loading && templateType === "hold-my-hand" && data) {
    return <HoldMyHandViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Train Ticket has its own full-page viewer
  if (!loading && templateType === "train-ticket" && data) {
    return <TrainTicketViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Legal Notice has its own full-page viewer
  if (!loading && templateType === "legal-notice" && data) {
    return <LegalNoticeViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Kundli Milan has its own full-page viewer
  if (!loading && templateType === "kundli-milan" && data) {
    return <KundliMilanViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Vending Machine has its own full-page viewer
  if (!loading && templateType === "vending-machine" && data) {
    return <VendingMachineViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Catch has its own full-page viewer
  if (!loading && templateType === "catch" && data) {
    return <CatchViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Flags has its own full-page viewer
  if (!loading && templateType === "flags" && data) {
    return <FlagsViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The Invitation has its own full-page viewer
  if (!loading && templateType === "date-invitation" && data) {
    return <DateInvitationViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The Last Piece has its own full-page viewer
  if (!loading && templateType === "photo-puzzle" && data) {
    return <PhotoPuzzleViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // LoveFlix has its own full-page viewer
  if (!loading && templateType === "loveflix" && data) {
    return <LoveflixViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Rewind has its own full-page viewer
  if (!loading && templateType === "rewind" && data) {
    return <RewindViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Streak has its own full-page viewer
  if (!loading && templateType === "streak" && data) {
    return <StreakViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Dedication has its own full-page viewer
  if (!loading && templateType === "dedication" && data) {
    return <DedicationViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Searched has its own full-page viewer
  if (!loading && templateType === "searched" && data) {
    return <SearchedViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Capsule has its own full-page viewer
  if (!loading && templateType === "capsule" && data) {
    return <CapsuleViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Us has its own full-page viewer
  if (!loading && templateType === "us" && data) {
    return <UsViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Birthday GF has its own full-page viewer
  if (!loading && templateType === "birthday-gf" && data) {
    return <BirthdayGfViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Apology Dashboard has its own full-page viewer
  if (!loading && templateType === "apology-dashboard" && data) {
    return <ApologyDashboardViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Miss You (gf) has its own full-page viewer
  if (!loading && templateType === "missyou-gf" && data) {
    return <MissYouGfViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Build a Bouquet (gf) has its own full-page viewer
  if (!loading && templateType === "bouquet-gf" && data) {
    return <BouquetGfViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Raksha Bandhan has its own full-page viewer
  if (!loading && templateType === "raksha-bandhan" && data) {
    return <RakshaBandhanViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The Product listing has its own full-page viewer
  if (!loading && templateType === "product" && data) {
    return <ProductViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The Watch page has its own full-page viewer
  if (!loading && templateType === "watch" && data) {
    return <WatchViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Caller ID has its own full-page viewer
  if (!loading && templateType === "call" && data) {
    return <CallViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Recharge has its own full-page viewer
  if (!loading && templateType === "recharge" && data) {
    return <RechargeViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The Challan has its own full-page viewer
  if (!loading && templateType === "challan" && data) {
    return <ChallanViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The Nutrition label has its own full-page viewer
  if (!loading && templateType === "nutrition" && data) {
    return <NutritionViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The App listing has its own full-page viewer
  if (!loading && templateType === "app" && data) {
    return <AppViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // Endorsements has its own full-page viewer
  if (!loading && templateType === "profile-pro" && data) {
    return <ProfileProViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The Court of Love has its own full-page viewer
  if (!loading && templateType === "court-of-love" && data) {
    return <CourtOfLoveViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  // The Proposal has its own full-page viewer
  if (!loading && templateType === "proposal" && data) {
    return <ProposalViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
  }

  if (error || !entry || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-pink-50/30 to-white dark:from-slate-950 dark:via-rose-950/20 dark:to-slate-950">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
          <HeartCrack size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Page Not Found</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            This page doesn&apos;t exist or hasn&apos;t been published yet.
          </p>
        </motion.div>
      </div>
    );
  }

  const { Content, Nav, bg, label } = entry;

  return (
    <div className={`min-h-screen ${bg} relative overflow-hidden`}>
      <Content data={data} tab={tab} onTabChange={handleTabChange} />
      <Nav mode="viewer" tab={tab} onTabChange={handleTabChange} onEdit={handleEditClick} lockedTabs={lockedTabs} onInstall={handleInstall} />

      {/* ─── INSTALL TOAST ─── */}
      <AnimatePresence>
        {installToast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 max-w-sm pointer-events-auto">
              <span className="text-base">📲</span>
              <span>{installToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PASSWORD MODAL ─── */}
      <AnimatePresence>
        {showPwModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowPwModal(false); setPendingTab(null); }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[320px]"
            >
              <div className="bg-background rounded-3xl shadow-2xl border border-border/40 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500" />

                <div className="px-6 pt-7 pb-6">
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      animate={{ rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mb-4 shadow-xl shadow-rose-500/20"
                    >
                      <Lock size={26} className="text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-center">This Surprise is Locked</h3>
                    <p className="text-[11px] text-muted-foreground mt-1.5 text-center leading-relaxed">
                      Enter the secret password to<br />unlock the surprise tab
                    </p>
                  </div>

                  <div className="relative mb-4">
                    <input
                      type={showPwValue ? "text" : "password"}
                      value={pwInput}
                      onChange={(e) => { setPwInput(e.target.value); setPwError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                      placeholder="Enter password..."
                      autoFocus
                      className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-muted/30 border border-border/60 focus:border-rose-400 dark:focus:border-rose-600 focus:ring-2 focus:ring-rose-400/20 focus:outline-none text-sm transition-all placeholder:text-muted-foreground/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwValue((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                      {showPwValue ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {pwError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center justify-center gap-1.5 text-red-500 text-xs mb-4"
                      >
                        <ShieldAlert size={12} />
                        <span>{pwError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleVerify}
                    disabled={pwLoading || !pwInput.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-40 shadow-lg shadow-rose-500/20"
                  >
                    {pwLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                    {pwLoading ? "Verifying..." : "Unlock Surprise"}
                  </button>

                  <button
                    onClick={() => { setShowPwModal(false); setPendingTab(null); }}
                    className="w-full mt-3 py-2 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── EDIT CHOICE SHEET ─── */}
      <AnimatePresence>
        {showEditChoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditChoice(false)}
              className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl safe-bottom"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="px-5 pb-8 pt-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Create Your Own</h3>
                  <button onClick={() => setShowEditChoice(false)} className="p-1 text-muted-foreground"><X size={20} /></button>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  Loved this? Create a personalized {label} page for someone special!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => { setShowEditChoice(false); router.push(editorRoute); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 border border-violet-200/50 dark:border-violet-800/30 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">AI Magic</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Let AI create a beautiful page</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowEditChoice(false); router.push(editorRoute); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-500/15 dark:to-pink-500/15 border border-rose-200/50 dark:border-rose-800/30 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <PenLine size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Write Manually</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Write your own heartfelt message</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); router.push("/"); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
