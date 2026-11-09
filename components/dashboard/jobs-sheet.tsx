"use client";

import { ExternalLink } from "lucide-react";
import type { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMonthDay } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import type { DashboardMode, JobSelection } from "./types";

type Props = {
  mode: DashboardMode;
  selection: JobSelection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JobsSheet({ mode, selection, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle className="font-heading text-xl font-bold tracking-wide uppercase">
            {selection?.title}
          </SheetTitle>
          <SheetDescription>{selection?.description}</SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col overflow-y-auto">
          {selection?.jobs.map((job) => (
            <li key={job.ragicId} className="border-b border-border">
              <JobItem job={job} mode={mode} />
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

function JobItem({ job, mode }: { job: Job; mode: DashboardMode }) {
  return (
    <article className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-medium tracking-wide text-muted-foreground tabular-nums">{job.jobId}</span>
          <h3 className="font-semibold leading-snug text-pretty">{job.jobName}</h3>
        </div>
        {job.hours === null ? (
          <span className="shrink-0 rounded-full bg-alert-soft px-2 py-0.5 text-xs font-medium text-destructive">
            no hours
          </span>
        ) : (
          <span className="shrink-0 text-sm font-semibold tabular-nums">{formatNumber(job.hours)} hrs</span>
        )}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
        <dt className="text-muted-foreground">Company</dt>
        <dd>{job.company}</dd>
        <dt className="text-muted-foreground">Sales rep</dt>
        <dd>{job.salesRep}</dd>
        <dt className="text-muted-foreground">Estimator</dt>
        <dd>{job.estimator ?? <span className="font-medium text-destructive">Unassigned</span>}</dd>
        <dt className="text-muted-foreground">Region</dt>
        <dd>{job.region ?? "No region"}</dd>
        <dt className="text-muted-foreground">Due</dt>
        <dd>
          {formatMonthDay(job.estimateDue)}
          {job.bidDate && <span className="text-muted-foreground"> &middot; bid {formatMonthDay(job.bidDate)}</span>}
        </dd>
      </dl>

      {(job.scope.length > 0 || job.isCsc) && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Scope">
          {job.isCsc && (
            <li className="rounded-sm bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">CSC</li>
          )}
          {job.scope.map((s) => (
            <li key={s} className="rounded-sm border border-border bg-muted px-1.5 py-0.5 text-xs font-medium">
              {s}
            </li>
          ))}
        </ul>
      )}

      {job.note && <p className="text-sm leading-relaxed text-muted-foreground">{job.note}</p>}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
        >
          Open in Ragic
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        {mode === "manager" && (
          <div className="ml-auto flex gap-2">
            <DisabledAction label="Reassign" />
            <DisabledAction label="Set hours" />
          </div>
        )}
      </div>
    </article>
  );
}

const EDIT_DISABLED_REASON = "Editing will be enabled when Ragic write access is connected";

function DisabledAction({ label }: { label: string }) {
  return (
    <Tooltip>
      {/* Wrapper span keeps the tooltip reachable: disabled buttons receive no pointer or focus events. */}
      <TooltipTrigger render={<span tabIndex={0} className="inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" />}>
        <Button variant="outline" size="sm" disabled aria-describedby={undefined}>
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{EDIT_DISABLED_REASON}</TooltipContent>
    </Tooltip>
  );
}
