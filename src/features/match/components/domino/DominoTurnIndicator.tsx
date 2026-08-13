import { Hand, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/shared/lib/utils";

interface DominoTurnIndicatorProps {
  currentPlayerName: string;
  isMyTurn: boolean;
  canPass: boolean;
  onPass: () => void;
  isBusy: boolean;
  /** Hint shown once a tile is selected but no end has been chosen. */
  awaitingSide: boolean;
}

export function DominoTurnIndicator({
  currentPlayerName,
  isMyTurn,
  canPass,
  onPass,
  isBusy,
  awaitingSide,
}: DominoTurnIndicatorProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border px-3 py-2.5 transition-colors sm:flex-row sm:items-center sm:justify-between",
        isMyTurn
          ? "border-green-500/60 bg-green-50 dark:bg-green-950/25"
          : "border-surface-border bg-surface-muted"
      )}
    >
      <p className="text-sm text-text">
        {isMyTurn ? (
          awaitingSide ? (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              Escolha em qual ponta encaixar
            </span>
          ) : canPass ? (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              Sem jogada — passe a vez
            </span>
          ) : (
            <span className="font-semibold text-green-700 dark:text-green-400">
              Sua vez — escolha uma pedra
            </span>
          )
        ) : (
          <>
            Vez de <span className="font-semibold">{currentPlayerName}</span>
            <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-text-muted" />
          </>
        )}
      </p>

      {canPass && (
        <Button
          size="sm"
          variant="outline"
          onClick={onPass}
          disabled={isBusy}
          className="border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
        >
          <Hand className="mr-1.5 h-3.5 w-3.5" />
          Passar a vez
        </Button>
      )}
    </div>
  );
}
