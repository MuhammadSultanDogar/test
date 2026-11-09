import type { DayGroup, SummaryRow } from "@/lib/aggregate";
import { formatDateSpan, formatDayLabel } from "@/lib/dates";
import { formatNumber, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { JobSelection } from "./types";

type Props = {
  group: DayGroup;
  onSelect: (selection: JobSelection) => void;
};

const DASH = "\u2013";

export function DayCard({ group, onSelect }: Props) {
  const { summary } = group;
  const label = group.isWeekend
    ? `Sat\u2013Sun, ${formatDateSpan(group.dates[0], group.dates[group.dates.length - 1])}`
    : formatDayLabel(group.dates[0]);
  const totalDue = summary.all.length;
  const isEmpty = totalDue === 0;

  function openAll() {
    onSelect({ title: label, description: `All jobs due \u00b7 ${pluralize(totalDue, "job")}`, jobs: summary.all });
  }

  function openRow(row: SummaryRow) {
    onSelect({ title: `${label} \u00b7 ${row.label}`, description: pluralize(row.jobCount, "job"), jobs: row.jobs });
  }

  return (
    <article
      aria-label={label}
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border bg-card p-3",
        group.isWeekend && "bg-muted/60",
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border pb-2">
        <h4 className="font-heading text-base font-semibold tracking-wide uppercase">
          {isEmpty ? (
            label
          ) : (
            <button
              type="button"
              onClick={openAll}
              className="rounded-sm text-left underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </button>
          )}
        </h4>
      </header>

      {group.isWeekend && !isEmpty && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{pluralize(totalDue, "job")} due</span>
          <span className="rounded-sm bg-destructive px-1.5 py-0.5 font-heading text-xs font-semibold tracking-wider text-destructive-foreground uppercase">
            Reassign
          </span>
        </div>
      )}

      {isEmpty ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Nothing due</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Jobs and hours by estimator, {label}</caption>
          <thead>
            <tr className="text-xs tracking-wider text-muted-foreground uppercase">
              <th scope="col" className="pb-1 text-left font-medium">
                Name
              </th>
              <th scope="col" className="w-10 pb-1 text-right font-medium">
                Jobs
              </th>
              <th scope="col" className="w-11 pb-1 text-right font-medium">
                Hrs
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.unassigned && (
              <Row row={summary.unassigned} onOpen={openRow} className="font-semibold" />
            )}
            {summary.noHours && (
              <Row row={summary.noHours} onOpen={openRow} className="bg-alert-soft" hoursOverride={DASH} />
            )}
            {summary.estimators.map((row) => (
              <Row key={row.key} row={row} onOpen={openRow} showNoHoursPill />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-foreground/80 font-semibold">
              <th scope="row" className="py-1 text-left">
                Total
              </th>
              <td className="py-1 text-right tabular-nums">{formatNumber(summary.total.jobCount)}</td>
              <td className="py-1 text-right tabular-nums">{formatNumber(summary.total.hours)}</td>
            </tr>
            {summary.csc.jobCount > 0 && (
              <tr className="border-t border-dashed border-border text-muted-foreground">
                <th scope="row" className="pt-1.5 text-left font-normal">
                  <button
                    type="button"
                    onClick={() =>
                      onSelect({
                        title: `${label} \u00b7 CSC Estimating`,
                        description: `${pluralize(summary.csc.jobCount, "job")} \u00b7 not included in totals`,
                        jobs: summary.csc.jobs,
                      })
                    }
                    className="rounded-sm text-left underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    CSC Estimating
                  </button>
                </th>
                <td className="pt-1.5 text-right tabular-nums">{formatNumber(summary.csc.jobCount)}</td>
                <td className="pt-1.5 text-right">
                  <span aria-label="not counted">{DASH}</span>
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      )}
    </article>
  );
}

type RowProps = {
  row: SummaryRow;
  onOpen: (row: SummaryRow) => void;
  className?: string;
  hoursOverride?: string;
  showNoHoursPill?: boolean;
};

function Row({ row, onOpen, className, hoursOverride, showNoHoursPill }: RowProps) {
  return (
    <tr className={cn("align-top", className)}>
      <th scope="row" className="py-1 pr-1 text-left font-[inherit]">
        <button
          type="button"
          onClick={() => onOpen(row)}
          className="flex w-full flex-col items-start gap-0.5 rounded-sm text-left underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="break-words">{row.label}</span>
          {showNoHoursPill && row.noHoursCount > 0 && (
            <span className="rounded-full bg-alert-soft px-1.5 text-xs leading-5 font-medium text-destructive no-underline">
              {formatNumber(row.noHoursCount)} no hrs
            </span>
          )}
        </button>
      </th>
      <td className="py-1 text-right tabular-nums">{formatNumber(row.jobCount)}</td>
      <td className="py-1 text-right tabular-nums">{hoursOverride ?? formatNumber(row.hours)}</td>
    </tr>
  );
}
