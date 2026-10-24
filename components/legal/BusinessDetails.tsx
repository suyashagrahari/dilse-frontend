import { Clock, Mail, MapPin } from "lucide-react";
import { BUSINESS, BUSINESS_ADDRESS_LINES } from "@/lib/business";

// The registered business, shown on Contact Us, About Us and every legal
// policy. Payment-gateway reviewers look for exactly this block: the legal
// name, a verifiable address, a phone number and an email that match the
// merchant's KYC. Values come from lib/business.ts — edit them there.

const MUTED = "#7a5555";
/** Label gold, darkened from the brand #c9a84c to pass 4.5:1 on the card. */
const GOLD = "#7d5f18";
const INK = "#2a0a0e";

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  BUSINESS_ADDRESS_LINES.join(", "),
)}`;

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: "rgba(201,168,76,0.14)", color: "#8a6a1c" }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.22em] font-bold mb-1" style={{ color: GOLD }}>
          {label}
        </p>
        <div className="text-[15px] md:text-base leading-relaxed break-words" style={{ color: INK }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BusinessDetails({ title = "Business Details" }: { title?: string }) {
  return (
    <section
      aria-labelledby="business-details-title"
      className="rounded-3xl border p-5 md:p-7"
      style={{ borderColor: "rgba(61,12,17,0.14)", background: "rgba(255,255,255,0.82)" }}
    >
      <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>
        Registered Business
      </p>
      <h2
        id="business-details-title"
        className="text-[28px] md:text-[36px] leading-[1.04] tracking-[-0.02em] mb-2"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: INK }}
      >
        {title}
      </h2>
      <p className="text-[15px] md:text-base leading-relaxed" style={{ color: MUTED }}>
        <strong style={{ color: INK }}>{BUSINESS.name}</strong> is a {BUSINESS.type.toLowerCase()} owned and
        operated by {BUSINESS.proprietor}, in business since {BUSINESS.established}.
      </p>

      <address className="not-italic mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Row icon={<MapPin size={18} />} label="Registered Address">
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ color: INK, textDecoration: "none" }}>
            {BUSINESS.name}
            {BUSINESS_ADDRESS_LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </a>
        </Row>
        <div className="space-y-5">
          <Row icon={<Mail size={18} />} label="Email">
            <a href={`mailto:${BUSINESS.email}`} style={{ color: INK, textDecoration: "none" }}>
              {BUSINESS.email}
            </a>
          </Row>
          <Row icon={<Clock size={18} />} label="Support Hours">
            {BUSINESS.hours}
          </Row>
        </div>
      </address>
    </section>
  );
}
