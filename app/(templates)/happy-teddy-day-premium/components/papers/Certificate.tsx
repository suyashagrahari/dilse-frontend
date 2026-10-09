"use client";

// The Certificate of Adoption: letterpress paper (fibre + mottle noise, a debossed double rule, honey corner
// ornaments), set entirely in type. Sizes are container-relative (cqw), so the same document renders full-size in
// chapter VI and as a small keepsake card at the end. Slots: the signature line (a live pad, or the signed ink as
// an image) and the seal (empty → pressing glow → embossed gold foil); the red "ADOPTED" rubber stamp lands last.

import type { CSSProperties, ReactNode } from "react";
import type { Papers } from "./util";

export type SealState = "empty" | "pressing" | "sealed";

export function GoldSeal({ teddy }: { teddy: string }) {
  const ring = "OFFICIAL · TEDDY ADOPTION · WITH LOVE · ";
  return (
    <span className="ap-goldSeal" aria-hidden>
      <svg viewBox="0 0 100 100">
        <defs>
          <path id="ap-ring" d="M50 50 m-35 0 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0" />
        </defs>
        <circle cx="50" cy="50" r="42.5" className="ap-sealRim" />
        <circle cx="50" cy="50" r="27" className="ap-sealRim" />
        <text className="ap-sealRing">
          <textPath href="#ap-ring" startOffset="0">
            {ring}
          </textPath>
        </text>
      </svg>
      <b>{teddy.charAt(0).toUpperCase()}</b>
    </span>
  );
}

export function Certificate({
  p,
  signature,
  seal,
  stamped,
  holdProgress = 0,
  className,
  style,
}: {
  p: Papers;
  /** The live pad (chapter VI) or the signed ink (an <img>), placed on the signature line. */
  signature: ReactNode;
  seal: SealState;
  stamped: boolean;
  holdProgress?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const facts: [string, string][] = [
    ["Born", p.born],
    ...(p.birthPlace ? ([["Place of birth", p.birthPlace]] as [string, string][]) : []),
    ...(p.temperament ? ([["Temperament", p.temperament]] as [string, string][]) : []),
    ["Released by", p.from],
  ];
  return (
    <div className={`ap-cert${stamped ? " is-stamped" : ""}${className ? ` ${className}` : ""}`} style={style}>
      <div className="ap-certIn">
        <i className="ap-orn ap-ornTL" aria-hidden />
        <i className="ap-orn ap-ornTR" aria-hidden />
        <i className="ap-orn ap-ornBL" aria-hidden />
        <i className="ap-orn ap-ornBR" aria-hidden />
        <p className="ap-certNo">
          <span>No. {p.serial}</span>
          <span>Teddy Day</span>
        </p>
        <p className="ap-certKicker">Certificate</p>
        <h3 className="ap-certTitle">of Adoption</h3>
        <p className="ap-certSmall">This is to certify that</p>
        <p className="ap-certName">{p.to}</p>
        <p className="ap-certSmall">has, on this day, lovingly adopted</p>
        <p className="ap-certBear">{p.teddy}</p>
        <p className="ap-certSmall ap-certSmallIt">a bear of excellent character, to have and to hug.</p>
        <dl className="ap-facts">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="ap-certFoot">
          <div className="ap-sigLine">
            <div className="ap-sigInk">{signature}</div>
            <span className="ap-sigLabel">Signature of the adoptive parent</span>
          </div>
          <div className={`ap-sealSpot is-${seal}`} style={{ ["--hp" as string]: holdProgress }}>
            {seal === "sealed" ? <GoldSeal teddy={p.teddy} /> : <span className="ap-sealEmpty">Seal</span>}
          </div>
        </div>
      </div>
      <span className="ap-stamp ap-stampCert" aria-hidden={!stamped}>
        Adopted <em>♥</em>
      </span>
    </div>
  );
}
