import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Crown, Flame } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { DominoGameResult } from "@/shared/lib/domino";
import type { DominoUnitDisplay } from "./dominoDisplay";

interface DominoGameResultModalProps {
  open: boolean;
  result: DominoGameResult | null;
  units: DominoUnitDisplay[];
  myUnit: string | null;
  /**
   * Only the winning side may register: `confirmVictory` claims the win for
   * whoever calls it, so anyone else just waits for them.
   */
  canConfirm: boolean;
  /** Records the result through the existing confirm-victory pipeline. */
  onConfirm: () => void;
  isConfirming: boolean;
  /** TEAMS needs both partners to confirm; INDIVIDUAL finalizes on the first click. */
  needsPartnerConfirm: boolean;
}

/**
 * Fires when the engine decides the match. Confirming here routes into the very
 * same `confirmVictory` flow the manual button uses, so stats, ranking and
 * history keep their single code path.
 */
export function DominoGameResultModal({
  open,
  result,
  units,
  myUnit,
  canConfirm,
  onConfirm,
  isConfirming,
  needsPartnerConfirm,
}: DominoGameResultModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  const iWon = myUnit !== null && result?.winningUnit === myUnit;

  useEffect(() => {
    if (!open || !cardRef.current) return;

    animate(cardRef.current, {
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 500,
      ease: "outBack",
    });

    if (!iWon || !confettiRef.current) return;
    const pieces = confettiRef.current.querySelectorAll<HTMLElement>("span");
    animate(pieces, {
      translateY: [{ from: -20, to: 320 }],
      translateX: () => (Math.random() - 0.5) * 220,
      rotate: () => Math.random() * 720 - 360,
      opacity: [{ from: 1, to: 0 }],
      duration: 1800,
      delay: stagger(35),
      ease: "outQuad",
    });
  }, [open, iWon]);

  if (!open || !result) return null;

  const winnerName = units.find((u) => u.id === result.winningUnit)?.name ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {iWon && (
        <div ref={confettiRef} className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
          {Array.from({ length: 28 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "absolute h-2 w-2 rounded-[2px]",
                ["bg-primary-400", "bg-amber-400", "bg-blue-400", "bg-red-400"][index % 4]
              )}
            />
          ))}
        </div>
      )}

      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-6 text-center shadow-2xl"
      >
        <div
          className={cn(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            iWon
              ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
              : "bg-surface-muted text-text-muted"
          )}
        >
          <Crown className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-bold text-text">
          {iWon ? "Você venceu a partida!" : `${winnerName} venceu`}
        </h3>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {units.map((unit, index) => (
            <span key={unit.id} className="flex items-center gap-1 text-sm">
              {index > 0 && <span className="text-text-muted">x</span>}
              <span className="font-semibold text-text">{unit.name}</span>
              <span className="text-lg font-bold tabular-nums text-text">
                {result.score[unit.id] ?? 0}
              </span>
            </span>
          ))}
        </div>

        {result.shutout && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/30">
            <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
              Buchuda! {winnerName} venceu sem deixar ninguém pontuar.
            </span>
          </div>
        )}

        {canConfirm ? (
          <>
            <Button
              onClick={onConfirm}
              disabled={isConfirming}
              className="mt-5 w-full bg-primary-600 text-white hover:bg-primary-700"
            >
              {isConfirming ? "Registrando..." : "Registrar resultado"}
            </Button>
            {needsPartnerConfirm && (
              <p className="mt-2 text-[10px] text-text-muted">
                Os dois da dupla precisam registrar para fechar a partida.
              </p>
            )}
          </>
        ) : (
          <p className="mt-5 rounded-xl bg-surface-muted px-3 py-2.5 text-xs text-text-muted">
            Aguardando {winnerName} registrar o resultado.
          </p>
        )}
      </div>
    </div>
  );
}
