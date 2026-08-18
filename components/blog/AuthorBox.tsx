import Image from "next/image";
import { Twitter, Linkedin, Instagram, Github, Globe } from "lucide-react";
import type { Author, AuthorProfileKind } from "@/lib/strapi";
import { strapiMedia, authorProfiles } from "@/lib/strapi";

const PROFILE_META: Record<AuthorProfileKind, { Icon: typeof Twitter; label: string }> = {
  twitter: { Icon: Twitter, label: "X" },
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
  instagram: { Icon: Instagram, label: "Instagram" },
  github: { Icon: Github, label: "GitHub" },
  website: { Icon: Globe, label: "portfolio" },
};

export default function AuthorBox({ author }: { author: Author }) {
  const avatar = strapiMedia(author.avatar?.url);
  const profiles = authorProfiles(author);
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center"
      style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(61,12,17,0.12)" }}
    >
      {avatar ? (
        <Image src={avatar} alt={author.name} width={72} height={72} className="h-18 w-18 rounded-full object-cover" style={{ width: 72, height: 72 }} />
      ) : (
        <span className="flex h-18 w-18 items-center justify-center rounded-full text-2xl font-bold" style={{ width: 72, height: 72, background: "#c9a84c", color: "#fff" }}>
          {author.name.charAt(0)}
        </span>
      )}
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#c9a84c" }}>
          Written by
        </p>
        <h3 className="text-lg" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#2a0a0e" }}>
          {author.name}
        </h3>
        {author.jobTitle && (
          <p className="text-xs" style={{ color: "rgba(42,10,14,0.6)" }}>
            {author.jobTitle}
          </p>
        )}
        {author.bio && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(42,10,14,0.78)" }}>
            {author.bio}
          </p>
        )}
        {profiles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {profiles.map(({ kind, url }) => {
              const { Icon, label } = PROFILE_META[kind];
              return (
                <a
                  key={kind}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={`${author.name} on ${label}`}
                  title={`${author.name} on ${label}`}
                  style={{ color: "#3d0c11" }}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
