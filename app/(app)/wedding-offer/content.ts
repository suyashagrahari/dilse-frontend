// Copy for /wedding-offer, shared by the server page (metadata, FAQ JSON-LD)
// and the client page. Plain data, so a server component can read it. Which
// templates are in the drop is the wedding drop's slugs (see ./WeddingDropTemplates).
// Facts here match the /wedding hub's FAQ (../wedding/content.ts) — nothing is
// claimed that the templates do not do.

export const WEDDING_ENDS_TEXT = "31 December";

export function weddingFaqs(pct: number, upTo = false, free = false): { q: string; a: string }[] {
  const off = `${upTo ? "up to " : ""}${pct}%`;
  const sale = free
    ? {
        q: "Is it really free?",
        a: `Yes. The wedding invitations in the drop are free to make and send until ${WEDDING_ENDS_TEXT}, 11:59 pm India time — no payment, no code.`,
      }
    : {
        q: pct ? `Is it really ${off} off?` : "Is there a wedding season discount?",
        a: pct
          ? `Yes. ${upTo ? "Invitations in the drop are" : "Every invitation in the drop is"} ${off} off until ${WEDDING_ENDS_TEXT}, 11:59 pm India time. The sale price is what you pay when you publish — no code to apply.`
          : "The drop's invitations are available at their regular price right now. When the wedding season sale is running, the discount is applied automatically when you publish.",
      };
  return [
    sale,
    {
      q: "Which wedding invitations are in the drop?",
      a: "The designs on this page: Hindu and Indian invitations (palace doors, a Mughal peacock garden, a lotus temple, royal and classic designs and the shaadi card), the reception invitation and Christian wedding invitations. Any couple, of any faith or none, can use any of them — you write the wording, the ceremonies and the names.",
    },
    {
      q: "Can one invitation cover Haldi, Mehndi, Sangeet and the reception?",
      a: "Yes. The premium designs hold every function on one link, each with its own date, time, venue, dress code and map, and guests can RSVP to each function separately with a headcount.",
    },
    {
      q: free ? "Can I see it before I send it?" : "Can I see it before I pay?",
      a: `Yes. Open a design, fill it in (AI can fill the form from a few answers), add photos and music, and preview every page first. ${free ? "Then publish the link you want to send — it costs nothing." : "You pay once, at the sale price, when you publish the link you want to send."}`,
    },
    {
      q: "Can I send it on WhatsApp to family abroad?",
      a: "Yes. The invitation is a link that opens in WhatsApp's browser, Safari or Chrome on any phone in any country, and you also get a QR code for a printed card. Prices show in rupees in India and in US dollars abroad.",
    },
    {
      q: "When does the offer end?",
      a: `On ${WEDDING_ENDS_TEXT} (Thursday), at 11:59 pm India time. Invitations you publish before then stay live afterwards, and you can keep editing them — the link stays the same.`,
    },
  ];
}
