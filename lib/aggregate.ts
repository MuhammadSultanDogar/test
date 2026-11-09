import type { Job } from "@/types/job";
import { isWeekend, type DateWindow } from "@/lib/dates";

export const ALL_REGIONS = "__all__";
export const NO_REGION = "__none__";
export type RegionFilter = string; // ALL_REGIONS | NO_REGION | a region name

export type RegionTab = { value: RegionFilter; label: string };

/** "All regions", each region present (sorted), then "No region" if any job lacks one. */
export function listRegionTabs(jobs: Job[]): RegionTab[] {
  const names = new Set<string>();
  let hasNone = false;
  for (const job of jobs) {
    if (job.region) names.add(job.region);
    else hasNone = true;
  }
  const tabs: RegionTab[] = [{ value: ALL_REGIONS, label: "All regions" }];
  for (const name of [...names].sort((a, b) => a.localeCompare(b))) tabs.push({ value: name, label: name });
  if (hasNone) tabs.push({ value: NO_REGION, label: "No region" });
  return tabs;
}

export function filterByRegion(jobs: Job[], region: RegionFilter): Job[] {
  if (region === ALL_REGIONS) return jobs;
  if (region === NO_REGION) return jobs.filter((j) => j.region === null);
  return jobs.filter((j) => j.region === region);
}

export function filterByWindow(jobs: Job[], window: Pick<DateWindow, "from" | "to">): Job[] {
  return jobs.filter((j) => j.estimateDue >= window.from && j.estimateDue <= window.to);
}

const sumHours = (jobs: Job[]) => jobs.reduce((acc, j) => acc + (j.hours ?? 0), 0);

export type SummaryRow = {
  key: string;
  label: string;
  jobs: Job[];
  jobCount: number;
  hours: number;
  /** Jobs in this row with hours === null. */
  noHoursCount: number;
};

export type Summary = {
  unassigned: SummaryRow | null;
  /** Cross-cutting: every non-CSC job with hours === null (they also appear in their estimator rows). */
  noHours: SummaryRow | null;
  estimators: SummaryRow[];
  total: { jobCount: number; hours: number };
  csc: { jobs: Job[]; jobCount: number };
  /** All jobs (CSC included) the summary was built from. */
  all: Job[];
};

function makeRow(key: string, label: string, jobs: Job[]): SummaryRow {
  return {
    key,
    label,
    jobs,
    jobCount: jobs.length,
    hours: sumHours(jobs),
    noHoursCount: jobs.filter((j) => j.hours === null).length,
  };
}

/** Build the per-estimator table for a set of jobs (one day, a weekend, or the whole window). */
export function summarize(jobs: Job[]): Summary {
  const counted = jobs.filter((j) => !j.isCsc);
  const csc = jobs.filter((j) => j.isCsc);

  const unassignedJobs = counted.filter((j) => j.estimator === null);
  const noHoursJobs = counted.filter((j) => j.hours === null);

  const byEstimator = new Map<string, Job[]>();
  for (const job of counted) {
    if (job.estimator === null) continue;
    const list = byEstimator.get(job.estimator);
    if (list) list.push(job);
    else byEstimator.set(job.estimator, [job]);
  }

  const estimators = [...byEstimator.entries()]
    .map(([name, list]) => makeRow(`est:${name}`, name, list))
    .sort((a, b) => b.hours - a.hours || b.jobCount - a.jobCount || a.label.localeCompare(b.label));

  return {
    unassigned: unassignedJobs.length ? makeRow("unassigned", "Unassigned", unassignedJobs) : null,
    noHours: noHoursJobs.length ? makeRow("no-hours", "No hours set", noHoursJobs) : null,
    estimators,
    total: { jobCount: counted.length, hours: sumHours(counted) },
    csc: { jobs: csc, jobCount: csc.length },
    all: jobs,
  };
}

export type DayGroup = {
  key: string;
  /** One date for weekdays, [Sat, Sun] for weekends. */
  dates: string[];
  isWeekend: boolean;
  summary: Summary;
};

export type WeekGroup = {
  weekStart: string;
  weekdays: DayGroup[];
  weekend: DayGroup;
};

/** Group jobs by estimateDue into weeks of Mon–Fri plus a combined Sat–Sun bucket. */
export function groupByDay(jobs: Job[], window: DateWindow): WeekGroup[] {
  const byDate = new Map<string, Job[]>();
  for (const job of jobs) {
    const list = byDate.get(job.estimateDue);
    if (list) list.push(job);
    else byDate.set(job.estimateDue, [job]);
  }

  const weeks: WeekGroup[] = [];
  for (let i = 0; i < window.dates.length; i += 7) {
    const week = window.dates.slice(i, i + 7);
    const weekdays = week.filter((d) => !isWeekend(d));
    const weekendDates = week.filter((d) => isWeekend(d));
    weeks.push({
      weekStart: week[0],
      weekdays: weekdays.map((date) => ({
        key: date,
        dates: [date],
        isWeekend: false,
        summary: summarize(byDate.get(date) ?? []),
      })),
      weekend: {
        key: `${weekendDates[0]}-weekend`,
        dates: weekendDates,
        isWeekend: true,
        summary: summarize(weekendDates.flatMap((d) => byDate.get(d) ?? [])),
      },
    });
  }
  return weeks;
}

export type Kpis = {
  jobsDue: number;
  cscExcluded: number;
  hoursPlanned: number;
  jobsWithHours: number;
  jobsWithoutHours: number;
  noEstimator: number;
  noEstimatorHours: number;
};

export function computeKpis(jobs: Job[]): Kpis {
  const counted = jobs.filter((j) => !j.isCsc);
  const unassigned = counted.filter((j) => j.estimator === null);
  return {
    jobsDue: counted.length,
    cscExcluded: jobs.length - counted.length,
    hoursPlanned: sumHours(counted),
    jobsWithHours: counted.filter((j) => j.hours !== null).length,
    jobsWithoutHours: counted.filter((j) => j.hours === null).length,
    noEstimator: unassigned.length,
    noEstimatorHours: sumHours(unassigned),
  };
}
