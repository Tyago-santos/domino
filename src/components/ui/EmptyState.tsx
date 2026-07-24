import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, actionLabel, onAction, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-border px-6 py-16 text-center",
        "dark:border-surface-border",
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted">
        {icon ?? (
          <Inbox className="h-7 w-7 text-text-muted dark:text-text-muted" />
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-text dark:text-text">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-text-muted dark:text-text-muted">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  )
);
EmptyState.displayName = "EmptyState";

export { EmptyState, type EmptyStateProps };
