import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "@/shared/lib/utils";
import type { HandResult } from "@/shared/lib/domino";
import type { DominoUnitDisplay } from "./dominoDisplay";

/** Cycled by unit index — TEAMS always uses the first two (blue vs red). */
const UNIT_COLORS = [
  { border: "border-blue-200 dark:border-blue-900/50", bg: "bg-blue-50/60 dark:bg-blue-950/25", text: "text-blue-600 dark:text-blue-400" },
  { border: "border-red-200 dark:border-red-900/50", bg: "bg-red-50/60 dark:bg-red-950/25", text: "text-red-600 dark:text-red-400" },
  { border: "border-amber-200 dark:border-amber-900/50", bg: "bg-amber-50/60 dark:bg-amber-950/25", text: "text-amber-600 dark:text-amber-400" },
  { border: "border-emerald-200 dark:border-emerald-900/50", bg: "bg-emerald-50/60 dark:bg-emerald-950/25", text: "text-emerald-600 dark:text-emerald-400" },
];

interface DominoScoreboardProps {
  units: DominoUnitDisplay[];
  score: Record<string, number>;
  targetScore: number;
  myUnit: string | null;
  handNumber: number;
  handHistory: HandResult[];
}

export function DominoScoreboard({
  units,
  score,
  targetScore,
  myUnit,
  handNumber,
  handHistory,
}: DominoScoreboardProps) {
  const unitName = (id: string) => units.find((u) => u.id === id)?.name ?? "?";

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold text-text">Placar</h4>
        <span className="text-[10px] font-medium text-text-muted">
          Mão {handNumber} · vale {targetScore} pontos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {units.map((unit, index) => (
          <UnitScore
            key={unit.id}
            name={unit.name}
            points={score[unit.id] ?? 0}
            target={targetScore}
            color={UNIT_COLORS[index % UNIT_COLORS.length]!}
            isMine={myUnit === unit.id}
          />
        ))}
      </div>

      {handHistory.length > 0 && (
        <div className="mt-3 border-t border-surface-border pt-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Mãos anteriores
          </p>
          <div className="flex flex-wrap gap-1.5">
            {handHistory.map((result, index) => (
              <span
                key={index}
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  result.isDraw
                    ? "bg-surface-muted text-text-muted"
                    : "bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                )}
              >
                {result.isDraw
                  ? "Empate · anulada"
                  : `${unitName(result.winningUnit!)} +${result.points}${result.wasBlocked ? " · travado" : ""}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface UnitScoreProps {
  name: string;
  points: number;
  target: number;
  color: (typeof UNIT_COLORS)[number];
  isMine: boolean;
}

function UnitScore({ name, points, target, color, isMine }: UnitScoreProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const previousRef = useRef(points);

  // Pop the number whenever this unit scores.
  useEffect(() => {
    if (points === previousRef.current) return;
    previousRef.current = points;
    if (!valueRef.current) return;
    animate(valueRef.current, {
      scale: [1, 1.45, 1],
      duration: 620,
      ease: "outElastic(1, .55)",
    });
  }, [points]);

  return (
    <div className={cn("rounded-xl border p-2.5", color.border, color.bg)}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="truncate text-xs font-semibold text-text">{name}</span>
        {isMine && (
          <span className="shrink-0 rounded-full bg-primary-100 px-1.5 py-px text-[9px] font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
            Você
          </span>
        )}
      </div>
      <span ref={valueRef} className={cn("inline-block text-2xl font-bold tabular-nums", color.text)}>
        {points}
      </span>
      <span className="ml-1 text-xs text-text-muted">/ {target}</span>
    </div>
  );
}
