"use client";

import { useRef, type KeyboardEvent } from "react";
import type { RegionFilter, RegionTab } from "@/lib/aggregate";
import { cn } from "@/lib/utils";

type Props = {
  tabs: RegionTab[];
  value: RegionFilter;
  onChange: (value: RegionFilter) => void;
  panelId: string;
};

export function RegionTabs({ tabs, value, onChange, panelId }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div className="overflow-x-auto border-b border-border">
      <div role="tablist" aria-label="Sales region" className="flex min-w-max gap-6">
        {tabs.map((tab, index) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "-mb-px border-b-2 px-0.5 py-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-foreground font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
