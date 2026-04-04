"use client";

import InvitationCard from "./InvitationCard";
import type { ShaadiData } from "./types";

interface Props { data: ShaadiData }

export default function HomeSection({ data }: Props) {
  return (
    <div className="min-h-[100dvh] min-h-screen lg:min-h-[calc(100dvh-0px)] w-full">
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
