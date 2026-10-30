"use client";

// The guest page for /malayalam-wedding-invitation: the shared faith-wedding experience with the malayalam profile.
import FaithWeddingExperience from "../../_faith/Experience";
import { MALAYALAM } from "../../_faith/faiths/malayalam";
import type { ExperienceProps } from "../../_valentine/types";

export default function MalayalamWeddingExperience(props: ExperienceProps) {
  return <FaithWeddingExperience {...props} faith={MALAYALAM} />;
}
