"use client";

import InvitationCard from "./InvitationCard";
import type { ShaadiData } from "./types";

interface Props { data: ShaadiData }

export default function HomeSection({ data }: Props) {
  return (
    <div style={{ height: "100vh" }}>
      <InvitationCard
        brideName={data.brideName}
        groomName={data.groomName}
        weddingDate={data.weddingDate}
        venue={data.venue}
        blessing={data.blessing}
      />
    </div>
  );
}
