"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { Download, Instagram, Loader2 } from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { GANESH_ASSETS } from "../assets";
import { GC, PAPER_GRADIENT } from "./theme";
import {
  Durva,
  Kumkum,
  Flowers,
  Modak,
  LampIncense,
  Diya,
  Garland,
  Marigold,
  PetalFall,
  RoundFrame,
  Rule,
} from "./Ornaments";
import { Button, BrandBadge, Card, Reveal, SectionHead } from "./Bits";
import AartiSection from "./AartiSection";
import BackgroundMusic from "./BackgroundMusic";
import UserImage from "./UserImage";
import { useStoryCard } from "./StoryCard";
import { useNow } from "./useNow";
import {
  OFFERINGS,
  formatFestivalDate,
  muhuratLine,
  visarjanLine,
  type GaneshData,
  type OfferingKey,
} from "./types";

// ─── The page ────────────────────────────────────────────────────────────────
//
// One scrolling document. There is no screen state, no step counter, no gating
// and no modal anywhere in this template.
//
// ── WHAT THIS REPLACED ──────────────────────────────────────────────────────
//
// Six full-viewport screens with a Continue button on each, a five-tap offering
// sequence that had to be completed before the aarti would open, and a
// full-screen takeover per tap. It was more code and less page: four of the six
// screens were a heading, a paragraph and a button, and the gating meant a
// reader had to agree to five more taps before they knew whether the page was
// worth it.
//
// Everything those screens carried is still here — the greeting, the aarti, the
// offerings and what they mean, the wishes, the photo, the prasad, the reply —
// laid out as sections you scroll past. The one thing that is genuinely gone is
// the requirement to interact before you are allowed to read.
//
// ── THE TWO THINGS THAT STILL TAKE A TAP, AND WHY ───────────────────────────
//
//   Play the aarti — audio cannot legally start without a gesture, and a
//     devotional recording that begins on open is a page people close.
//   The reply box — it is the reader writing something. There is no way to do
//     that without an interaction.
//
// Everything else on the page is just there.

const OFFERING_ICONS: Record<OfferingKey, (p: { size: number }) => React.ReactElement> = {
  durva: ({ size }) => <Durva size={size} />,
  kumkum: ({ size }) => <Kumkum size={size} />,
  flowers: ({ size }) => <Flowers size={size} />,
  modak: ({ size }) => <Modak size={size} />,
  lamp: ({ size }) => <LampIncense size={size} />,
};

export default function GaneshTemplate({
  data,
  mode,
  shareId,
  hasPassword,
  sample = false,
}: {
  data: GaneshData;
  /** `"preview"` in the builder, `"live"` on the recipient's page. */
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /**
   * Label this as the demo rather than as somebody's finished page.
   *
   * ── WHY IT IS A PROP AND NOT A FIXED CHIP IN page.tsx ─────────────────────
   *
   * It was an absolutely-positioned pill in the builder, sitting 62px from the
   * top, and it collided with two different things depending on the width: the
   * garland hanging under the bar, and the hero artwork on a phone. Every fix
   * was a third magic offset.
   *
   * In the flow, at the head of the hero's own text column, it cannot collide
   * with anything at any width, it scrolls away like the caption it is, and the
   * layout it belongs to is the one that positions it.
   */
  sample?: boolean;
}) {
  const now = useNow(60_000);
  /** Raised by the aarti's own Play button — a real gesture, so `play()` is legal. */
  const [playing, setPlaying] = useState(false);

  const story = useStoryCard(data, mode === "live" ? currentUrl() : null);
  const [storyMsg, setStoryMsg] = useState<string | null>(null);
  const runStory = useCallback(
    async (which: "download" | "share") => {
      const result = which === "share" ? await story.share() : await story.download();
      // An empty message means "nothing to say" — a dismissed OS share sheet is
      // not an error and must not raise a notice claiming it is.
      if (result.message) {
        setStoryMsg(result.message);
        setTimeout(() => setStoryMsg(null), 4000);
      }
    },
    [story]
  );

  const date = formatFestivalDate(data.festivalDate);
  const muhurat = now ? muhuratLine(now) : null;
  const visarjan = visarjanLine(data.visarjanDate, now);
  const greeting = data.greeting.filter((l) => l.trim());
  const wishes = data.wishes.filter((r) => r.label.trim());
  const hasVargani = Boolean(data.vargani.upiId || data.vargani.qrImageUrl);

  return (
    <div className="gc-root gc-page" style={{ background: PAPER_GRADIENT }}>
      {mode === "live" && <BrandBadge />}

      {/* Mounted for the whole page, so the recording is not restarted by a
          section scrolling in and out of view. */}
      <BackgroundMusic shouldPlay={playing} />

      {/* ════════════════════════════════════════════════════════════════════
          1. The greeting
          ════════════════════════════════════════════════════════════════════ */}
      <section className="gc-section gc-section--hero" style={{ position: "relative" }}>
        <Garland pieces={15} />
        <PetalFall count={14} seed={9} />

        <div className="gc-wrap" style={{ position: "relative", zIndex: 2 }}>
          <div className="gc-split gc-split--art-right" style={{ ["--gc-split" as string]: "1.05fr 0.95fr" }}>
            {/* The artwork. First in the DOM so it is above the fold on a
                phone — the picture is what says what this page is. */}
            <div className="gc-art">
              <Reveal>
                <div
                  style={{
                    width: "min(86vw, 460px)",
                    borderRadius: 24,
                    overflow: "hidden",
                    border: `1px solid ${GC.hairline}`,
                    boxShadow: "0 30px 60px -34px rgba(46,33,25,0.42)",
                    background: GC.surface,
                  }}
                >
                  {/* `unoptimized` is REQUIRED. Without it Next's optimiser
                      re-encodes the GIF to a static WebP and the greeting
                      silently stops moving — nothing errors, it just freezes. */}
                  <Image
                    src={GANESH_ASSETS.shubhkamnaye.src}
                    alt="Happy Ganesh Chaturthi"
                    width={GANESH_ASSETS.shubhkamnaye.width}
                    height={GANESH_ASSETS.shubhkamnaye.height}
                    priority
                    unoptimized
                    sizes="(min-width: 1024px) 460px, 86vw"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              </Reveal>
            </div>

            <div className="gc-words">
              {sample && (
                <Reveal>
                  <p
                    style={{
                      display: "inline-block",
                      margin: "0 0 18px",
                      padding: "6px 13px",
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 600,
                      letterSpacing: 0.2,
                      background: "rgba(46,33,25,0.06)",
                      border: `1px solid ${GC.hairline}`,
                      color: GC.muted,
                    }}
                  >
                    A sample — yours will use your names and your photo
                  </p>
                </Reveal>
              )}
              <Reveal delay={0.08}>
                <p className="gc-eyebrow" style={{ margin: "0 0 14px" }}>
                  {date || "Ganesh Chaturthi"}
                </p>
                <h1 className="gc-display gc-title">Happy Ganesh Chaturthi</h1>
              </Reveal>

              <Reveal delay={0.16}>
                <p
                  className="gc-display gc-name"
                  style={{
                    fontSize: "clamp(24px, 4.4vw, 38px)",
                    lineHeight: 1.15,
                    fontWeight: 600,
                    color: GC.ink,
                    margin: "18px 0 0",
                  }}
                >
                  {data.recipientName || "to your house"}
                </p>
                {(data.senderName || data.city) && (
                  <p
                    style={{
                      fontSize: 13.5,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: GC.muted,
                      margin: "12px 0 0",
                    }}
                  >
                    from {data.senderName || "someone at home"}
                    {data.city ? ` · ${data.city}` : ""}
                  </p>
                )}
              </Reveal>

              {/* ── The countdown, which gates nothing ──────────────────────
               *
               * Purely informational, and `muhuratLine` is documented as such: a
               * panchang timing differs by a few minutes between almanacs and by
               * city, so a page that refused to open outside the hour would be
               * wrong for somebody, somewhere, every year. */}
              {muhurat && (
                <Reveal delay={0.24}>
                  <p
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12.5,
                      margin: "22px 0 0",
                      padding: "7px 14px",
                      borderRadius: 999,
                      background: "rgba(255,253,249,0.8)",
                      border: `1px solid ${GC.hairline}`,
                      color: muhurat.phase === "during" ? GC.leaf : GC.muted,
                      fontWeight: muhurat.phase === "during" ? 600 : 400,
                    }}
                  >
                    <Diya size={18} />
                    {muhurat.label}
                  </p>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2. What the sender wanted to say
          ════════════════════════════════════════════════════════════════════ */}
      {greeting.length > 0 && (
        <section className="gc-section gc-section--ruled">
          <div className="gc-wrap" style={{ textAlign: "center" }}>
            <div style={{ maxWidth: "44ch", margin: "0 auto", display: "grid", gap: "clamp(14px, 2vw, 22px)" }}>
              {greeting.map((line, i) => (
                <Reveal key={`${i}-${line}`} delay={i * 0.1} as="p">
                  <span
                    className="gc-quote"
                    style={{
                      display: "block",
                      fontSize: "clamp(20px, 3.4vw, 30px)",
                      lineHeight: 1.42,
                      color: GC.ink,
                    }}
                  >
                    {line}
                  </span>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.34}>
              <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
                <Rule width={160} />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          3. The aarti — the centre of the page
          ════════════════════════════════════════════════════════════════════ */}
      <AartiSection data={data} playing={playing} onPlay={() => setPlaying(true)} />

      {/* ════════════════════════════════════════════════════════════════════
          4. The offerings — five cards, nothing gated
          ════════════════════════════════════════════════════════════════════ */}
      <section className="gc-section gc-section--ruled">
        <div className="gc-wrap">
          <Reveal>
            <SectionHead
              eyebrow="What is offered"
              title="Five things, and why"
              centered
              sub="Nothing here needs you to do anything. It is what is put in front of him, and what each one is for."
            />
          </Reveal>

          {/* One column on a phone, two on a tablet, five across on a laptop.
              `auto-fit` with a min track rather than three breakpoints: the
              cards find their own number of columns and the odd one out centres
              itself instead of stranding at the left. */}
          <div
            style={{
              marginTop: "clamp(28px, 4vw, 48px)",
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            {OFFERINGS.map((o, i) => {
              const Icon = OFFERING_ICONS[o.key];
              return (
                <Reveal key={o.key} delay={i * 0.07}>
                  <Card pad={20} style={{ height: "100%" }}>
                    <div style={{ display: "grid", gap: 10 }}>
                      <span style={{ display: "grid", placeItems: "start" }}>
                        <Icon size={40} />
                      </span>
                      <p
                        className="gc-display"
                        style={{ fontSize: 17, fontWeight: 700, color: GC.ink, margin: 0 }}
                      >
                        {o.label}
                      </p>
                      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: GC.muted, margin: 0 }}>
                        {o.meaning}
                      </p>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          5. The photograph
          ════════════════════════════════════════════════════════════════════ */}
      {data.photoUrl && (
        <section className="gc-section gc-section--sunk">
          <div className="gc-wrap">
            <div className="gc-split" style={{ ["--gc-split" as string]: "0.9fr 1.1fr" }}>
              <div className="gc-art">
                <Reveal>
                  <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
                    <RoundFrame size={280}>
                      <div style={{ position: "relative", width: "100%", height: "100%" }}>
                        <UserImage
                          src={data.photoUrl}
                          alt=""
                          sizes="(min-width: 1024px) 280px, 70vw"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </RoundFrame>
                    {/* A garland under the portrait — how a photograph is
                        actually dressed during the festival. */}
                    <div aria-hidden style={{ display: "flex", gap: 3 }}>
                      {Array.from({ length: 7 }, (_, i) => (
                        <Marigold key={i} size={14} />
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="gc-words">
                <Reveal delay={0.1}>
                  <SectionHead eyebrow="At home" title="This year, from us" />
                  <p className="gc-lede" style={{ marginTop: 18 }}>
                    {data.senderName && data.recipientName
                      ? `${data.senderName} and ${data.recipientName}, and everyone who could get there.`
                      : "Everyone who could get there."}
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          6. Our wishes this year
          ════════════════════════════════════════════════════════════════════ */}
      {wishes.length > 0 && (
        <section className="gc-section gc-section--ruled">
          <div className="gc-wrap">
            <Reveal>
              <SectionHead
                eyebrow="Asked for"
                title="Our wishes this year"
                centered
                sub="Written down, so it is on the record."
              />
            </Reveal>
            <Reveal delay={0.12}>
              <Card
                style={{
                  marginTop: "clamp(24px, 4vw, 44px)",
                  maxWidth: 860,
                  marginInline: "auto",
                }}
              >
                <div className={`gc-wishlist${wishes.length > 3 ? " gc-wishlist--wide" : ""}`}>
                  {wishes.map((r, i) => (
                    <div key={`${i}-${r.label}`} className="gc-wishrow">
                      <span style={{ fontSize: 15, lineHeight: 1.45, color: GC.ink, minWidth: 0 }}>
                        {r.label}
                      </span>
                      <span aria-hidden className="gc-dots" />
                      <span
                        className="gc-display"
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: GC.maroon,
                          lineHeight: 1.45,
                          textAlign: "right",
                          flexShrink: 0,
                          maxWidth: "52%",
                        }}
                      >
                        {r.value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          7. The prasad
          ════════════════════════════════════════════════════════════════════ */}
      <section className="gc-section gc-section--ruled">
        <div className="gc-wrap" style={{ textAlign: "center" }}>
          <Reveal>
            <div style={{ display: "grid", placeItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 132,
                  height: 132,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: `radial-gradient(circle at 50% 36%, ${GC.surface}, ${GC.goldPale})`,
                  border: `1px solid ${GC.goldSoft}`,
                }}
              >
                <Modak size={84} />
              </div>
              <SectionHead eyebrow="Prasad" title="Take one" centered rule={false} />
              {data.prasadNote && (
                <p
                  className="gc-quote"
                  style={{
                    fontSize: "clamp(17px, 2.6vw, 22px)",
                    lineHeight: 1.5,
                    color: GC.muted,
                    margin: 0,
                    maxWidth: "36ch",
                  }}
                >
                  {data.prasadNote}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          8. What the reader says back
          ════════════════════════════════════════════════════════════════════ */}
      <ReplySection data={data} mode={mode} shareId={shareId} />

      {/* ════════════════════════════════════════════════════════════════════
          9. The collection, if there is one
          ════════════════════════════════════════════════════════════════════ */}
      {hasVargani && <VarganiSection data={data} />}

      {/* ════════════════════════════════════════════════════════════════════
          10. The card, and the way out
          ════════════════════════════════════════════════════════════════════ */}
      <section className="gc-section gc-section--sunk">
        <div className="gc-wrap" style={{ textAlign: "center" }}>
          <Reveal>
            <SectionHead
              eyebrow="Keep it"
              title="Put it on your story"
              centered
              sub="A card with the photo, both names and the date — 1080×1920, the exact size, with a code back to this page."
            />
          </Reveal>

          {/* Two buttons and not one, because the two devices need different
              things and neither works on the other. There is no web API anywhere
              that posts to a Story, so the phone path is the OS share sheet with
              Instagram in it, and the laptop path is a download. See StoryCard. */}
          <Reveal delay={0.12}>
            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button onClick={() => void runStory("share")} disabled={!story.ready || story.busy}>
                {story.busy ? <Loader2 size={15} className="animate-spin" /> : <Instagram size={15} />}
                Add to your story
              </Button>
              <Button
                tone="quiet"
                onClick={() => void runStory("download")}
                disabled={!story.ready || story.busy}
              >
                <Download size={15} /> Save the card
              </Button>
            </div>
          </Reveal>

          {storyMsg && (
            <p role="status" style={{ fontSize: 12.5, color: GC.muted, marginTop: 14 }}>
              {storyMsg}
            </p>
          )}

          <Reveal delay={0.2}>
            <div style={{ marginTop: 56, display: "grid", placeItems: "center", gap: 14 }}>
              <Rule width={200} />
              {visarjan && (
                <p style={{ fontSize: 13, color: GC.muted, margin: 0 }}>{visarjan}</p>
              )}
              {mode === "live" && (
                <Button as="a" href="/templates" tone="quiet">
                  Make one of your own
                </Button>
              )}
              {mode === "live" && hasPassword && (
                <p style={{ fontSize: 11, color: GC.muted, margin: 0, opacity: 0.75 }}>
                  This page is private — it was sent with a password.
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* The story card's off-screen node. It MUST be rendered — html-to-image
          cannot capture a node with no layout. */}
      {story.element}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════

/**
 * The reader writes one line back, once.
 *
 * ── IT IS WRITE-ONCE, AND THE SECTION SAYS SO ───────────────────────────────
 *
 * The public route refuses a second write, and a form that silently stops
 * working is worse than one that never worked. So once it is written the box is
 * replaced by the words themselves, presented as something recorded rather than
 * as a filled input.
 *
 * ── AND IT IS `mode === "live"` ONLY ────────────────────────────────────────
 *
 * In the builder there is nobody to write it: the sender is looking at their own
 * page, and anything they typed here would be their words in the reader's slot.
 * So the editor gets a description of the box instead of the box, which is also
 * the only way the sender learns the feature exists.
 */
function ReplySection({
  data,
  mode,
  shareId,
}: {
  data: GaneshData;
  mode: "preview" | "live";
  shareId?: string;
}) {
  // Seeded from the server document, then owned locally once written — the page
  // does not refetch, and re-reading `data` would blank the box the moment the
  // POST resolves.
  const [written, setWritten] = useState(data.reply);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text || !shareId || saving) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`${API_URL}/ganesh-chaturthi-pages/share/${shareId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ reply: text }),
      });
      const json = await res.json();
      if (json?.success && json.data?.reply) {
        // Covers the already-written case too: the route returns the EXISTING
        // reply rather than an error, so a second tab that got here first shows
        // those words instead of a failure.
        setWritten(String(json.data.reply));
      } else {
        setErr("Couldn’t save that — try once more.");
      }
    } catch {
      setErr("Couldn’t save that — check your connection.");
    } finally {
      setSaving(false);
    }
  }, [draft, shareId, saving]);

  const canWrite = mode === "live" && !!shareId && !written;

  return (
    <section className="gc-section gc-section--ruled">
      <div className="gc-wrap">
        <Reveal>
          <SectionHead
            eyebrow="Back to them"
            title="What did you ask for?"
            centered
            sub={
              written
                ? undefined
                : "One line. It goes back to whoever sent this, and it cannot be changed afterwards."
            }
          />
        </Reveal>

        <Reveal delay={0.12}>
          <div style={{ maxWidth: 620, margin: "clamp(24px, 4vw, 40px) auto 0" }}>
            {written ? (
              <Card style={{ textAlign: "center" }}>
                <p className="gc-eyebrow" style={{ margin: "0 0 12px" }}>
                  Recorded
                </p>
                <p
                  className="gc-quote"
                  style={{
                    fontSize: "clamp(19px, 3vw, 25px)",
                    lineHeight: 1.5,
                    color: GC.ink,
                    margin: 0,
                  }}
                >
                  “{written}”
                </p>
                <p style={{ fontSize: 12.5, color: GC.muted, margin: "16px 0 0" }}>
                  {mode === "live"
                    ? `${data.senderName || "They"} will see this.`
                    : "What they wrote back."}
                </p>
              </Card>
            ) : canWrite ? (
              <Card>
                <label
                  htmlFor="gc-reply"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: GC.muted,
                    marginBottom: 10,
                  }}
                >
                  In your own words
                </label>
                <textarea
                  id="gc-reply"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  // Matches the server's cap exactly. A `maxLength` here and a
                  // silent `.slice()` there would let somebody type a sentence
                  // and receive a different one back.
                  maxLength={140}
                  rows={3}
                  placeholder="One line is plenty."
                  style={{
                    width: "100%",
                    resize: "none",
                    fontSize: 16,
                    lineHeight: 1.55,
                    padding: "12px 14px",
                    borderRadius: 14,
                    color: GC.ink,
                    background: GC.paper,
                    border: `1px solid ${GC.hairlineStrong}`,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 14,
                  }}
                >
                  <span style={{ fontSize: 12, color: err ? GC.maroon : GC.muted }}>
                    {err || `${140 - draft.length} characters left`}
                  </span>
                  <Button onClick={() => void submit()} disabled={!draft.trim() || saving}>
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    {saving ? "Saving" : "Send it back"}
                  </Button>
                </div>
              </Card>
            ) : (
              // The builder's view of the box. A dashed placeholder rather than
              // a live textarea, so the sender learns the feature exists without
              // being able to fill in the reader's half of their own page.
              <div
                style={{
                  padding: "22px 24px",
                  borderRadius: 18,
                  border: `1px dashed ${GC.goldSoft}`,
                  background: "rgba(243,231,201,0.35)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 14, lineHeight: 1.65, color: GC.muted, margin: 0 }}>
                  Whoever opens this writes one line here — what they asked for —
                  and it comes back to you. They cannot change it afterwards, and
                  neither can you.
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The collection a building or a group of friends runs for its pandal.
 *
 * The quietest block on the page, deliberately. Money on a devotional page is
 * defensible only if it is impossible to feel obliged by, so there is no amount,
 * no total raised, no count of who has paid, and nowhere for the page to record
 * that anybody did — the server has no field for it either.
 */
function VarganiSection({ data }: { data: GaneshData }) {
  /**
   * The payment link. Only when there is an actual ID: a QR image alone is
   * scannable but cannot be turned into a link, and a `upi://` URL with an empty
   * `pa` opens somebody's payment app on an error screen.
   *
   * No `am` (amount) parameter, deliberately — see the note above. A prefilled
   * figure is the difference between a collection and a bill.
   */
  const upiLink = data.vargani.upiId
    ? `upi://pay?pa=${encodeURIComponent(data.vargani.upiId)}&pn=${encodeURIComponent(
        data.senderName || "Collection"
      )}&cu=INR&tn=${encodeURIComponent("Ganesh Chaturthi collection")}`
    : null;

  return (
    <section className="gc-section gc-section--ruled">
      <div className="gc-wrap">
        <Reveal>
          <Card
            style={{
              maxWidth: 560,
              marginInline: "auto",
              display: "flex",
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {data.vargani.qrImageUrl && (
              <div
                style={{
                  position: "relative",
                  width: 104,
                  height: 104,
                  flexShrink: 0,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                  border: `1px solid ${GC.hairline}`,
                }}
              >
                <UserImage
                  src={data.vargani.qrImageUrl}
                  alt="Payment code"
                  sizes="104px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1, minInlineSize: 200 }}>
              <p className="gc-eyebrow" style={{ margin: "0 0 8px" }}>
                For the pandal
              </p>
              {data.vargani.note && (
                <p style={{ fontSize: 14, lineHeight: 1.6, color: GC.ink, margin: "0 0 12px" }}>
                  {data.vargani.note}
                </p>
              )}
              {upiLink ? (
                <a
                  href={upiLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: 38,
                    padding: "0 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    color: GC.ink,
                    background: GC.goldPale,
                    border: `1px solid ${GC.goldSoft}`,
                  }}
                >
                  {data.vargani.upiId}
                </a>
              ) : (
                <p style={{ fontSize: 12.5, color: GC.muted, margin: 0 }}>
                  Scan it if you want to. Entirely optional.
                </p>
              )}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The URL this page is being read at, for the story card's code.
 *
 * Read from `location` rather than rebuilt from `shareId`, because the share URL
 * is minted by the SERVER (`utils/shareUrl.ts`) and can be a per-user subdomain
 * on the apex deployment — `${SITE_URL}/${shareId}` would be a working link to
 * the wrong host, which is the kind of thing that only surfaces in somebody's
 * story a week later.
 */
function currentUrl(): string | null {
  if (typeof window === "undefined") return null;
  return `${window.location.origin}${window.location.pathname}`;
}
