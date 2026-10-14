// /happy-anniversary — "Our Little Love Museum", a premium anniversary page.
// The whole editor lives in the shared engine (app/(templates)/_valentine);
// this occasion's own look is ./components/HappyAnniversaryExperience.tsx.
import ValentineDayEditorPage from "../_valentine/ValentineDayEditorPage";

export default function Page() {
  return <ValentineDayEditorPage slug="happy-anniversary" />;
}
