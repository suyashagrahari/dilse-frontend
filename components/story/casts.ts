// ─── Who the story composer asks about ───────────────────────────────────────
//
// The composer used to hardcode one cast: "Your name", "Her name", "Your best
// friend", and a sample paragraph about meeting someone at a party in second
// year. That is right for most of this app, which is mostly couples — and it is
// wrong in a way that stops people cold on the templates that are not.
//
// A brother building a Raksha Bandhan page for his sister was asked for his
// "best friend"'s name and shown a story about a girl who hates coriander. He
// has to work out that the third box is where his sister's name goes, and that
// the sample is not about anybody like her. Most people will not work that out;
// they will close it and fill the form in by hand, which is exactly the outcome
// the composer exists to prevent.
//
// ── WHY THIS IS A CLIENT-SIDE CONFIG AND NOT A SERVER FIELD ─────────────────
//
// The natural home for "who is in this page" is the server's aiFill schema,
// next to `audience`. But `audience` is frozen at partner | bestfriend | friend
// in the lead-owned contract, and a sibling is none of those three. Extending
// that union is explicitly not allowed, and it would also be the wrong shape:
// the union drives PRONOUNS AND REGISTER in the prompt, which `bestfriend`
// already gets right for a sibling — warm, loyal, never romantic. The only thing
// wrong is the words on two labels and one sample paragraph, and those are UI.
//
// So the wire keys never change. A sister's name still travels as
// `bestFriendName`, because that is the slot the prompt reads for a non-partner
// audience. Only what the sender is shown changes.

import { STORY_SLOTS, type StorySlotKey } from "@/lib/ai-fill/types";

export interface CastSlot {
  slot: StorySlotKey;
  /** The form label. "Your sister's name", not "Your best friend". */
  label: string;
  placeholder: string;
  /**
   * What the chip in the sample reads before that name is given. Short and
   * lower case — it sits inline in a sentence.
   */
  prompt: string;
}

export interface StoryCast {
  /** In display order. A cast may show two boxes where the default shows three. */
  slots: readonly CastSlot[];
  /**
   * The sample paragraph, using `STORY_SLOTS` tokens for the names.
   *
   * It has to be SPECIFIC. A generic sample ("we are very close and she means a
   * lot to me") teaches the sender nothing about the level of detail that makes
   * a good page, and the model gets the same nothing back. It should also be
   * slightly unflattering to the sender — that is what signals "you may write
   * the real thing here".
   */
  sample: string;
}

/**
 * The couples cast. Unchanged from what every template shipped before this file
 * existed, and still the default, so nothing that does not opt in can shift.
 */
export const DEFAULT_CAST: StoryCast = {
  slots: [
    { slot: "you", label: "Your name", placeholder: "Rohan", prompt: "your name" },
    { slot: "partner", label: "Her name", placeholder: "Meera", prompt: "her name" },
    { slot: "bestFriend", label: "Your best friend", placeholder: "Ananya", prompt: "best friend" },
  ],
  sample:
    `${STORY_SLOTS.you} and ${STORY_SLOTS.partner} met in second year, at a birthday party ` +
    `neither of us wanted to be at. Three years later she still calls me by the ` +
    `nickname she made up that night. She hates coriander, she cries at every ` +
    `film, and she is the only person who can get me to shut up and eat. Last ` +
    `winter we took the overnight bus to Manali and got stuck in the snow for two ` +
    `days — still the best trip we've had. ${STORY_SLOTS.bestFriend} was the one who ` +
    `told me to text her first.`,
};

// ── The sibling casts ────────────────────────────────────────────────────────
//
// Two boxes, not three. The recipient still occupies the `bestFriend` slot
// because that is the wire key the prompt reads, but nothing on screen says so.
//
// Both samples are built the same way, and the shape is the point — it is a
// worked example of what makes a page good rather than a nice paragraph:
//
//   one ordinary domestic detail  (the borrowed thing, the tattling)
//   one fight, named plainly      (so the page can be funny and true)
//   one thing they did for you    (this is what the vow and the ledger run on)
//   where you both are now        (drives the distance and the countdown)
//
// Deliberately NOT included: anything about the festival itself. A sender who
// writes "we celebrate rakhi every year" has given the model nothing it cannot
// already assume, and the space is better spent on the one memory only they have.

const SIBLING_TAIL =
  `We fought about the TV remote for about fifteen years. She told Mummy every ` +
  `single time I bunked class. But the year I failed my second-year exams she sat ` +
  `outside the room for three hours and never told anyone at home about it. She is ` +
  `in Bangalore now and I am in Pune, and she still calls at 1am about nothing.`;

/** A BROTHER writing for his SISTER — `happy-rakshabandhan-to-sister`. */
export const SISTER_CAST: StoryCast = {
  slots: [
    { slot: "you", label: "Your name", placeholder: "Rohan", prompt: "your name" },
    {
      slot: "bestFriend",
      label: "Your sister's name",
      placeholder: "Ishita",
      prompt: "her name",
    },
  ],
  sample:
    `${STORY_SLOTS.bestFriend} is my sister. She takes my hoodies and never gives ` +
    `them back. ${SIBLING_TAIL}`,
};

/** A SISTER writing for her BROTHER — `happy-rakshabandhan-to-brother`. */
export const BROTHER_CAST: StoryCast = {
  slots: [
    { slot: "you", label: "Your name", placeholder: "Meera", prompt: "your name" },
    {
      slot: "bestFriend",
      label: "Your brother's name",
      placeholder: "Arjun",
      prompt: "his name",
    },
  ],
  sample:
    `${STORY_SLOTS.bestFriend} is my brother. He ate my share of the gulab jamun in ` +
    `2009 and has never once admitted it. We fought about the TV remote for about ` +
    `fifteen years. He told Mummy every single time I came home late. But the year I ` +
    `moved cities he took three days off work to help me shift, and complained the ` +
    `whole time. He is in Dubai now and I am in Delhi, and he still calls at 1am ` +
    `about nothing.`,
};
