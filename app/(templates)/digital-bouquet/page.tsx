// /digital-bouquet — Digital Bouquet ✦ Premium: the sender arranges a bouquet
// stem by stem in the bouquet studio; it is delivered, blooms and is kept.
// The whole editor lives in the shared engine (app/(templates)/_valentine);
// this template's own pieces are ./components (the studio, the bouquet and
// the recipient's scenes).
import ValentineDayEditorPage from "../_valentine/ValentineDayEditorPage";

export default function Page() {
  return <ValentineDayEditorPage slug="digital-bouquet" />;
}
