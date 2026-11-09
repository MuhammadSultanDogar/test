"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import type { JobFeed } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative, formatTimestamp } from "@/lib/dates";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import type { DashboardMode } from "./types";

type Props = {
  mode: DashboardMode;
  feed: JobFeed | undefined;
  onRefresh: () => void;
  refreshing: boolean;
  refreshError: string | null;
};

export function DashboardHeader({ mode, feed, onRefresh, refreshing, refreshError }: Props) {
  return (
    <header className="bg-card">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 pt-4 pb-3 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="flex items-center gap-4">
          <Logo />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="font-heading text-2xl leading-none font-bold tracking-wide text-balance uppercase md:text-3xl">
                Capacity Estimating Dashboard
              </h1>
              {mode === "manager" && (
                <span className="rounded-sm bg-primary px-2 py-0.5 font-heading text-xs font-semibold tracking-wider text-primary-foreground uppercase">
                  Manager view
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Four-week view by region, from the Ragic bid calendar</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 text-sm md:items-end">
          {/* Plain anchor: the Toolkit lives on the portal, outside this app's /capacity basePath. */}
          <a
            href="/"
            className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Toolkit
          </a>
          {feed ? (
            <div className="flex flex-col items-start gap-0.5 md:items-end">
              <p>
                Data refreshed{" "}
                <time dateTime={feed.fetchedAt} className="font-medium">
                  {formatTimestamp(feed.fetchedAt)}
                </time>{" "}
                <span className="text-muted-foreground">({formatRelative(feed.fetchedAt)})</span>
              </p>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">
                  {pluralize(feed.jobs.length, "job")} in the feed
                  {feed.source === "mock" && " (demo data)"}
                </p>
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
                  <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} aria-hidden="true" />
                  {refreshing ? "Refreshing" : "Refresh"}
                </Button>
              </div>
              {refreshError && (
                <p role="alert" className="text-destructive">
                  {refreshError}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-1.5 md:items-end" aria-hidden="true">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          )}
        </div>
      </div>
      <div className="deck-divider" aria-hidden="true" />
    </header>
  );
}
