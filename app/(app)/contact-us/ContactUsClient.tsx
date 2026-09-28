"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, Mail, Phone, Send } from "lucide-react";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import { API_URL, IS_NGROK } from "@/lib/config";
import BusinessDetails from "@/components/legal/BusinessDetails";
import { BUSINESS } from "@/lib/business";
import { BRAND } from "@/lib/brand";

export default function ContactUsClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const reduce = useReducedMotion();

  const submitContact = async () => {
    setStatus(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: "error", text: "Please fill name, email and message." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        setStatus({ type: "error", text: data?.error || "Unable to send message right now." });
        return;
      }

      setStatus({ type: "success", text: "Message sent successfully. We will contact you soon." });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setStatus({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="ctPage">
      <LuxuryMobileTopBrand />

      <div className="ctWrap">
        {/* ── Hero: headline, promise and one-tap ways to reach us ───────────── */}
        <section className="ctHero" aria-labelledby="contact-title">
          <span className="ctShine" aria-hidden="true" />
          <span className="ctOrb" aria-hidden="true" />
          <span className="ctSpark s1" aria-hidden="true">✦</span>
          <span className="ctSpark s2" aria-hidden="true">♥</span>
          <span className="ctSpark s3" aria-hidden="true">✦</span>

          <p className="ctBadge">
            <span className="ctBadgeDot" aria-hidden="true" />
            Contact Us
          </p>
          <h1 id="contact-title" className="ctTitle">
            We Would Love
            <em> to Hear From You.</em>
          </h1>
          <p className="ctLead">
            Reach us for support, payments, refunds, collaboration, or feedback. We are available {BUSINESS.hoursShort} and
            happy to help you create better celebration moments.
          </p>
          <ul className="ctChips">
            <li>
              <a href={`mailto:${BUSINESS.email}`}>
                <Mail size={14} aria-hidden="true" />
                <span>{BUSINESS.email}</span>
              </a>
            </li>
            <li>
              <a href={`tel:${BUSINESS.phone.tel}`}>
                <Phone size={14} aria-hidden="true" />
                <span>{BUSINESS.phone.display}</span>
              </a>
            </li>
            <li className="ctChipStatic">
              <Clock size={14} aria-hidden="true" />
              <span>{BUSINESS.hoursShort} support</span>
            </li>
          </ul>
        </section>

        <div className="ctGrid">
          {/* ── The form ─────────────────────────────────────────────────────── */}
          <section className="ctCard ctForm" aria-labelledby="contact-form-title">
            <p className="ctEyebrow">Write to us</p>
            <h2 id="contact-form-title" className="ctH2">
              Send Us a <em>Message</em>
            </h2>
            <p className="ctHint">For a payment or refund, include the email on your account and the date of payment.</p>

            <div className="ctFields">
              <div className="ctField">
                <input
                  id="contact-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  className="ctInput"
                />
                <label htmlFor="contact-name">Name *</label>
              </div>
              <div className="ctField">
                <input
                  id="contact-email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  type="email"
                  className="ctInput"
                />
                <label htmlFor="contact-email">Email *</label>
              </div>
              <div className="ctField ctWide">
                <input
                  id="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=" "
                  className="ctInput"
                />
                <label htmlFor="contact-phone">Phone (optional)</label>
              </div>
              <div className="ctField ctWide">
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder=" "
                  rows={5}
                  className="ctInput ctArea"
                />
                <label htmlFor="contact-message">Message * — tell us how we can help</label>
              </div>
            </div>

            <div aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {status && (
                  <motion.div
                    key={status.type + status.text}
                    className={`ctStatus ${status.type === "success" ? "is-ok" : "is-err"}`}
                    role={status.type === "error" ? "alert" : "status"}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                    animate={
                      reduce
                        ? { opacity: 1 }
                        : status.type === "error"
                          ? { opacity: 1, y: 0, height: "auto", x: [0, -6, 6, -4, 4, 0] }
                          : { opacity: 1, y: 0, height: "auto" }
                    }
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="ctStatusInner">
                      <motion.span
                        className="ctStatusIc"
                        initial={reduce ? false : { scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.08 }}
                        aria-hidden="true"
                      >
                        {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </motion.span>
                      <span>{status.text}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="ctActions">
              <p className="ctReply">
                <span className="ctReplyDot" aria-hidden="true" />
                We reply within 24 hours.
              </p>
              <motion.button
                type="button"
                onClick={submitContact}
                disabled={submitting}
                className="ctSubmit"
                whileHover={reduce || submitting ? undefined : { y: -2 }}
                whileTap={reduce || submitting ? undefined : { scale: 0.97 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={submitting ? "sending" : "idle"}
                    className="ctSubmitLabel"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {submitting ? (
                      <>
                        <span className="ctSpin" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={15} aria-hidden="true" className="ctSendIc" />
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </section>

          {/* The registered business, in full. Payment-gateway reviewers check that
              this page shows the legal name, a verifiable address, a phone number
              and an email — a form on its own does not count. */}
          <div className="ctBiz">
            <BusinessDetails title="Get in Touch" />
          </div>
        </div>
      </div>

      <style>{`
        .ctPage {
          min-height: 100dvh; overflow-x: hidden; color: ${BRAND.text}; font-family: 'Inter', sans-serif;
          background: radial-gradient(900px 480px at 100% 0%, rgba(201,168,76,0.14), transparent 60%), ${BRAND.bg};
        }
        /* Phones: LuxuryMobileTopBrand reserves its own spacer; the BottomNav
           floats at the bottom. 768+: the fixed desktop nav pill ends at ~74px. */
        .ctWrap { width: 100%; max-width: 1080px; margin: 0 auto; padding: 4px 14px 124px; display: grid; gap: 14px }
        @media (min-width: 600px) { .ctWrap { padding: 12px 24px 124px; gap: 18px } }
        @media (min-width: 768px) { .ctWrap { padding-top: 92px } }
        @media (min-width: 1024px) { .ctWrap { padding: 92px 32px 88px } }

        /* ── Hero ─────────────────────────────────────────────────────────── */
        .ctHero {
          position: relative; overflow: hidden; min-width: 0;
          padding: 22px 16px 18px; border-radius: 24px; color: ${BRAND.bg};
          background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
          box-shadow: ${BRAND.shadowElevated};
          animation: ctRise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (min-width: 600px) { .ctHero { padding: 30px 30px 26px } }
        @media (min-width: 900px) { .ctHero { padding: 36px 40px 30px } }
        .ctShine {
          position: absolute; top: -60px; bottom: -60px; width: 80px; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,236,190,0.14), transparent);
          animation: ctShine 6s ease-in-out infinite;
        }
        @keyframes ctShine { from { transform: translateX(-160%) rotate(12deg) } to { transform: translateX(1600%) rotate(12deg) } }
        .ctOrb {
          position: absolute; right: -90px; top: -110px; width: 320px; height: 320px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(201,168,76,0.26), transparent 65%);
        }
        .ctSpark { position: absolute; color: #ffe3a3; opacity: 0.5; pointer-events: none; animation: ctFloat 5s ease-in-out infinite }
        .ctSpark.s1 { top: 18px; right: 22px; font-size: 14px }
        .ctSpark.s2 { bottom: 18px; right: 18%; font-size: 12px; color: #ffb3c4; animation-delay: 1.2s }
        .ctSpark.s3 { top: 46%; right: 34%; font-size: 10px; animation-delay: 2.4s }
        @keyframes ctFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }

        .ctBadge {
          position: relative; display: inline-flex; align-items: center; gap: 8px; margin: 0 0 12px;
          padding: 6px 13px 6px 10px; border-radius: 999px;
          background: rgba(255,227,163,0.12); border: 1px solid rgba(255,227,163,0.3);
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; color: #ffe3a3;
        }
        .ctBadgeDot { width: 7px; height: 7px; flex: none; border-radius: 50%; background: #7ddc96; animation: ctPulse 2400ms ease-out infinite }
        @keyframes ctPulse {
          0% { box-shadow: 0 0 0 0 rgba(125,220,150,0.6) }
          70% { box-shadow: 0 0 0 7px rgba(125,220,150,0) }
          100% { box-shadow: 0 0 0 0 rgba(125,220,150,0) }
        }
        .ctTitle {
          position: relative; margin: 0; max-width: 18ch; font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(30px, 7.4vw, 52px); line-height: 1.04; font-weight: 800; letter-spacing: -0.02em; color: #fff6e6;
        }
        .ctTitle em { font-style: italic; color: #ffe3a3 }
        .ctLead { position: relative; margin: 12px 0 0; max-width: 58ch; font-size: 14px; line-height: 1.6; color: rgba(255,236,210,0.82) }
        @media (min-width: 600px) { .ctLead { font-size: 15px } }

        .ctChips { position: relative; list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; padding: 0 }
        .ctChips li { min-width: 0; max-width: 100%; animation: ctRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both }
        .ctChips li:nth-child(1) { animation-delay: 140ms }
        .ctChips li:nth-child(2) { animation-delay: 210ms }
        .ctChips li:nth-child(3) { animation-delay: 280ms }
        .ctChips a, .ctChipStatic {
          display: inline-flex; align-items: center; gap: 7px; max-width: 100%;
          padding: 7px 13px 7px 10px; border-radius: 999px; font-size: 12.5px; font-weight: 700; text-decoration: none;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,236,190,0.16); color: #f5e6d6;
          transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
        }
        .ctChips a span, .ctChipStatic span { min-width: 0; overflow-wrap: anywhere }
        .ctChips svg { flex: none; color: #ffe3a3 }
        .ctChips a:hover { background: rgba(255,227,163,0.16); border-color: rgba(255,227,163,0.45); transform: translateY(-2px) }
        .ctChips a:focus-visible { outline: 2px solid #ffe3a3; outline-offset: 2px }

        /* ── Layout: form + business details side by side from 1000 ─────────── */
        .ctGrid { display: grid; gap: 14px; min-width: 0 }
        @media (min-width: 600px) { .ctGrid { gap: 18px } }
        @media (min-width: 1000px) { .ctGrid { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: start } }

        .ctCard {
          position: relative; overflow: hidden; min-width: 0; border-radius: 22px;
          background: linear-gradient(180deg, #fffdfb 0%, #fff6ee 100%);
          border: 1px solid ${BRAND.border};
          box-shadow: 0 1px 0 rgba(61,12,17,0.03), 0 14px 30px -20px rgba(61,12,17,0.45);
          animation: ctRise 600ms 90ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }
        .ctCard::before {
          content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px;
          background: linear-gradient(90deg, #3d0c11, #c9a84c, #ffe3a3);
          transform: scaleX(0); transform-origin: left; transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ctCard:focus-within::before { transform: scaleX(1) }
        @media (hover: hover) { .ctCard:hover::before { transform: scaleX(1) } }

        .ctForm { padding: 18px 16px 16px }
        @media (min-width: 600px) { .ctForm { padding: 24px 26px 22px } }
        .ctEyebrow { margin: 0 0 4px; font-size: 10.5px; font-weight: 800; letter-spacing: 0.26em; text-transform: uppercase; color: #7d5f18 }
        .ctH2 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(24px, 5.6vw, 32px); line-height: 1.08; font-weight: 800; letter-spacing: -0.02em; color: ${BRAND.text} }
        .ctH2 em { font-style: italic; color: #8a6a1c }
        .ctHint { margin: 6px 0 16px; font-size: 13.5px; line-height: 1.5; color: #7a5555 }

        /* Floating labels: the label sits inside the field and lifts onto the
           border when the field is focused or filled (placeholder=" " trick). */
        .ctFields { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px }
        @media (min-width: 600px) { .ctFields { grid-template-columns: repeat(2, minmax(0, 1fr)) } }
        @media (min-width: 600px) { .ctWide { grid-column: 1 / -1 } }
        .ctField { position: relative; min-width: 0 }
        .ctInput {
          display: block; width: 100%; padding: 20px 14px 8px; border-radius: 14px; font: inherit; font-size: 15px;
          color: ${BRAND.text}; background: rgba(255,255,255,0.92);
          border: 1px solid ${BRAND.borderStrong}; outline: none;
          transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .ctArea { resize: none; min-height: 128px; line-height: 1.55 }
        .ctInput:hover { border-color: rgba(61,12,17,0.3) }
        .ctInput:focus { border-color: ${BRAND.gold}; background: #fff; box-shadow: 0 0 0 4px rgba(201,168,76,0.18) }
        .ctField label {
          position: absolute; left: 15px; top: 15px; max-width: calc(100% - 28px);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; pointer-events: none;
          font-size: 14.5px; font-weight: 500; color: ${BRAND.faint}; transform-origin: left top;
          transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), color 180ms ease;
        }
        .ctInput:focus + label,
        .ctInput:not(:placeholder-shown) + label {
          transform: translateY(-9px) scale(0.74); color: #7d5f18; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
        }

        .ctStatus { overflow: hidden }
        .ctStatusInner {
          display: flex; align-items: flex-start; gap: 9px; margin-top: 14px; padding: 11px 14px; border-radius: 14px;
          font-size: 13.5px; font-weight: 600; line-height: 1.45; overflow-wrap: anywhere;
        }
        .ctStatusIc { display: inline-flex; flex: none; margin-top: 1px }
        .ctStatus.is-ok .ctStatusInner { background: rgba(58,167,109,0.1); color: #1f7a4a; border: 1px solid rgba(58,167,109,0.28) }
        .ctStatus.is-err .ctStatusInner { background: rgba(161,53,64,0.08); color: ${BRAND.danger}; border: 1px solid rgba(161,53,64,0.24) }

        .ctActions { display: flex; flex-direction: column-reverse; gap: 12px; margin-top: 16px }
        @media (min-width: 480px) { .ctActions { flex-direction: row; align-items: center; justify-content: space-between } }
        .ctReply { display: inline-flex; align-items: center; gap: 7px; margin: 0; font-size: 12.5px; font-weight: 600; color: #7a5555 }
        .ctReplyDot { width: 7px; height: 7px; border-radius: 50%; background: ${BRAND.ok}; animation: ctPulse 2400ms ease-out infinite }
        .ctSubmit {
          position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center;
          min-height: 46px; padding: 0 26px; border: none; border-radius: 999px; cursor: pointer;
          font: inherit; font-size: 14px; font-weight: 800; color: #fff6e6; background: ${BRAND.gradient};
          box-shadow: 0 12px 26px -12px rgba(61,12,17,0.75);
        }
        .ctSubmit::after {
          content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; pointer-events: none;
          background: linear-gradient(100deg, transparent, rgba(255,236,190,0.35), transparent); transform: skewX(-14deg);
          animation: ctBtnSheen 3.6s ease-in-out infinite;
        }
        @keyframes ctBtnSheen { 0%, 60% { left: -60% } 100% { left: 140% } }
        .ctSubmit:disabled { cursor: default; opacity: 0.75 }
        .ctSubmit:disabled::after { animation: none }
        .ctSubmit:focus-visible { outline: 2px solid ${BRAND.gold}; outline-offset: 3px }
        .ctSubmitLabel { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px }
        .ctSendIc { color: #ffe3a3; transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1) }
        .ctSubmit:hover .ctSendIc { transform: translate(3px, -2px) rotate(-8deg) }
        .ctSpin {
          width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.25); border-top-color: #ffe3a3;
          animation: ctSpin 800ms linear infinite; display: inline-block;
        }
        @keyframes ctSpin { to { transform: rotate(360deg) } }

        /* Business details: the shared component, untouched — only its frame is
           warmed to match the paper cards, and its address grid is kept to one
           column when it sits in the narrower desktop column. */
        .ctBiz { min-width: 0; animation: ctRise 600ms 170ms cubic-bezier(0.22, 1, 0.36, 1) backwards }
        .ctBiz > section { background: linear-gradient(180deg, #fffdfb 0%, #fff6ee 100%) !important; box-shadow: 0 14px 30px -20px rgba(61,12,17,0.45) }
        @media (min-width: 1000px) { .ctBiz address { grid-template-columns: minmax(0, 1fr) } }

        @keyframes ctRise { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: none } }

        @media (prefers-reduced-motion: reduce) {
          .ctHero, .ctCard, .ctBiz, .ctChips li { animation: none }
          .ctShine, .ctSpark, .ctBadgeDot, .ctReplyDot, .ctSubmit::after { animation: none }
          .ctInput, .ctField label, .ctCard::before, .ctChips a, .ctSendIc { transition: none }
        }
      `}</style>
    </main>
  );
}
