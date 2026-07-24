import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600 text-white dark:bg-primary-500",
        secondary:
          "border-transparent bg-surface-muted text-text dark:bg-surface-muted dark:text-text",
        destructive:
          "border-transparent bg-red-600 text-white dark:bg-red-500",
        outline:
          "border-surface-border text-text dark:border-surface-border dark:text-text",
        success:
          "border-transparent bg-emerald-600 text-white dark:bg-emerald-500",
        warning:
          "border-transparent bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-950",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
