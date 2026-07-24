import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-surface-border dark:bg-surface-border",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary-600 transition-all duration-300 ease-in-out dark:bg-primary-500",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress, type ProgressProps };
