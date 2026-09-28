import { ContentSkeleton } from "@/components/skeleton/Skeletons";

// Shown the instant a link inside the site is tapped, until the next page is
// ready. Routes with a distinctive shape override this with their own.
export default function Loading() {
  return <ContentSkeleton />;
}
