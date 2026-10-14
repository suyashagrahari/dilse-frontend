// ─── Card copy, by template slug ─────────────────────────────────────────────
//
// What the printed card actually says.
//
// Left to itself the card was headed "Bouquet GF page" — a route slug with a
// word stuck on the end — and captioned with the raw share address. Both are
// machine text on something a person is meant to hand to someone they love.
//
// So every template gets three written lines:
//
//   kicker    the small line above the headline
//   headline  the big one, in the display face
//   line      the line under the code, where the URL used to be
//
// The register follows the template. A bouquet is tender; a challan is
// deadpan; a court summons plays the joke completely straight, because that is
// the joke. The point is that nothing here reads as generated.
//
// A slug with no entry falls back to something warm and non-committal, which is
// the right failure: a card that says "Someone is thinking of you" is fine, and
// a card that says "missyou-bestfriend page" is not.

export interface CardCopy {
  kicker: string;
  headline: string;
  /** Sits under the QR, where the address used to be. Keep it short. */
  line: string;
}

const COPY: Record<string, CardCopy> = {
  // ── Romantic ───────────────────────────────────────────────────────────────
  "love-gf": { kicker: "A little something", headline: "Because It's You", line: "Every day, still you" },
  darling: { kicker: "For my favourite person", headline: "Hello, Darling", line: "Yours, always" },
  "birthday-gf": { kicker: "Happy birthday", headline: "The Best Day", line: "Here's to another year of us" },
  "valentine-gf": { kicker: "Be mine", headline: "My Valentine", line: "Still choosing you" },
  "anniversary-gf": { kicker: "Another year", headline: "One More Trip Round the Sun", line: "And I'd do it all again" },
  "missyou-gf": { kicker: "Thinking of you", headline: "I Miss You", line: "Come back soon" },
  "bouquet-gf": { kicker: "Freshly picked", headline: "A Bouquet, Just for You", line: "These ones never wilt" },
  proposal: { kicker: "One question", headline: "Will You?", line: "Take your time. Say yes." },
  "hold-my-hand": { kicker: "Whenever you need it", headline: "Hold My Hand", line: "I'm right here" },
  "date-invitation": { kicker: "You're invited", headline: "Dinner? Just Us.", line: "Say when" },
  "court-of-love": { kicker: "You are hereby summoned", headline: "The Court of Love", line: "Attendance is mandatory" },
  us: { kicker: "The story so far", headline: "Us", line: "Chapter one of many" },
  "happy-rakshabandhan-to-brother": { kicker: "Raksha Bandhan", headline: "Your Sister Tied You a Rakhi", line: "Scan to tie it" },
  // The pair to the line above, and written from HER side, because the card is
  // the thing she ends up holding. The headline is what she is being told when
  // the link arrives — she has not tied anything yet, and the whole point of the
  // page is that the tying is left for her to do.
  "happy-rakshabandhan-to-sister": { kicker: "Raksha Bandhan", headline: "Your Brother Sent a Rakhi to Tie", line: "Scan to tie it" },
  capsule: { kicker: "Sealed for later", headline: "A Time Capsule", line: "Open when you're ready" },
  rewind: { kicker: "Press play", headline: "Our Year, Rewound", line: "All of it, again" },
  loveflix: { kicker: "Now streaming", headline: "Tonight's Feature: Us", line: "No skipping the good parts" },
  streak: { kicker: "Day after day", headline: "Our Streak", line: "Don't break it" },
  dedication: { kicker: "This one's for you", headline: "A Dedication", line: "Turn it up" },
  "photo-puzzle": { kicker: "Piece it together", headline: "A Puzzle of Us", line: "You'll see" },
  call: { kicker: "Incoming", headline: "One Missed Call", line: "Pick up" },
  watch: { kicker: "Time you'd like back", headline: "Counting Down to You", line: "Nearly there" },
  catch: { kicker: "Ready?", headline: "Catch This", line: "Don't drop it" },
  "happy-rose-day": { kicker: "Happy Rose Day", headline: "A Rose, Just for You", line: "Hold it till it blooms" },
  "happy-propose-day": { kicker: "Happy Propose Day", headline: "I Have Something to Ask", line: "Open the box" },
  "happy-chocolate-day": { kicker: "Happy Chocolate Day", headline: "Ek Dabba Pyaar", line: "Unwrap every piece" },
  "happy-teddy-day": { kicker: "Happy Teddy Day", headline: "Someone Left You a Teddy", line: "One free play" },
  "happy-promise-day": { kicker: "Happy Promise Day", headline: "Vaada Pakka", line: "Pinky promise first" },
  "happy-hug-day": { kicker: "Happy Hug Day", headline: "A Warm Hug, Delivered", line: "Come inside" },
  // Neutral on purpose: this card can be seen on a shared family phone.
  "happy-kiss-day": { kicker: "For you", headline: "A Little Something", line: "Open it 💌" },
  "happy-valentines-day": { kicker: "Admit two", headline: "Our Valentine Night", line: "Tonight" },
  "happy-halloween": { kicker: "Happy Halloween", headline: "A Little Haunted House", line: "Knock three times" },
  "dandiya-partner": { kicker: "Happy Navratri", headline: "Be My Dandiya Partner", line: "The dhol is calling 🥁" },
  sorry: { kicker: "Psst…", headline: "I'm Sorry", line: "Please open this before you stay mad 🥺" },
  "happy-birthday": { kicker: "Happy Birthday", headline: "A Birthday Surprise", line: "Untie the ribbon 🎀" },
  "miss-you": { kicker: "Incoming call", headline: "I Miss You", line: "Pick up, it's me 🥹" },
  "will-you-be-mine": { kicker: "Psst…", headline: "Will You Be Mine?", line: "Someone has a very big question for you 💍" },
  "happy-anniversary": { kicker: "Admit one…", headline: "Happy Anniversary", line: "You're invited to a tiny museum about us 🖼️" },
  "anniversary-premium": { kicker: "Happy anniversary", headline: "The Book of Us", line: "Every year of us, in one little storybook 📖" },
  "happy-diwali": { kicker: "Happy Diwali", headline: "A Diya at Your Door", line: "Light it 🪔" },
  "happy-rose-day-premium": { kicker: "✦ Rose Day", headline: "The Rose Garden", line: "Tear open your seed packet" },
  "happy-propose-day-premium": { kicker: "✦ Propose Day", headline: "The Little Proposal", line: "Knock knock 💍" },
  "happy-chocolate-day-premium": { kicker: "✦ Chocolate Day", headline: "The Sweetheart Chocolate Factory", line: "Scratch your golden ticket" },
  "happy-teddy-day-premium": { kicker: "✦ Teddy Day", headline: "The Teddy House", line: "Special delivery 🧸" },
  "happy-promise-day-premium": { kicker: "✦ Promise Day", headline: "The Pinky Promise Club", line: "Pinky promise? 🤙" },
  "happy-hug-day-premium": { kicker: "✦ Hug Day", headline: "The Hug Passport", line: "Come collect your hugs" },
  "happy-kiss-day-premium": { kicker: "✦ Kiss Day", headline: "Mwah Booth", line: "Step into the kissing booth 💋" },
  "happy-valentines-day-premium": { kicker: "✦ Valentine's Day", headline: "Be My Valentine Carnival", line: "Your ticket is inside 🎡" },
  "happy-halloween-premium": { kicker: "✦ Halloween", headline: "Boo-tiful Night", line: "Boo! A little ghost has a letter for you 👻" },
  searched: { kicker: "Top result", headline: "What I Keep Looking Up", line: "Every single time" },
  flags: { kicker: "Full disclosure", headline: "All My Red Flags", line: "Still worth it" },
  "kundli-milan": { kicker: "Written in the stars", headline: "A Perfect Match", line: "The charts agree" },
  "court-marriage": { kicker: "Make it official", headline: "Let's Sign the Papers", line: "Witnesses optional" },

  // ── Weddings and occasions ─────────────────────────────────────────────────
  "wedding-shaadi": { kicker: "With great joy", headline: "We're Getting Married", line: "Come celebrate with us" },
  "shaadi-card": { kicker: "Save the date", headline: "Our Shaadi", line: "Your presence is the gift" },
  reception: { kicker: "Join us", headline: "The Reception", line: "Dinner, dancing, the works" },
  "christian-wedding": { kicker: "Together with our families", headline: "Our Wedding Day", line: "Come as you are" },
  "christian-wedding-2": { kicker: "Together with our families", headline: "Our Wedding Day", line: "Come as you are" },
  holi: { kicker: "Bura na maano", headline: "Happy Holi", line: "Bring colour, expect chaos" },
  "eid-mubarak": { kicker: "Warm wishes", headline: "Eid Mubarak", line: "May your year be sweet" },

  // ── Funny, deadpan on purpose ──────────────────────────────────────────────
  challan: { kicker: "Notice of offence", headline: "You've Been Booked", line: "Contest it in person" },
  "legal-notice": { kicker: "Formal notice", headline: "You Have Been Served", line: "Response required immediately" },
  recharge: { kicker: "Balance low", headline: "Please Recharge", line: "Top-up accepted in hugs" },
  "train-ticket": { kicker: "Confirmed", headline: "One Ticket, One Seat", line: "Window seat. Obviously." },
  nutrition: { kicker: "Nutritional information", headline: "What You're Made Of", line: "100% daily value" },
  product: { kicker: "Back in stock", headline: "Limited Edition: You", line: "Only one ever made" },
  app: { kicker: "New release", headline: "Now Available", line: "Five stars, no notes" },
  "vending-machine": { kicker: "Make a selection", headline: "Pick Something Nice", line: "Exact change not required" },
  "apology-dashboard": { kicker: "Incident report", headline: "I'm Sorry", line: "Fix already in progress" },
  "profile-pro": { kicker: "Endorsed by many", headline: "A Glowing Reference", line: "All of it true" },
};

/** Warm, non-committal, and never wrong for a template with no entry. */
const FALLBACK: CardCopy = {
  kicker: "A gift for you",
  headline: "Something for You",
  line: "Made with you in mind",
};

export function cardCopy(slug?: string | null): CardCopy {
  if (!slug) return FALLBACK;
  return COPY[slug] ?? FALLBACK;
}
