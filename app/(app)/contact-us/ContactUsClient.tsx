"use client";

import { useState } from "react";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import { API_URL, IS_NGROK } from "@/lib/config";
import BusinessDetails from "@/components/legal/BusinessDetails";
import { BUSINESS } from "@/lib/business";

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

export default function ContactUsClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#f5ede6", color: "#2a0a0e", fontFamily: "'Inter', sans-serif" }}
    >
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>
      <LuxuryMobileTopBrand />

      <section className="relative z-[1] max-w-4xl mx-auto px-5 pt-10 pb-24 md:pt-32">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] mb-3 text-center" style={{ color: "#7d5f18" }}>
          Contact Us
        </p>
        <h1 className="text-[42px] md:text-[72px] leading-[0.94] tracking-[-0.03em] text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          We Would Love
          <em style={{ color: "#8a6a1c", fontStyle: "italic" }}> to Hear From You.</em>
        </h1>
        <p className="mt-6 text-base md:text-lg leading-relaxed text-center max-w-2xl mx-auto" style={{ color: "#7a5555" }}>
          Reach us for support, payments, refunds, collaboration, or feedback. We are available {BUSINESS.hoursShort} and
          happy to help you create better celebration moments.
        </p>

        {/* The registered business, in full. Payment-gateway reviewers check that
            this page shows the legal name, a verifiable address, a phone number
            and an email — a form on its own does not count. */}
        <div className="mt-10">
          <BusinessDetails title="Get in Touch" />
        </div>

        <div className="mt-6 rounded-3xl border p-6 md:p-8" style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.76)" }}>
          <h2 className="text-[28px] md:text-[36px] leading-[1.04] tracking-[-0.02em] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Send Us a Message
          </h2>
          <p className="text-[15px] md:text-base mb-6" style={{ color: "#7a5555" }}>
            For a payment or refund, include the email on your account and the date of payment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-[10px] uppercase tracking-[0.22em] font-bold mb-2" style={{ color: "#7d5f18" }}>Name *</label>
              <input
                id="contact-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={{ border: "1px solid rgba(61,12,17,0.18)", background: "rgba(255,255,255,0.9)", color: "#2a0a0e" }}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-[10px] uppercase tracking-[0.22em] font-bold mb-2" style={{ color: "#7d5f18" }}>Email *</label>
              <input
                id="contact-email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={{ border: "1px solid rgba(61,12,17,0.18)", background: "rgba(255,255,255,0.9)", color: "#2a0a0e" }}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="contact-phone" className="block text-[10px] uppercase tracking-[0.22em] font-bold mb-2" style={{ color: "#7d5f18" }}>Phone</label>
              <input
                id="contact-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={{ border: "1px solid rgba(61,12,17,0.18)", background: "rgba(255,255,255,0.9)", color: "#2a0a0e" }}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="contact-message" className="block text-[10px] uppercase tracking-[0.22em] font-bold mb-2" style={{ color: "#7d5f18" }}>Message *</label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help..."
                rows={5}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                style={{ border: "1px solid rgba(61,12,17,0.18)", background: "rgba(255,255,255,0.9)", color: "#2a0a0e" }}
              />
            </div>
          </div>

          {status && (
            <div
              className="mt-4 rounded-xl px-4 py-3 text-sm"
              style={{
                background: status.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                color: status.type === "success" ? "#15803d" : "#b91c1c",
                border: `1px solid ${status.type === "success" ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)"}`,
              }}
            >
              {status.text}
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs" style={{ color: "#7a5555" }}>We reply within 24 hours.</p>
            <button
              type="button"
              onClick={submitContact}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold disabled:opacity-60"
              style={{ background: "#3d0c11", color: "#f5ede6" }}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
