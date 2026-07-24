import { useState, useEffect, useRef } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface MatchTimerProps {
  startedAt?: string;
  isRunning: boolean;
  className?: string;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function MatchTimer({ startedAt, isRunning, className }: MatchTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && startedAt) {
      const startTime = new Date(startedAt).getTime();
      const update = () => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      };
      update();
      intervalRef.current = setInterval(update, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, startedAt]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Timer className="h-5 w-5 text-primary-500" />
        {isRunning && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-green-500" />
        )}
      </div>
      <span className="font-mono text-2xl font-bold tracking-wider text-text tabular-nums sm:text-3xl">
        {formatTime(elapsed)}
      </span>
    </div>
  );
}
