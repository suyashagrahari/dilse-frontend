import type { Metadata } from "next";
import { getSharePageMeta, buildMeta, SITE_URL } from "@/lib/seo";
import { SharePageJsonLd } from "@/components/JsonLd";
import SharePageWrapper from "./SharePageWrapper";
import { API_URL } from "@/lib/config";
import { RAKHI_FONT_VARS } from "@/app/(templates)/happy-rakshabandhan-to-brother/fonts";

interface SharePageData {
  success: boolean;
  templateType?: string;
  data?: {
    recipientName?: string;
    senderName?: string;
    createdAt?: string;
    sharePhoto?: string;
  };
}

async function fetchShareData(shareId: string): Promise<SharePageData | null> {
  try {
    const res = await fetch(`${API_URL}/share/${shareId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: shareId } = await params;
  const result = await fetchShareData(shareId);

  if (!result?.success || !result.data || !result.templateType) {
    return buildMeta({
      title: "Gift Page | Gifts",
      description: "Someone created a special gift page for you. Open to see the surprise!",
      robots: { index: false, follow: false },
    });
  }

  const meta = getSharePageMeta({
    templateType: result.templateType,
    recipientName: result.data.recipientName || "You",
    senderName: result.data.senderName || "Someone Special",
    shareId,
  });

  const sharePhoto = result.data.sharePhoto;
  const ogOverride = sharePhoto && sharePhoto.startsWith("http")
    ? { openGraph: { ...(meta.openGraph as object), images: [{ url: sharePhoto, width: 800, height: 800, alt: `Birthday surprise for ${result.data.recipientName || "You"}` }] }, twitter: { ...(meta.twitter as object), images: [sharePhoto] } }
    : {};

  return {
    ...meta,
    ...ogOverride,
    alternates: { canonical: `${SITE_URL}/${shareId}` },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: shareId } = await params;
  const result = await fetchShareData(shareId);

  const senderName = result?.data?.senderName || "Someone Special";
  const recipientName = result?.data?.recipientName || "You";
  const templateType = result?.templateType || "gift";
  const createdAt = result?.data?.createdAt;

  const title = `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} for ${recipientName}`;
  const description = `${senderName} created a special ${templateType} surprise for ${recipientName}`;

  // ── Template-scoped font variables ────────────────────────────────────────
  //
  // Raksha Bandhan needs its four faces on THIS route — it is the page the
  // recipient opens, and without them the whole ritual, including the
  // Devanagari shloka, falls back to a system face.
  //
  // Applied here, in a Server Component, rather than inside the client viewer.
  // Four `/[id]` viewers already call next/font from a client component, and
  // adding a fifth reproducibly broke the Turbopack build — it failed resolving
  // `@vercel/turbopack-next/internal/font/google/font` for dm_sans, a font in a
  // *different* viewer that nothing had touched. All these viewers are lazily
  // imported into one chunk group, so a new font module there reshuffles the
  // chunk graph and stale cached font-CSS modules stop resolving. A cold build
  // passed; the CI build, which restores `.next/cache`, did not.
  //
  // A Server Component does not participate in that client chunk group, so the
  // fonts load without touching it. `templateType` is already known here from
  // the server fetch, so the class is applied ONLY for this template and every
  // other share page is unaffected.
  const fontVars = templateType === "raksha-bandhan" ? RAKHI_FONT_VARS : undefined;

  return (
    <>
      <SharePageJsonLd
        title={title}
        description={description}
        url={`${SITE_URL}/${shareId}`}
        datePublished={createdAt}
        authorName={senderName}
      />
      <div className={fontVars}>
        <SharePageWrapper />
      </div>
    </>
  );
}
