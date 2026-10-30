"use client";

// The guest page for /telugu-wedding-invitation: the shared faith-wedding experience with the telugu profile.
import FaithWeddingExperience from "../../_faith/Experience";
import { TELUGU } from "../../_faith/faiths/telugu";
import type { ExperienceProps } from "../../_valentine/types";

export default function TeluguWeddingExperience(props: ExperienceProps) {
  return <FaithWeddingExperience {...props} faith={TELUGU} />;
}
