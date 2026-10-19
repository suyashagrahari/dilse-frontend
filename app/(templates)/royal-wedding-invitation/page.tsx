// /royal-wedding-invitation — Royal Wedding Invitation 👑 ($20, the flagship
// wedding tier): palace gates, a gold-foil crest, the story, up to eight
// functions, 40 photos, RSVP per function and a blessings wall.
// The editor and publishing are the shared engine (app/(templates)/_valentine);
// this template's own pieces are ./components (the guest page and the studio).
import ValentineDayEditorPage from "../_valentine/ValentineDayEditorPage";

export default function Page() {
  return <ValentineDayEditorPage slug="royal-wedding-invitation" />;
}
