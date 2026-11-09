import type { Kpis } from "@/lib/aggregate";
import { formatMonthDay, type DateWindow } from "@/lib/dates";
import { formatNumber, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

type KpiProps = { label: string; value: string; caption: string; alert?: boolean };

function Kpi({ label, value, caption, alert }: KpiProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-4">
      <dt className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase md:text-sm">
        {label}
      </dt>
      <dd className={cn("font-heading text-3xl leading-tight font-bold md:text-4xl", alert && "text-destructive")}>
        {value}
      </dd>
      <dd className="text-sm leading-relaxed text-muted-foreground">{caption}</dd>
    </div>
  );
}

export function KpiCards({ kpis, window }: { kpis: Kpis; window: DateWindow }) {
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi
        label="Jobs due"
        value={formatNumber(kpis.jobsDue)}
        caption={`${formatMonthDay(window.from)} to ${formatMonthDay(window.to)} \u00b7 excl. ${formatNumber(kpis.cscExcluded)} CSC`}
      />
      <Kpi
        label="Hours planned"
        value={formatNumber(kpis.hoursPlanned)}
        caption={`across ${pluralize(kpis.jobsWithHours, "job")} with hours`}
      />
      <Kpi
        label="Jobs without hours"
        value={formatNumber(kpis.jobsWithoutHours)}
        caption="need an hours entry in Ragic"
        alert={kpis.jobsWithoutHours > 0}
      />
      <Kpi
        label="No estimator"
        value={formatNumber(kpis.noEstimator)}
        caption={`${formatNumber(kpis.noEstimatorHours)} hours on those jobs`}
      />
    </dl>
  );
}
