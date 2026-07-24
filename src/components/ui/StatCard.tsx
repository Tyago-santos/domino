import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: TrendDirection;
  trendValue?: string;
  icon?: ReactNode;
}

const trendConfig: Record<TrendDirection, { icon: typeof TrendingUp; color: string }> = {
  up: {
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  down: {
    icon: TrendingDown,
    color: "text-red-600 dark:text-red-400",
  },
  neutral: {
    icon: Minus,
    color: "text-text-muted dark:text-text-muted",
  },
};

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, trend = "neutral", trendValue, icon, className, ...props }, ref) => {
    const { icon: TrendIcon, color } = trendConfig[trend];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5 shadow-sm",
          "dark:border-surface-border dark:bg-surface",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-muted dark:text-text-muted">
            {label}
          </span>
          {icon && (
            <div className="text-text-muted dark:text-text-muted">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-end gap-3">
          <span className="text-2xl font-bold tracking-tight text-text dark:text-text">
            {value}
          </span>

          {trendValue && (
            <div className={cn("flex items-center gap-1", color)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard, type StatCardProps, type TrendDirection };
