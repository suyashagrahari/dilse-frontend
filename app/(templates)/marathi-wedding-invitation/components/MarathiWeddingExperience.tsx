"use client";

// The guest page for /marathi-wedding-invitation: the shared faith-wedding experience with the marathi profile.
import FaithWeddingExperience from "../../_faith/Experience";
import { MARATHI } from "../../_faith/faiths/marathi";
import type { ExperienceProps } from "../../_valentine/types";

export default function MarathiWeddingExperience(props: ExperienceProps) {
  return <FaithWeddingExperience {...props} faith={MARATHI} />;
}
