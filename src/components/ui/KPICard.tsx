import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  decimals?: number;
}

const KPICard = forwardRef<HTMLDivElement, KPICardProps>(
  ({ icon, label, value, change, changeLabel, className, ...props }, ref) => {
    const isPositive = change !== undefined && change >= 0;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3 rounded-lg border border-surface-border bg-surface p-6 shadow-sm",
          "dark:border-surface-border dark:bg-surface",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-muted dark:text-text-muted">
            {label}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
            {icon}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight text-text dark:text-text">
            {value}
          </span>
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-xs text-text-muted dark:text-text-muted">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
KPICard.displayName = "KPICard";

export { KPICard, type KPICardProps };
