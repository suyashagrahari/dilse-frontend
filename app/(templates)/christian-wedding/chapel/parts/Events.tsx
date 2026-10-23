"use client";

// ─── Every function: date, time, venue, map, dress code, calendar ───────────
// One card per function (1 column on phones, 2 on tablets, 3 on desktops).
// Each card: the day as a little paper calendar leaf, the time, the venue and
// address, the dress code with its colour swatch, the note, and three buttons
// (Directions · Add to calendar (.ics) · Google). "Save all dates" below.

import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, formatEventTime, googleCalendarUrl, mapLink, type WeddingEvent } from "../../../_wedding";
import { swatchFor } from "../model";
import { shareableUrl } from "./guest";
import { ICON, Icon, useFlash } from "./ShareBar";
import { Heading } from "./Blocks";

const dayParts = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { ...o, timeZone: "UTC" }).format(d);
  return { wd: f({ weekday: "short" }), day: f({ day: "numeric" }), mon: f({ month: "short" }), year: f({ year: "numeric" }) };
};

export default function Events({ events, couple, icons }: { events: WeddingEvent[]; couple: string; icons: Record<string, string> }) {
  const [flash, setFlash] = useFlash();
  if (!events.length) return null;
  const dated = events.filter((e) => e.date);
  const save = (list: WeddingEvent[], key: string) => {
    if (downloadWeddingIcs(list, { couple, url: shareableUrl(), tz: DEFAULT_TZ_OFFSET }, list.length > 1 ? `wedding-${couple}` : `${list[0].title}-${couple}`)) setFlash(key);
  };
  return (
    <section className="cw-sec cw-events" id="events" aria-labelledby="cw-events-h">
      <Heading eyebrow="Celebrate with us" title="The wedding days" id="cw-events-h" />
      <ul className={`cw-ev-grid n${Math.min(events.length, 3)}`}>
        {events.map((e, i) => {
          const d = e.date ? dayParts(e.date) : null;
          const time = e.time ? formatEventTime(e.time, "en-IN") : "Time to be announced";
          const swatch = swatchFor(e);
          const map = e.venue || e.address ? mapLink(e) : "";
          const gcal = e.date ? googleCalendarUrl(e, { couple, url: shareableUrl(), tz: DEFAULT_TZ_OFFSET }) : "";
          return (
            <Reveal as="li" key={e.id || i} className="cw-ev" delay={(i % 3) * 90}>
              <div className="cw-ev-top">
                {d ? (
                  <span className="cw-ev-leaf" aria-label={`${d.wd} ${d.day} ${d.mon} ${d.year}`}>
                    <small>{d.mon}</small>
                    <b>{d.day}</b>
                    <small>{d.wd}</small>
                  </span>
                ) : (
                  <span className="cw-ev-leaf is-tba" aria-hidden>
                    <b>{icons[e.id] || "✦"}</b>
                  </span>
                )}
                <div className="cw-ev-head">
                  <h3 className="cw-ev-title">
                    <span aria-hidden>{icons[e.id] ? `${icons[e.id]} ` : ""}</span>
                    {e.title}
                  </h3>
                  <p className="cw-ev-time">
                    <Icon d={ICON.clock} size={15} /> {time}
                  </p>
                </div>
              </div>
              {(e.venue || e.address) && (
                <p className="cw-ev-venue">
                  <Icon d={ICON.pin} size={15} />
                  <span>
                    {e.venue && <b>{e.venue}</b>}
                    {e.address && <small>{e.address}</small>}
                  </span>
                </p>
              )}
              {e.dressCode && (
                <p className="cw-ev-dress">
                  {swatch ? <span className="cw-swatch" style={{ background: swatch }} aria-hidden /> : <Icon d={ICON.dress} size={15} />}
                  <span>
                    <small>Dress code</small> {e.dressCode}
                  </span>
                </p>
              )}
              {e.note && <p className="cw-ev-note">{e.note}</p>}
              <div className="cw-ev-btns">
                {map && (
                  <a className="cw-pill" href={map} target="_blank" rel="noopener noreferrer">
                    <Icon d={ICON.pin} size={15} /> Directions
                  </a>
                )}
                {e.date && (
                  <button type="button" className="cw-pill" onClick={() => save([e], e.id)}>
                    <Icon d={flash === e.id ? ICON.check : ICON.cal} size={15} /> {flash === e.id ? "Saved" : "Calendar"}
                  </button>
                )}
                {gcal && (
                  <a className="cw-pill" href={gcal} target="_blank" rel="noopener noreferrer" aria-label={`Add ${e.title} to Google Calendar`}>
                    <Icon d={ICON.google} size={15} /> Google
                  </a>
                )}
              </div>
            </Reveal>
          );
        })}
      </ul>
      {dated.length > 1 && (
        <Reveal className="cw-ev-all">
          <button type="button" className="cw-btn cw-btn-ghost" onClick={() => save(dated, "all")}>
            <Icon d={flash === "all" ? ICON.check : ICON.cal} size={17} /> {flash === "all" ? "All dates saved" : "Save all dates"}
          </button>
        </Reveal>
      )}
    </section>
  );
}
