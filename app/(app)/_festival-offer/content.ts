// Copy for /dandiya-offer and /diwali-offer, shared by the server pages
// (metadata, FAQ JSON-LD) and the client page. Plain data, so a server
// component can read it. Which templates are in each drop is that drop's slugs
// (see ./FestivalDropTemplates).

import type { FestivalId } from "@/lib/season";

export const ENDS_TEXT: Record<FestivalId, string> = {
  dandiya: "Dussehra, 20 October",
  diwali: "Diwali night, 8 November",
};

export function festivalFaqs(kind: FestivalId, pct: number, upTo = false, free = false): { q: string; a: string }[] {
  const off = `${upTo ? "up to " : ""}${pct}%`;
  const ends = ENDS_TEXT[kind];
  const day = kind === "dandiya" ? "Tuesday" : "Sunday";
  const sale = free ? {
    q: "Is it really free?",
    a: `Yes. ${kind === "dandiya" ? "The Dandiya partner invitation is" : "The Diwali wishes are"} free to make and send until ${ends}, 11:59 pm India time — no payment, no code.`,
  } : {
    q: pct ? `Is it really ${off} off?` : kind === "dandiya" ? "Is there a Navratri discount?" : "Is there a Diwali discount?",
    a: pct
      ? `Yes. ${upTo ? "Templates in the drop are" : "Every template in the drop is"} ${off} off until ${ends}, 11:59 pm India time. The sale price is what you pay when you publish — no code to apply.`
      : "The drop's templates are available at their regular price. When a festival sale is running, the discount is applied automatically when you publish.",
  };
  const preview = {
    q: free ? "Can I see it before I send it?" : "Can I see it before I pay?",
    a: `Yes. Open the template, write your words (AI can help), add photos and a song, and preview every scene first. ${free ? "Then publish the link you want to send — it costs nothing." : "You pay once, at the sale price, when you publish the link you want to send."}`,
  };
  const phone = {
    q: "Will it work on their phone?",
    a: "Yes — it is a link that opens in any browser on a phone, tablet or laptop. Nothing to install. You can also share it as a QR code.",
  };
  const end = {
    q: "When does the drop end?",
    a: `On ${ends} (${day}), at 11:59 pm India time. Pages you publish before then stay live afterwards.`,
  };
  if (kind === "dandiya") {
    return [
      sale,
      {
        q: "What is the Dandiya partner invitation?",
        a: "A playful, romantic invitation to ask someone to be your Dandiya partner this Navratri — they open the link, the dhol starts, the sticks twirl and they answer your question with a tap. Everything is in English.",
      },
      {
        q: "Can they say no?",
        a: "You choose when you make it: a 'Yes only' invitation where the No button keeps dodging, or one where they can say no after a few tries. Either way you can see their answer on your page card.",
      },
      preview,
      phone,
      end,
    ];
  }
  return [
    sale,
    {
      q: "What is the Happy Diwali card?",
      a: "A Diwali wish they light up themselves: diyas, rangoli, sparklers and crackers they can burst, with your photos and your message for them, their family or the whole group.",
    },
    preview,
    phone,
    end,
  ];
}
