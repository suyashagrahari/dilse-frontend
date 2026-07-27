"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import "./missyou.css";
import type { MissYouData, LoveMapData } from "./types";
import { muMedia } from "./assets";
import Ambience from "./Ambience";
import BackgroundMusic from "./BackgroundMusic";
import Reveal from "./Reveal";
import ReunionCountdown from "./ReunionCountdown";
import MissingTimer from "./MissingTimer";
import WaxSealLetter from "./WaxSealLetter";
import HugButton from "./HugButton";
import ScratchCard from "./ScratchCard";
import EvasiveNo from "./EvasiveNo";
import DoubleReveal from "./DoubleReveal";
import OpenWhenVault from "./OpenWhenVault";
import MemoryLane from "./MemoryLane";
import LoveMap from "./LoveMap";

interface Props {
  data: MissYouData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** Live-page engagement seeds (from the shared doc). */
  initialHugCount?: number;
  initialLoveMap?: LoveMapData;
}

function Section({
  id,
  index,
  eyebrow,
  title,
  note,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mu-screen relative w-full px-5 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
            <span className="mu-eyebrow mb-3">
              <span className="mu-rose-deep">{index}</span>
              {eyebrow}
            </span>
            <h2 className="mu-serif text-4xl leading-tight sm:text-6xl">
              <span className="mu-gt">{title}</span>
            </h2>
            {note && <p className="mu-serif mt-3 max-w-md text-sm leading-relaxed mu-muted sm:text-base">{note}</p>}
            <hr className="mu-hair mt-7 w-24" />
          </div>
        </Reveal>
        <Reveal delay={80}>{children}</Reveal>
      </div>
    </section>
  );
}

export default function MissYouTemplate({ data, mode, shareId, initialHugCount, initialLoveMap }: Props) {
  const petName = data.petName?.trim() || data.recipientName?.trim() || "you";
  const hasCountdown = !!data.reunionDate;
  const hasSince = !!data.sinceDate;

  return (
    <div className="mu-root relative min-h-screen">
      <Ambience />
      <BackgroundMusic src={data.backgroundMusic} />

      {/* SubhSandesh brand + create-your-own (shared page only) */}
      {mode === "live" && (
        <Link
          href="/templates"
          aria-label="SubhSandesh — make your own"
          className="mu-glass fixed right-3 top-3 z-40 flex items-center gap-2 px-3 py-1.5"
          style={{ borderRadius: 999, textDecoration: "none" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" width={22} height={22} style={{ objectFit: "contain" }} />
          <span className="mu-sans text-xs font-semibold mu-sepia">make your own</span>
        </Link>
      )}

      {/* Hero — text on the left, a cute long-distance chibi on the right */}
      <header className="mu-screen relative mx-auto w-full max-w-6xl px-5 py-20">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-8">
          {/* left: text (below the gif on mobile, left on desktop) */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <Reveal>
              <span className="mu-eyebrow">written by hand · kept for you</span>
            </Reveal>
            <Reveal delay={100}>
              <p className="mu-script mt-6 text-2xl mu-rose-deep sm:text-3xl">
                {data.coverLine?.trim() ? data.coverLine : `a little corner just for you, ${petName},`}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <h1 className="mu-serif mt-1 text-6xl leading-[0.95] sm:text-7xl xl:text-8xl">
                <span className="mu-gt">i miss you.</span>
                <span className="sr-only"> — a letter for {petName}</span>
              </h1>
            </Reveal>
            <Reveal delay={260}>
              <p className="mu-serif mx-auto mt-6 max-w-xl text-lg leading-relaxed mu-muted lg:mx-0 sm:text-xl">
                a small, quiet place — letters, hugs, memories{hasCountdown ? ", and a countdown until i get to hold you again" : ""}. take your time. it&apos;s all yours.
              </p>
            </Reveal>
            <Reveal delay={340} className="mx-auto mt-8 w-full max-w-md lg:mx-0">
              <div className="mu-paper px-5 py-6">
                {hasSince ? (
                  <>
                    <MissingTimer sinceIso={data.sinceDate} petName={petName} />
                    {hasCountdown && (
                      <>
                        <hr className="mu-hair my-5 w-16 mx-auto" />
                        <div className="scale-90"><ReunionCountdown targetIso={data.reunionDate} label="until i hold you again" /></div>
                      </>
                    )}
                  </>
                ) : hasCountdown ? (
                  <ReunionCountdown targetIso={data.reunionDate} label="until i see you again" />
                ) : (
                  <p className="mu-script py-2 text-center text-2xl mu-rose-deep">counting the days until i hold you again 🤍</p>
                )}
              </div>
            </Reveal>
          </div>

          {/* right on desktop, top on mobile: the chibi long-distance gif (fixed, not floating) */}
          <Reveal delay={140} className="order-1 flex justify-center lg:order-2 lg:justify-center">
            <div className="w-[min(64vw,340px)] lg:w-[min(46vw,560px)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={muMedia("chibi-phones.gif")}
                alt="two little characters texting across the distance"
                className="h-auto w-full"
                style={{ filter: "drop-shadow(0 22px 40px rgba(120,60,72,.22))" }}
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-10 text-center">
          <Reveal delay={480}>
            <a href="#letter" className="mu-sans inline-flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] mu-muted">
              scroll, love
              <span style={{ height: 40, width: 1, background: "linear-gradient(180deg,var(--mu-rose),transparent)" }} />
            </a>
          </Reveal>
        </div>
      </header>

      <Section id="letter" index="01" eyebrow="a letter" title="for your eyes only" note="break the seal whenever you're ready.">
        <WaxSealLetter petName={petName} letterBody={data.letterBody} signature={data.signature} senderName={data.senderName} />
      </Section>

      <Section id="hug" index="02" eyebrow="a squeeze" title="whenever you need one" note="press it as many times as you like — i'll know.">
        <div className="mx-auto max-w-md">
          <HugButton mode={mode} shareId={shareId} initialCount={initialHugCount} />
        </div>
      </Section>

      <Section id="coupon" index="03" eyebrow="a little coupon" title="scratch me" note="drag across the card to uncover it.">
        <ScratchCard reveal={data.secret} />
      </Section>

      <Section id="play" index="04" eyebrow="two small games" title="play with me">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="mu-paper p-6 sm:p-8">
            <p className="mu-sans mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em] mu-muted">
              <span className="text-base">💭</span> one silly question
            </p>
            <EvasiveNo question={`do you miss me too, ${petName}?`} />
          </div>
          <div className="mu-paper p-6 sm:p-8">
            <p className="mu-sans mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em] mu-muted">
              <span className="text-base">🃏</span> this or that
            </p>
            <DoubleReveal />
          </div>
        </div>
      </Section>

      <Section id="vault" index="05" eyebrow="open when…" title="letters for later" note="save them for the days that need them.">
        <OpenWhenVault notes={data.openWhen} />
      </Section>

      <Section id="memories" index="06" eyebrow="us" title="our memory lane">
        <MemoryLane memories={data.memories} />
      </Section>

      <Section id="map" index="07" eyebrow="the small things" title="our love map" note="tell me your world — i'm keeping this.">
        <LoveMap mode={mode} shareId={shareId} initial={initialLoveMap} />
      </Section>

      <footer className="relative px-5 pb-36 pt-10 text-center">
        <hr className="mu-hair mx-auto mb-10 w-40" />
        <p className="mu-script text-3xl mu-rose-deep sm:text-4xl">
          made with every part of me{data.senderName?.trim() ? `, ${data.senderName}` : ""},
        </p>
        <p className="mu-serif mt-2 text-lg mu-muted">for you, only ever you.</p>
        <Link href="/templates" className="mu-btn mu-sans mt-8 inline-block px-6 py-3 text-sm" style={{ textDecoration: "none" }}>
          make one for someone you miss →
        </Link>
      </footer>
    </div>
  );
}
