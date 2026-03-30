"use client";

import ChristianInvitationCard from "./ChristianInvitationCard";
import type { ShaadiData } from "./types";

interface Props {
  data: ShaadiData;
}

export default function HomeSection({ data }: Props) {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-white lg:flex lg:items-center lg:justify-center lg:bg-[#fcfcfa] lg:py-8">
      <ChristianInvitationCard
        brideName={data.brideName}
        groomName={data.groomName}
        weddingDate={data.weddingDate}
        venue={data.venue}
        blessing={data.blessing}
      />
    </div>
  );
}
