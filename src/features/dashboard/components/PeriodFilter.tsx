import { cn } from "@/shared/lib/utils";
import type { PeriodFilter as PeriodFilterType } from "@/shared/types";

interface PeriodFilterProps {
  value: PeriodFilterType;
  onChange: (period: PeriodFilterType) => void;
  className?: string;
}

const periods: { value: PeriodFilterType; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7days", label: "7 dias" },
  { value: "30days", label: "30 dias" },
  { value: "90days", label: "90 dias" },
  { value: "year", label: "Ano" },
  { value: "custom", label: "Personalizado" },
];

export function PeriodFilter({ value, onChange, className }: PeriodFilterProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-lg border border-surface-border bg-surface p-1",
        "dark:border-surface-border dark:bg-surface",
        className
      )}
    >
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            value === period.value
              ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
              : "text-text-muted hover:bg-surface-muted hover:text-text dark:text-text-muted dark:hover:bg-surface-muted dark:hover:text-text"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
