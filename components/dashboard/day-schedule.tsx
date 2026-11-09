import type { WeekGroup } from "@/lib/aggregate";
import { formatMonthDay, formatMonthDayYear, type DateWindow } from "@/lib/dates";
import { DayCard } from "./day-card";
import { EmptyState } from "./states";
import type { JobSelection } from "./types";

type Props = {
  weeks: WeekGroup[];
  window: DateWindow;
  isEmpty: boolean;
  onSelect: (selection: JobSelection) => void;
};

export function DaySchedule({ weeks, window, isEmpty, onSelect }: Props) {
  return (
    <section aria-labelledby="by-day-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 id="by-day-heading" className="font-heading text-xl font-bold tracking-wide uppercase">
          Jobs due by day
        </h2>
        <p className="text-sm text-muted-foreground">Jobs and hours by estimator, each day</p>
      </div>

      {isEmpty ? (
        <EmptyState range={`${formatMonthDayYear(window.from)} to ${formatMonthDayYear(window.to)}`} />
      ) : (
        <div className="flex flex-col gap-6">
          {weeks.map((week) => (
            <section key={week.weekStart} aria-label={`Week of ${formatMonthDay(week.weekStart)}`} className="flex flex-col gap-2">
              <h3 className="font-heading text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                Week of {formatMonthDay(week.weekStart)}
              </h3>
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,0.8fr)]">
                {week.weekdays.map((day) => (
                  <DayCard key={day.key} group={day} onSelect={onSelect} />
                ))}
                <DayCard group={week.weekend} onSelect={onSelect} />
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
