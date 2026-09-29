"use client";

// ─── Endorsements — the intro card ───────────────────────────────────────────
//
// Cover banner, the round photo overlapping it in a green "#OPENTOFOREVER"
// frame, name + verified badge + degree, headline, location · Contact info, the
// connection link, mutual faces, then Open to · Message · More, and the grey
// "Open to …" box. Message opens the letter.

import { useState } from "react";
import type { ProfileProData } from "./types";
import { firstName } from "./data";
import { Face, FaceStack, Pic } from "./ui";
import { IMore, ISendSm, IShield, IPencil } from "./Icons";

export function TopCard({
  d,
  people,
  onMessage,
  onToast,
}: {
  d: ProfileProData;
  people: string[];
  onMessage: () => void;
  onToast: (t: string) => void;
}) {
  const p = d.person;
  const [menu, setMenu] = useState<null | "open" | "more">(null);
  const roles = d.experience.map((e) => e.role).filter(Boolean).slice(0, 3);
  const rolesLine = roles.length > 1 ? `${roles.slice(0, -1).join(", ")} and ${roles[roles.length - 1]} roles` : roles[0] ? `${roles[0]} roles` : "Forever roles";
  const sender = d.senderName.trim() || "someone";
  const her = firstName(p.name) || "them";

  return (
    <section className="pf-card pf-top" aria-label={`${p.name || "Profile"} — intro`}>
      <div className="pf-cover">
        {p.bannerUrl ? (
          <Pic url={p.bannerUrl} x={p.bannerCropX} y={p.bannerCropY} scale={p.bannerScale} className="pf-coverPic" />
        ) : (
          <span className="pf-coverArt" aria-hidden />
        )}
      </div>

      <div className="pf-topBody">
        <div className="pf-photoWrap">
          <button type="button" className="pf-photo" aria-label={`${p.name}'s photo`} onClick={() => onToast(`${sender} has viewed this photo 1,247 times 👀`)}>
            <Face name={p.name} src={p.photoUrl} x={p.photoCropX} y={p.photoCropY} scale={p.photoScale} size={200} />
            <svg className="pf-frame" viewBox="0 0 200 200" aria-hidden>
              <defs>
                <path id="pf-arc" d="M 22 100 A 78 78 0 0 0 178 100" />
                <linearGradient id="pf-frameG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#3E8E41" stopOpacity="0" />
                  <stop offset=".22" stopColor="#3E8E41" />
                  <stop offset=".78" stopColor="#3E8E41" />
                  <stop offset="1" stopColor="#3E8E41" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 12 100 A 88 88 0 0 0 188 100" fill="none" stroke="url(#pf-frameG)" strokeWidth="24" />
              <text className="pf-frameTx">
                <textPath href="#pf-arc" startOffset="50%" textAnchor="middle">#OPENTOFOREVER</textPath>
              </text>
            </svg>
          </button>
        </div>

        <div className="pf-idRow">
          <div className="pf-id">
            <h1 className="pf-name">
              {p.name || "Your person"}
              <span className="pf-verified" title={`Verified by ${sender}`}>
                <IShield size={18} />
              </span>
              {p.degreeNote ? <span className="pf-degree">{p.degreeNote.replace(/^·\s*/, "· ")}</span> : null}
            </h1>
            {p.headline && <p className="pf-headline">{p.headline}</p>}
            <p className="pf-loc">
              {p.location && <span>{p.location}</span>}
              {p.location && <span aria-hidden> · </span>}
              <button type="button" className="pf-link" onClick={() => onToast(`Contact: ask ${sender}. He has it memorised.`)}>
                Contact info
              </button>
            </p>
            {p.connections && (
              <button type="button" className="pf-conn" onClick={() => onToast(`${p.connections}. ${sender}, obviously.`)}>
                {p.connections}
              </button>
            )}
            {people.length > 0 && (
              <p className="pf-mutual">
                <FaceStack names={people} size={24} />
                <span>
                  <b>{people.slice(0, 2).join(", ")}</b>
                  {people.length > 2 ? ` and ${people.length - 2} other mutual connections` : " are mutual connections"}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="pf-actions">
          <div className="pf-menuWrap">
            <button type="button" className="pf-btn pf-btn--primary" onClick={() => setMenu(menu === "open" ? null : "open")} aria-expanded={menu === "open"}>
              Open to
            </button>
            {menu === "open" && (
              <div className="pf-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onToast("Finding a new job? Nope. Found. 💍"); }}>
                  <b>Finding a new job</b>
                  <span>Not looking. Very much found.</span>
                </button>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onToast(`Hiring: ${sender}, for the role of Forever. Filled.`); }}>
                  <b>Hiring</b>
                  <span>One opening. Already filled by {sender}.</span>
                </button>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onToast("Services: hugs, chai, being right."); }}>
                  <b>Providing services</b>
                  <span>Hugs, chai runs, being right</span>
                </button>
              </div>
            )}
          </div>
          <button type="button" className="pf-btn pf-btn--outline" onClick={onMessage}>
            <ISendSm size={16} /> Message
          </button>
          <div className="pf-menuWrap">
            <button type="button" className="pf-btn pf-btn--ghost pf-btn--more" aria-label="More actions" onClick={() => setMenu(menu === "more" ? null : "more")} aria-expanded={menu === "more"}>
              <IMore size={20} />
              <span className="pf-moreL">More</span>
            </button>
            {menu === "more" && (
              <div className="pf-menu pf-menu--r" role="menu">
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onToast("Sent. They already knew, but still."); }}>Send profile in a message</button>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onToast("Saved to PDF: 'Reasons_I_Love_You_FINAL_v7.pdf'"); }}>Save to PDF</button>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onMessage(); }}>Read recommendation</button>
                <button type="button" role="menuitem" onClick={() => { setMenu(null); onToast("Block? Not an option 🙅"); }}>Report / Block</button>
              </div>
            )}
          </div>
        </div>

        <button type="button" className="pf-openBox" onClick={() => onToast(`${her} is open to ${p.openTo || "forever"}. Details: see ${sender}.`)}>
          <span className="pf-openBoxT">
            <b>Open to {p.openTo || "forever"}</b>
            <span>{rolesLine}</span>
            <span className="pf-link">Show details</span>
          </span>
          <IPencil size={20} className="pf-openPen" />
        </button>
      </div>
      {menu && <div className="pf-menuScrim" onClick={() => setMenu(null)} aria-hidden />}
    </section>
  );
}
