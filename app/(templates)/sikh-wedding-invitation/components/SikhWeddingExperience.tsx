"use client";

// The guest page for /sikh-wedding-invitation: the shared faith-wedding experience with the sikh profile.
import FaithWeddingExperience from "../../_faith/Experience";
import { SIKH } from "../../_faith/faiths/sikh";
import type { ExperienceProps } from "../../_valentine/types";

export default function SikhWeddingExperience(props: ExperienceProps) {
  return <FaithWeddingExperience {...props} faith={SIKH} />;
}
