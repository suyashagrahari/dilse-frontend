// Copy for /festive-offer, shared by the server page (metadata, FAQ JSON-LD)
// and the client page. Plain data, so a server component can read it. Which
// templates are in the drop is the festive drop's slugs (see ./FestiveDropTemplates).

export const FESTIVE_ENDS_TEXT = "Diwali night, 8 November";

export function festiveFaqs(pct: number, upTo = false): { q: string; a: string }[] {
  const off = `${upTo ? "up to " : ""}${pct}%`;
  return [
    {
      q: pct ? `Is it really ${off} off?` : "Is there a Navratri & Diwali discount?",
      a: pct
        ? `Yes. ${upTo ? "Templates in the drop are" : "Every template in the drop is"} ${off} off until ${FESTIVE_ENDS_TEXT}, 11:59 pm India time. The sale price is what you pay when you publish — no code to apply.`
        : "The drop's templates are available at their regular price. When a festive sale is running, the discount is applied automatically when you publish.",
    },
    {
      q: "Can I see it before I pay?",
      a: "Yes. Open either template, write your words (AI can help), add photos and a song, and preview every scene first. You pay once, at the sale price, when you publish the link you want to send.",
    },
    {
      q: "What is the Dandiya partner invitation?",
      a: "A playful, romantic invitation to ask someone to be your Dandiya partner this Navratri — they open the link, the dhol starts, and they answer your question with a tap. Everything is in English.",
    },
    {
      q: "And the Diwali one?",
      a: "A Diwali wish they light up themselves: diyas, rangoli, sparklers and fireworks, with your photos and your message for them, their family or the whole group.",
    },
    {
      q: "Will it work on their phone?",
      a: "Yes — it is a link that opens in any browser on a phone, tablet or laptop. Nothing to install. You can also share it as a QR code.",
    },
    {
      q: "When does the drop end?",
      a: `On ${FESTIVE_ENDS_TEXT} (Sunday), at 11:59 pm India time. Pages you publish before then stay live afterwards.`,
    },
  ];
}
