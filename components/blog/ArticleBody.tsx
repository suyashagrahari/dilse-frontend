"use client";

import Image from "next/image";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import type { BlocksContent } from "@/lib/strapi";
import { strapiMedia } from "@/lib/strapi";

/** Slugify heading text → stable anchor id (kept in sync with TableOfContents). */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function plainText(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(plainText).join("");
  if (children?.props?.children) return plainText(children.props.children);
  return "";
}

export default function ArticleBody({ content }: { content: BlocksContent }) {
  if (!content || !Array.isArray(content)) return null;

  return (
    <div
      className="blog-prose"
      style={{ fontFamily: "'Inter', sans-serif", color: "#2a0a0e", lineHeight: 1.8, fontSize: 17 }}
    >
      <BlocksRenderer
        content={content}
        blocks={{
          heading: ({ children, level }) => {
            const id = headingId(plainText(children));
            const styles: React.CSSProperties = {
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: "#2a0a0e",
              scrollMarginTop: 100,
            };
            const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
            const size = level <= 2 ? "1.9rem" : level === 3 ? "1.45rem" : "1.2rem";
            return (
              <Tag id={id} style={{ ...styles, fontSize: size, marginTop: "1.8em", marginBottom: "0.5em" }}>
                {children}
              </Tag>
            );
          },
          paragraph: ({ children }) => <p style={{ margin: "1.1em 0" }}>{children}</p>,
          link: ({ children, url }) => (
            <a href={url} style={{ color: "#9a3324", textDecoration: "underline" }} rel="noopener">
              {children}
            </a>
          ),
          list: ({ children, format }) =>
            format === "ordered" ? (
              <ol style={{ margin: "1.1em 0", paddingLeft: "1.4em", listStyle: "decimal" }}>{children}</ol>
            ) : (
              <ul style={{ margin: "1.1em 0", paddingLeft: "1.4em", listStyle: "disc" }}>{children}</ul>
            ),
          "list-item": ({ children }) => <li style={{ margin: "0.4em 0" }}>{children}</li>,
          quote: ({ children }) => (
            <blockquote
              style={{
                margin: "1.5em 0",
                padding: "0.6em 1.2em",
                borderLeft: "4px solid #c9a84c",
                fontStyle: "italic",
                color: "rgba(42,10,14,0.82)",
                background: "rgba(201,168,76,0.08)",
              }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <pre style={{ margin: "1.4em 0", padding: "1em", borderRadius: 12, background: "#2a0a0e", color: "#f5ede6", overflowX: "auto", fontSize: 14 }}>
              <code>{children}</code>
            </pre>
          ),
          image: ({ image }) => (
            <span style={{ display: "block", margin: "1.6em 0" }}>
              <Image
                src={strapiMedia(image.url)}
                alt={image.alternativeText || ""}
                width={image.width || 1200}
                height={image.height || 700}
                className="rounded-xl"
                style={{ width: "100%", height: "auto" }}
              />
            </span>
          ),
        }}
        modifiers={{
          bold: ({ children }) => <strong>{children}</strong>,
          italic: ({ children }) => <em>{children}</em>,
          underline: ({ children }) => <u>{children}</u>,
          code: ({ children }) => (
            <code style={{ background: "rgba(61,12,17,0.08)", padding: "0.15em 0.4em", borderRadius: 5, fontSize: "0.9em" }}>
              {children}
            </code>
          ),
        }}
      />
    </div>
  );
}
