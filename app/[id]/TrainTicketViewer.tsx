"use client";

// PRE-FLIGHT PLACEHOLDER — replaced by the train-ticket build agent.
// Props signature is final: SharePageClient already dispatches to this.
export default function TrainTicketViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  void rawData; void hasPassword; void shareId;
  return (
    <main className="min-h-dvh grid place-items-center bg-white px-6 text-center">
      <p className="text-sm text-neutral-500">Train Ticket — building.</p>
    </main>
  );
}
