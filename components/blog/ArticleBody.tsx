"use client";

import Image from "next/image";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BlocksContent } from "@/lib/strapi";
import { strapiMedia } from "@/lib/strapi";
import { headingId } from "@/lib/blog-utils";

// Re-export so older imports (`import { headingId } from "./ArticleBody"`) keep working.
export { headingId };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function plainText(children: any): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(plainText).join("");
  if (children?.props?.children) return plainText(children.props.children);
  if (typeof children?.props?.text === "string") return children.props.text;
  return "";
}

/** Raw text of a Strapi block, read straight from its leaf nodes (reliable). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rawBlockText(block: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (block?.children || []).map((c: any) => c?.text || "").join("");
}

/** Drop empty paragraph blocks (blank lines from pasted content) that create huge gaps. */
function compactBlocks(content: BlocksContent): BlocksContent {
  if (!Array.isArray(content)) return content;
  return content.filter((b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = b as any;
    if (block?.type !== "paragraph") return true;
    const text = (block.children || []).map((c: { text?: string }) => c.text || "").join("");
    return text.trim().length > 0;
  });
}

const headingStyle = (level: number): React.CSSProperties => ({
  fontFamily: "'Playfair Display', serif",
  fontWeight: 700,
  color: "#2a0a0e",
  scrollMarginTop: 100,
  fontSize: level <= 2 ? "1.75rem" : level === 3 ? "1.35rem" : "1.15rem",
  lineHeight: 1.25,
  marginTop: level <= 2 ? "1.5em" : "1.2em",
  marginBottom: "0.45em",
});

const PROSE_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: "#2a0a0e",
  lineHeight: 1.75,
  fontSize: 17,
};

export default function ArticleBody({
  content,
  markdown,
}: {
  content?: BlocksContent | null;
  markdown?: string | null;
}) {
  // Markdown body takes precedence when present (uploaded / pasted .md).
  if (markdown && markdown.trim()) {
    return (
      <div className="blog-prose" style={PROSE_STYLE}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h2 id={headingId(plainText(children))} style={headingStyle(2)}>{children}</h2>
            ),
            h2: ({ children }) => (
              <h2 id={headingId(plainText(children))} style={headingStyle(2)}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 id={headingId(plainText(children))} style={headingStyle(3)}>{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 id={headingId(plainText(children))} style={headingStyle(4)}>{children}</h4>
            ),
            p: ({ children }) => <p style={{ margin: "0.9em 0" }}>{children}</p>,
            a: ({ children, href }) => (
              <a href={href} style={{ color: "#9a3324", textDecoration: "underline" }} rel="noopener" target={href?.startsWith("http") ? "_blank" : undefined}>
                {children}
              </a>
            ),
            ul: ({ children }) => <ul style={{ margin: "0.9em 0", paddingLeft: "1.4em", listStyle: "disc" }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ margin: "0.9em 0", paddingLeft: "1.4em", listStyle: "decimal" }}>{children}</ol>,
            li: ({ children }) => <li style={{ margin: "0.35em 0" }}>{children}</li>,
            strong: ({ children }) => <strong>{children}</strong>,
            em: ({ children }) => <em>{children}</em>,
            hr: () => <hr style={{ margin: "2em 0", border: 0, borderTop: "1px solid rgba(61,12,17,0.12)" }} />,
            blockquote: ({ children }) => (
              <blockquote style={{ margin: "1.4em 0", padding: "0.6em 1.2em", borderLeft: "4px solid #c9a84c", fontStyle: "italic", color: "rgba(42,10,14,0.82)", background: "rgba(201,168,76,0.08)" }}>
                {children}
              </blockquote>
            ),
            code: ({ children, className }) =>
              className ? (
                <code className={className} style={{ display: "block", margin: "1.2em 0", padding: "1em", borderRadius: 12, background: "#2a0a0e", color: "#f5ede6", overflowX: "auto", fontSize: 14 }}>
                  {children}
                </code>
              ) : (
                <code style={{ background: "rgba(61,12,17,0.08)", padding: "0.15em 0.4em", borderRadius: 5, fontSize: "0.9em" }}>{children}</code>
              ),
            img: ({ src, alt }) =>
              typeof src === "string" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={strapiMedia(src)} alt={alt || ""} className="rounded-xl" style={{ width: "100%", height: "auto", margin: "1.4em 0" }} />
              ) : null,
            table: ({ children }) => (
              <div style={{ overflowX: "auto", margin: "1.4em 0" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 15 }}>{children}</table>
              </div>
            ),
            th: ({ children }) => <th style={{ border: "1px solid rgba(61,12,17,0.15)", padding: "0.5em 0.7em", textAlign: "left", background: "rgba(61,12,17,0.05)" }}>{children}</th>,
            td: ({ children }) => <td style={{ border: "1px solid rgba(61,12,17,0.15)", padding: "0.5em 0.7em" }}>{children}</td>,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    );
  }

  if (!content || !Array.isArray(content)) return null;

  const blocks = compactBlocks(content);
  // Anchor ids computed from RAW block text (same source as TableOfContents) and
  // assigned positionally — the renderer's `children` don't reliably stringify,
  // which previously produced empty id="" and broke TOC links.
  const headingIds = blocks
    .filter((b) => b?.type === "heading")
    .map((b) => headingId(rawBlockText(b)));
  let headingIdx = 0;

  return (
    <div className="blog-prose" style={PROSE_STYLE}>
      <BlocksRenderer
        content={blocks}
        blocks={{
          heading: ({ children, level }) => {
            const id = headingIds[headingIdx++] || headingId(plainText(children));
            const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
            return (
              <Tag id={id} style={headingStyle(level)}>
                {children}
              </Tag>
            );
          },
          paragraph: ({ children }) => <p style={{ margin: "0.9em 0" }}>{children}</p>,
          link: ({ children, url }) => (
            <a href={url} style={{ color: "#9a3324", textDecoration: "underline" }} rel="noopener">
              {children}
            </a>
          ),
          list: ({ children, format }) =>
            format === "ordered" ? (
              <ol style={{ margin: "0.9em 0", paddingLeft: "1.4em", listStyle: "decimal" }}>{children}</ol>
            ) : (
              <ul style={{ margin: "0.9em 0", paddingLeft: "1.4em", listStyle: "disc" }}>{children}</ul>
            ),
          "list-item": ({ children }) => <li style={{ margin: "0.35em 0" }}>{children}</li>,
          quote: ({ children }) => (
            <blockquote
              style={{
                margin: "1.4em 0",
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
            <pre style={{ margin: "1.2em 0", padding: "1em", borderRadius: 12, background: "#2a0a0e", color: "#f5ede6", overflowX: "auto", fontSize: 14 }}>
              <code>{children}</code>
            </pre>
          ),
          image: ({ image }) => (
            <span style={{ display: "block", margin: "1.4em 0" }}>
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
