import { AdminSkeleton } from "@/components/skeleton/Skeletons";

// Rendered inside the admin layout, so the fixed admin navbar stays put and
// only the page area shows the skeleton.
export default function Loading() {
  return <AdminSkeleton />;
}
