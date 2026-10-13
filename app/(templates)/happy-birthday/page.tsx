// /happy-birthday — a cute, romantic birthday surprise. The whole editor lives
// in the shared engine (app/(templates)/_valentine); this occasion's own look
// is ./components/HappyBirthdayExperience.tsx.
import ValentineDayEditorPage from "../_valentine/ValentineDayEditorPage";

export default function Page() {
  return <ValentineDayEditorPage slug="happy-birthday" />;
}
