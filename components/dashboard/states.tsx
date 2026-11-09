import { CalendarX, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading jobs from the bid calendar</span>
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-md" />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 4 }, (_, week) => (
          <div
            key={week}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,0.8fr)]"
          >
            {Array.from({ length: 6 }, (_, day) => (
              <Skeleton key={day} className="h-48 rounded-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry, retrying }: { message: string; onRetry: () => void; retrying: boolean }) {
  return (
    <div role="alert" className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 rounded-md border border-border bg-card p-8 text-center">
      <CircleAlert className="size-6 text-destructive" aria-hidden="true" />
      <h2 className="font-heading text-lg font-bold tracking-wide uppercase">Could not load the bid calendar</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
      <Button onClick={onRetry} disabled={retrying}>
        {retrying ? "Retrying" : "Retry"}
      </Button>
    </div>
  );
}

export function EmptyState({ range }: { range: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-card p-10 text-center">
      <CalendarX className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="font-heading text-lg font-semibold tracking-wide uppercase">No jobs due in this window</p>
      <p className="text-sm text-muted-foreground">{range}</p>
    </div>
  );
}
