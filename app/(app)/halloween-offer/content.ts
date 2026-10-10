// Copy for /halloween-offer, shared by the server page (metadata, FAQ JSON-LD)
// and the client page. Plain data, so a server component can read it. Which
// templates are in the drop is the season's `sale.slugs` (see ./DropTemplates).

export function halloweenFaqs(pct: number): { q: string; a: string }[] {
  return [
    {
      q: pct ? `Is it really ${pct}% off?` : "Is there a Halloween discount?",
      a: pct
        ? `Yes. Every template in the drop is ${pct}% off until 31 October, 11:59 pm India time. The sale price is what you pay when you publish — nothing to apply, no code.`
        : "The drop's templates are available at their regular price. Watch this page — when a Halloween sale is running, the discount is applied automatically when you publish.",
    },
    {
      q: "Can I try it before I pay?",
      a: "Yes. Open any template in the drop, write your letter, add photos and music, and preview the whole thing for free. You only pay when you publish the link you want to send.",
    },
    {
      q: "How scary is it?",
      a: "Cute-spooky, not horror: smiling ghosts, a pumpkin you carve, bats that make a heart. There are a couple of playful “boo!” moments, and sound stays off until they tap.",
    },
    {
      q: "Will it work on their phone?",
      a: "Yes — it is a link that opens in any browser on a phone, tablet or laptop. Nothing to install. You can also share it as a QR code.",
    },
    {
      q: "When does the Halloween drop end?",
      a: "31 October at 11:59 pm India time. Pages you publish before then stay live afterwards.",
    },
  ];
}
