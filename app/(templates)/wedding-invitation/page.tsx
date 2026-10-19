// /wedding-invitation — Wedding Invitation (Classic, $5): one elegant page that
// opens like a wax-sealed envelope. The editor is the shared engine
// (app/(templates)/_valentine) with this template's studio; the guest page and
// the studio live in ./components, on the wedding kit (../_wedding).
import ValentineDayEditorPage from "../_valentine/ValentineDayEditorPage";

export default function Page() {
  return <ValentineDayEditorPage slug="wedding-invitation" />;
}
