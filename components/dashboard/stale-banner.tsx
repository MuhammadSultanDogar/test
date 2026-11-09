import { TriangleAlert } from "lucide-react";
import { ageInDays, ageInHours } from "@/lib/dates";
import { pluralize } from "@/lib/format";

export function StaleBanner({ fetchedAt }: { fetchedAt: string }) {
  if (ageInHours(fetchedAt) <= 24) return null;
  const days = Math.max(1, ageInDays(fetchedAt));

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-md border border-destructive/25 bg-alert-soft px-4 py-3 text-sm"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      <p className="leading-relaxed text-pretty">
        <strong className="font-semibold">This data is {pluralize(days, "day")} old.</strong> Recent changes in Ragic
        will not show until the data is refreshed.
      </p>
    </div>
  );
}
