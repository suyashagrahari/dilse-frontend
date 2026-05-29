"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Send, MessageCircle, Instagram, Facebook, Twitter } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SocialShareSheetProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string | null;
  onCopy: (url?: string) => void;
  shareMessage?: string;
}

export default function SocialShareSheet({ open, onClose, shareUrl, onCopy, shareMessage }: SocialShareSheetProps) {
  const router = useRouter();
  const url = shareUrl || "";
  const toPublicShareUrl = (rawUrl: string) => {
    if (!rawUrl) return rawUrl;
    try {
      const parsed = new URL(rawUrl);
      const isLocalHost =
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "0.0.0.0";

      if (!isLocalHost) return rawUrl;

      const prodOrigin =
        (process.env.NEXT_PUBLIC_PROD_SITE_URL || "https://subhsandesh.in").replace(/\/$/, "");

      return `${prodOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return rawUrl;
    }
  };

  const publicUrl = toPublicShareUrl(url);
  const encodedUrl = encodeURIComponent(publicUrl);
  const finalMessage = (shareMessage && shareMessage.trim()) || "Celebrate with me on SubhSandesh! ✨";
  const encodedBrandText = encodeURIComponent(finalMessage);
  const encodedTextThenLink = encodeURIComponent(`${finalMessage}\n${publicUrl}`);
  const options: Array<{
    key: "whatsapp" | "instagram" | "telegram" | "twitter" | "facebook" | "copy";
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }> = [
    { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={15} />, onClick: () => openShare("whatsapp") },
    { key: "instagram", label: "Instagram", icon: <Instagram size={15} />, onClick: () => openShare("instagram") },
    { key: "telegram", label: "Telegram", icon: <Send size={15} />, onClick: () => openShare("telegram") },
    { key: "twitter", label: "Twitter/X", icon: <Twitter size={15} />, onClick: () => openShare("twitter") },
    { key: "facebook", label: "Facebook", icon: <Facebook size={15} />, onClick: () => openShare("facebook") },
    {
      key: "copy",
      label: "SubhSandesh",
      icon: (
        <Image src="/logo.png" alt="SubhSandesh" width={22} height={22} style={{ objectFit: "contain", borderRadius: 4 }} />
      ),
      onClick: () => { onClose(); router.push("/"); },
    },
  ];

  const openShare = (target: "whatsapp" | "telegram" | "twitter" | "facebook" | "instagram") => {
    if (!publicUrl) return;

    if (target === "instagram") {
      onCopy(publicUrl);
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      return;
    }

    const shareMap: Record<Exclude<typeof target, "instagram">, string> = {
      // Keep URL first for reliable auto-link detection in chat apps.
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTextThenLink}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedBrandText}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedBrandText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    window.open(shareMap[target], "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ y: 56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 56, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="relative w-[calc(100%-22px)] md:w-full md:max-w-2xl rounded-3xl p-4 mb-[104px] md:mb-0"
            style={{
              background: "linear-gradient(180deg, rgba(253,248,241,0.99) 0%, rgba(246,237,227,0.99) 100%)",
              border: "1px solid rgba(201,168,76,0.38)",
              boxShadow: "0 18px 40px rgba(61,12,17,0.22)",
            }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-3 md:hidden" style={{ background: "rgba(201,168,76,0.55)" }} />
            <h3 className="text-center mb-0.5" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#3d0c11" }}>
              Share Invitation
            </h3>
            <p className="text-center mb-3 text-xs" style={{ color: "#7a5555" }}>
              Choose where you want to send your page
            </p>

            <div className="mb-3">
              <div className="grid grid-cols-6 gap-1.5">
                {options.map((item) => (
                  <button
                    key={item.key}
                    onClick={item.onClick}
                    className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      border: "1px solid rgba(201,168,76,0.5)",
                      color: "#a48230",
                    }}
                  >
                    {item.icon}
                    {/* <span className="text-[9px] leading-none font-semibold tracking-[0.01em]">
                      {item.key === "whatsapp" ? "WA" :
                       item.key === "instagram" ? "IG" :
                       item.key === "telegram" ? "TG" :
                       item.key === "twitter" ? "X" :
                       item.key === "facebook" ? "FB" : "COPY"}
                    </span> */}
                  </button>
                ))}
              </div>
            </div>

            {/* URL copy bar */}
            {publicUrl && (
              <div
                className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(201,168,76,0.35)" }}
              >
                <span className="flex-1 text-xs truncate" style={{ color: "#7a5555" }}>{publicUrl}</span>
                <button
                  onClick={() => onCopy(publicUrl)}
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                  style={{ background: "rgba(201,168,76,0.15)", color: "#a48230", border: "1px solid rgba(201,168,76,0.4)" }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full h-10 rounded-xl text-sm font-semibold mt-3"
              style={{ background: "rgba(61,12,17,0.06)", color: "#5e3b3b", border: "1px solid rgba(201,168,76,0.35)" }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

