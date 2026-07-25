import { motion } from "framer-motion";
import { Trophy, Clock, Calendar, ArrowLeft } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import type { GameMatch, MatchPlayer } from "@/shared/types";

interface MatchResultOverlayProps {
  match: GameMatch;
  onBack: () => void;
  userId: string;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min ${s}s`;
}

export function MatchResultOverlay({ match, onBack, userId }: MatchResultOverlayProps) {
  const winnerPlayer = match.mode === "individual" && match.winnerId
    ? match.players.find((p) => p.id === match.winnerId)
    : null;

  const winningTeamName =
    match.winningTeam === "A"
      ? match.teamA?.name || "Equipe Azul"
      : match.teamB?.name || "Equipe Vermelha";

  const winningTeamPlayers =
    match.winningTeam === "A"
      ? match.teamA?.playerIds ?? []
      : match.teamB?.playerIds ?? [];

  const winningPlayers =
    winningTeamPlayers.map((id) => match.players.find((p) => p.id === id)).filter(Boolean) as MatchPlayer[];

  const losingPlayers =
    match.winningTeam === "A"
      ? match.teamB?.playerIds.map((id) => match.players.find((p) => p.id === id)).filter(Boolean) as MatchPlayer[]
      : match.teamA?.playerIds.map((id) => match.players.find((p) => p.id === id)).filter(Boolean) as MatchPlayer[];

  const isWinner = winningTeamPlayers.includes(userId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mx-0 flex h-full w-full flex-col overflow-hidden rounded-none border-0 border-surface-border bg-surface shadow-2xl sm:mx-4 sm:h-auto sm:max-w-lg sm:rounded-2xl sm:border"
      >
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-5 text-center sm:p-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <Trophy className="mx-auto h-10 w-10 text-white sm:h-16 sm:w-16" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-lg font-bold text-white sm:mt-4 sm:text-2xl"
          >
            {isWinner ? "Parabéns, mais uma Auréa farmada após vitória" : "Partida Encerrada!"}
          </motion.h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {match.mode === "individual" && winnerPlayer ? (
            <div className="text-center">
              <p className="text-[10px] text-text-muted sm:text-sm">Vencedor</p>
              <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
                <Avatar size="lg" src={winnerPlayer.avatar} fallback={winnerPlayer.name} />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-text sm:text-lg">{winnerPlayer.name}</p>
                  <p className="text-[10px] text-text-muted sm:text-sm">@{winnerPlayer.nickname}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-3 text-center dark:bg-yellow-950/20 sm:p-4">
                <p className="text-[10px] text-text-muted sm:text-sm">Equipe Vencedora</p>
                <p className="mt-1 text-[11px] font-bold text-yellow-700 dark:text-yellow-300 sm:text-lg">
                  {winningTeamName}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:mt-3 sm:gap-4">
                  {winningPlayers?.map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5 sm:gap-2">
                      <Avatar size="sm" src={p.avatar} fallback={p.name} />
                      <span className="text-[10px] font-medium text-text sm:text-sm">{p.nickname}</span>
                    </div>
                  ))}
                </div>
              </div>

              {losingPlayers && losingPlayers.length > 0 && (
                <div className="rounded-lg border border-surface-border bg-surface-muted p-2.5 text-center sm:p-3">
                  <p className="text-[9px] text-text-muted sm:text-xs">Derrotados</p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3 sm:mt-2 sm:gap-4">
                    {losingPlayers.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5 sm:gap-2">
                        <Avatar size="xs" src={p.avatar} fallback={p.name} />
                        <span className="text-[9px] text-text-muted sm:text-xs">{p.nickname}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-text-muted sm:mt-6 sm:gap-6 sm:text-sm">
            {match.duration != null && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{formatDuration(match.duration)}</span>
              </div>
            )}
            {match.endedAt && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{new Date(match.endedAt).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </div>

          <Button onClick={onBack} className="mt-4 w-full bg-primary-600 text-white hover:bg-primary-700 text-[10px] sm:mt-6 sm:text-sm">
            <ArrowLeft className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            Voltar ao Início
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
