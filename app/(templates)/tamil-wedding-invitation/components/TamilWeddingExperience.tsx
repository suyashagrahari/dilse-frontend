"use client";

// The guest page for /tamil-wedding-invitation: the shared faith-wedding experience with the tamil profile.
import FaithWeddingExperience from "../../_faith/Experience";
import { TAMIL } from "../../_faith/faiths/tamil";
import type { ExperienceProps } from "../../_valentine/types";

export default function TamilWeddingExperience(props: ExperienceProps) {
  return <FaithWeddingExperience {...props} faith={TAMIL} />;
}
