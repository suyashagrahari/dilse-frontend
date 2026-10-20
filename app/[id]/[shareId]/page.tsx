import type { Metadata } from "next";
import { getSharePageMeta, buildMeta } from "@/lib/seo";
import { SharePageJsonLd } from "@/components/JsonLd";
import SharePageClient from "@/app/[id]/SharePageClient";
import WrongShareLink from "./WrongShareLink";
import { API_URL, ROOT_DOMAIN, SITE_URL } from "@/lib/config";

interface SharePageData {
  success: boolean;
  templateType?: string;
  ownerSubdomain?: string;
  data?: {
    recipientName?: string;
    senderName?: string;
    createdAt?: string;
  };
}

// The name in front of the page id is checked by the API: a misspelt name, or
// someone else's name, is a 404 there and must be a 404 here too — otherwise
// `anything.subhsandesh.in/<id>` would open the page, and a typo in a link would
// still "work" until the day that name is claimed by somebody else. A transient
// API failure is not a 404: the client component takes over and retries.
type ShareFetchResult =
  | { status: "ok"; data: SharePageData }
  | { status: "notfound" }
  | { status: "unavailable" };

async function fetchShareData(username: string, shareId: string): Promise<ShareFetchResult> {
  try {
    const res = await fetch(`${API_URL}/share/u/${encodeURIComponent(username)}/${shareId}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404 || res.status === 410) return { status: "notfound" };
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
  params: Promise<{ id: string; shareId: string }>;
}): Promise<Metadata> {
  const { id: username, shareId } = await params;
  const fetched = await fetchShareData(username, shareId);
  const result = fetched.status === "ok" ? fetched.data : null;

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
    username,
  });

  const canonicalUrl = ROOT_DOMAIN
    ? `https://${username}.${ROOT_DOMAIN}/${shareId}`
    : `${SITE_URL}/${username}/${shareId}`;

  return {
    ...meta,
    alternates: { canonical: canonicalUrl },
  };
}

export default async function SubdomainSharePage({
  params,
}: {
  params: Promise<{ id: string; shareId: string }>;
}) {
  const { id: username, shareId } = await params;
  const fetched = await fetchShareData(username, shareId);
  // Rendered here rather than via notFound(): the root not-found page would win
  // and lose the "check the name" message. generateMetadata already marks this
  // noindex, since there is no page data.
  if (fetched.status === "notfound") return <WrongShareLink />;
  const result = fetched.status === "ok" ? fetched.data : null;

  const senderName = result?.data?.senderName || "Someone Special";
  const recipientName = result?.data?.recipientName || "You";
  const templateType = result?.templateType || "gift";
  const createdAt = result?.data?.createdAt;

  const title = `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} for ${recipientName}`;
  const description = `${senderName} created a special ${templateType} surprise for ${recipientName}`;
  const pageUrl = ROOT_DOMAIN
    ? `https://${username}.${ROOT_DOMAIN}/${shareId}`
    : `${SITE_URL}/${username}/${shareId}`;

  return (
    <>
      <SharePageJsonLd
        title={title}
        description={description}
        url={pageUrl}
        datePublished={createdAt}
        authorName={senderName}
      />
      <SharePageClient />
    </>
  );
}
