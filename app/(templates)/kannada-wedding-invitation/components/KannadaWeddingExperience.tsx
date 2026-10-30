"use client";

// The guest page for /kannada-wedding-invitation: the shared faith-wedding experience with the kannada profile.
import FaithWeddingExperience from "../../_faith/Experience";
import { KANNADA } from "../../_faith/faiths/kannada";
import type { ExperienceProps } from "../../_valentine/types";

export default function KannadaWeddingExperience(props: ExperienceProps) {
  return <FaithWeddingExperience {...props} faith={KANNADA} />;
}
