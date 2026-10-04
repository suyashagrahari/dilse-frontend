import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSharePageMeta, buildMeta, SITE_URL } from "@/lib/seo";
import { SharePageJsonLd } from "@/components/JsonLd";
import SharePageWrapper from "./SharePageWrapper";
import WrongShareLink from "./[shareId]/WrongShareLink";
import { API_URL } from "@/lib/config";

interface SharePageData {
  success: boolean;
  templateType?: string;
  /** Set only where subdomains are served, and only when the creator has one. */
  ownerSubdomain?: string;
  data?: {
    recipientName?: string;
    senderName?: string;
    createdAt?: string;
    sharePhoto?: string;
  };
}

// A share id that the API definitively does not know about must render a real
// 404, or every unknown root path (/BingSiteAuth.xml, /whatever) answers 200
// with this shell and crawlers index it as a live page. A transient API failure
// is NOT the same thing — there we still render the client, which retries and
// shows its own message, rather than telling the world a valid link is gone.
type ShareFetchResult =
  | { status: "ok"; data: SharePageData }
  | { status: "notfound" }
  | { status: "unavailable" };

async function fetchShareData(shareId: string): Promise<ShareFetchResult> {
  try {
    const res = await fetch(`${API_URL}/share/${shareId}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404 || res.status === 410) return { status: "notfound" };
    // 401/403 are password-gated pages, 5xx is the API being unhappy: both are
    // "can't tell from here", so let the client component take over.
    if (!res.ok) return { status: "unavailable" };
    const data = (await res.json()) as SharePageData;
    if (!data?.success) return { status: "notfound" };
    return { status: "ok", data };
  } catch {
    return { status: "unavailable" };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: shareId } = await params;
  const fetched = await fetchShareData(shareId);
  const result = fetched.status === "ok" ? fetched.data : null;

  if (!result?.success || !result.data || !result.templateType || result.ownerSubdomain) {
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
  const fetched = await fetchShareData(shareId);
  if (fetched.status === "notfound") notFound();
  const result = fetched.status === "ok" ? fetched.data : null;

  // A creator with a subdomain shares `{subdomain}.subhsandesh.in/{id}` and
  // nothing else: the bare link is refused, without naming the subdomain —
  // saying it would make the bare link work with one extra click.
  if (result?.ownerSubdomain) return <WrongShareLink reason="missing" />;

  const senderName = result?.data?.senderName || "Someone Special";
  const recipientName = result?.data?.recipientName || "You";
  const templateType = result?.templateType || "gift";
  const createdAt = result?.data?.createdAt;

  const title = `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} for ${recipientName}`;
  const description = `${senderName} created a special ${templateType} surprise for ${recipientName}`;

  return (
    <>
      <SharePageJsonLd
        title={title}
        description={description}
        url={`${SITE_URL}/${shareId}`}
        datePublished={createdAt}
        authorName={senderName}
      />
      <SharePageWrapper />
    </>
  );
}
