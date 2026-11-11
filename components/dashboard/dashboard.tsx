"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { getJobFeed, refreshFeed } from "@/lib/data";
import { getWindow } from "@/lib/dates";
import {
  ALL_REGIONS,
  computeKpis,
  filterByRegion,
  filterByWindow,
  groupByDay,
  listRegionTabs,
  type RegionFilter,
} from "@/lib/aggregate";
import { DashboardHeader } from "./dashboard-header";
import { StaleBanner } from "./stale-banner";
import { RegionTabs } from "./region-tabs";
import { KpiCards } from "./kpi-cards";
import { DaySchedule } from "./day-schedule";
import { JobsSheet } from "./jobs-sheet";
import { ErrorState, LoadingState } from "./states";
import type { DashboardMode, JobSelection } from "./types";

const PANEL_ID = "capacity-panel";

export function Dashboard({ mode }: { mode: DashboardMode }) {
  const { data, error, mutate, isValidating } = useSWR("capacity/job-feed", getJobFeed, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const [region, setRegion] = useState<RegionFilter>(ALL_REGIONS);
  const [selection, setSelection] = useState<JobSelection | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const dateWindow = useMemo(() => getWindow(), []);
  const windowJobs = useMemo(() => (data ? filterByWindow(data.jobs, dateWindow) : []), [data, dateWindow]);
  const tabs = useMemo(() => listRegionTabs(windowJobs), [windowJobs]);
  const activeRegion = tabs.some((t) => t.value === region) ? region : ALL_REGIONS;
  const regionJobs = useMemo(() => filterByRegion(windowJobs, activeRegion), [windowJobs, activeRegion]);
  const kpis = useMemo(() => computeKpis(regionJobs), [regionJobs]);
  const weeks = useMemo(() => groupByDay(regionJobs, dateWindow), [regionJobs, dateWindow]);

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshError(null);
    try {
      await mutate(refreshFeed(), { revalidate: false });
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : "Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  }

  function handleSelect(next: JobSelection) {
    setSelection(next);
    setSheetOpen(true);
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-1/2 z-0 -translate-x-[38%] -translate-y-1/2 -rotate-90 select-none font-heading text-[clamp(3.5rem,9vw,8rem)] font-bold uppercase leading-none tracking-[0.18em] text-foreground/[0.035]"
      >
        spatiolens
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col">
      <DashboardHeader
        mode={mode}
        feed={data}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        refreshError={refreshError}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 md:px-6">
        {error && !data ? (
          <ErrorState
            message={error instanceof Error ? error.message : "Something went wrong loading the feed."}
            onRetry={() => mutate()}
            retrying={isValidating}
          />
        ) : !data ? (
          <LoadingState />
        ) : (
          <>
            <StaleBanner fetchedAt={data.fetchedAt} />
            <RegionTabs tabs={tabs} value={activeRegion} onChange={setRegion} panelId={PANEL_ID} />
            <div id={PANEL_ID} role="tabpanel" className="flex flex-col gap-8">
              <KpiCards kpis={kpis} window={dateWindow} />
              <DaySchedule weeks={weeks} window={dateWindow} isEmpty={regionJobs.length === 0} onSelect={handleSelect} />
            </div>
          </>
        )}
      </main>

      <JobsSheet mode={mode} selection={selection} open={sheetOpen} onOpenChange={setSheetOpen} />
      </div>
    </div>
  );
}
