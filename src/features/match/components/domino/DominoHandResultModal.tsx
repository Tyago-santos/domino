import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Handshake, Trophy } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { HandResult } from "@/shared/lib/domino";
import type { DominoUnitDisplay } from "./dominoDisplay";

interface DominoHandResultModalProps {
  open: boolean;
  result: HandResult | null;
  units: DominoUnitDisplay[];
  myUnit: string | null;
  onNextHand: () => void;
  isBusy: boolean;
}

/** Shown between hands — the match itself keeps going until a unit reaches the target. */
export function DominoHandResultModal({
  open,
  result,
  units,
  myUnit,
  onNextHand,
  isBusy,
}: DominoHandResultModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !cardRef.current) return;
    animate(cardRef.current, {
      scale: [0.85, 1],
      opacity: [0, 1],
      duration: 420,
      ease: "outBack",
    });
  }, [open]);

  if (!open || !result) return null;

  const iWon = myUnit !== null && result.winningUnit === myUnit;
  const winnerName = units.find((u) => u.id === result.winningUnit)?.name ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-5 shadow-2xl sm:p-6"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "mb-3 flex h-14 w-14 items-center justify-center rounded-full",
              result.isDraw
                ? "bg-surface-muted text-text-muted"
                : iWon
                  ? "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
            )}
          >
            {result.isDraw ? <Handshake className="h-7 w-7" /> : <Trophy className="h-7 w-7" />}
          </div>

          {result.isDraw ? (
            <>
              <h3 className="text-lg font-bold text-text">Mão empatada</h3>
              <p className="mt-1 text-sm text-text-muted">
                A mesa travou com o mesmo tanto de pontos para todo mundo. Ninguém
                pontua — as pedras voltam para a mesa.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-text">
                {iWon ? "Você venceu a mão!" : `${winnerName} venceu a mão`}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {result.wasBlocked ? "Jogo travado — menor pontuação" : "Bateu"} ·{" "}
                <span className="font-semibold text-text">+{result.points}</span>{" "}
                {result.points === 1 ? "ponto" : "pontos"}
              </p>
              <div className="mt-3 flex w-full flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-text-muted">
                {units.map((unit) => (
                  <span key={unit.id}>
                    {unit.name}: <span className="font-semibold">{result.pipSum[unit.id] ?? 0}</span> na mão
                  </span>
                ))}
              </div>
            </>
          )}

          <Button
            onClick={onNextHand}
            disabled={isBusy}
            className="mt-5 w-full bg-primary-600 text-white hover:bg-primary-700"
          >
            {isBusy ? "Embaralhando..." : "Próxima mão"}
          </Button>
        </div>
      </div>
    </div>
  );
}
