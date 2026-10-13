// /miss-you — Miss You, a cute, romantic "I miss you" for a long-distance love.
// The whole editor lives in the shared engine (app/(templates)/_valentine);
// this occasion's own look is ./components/MissYouExperience.tsx.
import ValentineDayEditorPage from "../_valentine/ValentineDayEditorPage";

export default function Page() {
  return <ValentineDayEditorPage slug="miss-you" />;
}
