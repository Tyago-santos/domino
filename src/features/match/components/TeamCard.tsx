import { motion } from "framer-motion";
import { Trophy, Users, Check, Clock } from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { GameMatchStatus, MatchPlayer } from "@/shared/types";

interface TeamCardProps {
  teamName: string;
  color: "blue" | "red";
  players: MatchPlayer[];
  isWinner?: boolean;
  confirmedPlayers: string[];
  canConfirm: boolean;
  matchStatus?: GameMatchStatus;
  onConfirm?: () => void;
  isConfirming?: boolean;
}

export function TeamCard({
  teamName,
  color,
  players,
  isWinner,
  confirmedPlayers,
  canConfirm,
  matchStatus,
  onConfirm,
  isConfirming,
}: TeamCardProps) {
  const colorClasses = {
    blue: {
      border: isWinner ? "border-yellow-400" : "border-blue-300 dark:border-blue-700",
      bg: isWinner ? "bg-yellow-50 dark:bg-yellow-950/20" : "bg-blue-50/50 dark:bg-blue-950/10",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      dot: "bg-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    red: {
      border: isWinner ? "border-yellow-400" : "border-red-300 dark:border-red-700",
      bg: isWinner ? "bg-yellow-50 dark:bg-yellow-950/20" : "bg-red-50/50 dark:bg-red-950/10",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      dot: "bg-red-500",
      button: "bg-red-600 hover:bg-red-700",
    },
  };

  const c = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-xl border-2 p-5 transition-all",
        c.border,
        c.bg
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-3 w-3 rounded-full", c.dot)} />
          <h3 className="text-lg font-bold text-text">{teamName || `Equipe ${color === "blue" ? "Azul" : "Vermelha"}`}</h3>
        </div>
        {isWinner && (
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 dark:bg-yellow-900/30">
            <Trophy className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
              Vencedora
            </span>
          </div>
        )}
      </div>

      <div className="mb-4 space-y-3">
        {players.map((player) => {
          const isConfirmed = confirmedPlayers.includes(player.id);
          const statusText =
            matchStatus === "finished"
              ? isWinner
                ? isConfirmed
                  ? "Confirmou"
                  : "Vencedor"
                : "Derrotado"
              : isConfirmed
                ? "Confirmou"
                : "Aguardando";
          return (
            <div
              key={player.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all",
                isConfirmed
                  ? "border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-950/30"
                  : "border-surface-border bg-surface"
              )}
            >
              <Avatar size="sm" src={player.avatar} fallback={player.name} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-text">{player.nickname}</p>
                <p className="text-[11px] text-text-muted">{player.category}</p>
              </div>
              {isConfirmed ? (
                <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
                  <Check className="h-4 w-4" />
                  <span className="text-xs font-medium">{statusText}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-text-muted">
                  {matchStatus === "finished" ? (
                    <Trophy className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  <span className="text-xs">{statusText}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {canConfirm && (
        <Button
          onClick={onConfirm}
          disabled={isConfirming}
          className={cn("w-full text-white", c.button)}
        >
          {isConfirming ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Confirmando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nossa dupla venceu
            </span>
          )}
        </Button>
      )}
    </motion.div>
  );
}
