"use client";

// The guest page for /muslim-wedding-invitation: the shared faith-wedding experience with the muslim profile.
import FaithWeddingExperience from "../../_faith/Experience";
import { MUSLIM } from "../../_faith/faiths/muslim";
import type { ExperienceProps } from "../../_valentine/types";

export default function MuslimWeddingExperience(props: ExperienceProps) {
  return <FaithWeddingExperience {...props} faith={MUSLIM} />;
}
