"use client";
// ─── Wedding kit playground (development only — never routed) ───────────────
//
// `_wedding` is a private folder, so nothing here is a route and nothing ships
// unless imported. To look at the kit, create a throwaway page that renders
// <KitDemo /> (e.g. app/wedding-kit-dev/page.tsx with `"use client"` and
// `export default function P() { return <KitDemo /> }`), run `next dev --webpack`,
// and DELETE the page before committing.
//
// Query params: ?theme=noir · ?only=masonry|editor|sections|rsvp|themes ·
// ?mask=arch · ?frame=foil|mat · ?n=12

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  BlessingsWall,
  ORNAMENTS,
  Ornament,
  Countdown,
  Divider,
  EventsTimeline,
  FamiliesBlock,
  MasonryEditor,
  MessageBlock,
  Monogram,
  RSVPBlock,
  Section,
  ThemePicker,
  VenueCard,
  WeddingCard,
  WeddingMasonry,
  WeddingRoot,
  isWeddingThemeId,
  type MasonryFrame,
  type OrnamentId,
  type MasonryMask,
  type WeddingEvent,
  type WeddingPhoto,
  type WeddingThemeId,
} from "..";

const ASPECTS: [number, number][] = [
  [800, 1200], [1200, 800], [900, 900], [700, 1100], [1300, 700], [800, 1000],
  [1000, 1400], [1200, 900], [900, 1350], [1400, 800], [800, 800], [750, 1150],
  [1100, 1100], [900, 1200], [1300, 860], [800, 1180],
];
const SPANS: WeddingPhoto["span"][] = [undefined, undefined, "wide", undefined, undefined, "tall", undefined, undefined, "large", undefined, undefined, undefined];

function demoPhotos(n: number): WeddingPhoto[] {
  return Array.from({ length: n }, (_, i) => {
    const [w, h] = ASPECTS[i % ASPECTS.length];
    return {
      url: `https://picsum.photos/seed/wk${i + 3}/${w}/${h}`,
      w,
      h,
      span: SPANS[i % SPANS.length],
      cropX: 50,
      cropY: i % 3 === 0 ? 30 : 50,
      caption: i % 4 === 0 ? ["Where it all began", "The roka", "Mehendi nights", "Forever starts here"][(i / 4) % 4] : undefined,
    };
  });
}

const EVENTS: WeddingEvent[] = [
  { id: "haldi", title: "Haldi", date: "2026-12-10", time: "10:00", venue: "The Courtyard, Sharma Niwas", address: "Civil Lines, Jaipur", dressCode: "Shades of yellow", dressColor: "#f2c94c" },
  { id: "mehendi", title: "Mehendi", date: "2026-12-10", time: "17:00", endTime: "21:00", venue: "Rambagh Palace Lawns", address: "Bhawani Singh Rd, Jaipur", dressCode: "Greens & florals", dressColor: "#4f9b6a" },
  { id: "sangeet", title: "Sangeet", date: "2026-12-11", time: "19:30", venue: "Jai Mahal Palace", address: "Jacob Rd, Jaipur", dressCode: "Indo-western glam", dressColor: "#7b3fa0" },
  { id: "wedding", title: "Wedding", date: "2026-12-12", time: "19:30", venue: "Rambagh Palace", address: "Bhawani Singh Rd, Jaipur", dressCode: "Traditional", dressColor: "#a3122b", note: "Baraat at 7:30 pm sharp, pheras at 9:15 pm." },
  { id: "reception", title: "Reception", date: "2026-12-13", time: "20:00", venue: "ITC Rajputana", address: "Palace Rd, Jaipur" },
];

const MSG = `Together with their families,
Ananya and Rohan
request the pleasure of your company as they begin their forever.

Your presence and blessings will make our celebration complete.`;
const HINDI = `सादर आमंत्रण

हमारे परिवार के आशीर्वाद से
अनन्या और रोहन
के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं।`;

const sub = () => () => {};
const getSearch = () => window.location.search;

export default function KitDemo() {
  const search = useSyncExternalStore(sub, getSearch, () => "");
  const q = useMemo(() => new URLSearchParams(search), [search]);
  const qTheme = q.get("theme");
  const [picked, setPicked] = useState<WeddingThemeId | null>(null);
  const theme: WeddingThemeId = picked ?? (isWeddingThemeId(qTheme) ? qTheme : "maroon");
  const only = q.get("only");
  const n = Number(q.get("n")) || 12;
  const mask = (q.get("mask") as MasonryMask) || "rounded";
  const frame = (q.get("frame") as MasonryFrame) || "none";
  const [photos, setPhotos] = useState<WeddingPhoto[]>(() => demoPhotos(n));
  const show = (k: string) => !only || only === k;

  return (
    <WeddingRoot theme={theme} style={{ minHeight: "100vh" }}>
      {show("themes") && (
        <Section eyebrow="Wedding kit" title="Theme" ornament={null} width="narrow">
          <div style={{ background: "#fff", borderRadius: 20, padding: 14 }}>
            <ThemePicker value={theme} onChange={setPicked} sample="A & R" />
          </div>
        </Section>
      )}

      {show("sections") && (
        <>
          <Section width="narrow" ornament={null}>
            <WeddingCard corners="corner-filigree" paper style={{ textAlign: "center", paddingBlock: 56 }}>
              <Monogram a="Ananya" b="Rohan" variant="crest" size={170} caption="12 · 12 · 2026" />
              <p className="wk-eyebrow" style={{ marginTop: 22 }}>Save the date</p>
              <h1 className="wk-script wk-foil-text wk-shimmer" style={{ fontSize: "clamp(48px, 12vw, 84px)", margin: "4px 0 6px" }}>
                Ananya &amp; Rohan
              </h1>
              <Divider ornament="divider-mandala" space={10} width={240} />
              <Countdown date="2026-12-12" time="19:30" variant="flip" />
            </WeddingCard>
          </Section>
          <Section eyebrow="The invitation" ornament={null} width="wide">
            <MessageBlock text={MSG} hindi={HINDI} heading="Shubh Vivah" signature="— The Sharma & Kapoor families" />
          </Section>
          <Section eyebrow="Families" title="With love from" width="normal">
            <FamiliesBlock
              heading=""
              bride={{ title: "Bride's family", names: ["Mrs. Kavita & Mr. Rajesh Sharma"], note: "Jaipur" }}
              groom={{ title: "वर पक्ष", names: ["श्रीमती सुनीता एवं श्री अनिल कपूर"], note: "Delhi" }}
            />
          </Section>
          <Section eyebrow="Celebrations" title="The functions" ornament="divider-paisley">
            <EventsTimeline events={EVENTS} couple="Ananya & Rohan" calendar="all" />
          </Section>
          <Section eyebrow="Where" title="The venue" width="narrow" ornament={null}>
            <VenueCard name="Rambagh Palace" address="Bhawani Singh Rd, Jaipur, Rajasthan 302005" note="Valet parking at the main gate" embed />
          </Section>
        </>
      )}

      {show("masonry") && (
        <Section eyebrow="Moments" title="Our story in pictures" width="wide">
          <WeddingMasonry photos={photos} mask={mask} frame={frame} tileCaptions />
        </Section>
      )}

      {show("rsvp") && (
        <Section eyebrow="RSVP" title="Kindly respond" width="narrow">
          <RSVPBlock mode="preview" couple="Ananya & Rohan" events={EVENTS} perEvent meal askPhone deadline="2026-11-30" />
          <div style={{ height: 40 }} />
          <BlessingsWall mode="preview" />
        </Section>
      )}

      {show("editor") && (
        <Section eyebrow="Sender's studio" title="Gallery editor" width="normal" ornament={null}>
          <div style={{ background: "#fff", borderRadius: 22, padding: 14, position: "relative" }}>
            <MasonryEditor photos={photos} onChange={setPhotos} max={20} mask={mask} />
          </div>
        </Section>
      )}

      {show("ornaments") && (
        <Section eyebrow="Ornaments" title="Foil, themed" width="normal">
          <WeddingCard corners="corner-mughal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 18, padding: 48 }}>
            {(Object.keys(ORNAMENTS) as OrnamentId[]).map((id) => (
              <figure key={id} style={{ margin: 0, display: "grid", justifyItems: "center", gap: 6 }}>
                <Ornament id={id} width={ORNAMENTS[id].aspect > 2 ? 90 : 56} shimmer />
                <figcaption style={{ font: "11px var(--wk-font-sans)", color: "var(--wk-muted)" }}>{id}</figcaption>
              </figure>
            ))}
          </WeddingCard>
        </Section>
      )}
    </WeddingRoot>
  );
}
