import { motion } from "framer-motion";
import { Trophy, Clock, Calendar, ArrowLeft } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import type { GameMatch, MatchPlayer } from "@/shared/types";

interface MatchResultOverlayProps {
  match: GameMatch;
  onBack: () => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min ${s}s`;
}

export function MatchResultOverlay({ match, onBack }: MatchResultOverlayProps) {
  const winnerPlayer = match.mode === "individual" && match.winnerId
    ? match.players.find((p) => p.id === match.winnerId)
    : null;

  const winningTeamName =
    match.winningTeam === "A"
      ? match.teamA?.name || "Equipe Azul"
      : match.teamB?.name || "Equipe Vermelha";

  const winningPlayers =
    match.winningTeam === "A"
      ? match.teamA?.playerIds.map((id) => match.players.find((p) => p.id === id)).filter(Boolean) as MatchPlayer[]
      : match.teamB?.playerIds.map((id) => match.players.find((p) => p.id === id)).filter(Boolean) as MatchPlayer[];

  const losingPlayers =
    match.winningTeam === "A"
      ? match.teamB?.playerIds.map((id) => match.players.find((p) => p.id === id)).filter(Boolean) as MatchPlayer[]
      : match.teamA?.playerIds.map((id) => match.players.find((p) => p.id === id)).filter(Boolean) as MatchPlayer[];

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
        className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-2xl"
      >
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <Trophy className="mx-auto h-16 w-16 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-2xl font-bold text-white"
          >
            Partida Encerrada!
          </motion.h2>
        </div>

        <div className="p-6">
          {match.mode === "individual" && winnerPlayer ? (
            <div className="text-center">
              <p className="text-sm text-text-muted">Vencedor</p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <Avatar size="lg" src={winnerPlayer.avatar} fallback={winnerPlayer.name} />
                <div className="text-left">
                  <p className="text-lg font-bold text-text">{winnerPlayer.name}</p>
                  <p className="text-sm text-text-muted">@{winnerPlayer.nickname}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4 text-center dark:bg-yellow-950/20">
                <p className="text-sm text-text-muted">Equipe Vencedora</p>
                <p className="mt-1 text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  {winningTeamName}
                </p>
                <div className="mt-3 flex items-center justify-center gap-4">
                  {winningPlayers?.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Avatar size="sm" src={p.avatar} fallback={p.name} />
                      <span className="text-sm font-medium text-text">{p.nickname}</span>
                    </div>
                  ))}
                </div>
              </div>

              {losingPlayers && losingPlayers.length > 0 && (
                <div className="rounded-lg border border-surface-border bg-surface-muted p-3 text-center">
                  <p className="text-xs text-text-muted">Derrotados</p>
                  <div className="mt-2 flex items-center justify-center gap-4">
                    {losingPlayers.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <Avatar size="xs" src={p.avatar} fallback={p.name} />
                        <span className="text-xs text-text-muted">{p.nickname}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-text-muted">
            {match.duration != null && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(match.duration)}</span>
              </div>
            )}
            {match.endedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date(match.endedAt).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </div>

          <Button onClick={onBack} className="mt-6 w-full bg-primary-600 text-white hover:bg-primary-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
