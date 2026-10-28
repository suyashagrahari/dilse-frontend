"use client";

// The guest page for /christian-wedding-invitation: the shared faith-wedding experience with the christian profile.
import FaithWeddingExperience from "../../_faith/Experience";
import { CHRISTIAN } from "../../_faith/faiths/christian";
import type { ExperienceProps } from "../../_valentine/types";

export default function ChristianWeddingExperience(props: ExperienceProps) {
  return <FaithWeddingExperience {...props} faith={CHRISTIAN} />;
}
