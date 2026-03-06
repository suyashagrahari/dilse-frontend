import type { Metadata } from "next";
import { getSharePageMeta, buildMeta } from "@/lib/seo";
import { SharePageJsonLd } from "@/components/JsonLd";
import SharePageClient from "@/app/[id]/SharePageClient";
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

async function fetchShareData(username: string, shareId: string): Promise<SharePageData | null> {
  try {
    const res = await fetch(`${API_URL}/share/u/${username}/${shareId}`, {
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
  params: Promise<{ username: string; shareId: string }>;
}): Promise<Metadata> {
  const { username, shareId } = await params;
  const result = await fetchShareData(username, shareId);

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
  params: Promise<{ username: string; shareId: string }>;
}) {
  const { username, shareId } = await params;
  const result = await fetchShareData(username, shareId);

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
