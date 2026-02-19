import type { Metadata } from "next";
import { getSharePageMeta, buildMeta, SITE_URL } from "@/lib/seo";
import { SharePageJsonLd } from "@/components/JsonLd";
import SharePageClient from "./SharePageClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface SharePageData {
  success: boolean;
  templateType?: string;
  data?: {
    recipientName?: string;
    senderName?: string;
    createdAt?: string;
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

  return {
    ...meta,
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

  return (
    <>
      <SharePageJsonLd
        title={title}
        description={description}
        url={`${SITE_URL}/${shareId}`}
        datePublished={createdAt}
        authorName={senderName}
      />
      <SharePageClient />
    </>
  );
}
