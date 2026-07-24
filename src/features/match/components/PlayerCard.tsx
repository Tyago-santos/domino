import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { MatchPlayer } from "@/shared/types";

interface PlayerCardProps {
  player: MatchPlayer;
  isWinner?: boolean;
  hasConfirmed?: boolean;
  canConfirm?: boolean;
  onConfirm?: () => void;
  isConfirming?: boolean;
}

export function PlayerCard({
  player,
  isWinner,
  hasConfirmed,
  canConfirm,
  onConfirm,
  isConfirming,
}: PlayerCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all",
        isWinner
          ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20"
          : hasConfirmed
            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
            : "border-surface-border bg-surface"
      )}
    >
      <Avatar size="lg" src={player.avatar} fallback={player.name} />
      <div>
        <p className="text-sm font-bold text-text">{player.name}</p>
        <p className="text-xs text-text-muted">@{player.nickname}</p>
        <p className="mt-1 text-[11px] text-text-muted">{player.category}</p>
      </div>

      {isWinner && (
        <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 dark:bg-yellow-900/30">
          <Trophy className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            Vencedor
          </span>
        </div>
      )}

      {hasConfirmed && !isWinner && (
        <div className="rounded-full bg-primary-100 px-3 py-1 dark:bg-primary-900/30">
          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
            Confirmou vitória
          </span>
        </div>
      )}

      {canConfirm && !hasConfirmed && (
        <Button
          onClick={onConfirm}
          disabled={isConfirming}
          className="w-full bg-primary-600 text-white hover:bg-primary-700"
        >
          {isConfirming ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Confirmando...
            </span>
          ) : (
            "Ganhei"
          )}
        </Button>
      )}
    </motion.div>
  );
}
