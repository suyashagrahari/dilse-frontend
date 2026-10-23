"use client";

// ─── The eight steps of the Reception Night editor ───────────────────────────

import { useMemo, useState } from "react";
import PhotoCropper from "../../../_valentine/editor/PhotoCropper";
import { MasonryEditor, RsvpDashboard } from "../../../_wedding";
import { copyText } from "../Actions";
import { personalLink } from "../guest";
import { clock12, galleryToPhotos, isUpiId, newEvent, normalisePhone, photosToGallery, youtubeIdOf } from "../model";
import { RECEPTION_LIMITS, RECEPTION_THEMES, type Contact, type PersonInfo, type ReceptionData, type ReceptionEvent, type StoryChapter, type Thing } from "../types";
import { Area, Chips, Field, PhotoPick, RowActions, Segmented, Swatches, Toggle, move } from "./Fields";
import SongPicker from "./SongPicker";

export interface StepProps {
  mf: ReceptionData;
  patch: (p: Partial<ReceptionData>) => void;
  onUndo: (label: string, restore: () => void) => void;
}

const fmtDate = (d: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
};

function Card({ title, sub, children, open, onToggle }: { title: string; sub?: string; children: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <div className={`rc-ed-card${open ? " is-open" : ""}`}>
      <button type="button" className="rc-ed-card-h" aria-expanded={open} onClick={onToggle}>
        <span>
          <b>{title}</b>
          {sub && <small>{sub}</small>}
        </span>
        <i aria-hidden>{open ? "–" : "+"}</i>
      </button>
      {open && <div className="rc-ed-card-b">{children}</div>}
    </div>
  );
}

// ── 1. The couple ───────────────────────────────────────────────────────────

function PersonEditor({ who, p, onChange }: { who: "Bride" | "Groom"; p: PersonInfo; onChange: (p: PersonInfo) => void }) {
  const [crop, setCrop] = useState(false);
  return (
    <div className="rc-ed-person">
      <PhotoPick
        src={p.photo}
        label={`${who}'s portrait`}
        aspect={4 / 5}
        onPick={(url) => onChange({ ...p, photo: url, cropX: 50, cropY: 40, scale: 100 })}
        onClear={() => onChange({ ...p, photo: "" })}
        onFrame={() => setCrop(true)}
      />
      <Field label={`${who}'s full name`} value={p.name} max={60} onChange={(v) => onChange({ ...p, name: v })} placeholder={who === "Bride" ? "Priya Sharma" : "Arjun Verma"} />
      <Area label={`About the ${who.toLowerCase()}`} value={p.description} max={300} rows={3} onChange={(v) => onChange({ ...p, description: v })} help="One warm line for their portrait card." />
      {p.photo && (
        <PhotoCropper
          open={crop}
          src={p.photo}
          crop={{ x: p.cropX ?? 50, y: p.cropY ?? 50, scale: p.scale ?? 100 }}
          aspect={4 / 5}
          title={`Frame the ${who.toLowerCase()}'s portrait`}
          onChange={(c) => onChange({ ...p, cropX: Math.round(c.x), cropY: Math.round(c.y), scale: Math.round(c.scale) })}
          onClose={() => setCrop(false)}
        />
      )}
    </div>
  );
}

export function StepCouple({ mf, patch, onAi, onCard, cardBusy, aiAvailable }: StepProps & { onAi: () => void; onCard: (images: string[]) => void; cardBusy: boolean; aiAvailable: boolean }) {
  const [cardErr, setCardErr] = useState("");
  const readCard = async (files: FileList | null) => {
    if (!files?.length) return;
    setCardErr("");
    try {
      const { compressImage } = await import("../../../dedication/components/mediaUploads");
      const imgs = await Promise.all(Array.from(files).slice(0, 3).map((f) => compressImage(f, 1600)));
      onCard(imgs);
    } catch (e) {
      setCardErr(e instanceof Error ? e.message : "That photo could not be read");
    }
  };
  return (
    <>
      {aiAvailable && (
        <div className="rc-ed-ai">
          <p className="rc-ed-ai-k">✦ The fastest way</p>
          <h3>Let AI write your invitation</h3>
          <p>Answer a few quick questions — names, date, venue, how you met — and every section is written for you. You can change every word after.</p>
          <button type="button" className="rc-ed-btn is-gold is-lg" onClick={onAi}>
            ✦ Answer a few quick questions
          </button>
          <label className="rc-ed-ai-card">
            <input type="file" accept="image/*" multiple hidden onChange={(e) => void readCard(e.target.files)} />
            <span>{cardBusy ? "Reading your card…" : "Have a printed card? Read it from a photo"}</span>
          </label>
          {cardErr && <p className="rc-ed-err">{cardErr}</p>}
        </div>
      )}
      <h3 className="rc-ed-h">The couple</h3>
      <div className="rc-ed-grid2">
        <Field label="Bride's first name" required value={mf.brideName} max={30} onChange={(v) => patch({ brideName: v })} placeholder="Priya" autoComplete="off" error={!mf.brideName.trim() ? "The bride's name is needed" : undefined} />
        <Field label="Groom's first name" required value={mf.groomName} max={30} onChange={(v) => patch({ groomName: v })} placeholder="Arjun" error={!mf.groomName.trim() ? "The groom's name is needed" : undefined} />
      </div>
      <div className="rc-ed-grid2 is-people">
        <PersonEditor who="Bride" p={mf.bride} onChange={(bride) => patch({ bride })} />
        <PersonEditor who="Groom" p={mf.groom} onChange={(groom) => patch({ groom })} />
      </div>
      <h3 className="rc-ed-h">The families</h3>
      <Field label="Bride's parents" value={mf.families.bride} max={160} onChange={(v) => patch({ families: { ...mf.families, bride: v } })} placeholder="Mrs. Sunita & Mr. Rajesh Sharma" help='Printed as "Daughter of …"' />
      <Field label="Groom's parents" value={mf.families.groom} max={160} onChange={(v) => patch({ families: { ...mf.families, groom: v } })} placeholder="Mrs. Meena & Mr. Vikram Verma" help='Printed as "Son of …"' />
      <Field label="With the blessings of (optional)" value={mf.blessingsOf} max={160} onChange={(v) => patch({ blessingsOf: v })} placeholder="Grandparents or elders" />
    </>
  );
}

// ── 2. The evening ──────────────────────────────────────────────────────────

const PART_NAMES = ["Wedding Reception", "Cocktails", "Dinner & Toasts", "After-party", "Sangeet Night", "Ring Ceremony", "Brunch"] as const;
const isMapsUrl = (u: string) => !u || /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(u.trim());

function EventEditor({ e, onChange }: { e: ReceptionEvent; onChange: (e: ReceptionEvent) => void }) {
  const set = (p: Partial<ReceptionEvent>) => onChange({ ...e, ...p });
  return (
    <>
      <Field label="Name" value={e.title} max={60} onChange={(v) => set({ title: v })} placeholder="Wedding Reception" />
      <Chips options={PART_NAMES} value={e.title} onPick={(v) => set({ title: v })} label="Suggestions" />
      <div className="rc-ed-grid3">
        <Field label="Date" type="date" value={e.date} onChange={(v) => set({ date: v })} />
        <Field label="Starts" type="time" value={e.time} onChange={(v) => set({ time: v })} />
        <Field label="Ends (optional)" type="time" value={e.endTime} onChange={(v) => set({ endTime: v })} />
      </div>
      <Field label="Venue" value={e.venue} max={120} onChange={(v) => set({ venue: v })} placeholder="The Grand Ballroom, Taj Palace" />
      <Field label="Address" value={e.address} max={200} onChange={(v) => set({ address: v })} placeholder="Street, city, state" />
      <Field
        label="Google Maps link (optional)"
        type="url"
        inputMode="url"
        value={e.mapUrl}
        max={500}
        onChange={(v) => set({ mapUrl: v.trim() })}
        placeholder="https://maps.app.goo.gl/…"
        help="Paste the link from Google Maps → Share. Without one, the venue and address are used."
        error={isMapsUrl(e.mapUrl) ? undefined : "That isn't a Google Maps link"}
      />
      <Field label="Dress code" value={e.dressCode} max={80} onChange={(v) => set({ dressCode: v })} placeholder="Black tie & evening gowns" />
      <Swatches value={e.dressColor} onChange={(c) => set({ dressColor: c })} />
      <Area label="Note for guests (optional)" value={e.note} max={300} rows={2} onChange={(v) => set({ note: v })} placeholder="The couple's grand entry is at 7:30 pm." />
    </>
  );
}

export function StepEvening({ mf, patch, onUndo }: StepProps) {
  const [open, setOpen] = useState<number>(0);
  const list = mf.events;
  const setList = (events: ReceptionEvent[]) => patch({ events });
  const full = list.length >= RECEPTION_LIMITS.events;
  return (
    <>
      <h3 className="rc-ed-h">The evening</h3>
      <p className="rc-ed-lead">The reception and any other part of the night — cocktails, dinner, an after-party. Guests RSVP to each.</p>
      <div className="rc-ed-list">
        {list.map((e, i) => (
          <Card
            key={e.id}
            title={e.title || `Part ${i + 1}`}
            sub={[fmtDate(e.date), clock12(e.time), e.venue.split(",")[0]].filter(Boolean).join(" · ") || "Tap to fill in"}
            open={open === i}
            onToggle={() => setOpen(open === i ? -1 : i)}
          >
            <EventEditor e={e} onChange={(n) => setList(list.map((x, j) => (j === i ? n : x)))} />
            <RowActions
              i={i}
              n={list.length}
              onMove={(to) => {
                setList(move(list, i, to));
                setOpen(to);
              }}
              canDuplicate={!full}
              onDuplicate={() => {
                const copy = { ...e, id: newEvent(list.map((x) => x.id)).id, title: `${e.title} (copy)`.slice(0, 60) };
                setList([...list.slice(0, i + 1), copy, ...list.slice(i + 1)]);
                setOpen(i + 1);
              }}
              onRemove={() => {
                const before = list;
                setList(list.filter((_, j) => j !== i));
                setOpen(-1);
                onUndo(`Removed “${e.title || "that part"}”`, () => setList(before));
              }}
            />
          </Card>
        ))}
      </div>
      {full ? (
        <p className="rc-ed-help">That&apos;s the most this invitation holds ({RECEPTION_LIMITS.events}). For a full wedding with Haldi, Mehendi and Sangeet, try the Royal or Palace Door invitations.</p>
      ) : (
        <button
          type="button"
          className="rc-ed-btn is-ghost is-wide"
          onClick={() => {
            const n = { ...newEvent(list.map((x) => x.id)), date: list[0]?.date ?? "", venue: list[0]?.venue ?? "", address: list[0]?.address ?? "" };
            setList([...list, n]);
            setOpen(list.length);
          }}
        >
          + Add a part of the evening
        </button>
      )}
    </>
  );
}

// ── 3. Photos ───────────────────────────────────────────────────────────────

export function StepPhotos({ mf, patch }: StepProps) {
  const photos = useMemo(() => galleryToPhotos(mf.galleryImages), [mf.galleryImages]);
  const demo = mf.galleryImages.some((g) => g.src.startsWith("/wedding-v3/demo/"));
  return (
    <>
      <h3 className="rc-ed-h">Your cover photo</h3>
      <p className="rc-ed-lead">Shown in the ballroom window at the top. Leave it empty to keep the illustrated couple in a tuxedo and gown.</p>
      <PhotoPick src={mf.sharePhoto || ""} label="Cover photo" aspect={4 / 5} onPick={(url) => patch({ sharePhoto: url })} onClear={() => patch({ sharePhoto: "" })} />
      <h3 className="rc-ed-h">The gallery</h3>
      {demo && <p className="rc-ed-note">These are sample photos — replace them with your own (tap a photo → Replace, or remove it).</p>}
      <MasonryEditor
        photos={photos}
        onChange={(p) => patch({ galleryImages: photosToGallery(p, mf.galleryImages) })}
        max={RECEPTION_LIMITS.gallery}
        mask="rounded"
        hint="Tap a photo to size it (wide, tall, large), set its focus point, zoom, caption or move it. Drag ⠿ to reorder."
      />
    </>
  );
}

// ── 4. Invitation ───────────────────────────────────────────────────────────

export function StepInvite({ mf, patch }: StepProps) {
  return (
    <>
      <h3 className="rc-ed-h">The invitation</h3>
      <Field label="Line under the names" value={mf.tagline} max={120} onChange={(v) => patch({ tagline: v })} placeholder="request the pleasure of your company" />
      <Area label="Invitation (English)" value={mf.invitation} max={1200} rows={6} onChange={(v) => patch({ invitation: v })} help="Two short paragraphs read best. Leave a blank line between them." />
      <Area label="Invitation (Hindi, optional)" value={mf.hindiMessage} max={700} rows={4} lang="hi" onChange={(v) => patch({ hindiMessage: v })} help="Shown beside the English one; guests can switch the whole page to Hindi." />
      <Segmented label="The page opens in" value={mf.lang} onChange={(lang) => patch({ lang })} options={[{ v: "en", label: "English" }, { v: "hi", label: "हिन्दी", lang: "hi" }]} />
      <Field label="Closing line" value={mf.closingLine} max={120} onChange={(v) => patch({ closingLine: v })} placeholder="With love, the Sharma & Verma families" />
      <Field label="Wedding hashtag (optional)" value={mf.hashtag} max={40} onChange={(v) => patch({ hashtag: v })} placeholder="#PriyaWedsArjun" />
    </>
  );
}

// ── 5. Story ────────────────────────────────────────────────────────────────

export function StepStory({ mf, patch, onUndo }: StepProps) {
  const [open, setOpen] = useState(0);
  const list = mf.story;
  const setList = (story: StoryChapter[]) => patch({ story });
  return (
    <>
      <h3 className="rc-ed-h">Your love story</h3>
      <p className="rc-ed-lead">Two or three short chapters — how you met, the proposal. Leave it empty and the section is hidden.</p>
      <div className="rc-ed-list">
        {list.map((c, i) => (
          <Card key={i} title={c.title || `Chapter ${i + 1}`} sub={c.when || undefined} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
            <Field label="When & where" value={c.when} max={40} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, when: v } : x)))} placeholder="2019 · Delhi" />
            <Field label="Title" value={c.title} max={80} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, title: v } : x)))} placeholder="A borrowed umbrella" />
            <Area label="What happened" value={c.line} max={400} rows={3} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, line: v } : x)))} />
            <PhotoPick src={c.photo} label="Chapter photo" aspect={4 / 3} onPick={(url) => setList(list.map((x, j) => (j === i ? { ...x, photo: url } : x)))} onClear={() => setList(list.map((x, j) => (j === i ? { ...x, photo: "" } : x)))} />
            <RowActions
              i={i}
              n={list.length}
              onMove={(to) => {
                setList(move(list, i, to));
                setOpen(to);
              }}
              onRemove={() => {
                const before = list;
                setList(list.filter((_, j) => j !== i));
                onUndo(`Removed “${c.title || "that chapter"}”`, () => setList(before));
              }}
            />
          </Card>
        ))}
      </div>
      {list.length < RECEPTION_LIMITS.story && (
        <button
          type="button"
          className="rc-ed-btn is-ghost is-wide"
          onClick={() => {
            setList([...list, { when: "", title: "", line: "", photo: "" }]);
            setOpen(list.length);
          }}
        >
          + Add a chapter
        </button>
      )}
    </>
  );
}

// ── 6. Guest info ───────────────────────────────────────────────────────────

export function StepGuests({ mf, patch, onUndo }: StepProps) {
  const [upiOn, setUpiOn] = useState(!!mf.upiId);
  const contacts = mf.contacts;
  const setContacts = (c: Contact[]) => patch({ contacts: c });
  const things = mf.things;
  const setThings = (t: Thing[]) => patch({ things: t });
  const liveBad = !!mf.liveUrl && !/^https:\/\/\S+$/i.test(mf.liveUrl);
  const filmBad = !!mf.videoUrl && !youtubeIdOf(mf.videoUrl);
  return (
    <>
      <h3 className="rc-ed-h">Who to call</h3>
      <p className="rc-ed-lead">Elders love a name and a number. Each gets a Call and a WhatsApp button.</p>
      <div className="rc-ed-list">
        {contacts.map((c, i) => (
          <div key={i} className="rc-ed-row">
            <div className="rc-ed-grid2">
              <Field label="Name" value={c.name} max={60} onChange={(v) => setContacts(contacts.map((x, j) => (j === i ? { ...x, name: v } : x)))} placeholder="Rohit Sharma" />
              <Field label="Relation" value={c.relation} max={60} onChange={(v) => setContacts(contacts.map((x, j) => (j === i ? { ...x, relation: v } : x)))} placeholder="Priya's brother" />
            </div>
            <Field
              label="Phone"
              type="tel"
              inputMode="tel"
              prefix="+91"
              value={c.phone.replace(/^\+?91\s?/, "")}
              max={16}
              onChange={(v) => setContacts(contacts.map((x, j) => (j === i ? { ...x, phone: v.startsWith("+") ? v : `+91 ${v}` } : x)))}
              placeholder="98290 11223"
              error={c.phone && !normalisePhone(c.phone) ? "Enter a 10-digit mobile number" : undefined}
            />
            <RowActions
              i={i}
              n={contacts.length}
              onMove={(to) => setContacts(move(contacts, i, to))}
              onRemove={() => {
                const before = contacts;
                setContacts(contacts.filter((_, j) => j !== i));
                onUndo(`Removed ${c.name || "that contact"}`, () => setContacts(before));
              }}
            />
          </div>
        ))}
      </div>
      {contacts.length < RECEPTION_LIMITS.contacts && (
        <button type="button" className="rc-ed-btn is-ghost is-wide" onClick={() => setContacts([...contacts, { name: "", relation: "", phone: "" }])}>
          + Add a contact
        </button>
      )}

      <h3 className="rc-ed-h">Good to know</h3>
      <div className="rc-ed-list">
        {things.map((t, i) => (
          <div key={i} className="rc-ed-row">
            <Field label="Heading" value={t.head} max={60} onChange={(v) => setThings(things.map((x, j) => (j === i ? { ...x, head: v } : x)))} placeholder="Parking" />
            <Area label="Note" value={t.text} max={300} rows={2} onChange={(v) => setThings(things.map((x, j) => (j === i ? { ...x, text: v } : x)))} />
            <RowActions
              i={i}
              n={things.length}
              onMove={(to) => setThings(move(things, i, to))}
              onRemove={() => {
                const before = things;
                setThings(things.filter((_, j) => j !== i));
                onUndo("Removed a note", () => setThings(before));
              }}
            />
          </div>
        ))}
      </div>
      {things.length < RECEPTION_LIMITS.things && (
        <button type="button" className="rc-ed-btn is-ghost is-wide" onClick={() => setThings([...things, { head: "", text: "" }])}>
          + Add a note (parking, stay, kids…)
        </button>
      )}
      <Area label="Getting there (optional)" value={mf.gettingThere} max={600} rows={3} onChange={(v) => patch({ gettingThere: v })} placeholder="Distance from the airport, where cabs drop, which gate…" />

      <h3 className="rc-ed-h">For guests far away</h3>
      <Field label="Live stream link (optional)" type="url" inputMode="url" value={mf.liveUrl} max={500} onChange={(v) => patch({ liveUrl: v.trim() })} placeholder="https://youtube.com/live/…" help="The Watch live button switches on 30 minutes before the reception." error={liveBad ? "Use a full https:// link" : undefined} />
      <Field label="Your film (YouTube, optional)" type="url" inputMode="url" value={mf.videoUrl} max={300} onChange={(v) => patch({ videoUrl: v.trim() })} placeholder="https://youtu.be/…" help="A pre-wedding film or a teaser. It plays only when tapped." error={filmBad ? "That isn't a YouTube link" : undefined} />

      <h3 className="rc-ed-h">Shagun</h3>
      <Toggle
        label="Let guests send shagun by UPI"
        help="Off by default. We never process money — guests pay you directly."
        checked={upiOn}
        onChange={(on) => {
          setUpiOn(on);
          if (!on) patch({ upiId: "", upiName: "" });
        }}
      />
      {upiOn && (
        <div className="rc-ed-grid2">
          <Field label="UPI ID" value={mf.upiId} max={120} onChange={(v) => patch({ upiId: v.trim() })} placeholder="name@okhdfcbank" error={mf.upiId && !isUpiId(mf.upiId) ? "A UPI ID looks like name@bank" : undefined} />
          <Field label="Name on the account" value={mf.upiName} max={60} onChange={(v) => patch({ upiName: v })} placeholder="Priya Sharma" />
        </div>
      )}
    </>
  );
}

// ── 7. Look & music ─────────────────────────────────────────────────────────

export function StepLook({ mf, patch }: StepProps) {
  return (
    <>
      <h3 className="rc-ed-h">The look</h3>
      <div className="rc-ed-themes" role="radiogroup" aria-label="Theme">
        {RECEPTION_THEMES.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={mf.theme === t.id} className="rc-ed-theme" onClick={() => patch({ theme: t.id })}>
            <span className="rc-ed-theme-sw" aria-hidden style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 0 40%, ${t.swatch[1]} 40% 72%, ${t.swatch[2]} 72%)` }} />
            <b>{t.label}</b>
            <small>{t.blurb}</small>
          </button>
        ))}
      </div>
      <h3 className="rc-ed-h">Music</h3>
      <p className="rc-ed-lead">It starts only when a guest taps the doors open, and there&apos;s always a mute button.</p>
      <SongPicker value={mf.music.mode ? mf.music : { mode: "track", youtubeId: "", start: 0 }} onChange={(music) => patch({ music })} />
    </>
  );
}

// ── 8. RSVP & send ──────────────────────────────────────────────────────────

export function StepSend({
  mf,
  patch,
  password,
  setPassword,
  shareUrl,
  pageId,
  token,
}: StepProps & { password: string; setPassword: (v: string) => void; shareUrl: string | null; pageId: string | null; token: string | null | undefined }) {
  const [showPw, setShowPw] = useState(false);
  const [guest, setGuest] = useState("");
  const [copied, setCopied] = useState(false);
  const link = shareUrl ? personalLink(shareUrl, guest) : "";
  return (
    <>
      <h3 className="rc-ed-h">RSVP</h3>
      <Field label="Kindly reply by (optional)" type="date" value={mf.rsvpBy} onChange={(v) => patch({ rsvpBy: v })} />
      <div className="rc-ed-field">
        <span className="rc-ed-label">Most guests on one RSVP</span>
        <div className="rc-ed-stepper">
          <button type="button" className="rc-ed-icon" aria-label="Fewer" onClick={() => patch({ maxGuests: Math.max(1, mf.maxGuests - 1) })}>
            −
          </button>
          <b aria-live="polite">{mf.maxGuests}</b>
          <button type="button" className="rc-ed-icon" aria-label="More" onClick={() => patch({ maxGuests: Math.min(10, mf.maxGuests + 1) })}>
            +
          </button>
        </div>
      </div>
      <Toggle label="Ask about meals" help="Vegetarian, non-veg or Jain — for the caterer's count." checked={mf.rsvpMeal} onChange={(v) => patch({ rsvpMeal: v })} />

      <h3 className="rc-ed-h">Privacy</h3>
      <div className="rc-ed-field">
        <label htmlFor="rc-pw">Password (optional)</label>
        <div className="rc-ed-input has-suffix">
          <input id="rc-pw" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value.slice(0, 40))} placeholder="Leave empty for an open link" autoComplete="new-password" />
          <button type="button" className="rc-ed-suffix" onClick={() => setShowPw((s) => !s)}>
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
        <p className="rc-ed-help">Guests type it once to open the invitation. Share it with them along with the link.</p>
      </div>

      {shareUrl ? (
        <>
          <h3 className="rc-ed-h">Personal links</h3>
          <p className="rc-ed-lead">Type a family&apos;s name — the doors greet them by name and their RSVP is pre-filled.</p>
          <Field label="Guest or family name" value={guest} max={40} onChange={setGuest} placeholder="The Mehta family" />
          <p className="rc-ed-link">{link}</p>
          <div className="rc-ed-btnrow">
            <button
              type="button"
              className="rc-ed-btn"
              onClick={() =>
                void copyText(link).then((ok) => {
                  setCopied(ok);
                  window.setTimeout(() => setCopied(false), 2000);
                })
              }
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>
            <a className="rc-ed-btn is-wa" href={`https://wa.me/?text=${encodeURIComponent(`🥂 You're invited to the wedding reception of ${mf.brideName} & ${mf.groomName}\n${link}`)}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
          {pageId && token && (
            <>
              <h3 className="rc-ed-h">Who&apos;s coming</h3>
              <RsvpDashboard slug="reception" pageId={pageId} token={token} csvName={`${mf.brideName}-${mf.groomName}`} />
            </>
          )}
        </>
      ) : (
        <p className="rc-ed-note">After you publish, this step gives you personal links for each family, the RSVP list and a CSV for the caterer.</p>
      )}
    </>
  );
}
