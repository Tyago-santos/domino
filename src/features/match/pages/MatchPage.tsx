import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Swords,
  Plus,
  History,
  Trophy,
  Zap,
  XCircle,
} from "lucide-react";
import { Button, Badge, Skeleton, EmptyState } from "@/components/ui";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  useActiveMatchForPlayer,
  useRecentMatches,
  useConfirmVictory,
  useConfirmations,
  useCancelMatch,
} from "../hooks/useMatch";
import { MatchSetupModal } from "../components/MatchSetupModal";
import { MatchTimer } from "../components/MatchTimer";
import { PlayerCard } from "../components/PlayerCard";
import { TeamCard } from "../components/TeamCard";
import { VictoryConfirmModal } from "../components/VictoryConfirmModal";
import { MatchResultOverlay } from "../components/MatchResultOverlay";
import { ActiveMatchCard } from "../components/ActiveMatchCard";
import type { GameMatch } from "@/shared/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MatchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [finishedMatch, setFinishedMatch] = useState<GameMatch | null>(null);

  const { data: activeMatch, isLoading: loadingActive } = useActiveMatchForPlayer();
  const { data: recentMatches, isLoading: loadingRecent } = useRecentMatches();
  const confirmVictory = useConfirmVictory();
  const cancelMatch = useCancelMatch();
  const { data: confirmations } = useConfirmations(activeMatch?.id ?? null);

  const confirmedPlayerIds = confirmations?.map((c) => c.playerId) ?? [];
  const currentPlayerConfirmed = user?.uid
    ? confirmedPlayerIds.includes(user.uid)
    : false;

  const isMyTeamA =
    activeMatch?.teamA?.playerIds.includes(user?.uid || "") ?? false;

  function handleConfirmVictory() {
    if (!activeMatch || !user) return;
    confirmVictory.mutate(
      { matchId: activeMatch.id, playerId: user.uid },
      {
        onSuccess: (result) => {
          setShowVictoryModal(false);
          if (result.finalized) {
            setFinishedMatch(activeMatch);
          }
        },
      }
    );
  }

  function handleBackFromResult() {
    setFinishedMatch(null);
  }

  function handleCancelMatch() {
    if (!activeMatch) return;
    cancelMatch.mutate(activeMatch.id, {
      onSuccess: () => {
        setShowCancelConfirm(false);
      },
    });
  }

  if (finishedMatch) {
    return <MatchResultOverlay match={finishedMatch} onBack={handleBackFromResult} />;
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
            <Swords className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Partidas</h1>
            <p className="text-sm text-text-muted">Crie e acompanhe suas partidas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/play/history")}
          >
            <History className="mr-2 h-4 w-4" />
            Histórico
          </Button>
          <Button
            onClick={() => setShowSetupModal(true)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Partida
          </Button>
        </div>
      </motion.div>

      {/* Active Match */}
      {loadingActive ? (
        <motion.div variants={itemVariants} className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </motion.div>
      ) : activeMatch ? (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            <h2 className="text-lg font-bold text-text">Partida em Andamento</h2>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
            {/* Match Header */}
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-text sm:text-xl">
                    {activeMatch.name || "Partida"}
                  </h3>
                  <Badge variant={activeMatch.mode === "doubles" ? "secondary" : "outline"} className="text-[10px] sm:text-xs">
                    {activeMatch.mode === "doubles" ? "Duplas" : "Individual"}
                  </Badge>
                  <Badge
                    variant={
                      activeMatch.status === "in_progress"
                        ? "success"
                        : activeMatch.status === "finished"
                          ? "secondary"
                          : "warning"
                    }
                    className="text-[10px] sm:text-xs"
                  >
                    {activeMatch.status === "in_progress"
                      ? "Em andamento"
                      : activeMatch.status === "finished"
                        ? "Finalizada"
                        : "Aguardando início"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                  className="h-7 self-start rounded-full px-2.5 text-[10px] text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 sm:h-8 sm:self-auto sm:px-3 sm:text-xs"
                >
                  <XCircle className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Cancelar
                </Button>
              </div>

              <MatchTimer
                startedAt={activeMatch.startedAt}
                isRunning={activeMatch.status === "in_progress"}
              />
            </div>

            {/* Players / Teams */}
            {activeMatch.mode === "individual" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {activeMatch.players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isWinner={activeMatch.winnerId === player.id}
                    hasConfirmed={
                      activeMatch.status === "finished"
                        ? activeMatch.winnerId === player.id
                        : confirmedPlayerIds.includes(player.id)
                    }
                    canConfirm={
                      activeMatch.status === "in_progress" &&
                      user?.uid === player.id &&
                      !currentPlayerConfirmed
                    }
                    onConfirm={() => setShowVictoryModal(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TeamCard
                    teamName={activeMatch.teamA?.name || ""}
                    color="blue"
                    matchStatus={activeMatch.status}
                    players={
                      activeMatch.players.filter((p) =>
                        activeMatch.teamA?.playerIds.includes(p.id)
                      ) || []
                    }
                    isWinner={activeMatch.winningTeam === "A"}
                    confirmedPlayers={confirmedPlayerIds.filter((id) =>
                      activeMatch.teamA?.playerIds.includes(id)
                    )}
                    canConfirm={
                      activeMatch.status === "in_progress" &&
                      isMyTeamA &&
                      !currentPlayerConfirmed
                    }
                    onConfirm={() => setShowVictoryModal(true)}
                    isConfirming={confirmVictory.isPending}
                  />
                  <TeamCard
                    teamName={activeMatch.teamB?.name || ""}
                    color="red"
                    matchStatus={activeMatch.status}
                    players={
                      activeMatch.players.filter((p) =>
                        activeMatch.teamB?.playerIds.includes(p.id)
                      ) || []
                    }
                    isWinner={activeMatch.winningTeam === "B"}
                    confirmedPlayers={confirmedPlayerIds.filter((id) =>
                      activeMatch.teamB?.playerIds.includes(id)
                    )}
                    canConfirm={
                      activeMatch.status === "in_progress" &&
                      !isMyTeamA &&
                      !currentPlayerConfirmed
                    }
                    onConfirm={() => setShowVictoryModal(true)}
                    isConfirming={confirmVictory.isPending}
                  />
                </div>

                {activeMatch.status === "in_progress" &&
                  activeMatch.mode === "doubles" &&
                  !currentPlayerConfirmed && (
                    <p className="text-center text-sm text-text-muted">
                      {confirmations && confirmations.length > 0
                        ? "Aguardando confirmação do parceiro."
                        : "Confirme a vitória da sua dupla quando o jogo terminar."}
                    </p>
                  )}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={<Swords className="h-12 w-12" />}
            title="Nenhuma partida ativa"
            description="Crie uma nova partida para começar a jogar!"
            actionLabel="Nova Partida"
            onAction={() => setShowSetupModal(true)}
          />
        </motion.div>
      )}

      {/* Recent Matches */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">Partidas Recentes</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/play/history")}
          >
            Ver todas
          </Button>
        </div>

        {loadingRecent ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : recentMatches && recentMatches.length > 0 ? (
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <ActiveMatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-surface-border p-8 text-center">
            <Trophy className="mx-auto mb-2 h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-muted">
              Nenhuma partida recente encontrada.
            </p>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <MatchSetupModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />

      <VictoryConfirmModal
        open={showVictoryModal}
        playerName={user?.nickname || ""}
        onConfirm={handleConfirmVictory}
        onCancel={() => setShowVictoryModal(false)}
        isConfirming={confirmVictory.isPending}
      />

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative z-10 mx-0 flex h-full w-full flex-col justify-center rounded-none border-0 border-surface-border bg-surface p-4 shadow-2xl sm:mx-4 sm:h-auto sm:max-w-sm sm:rounded-2xl sm:border sm:p-6">
            <h3 className="text-[11px] font-bold text-text sm:text-lg">Cancelar Partida?</h3>
            <p className="mt-1.5 text-[10px] text-text-muted sm:mt-2 sm:text-sm">
              Tem certeza que deseja cancelar esta partida? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-4 flex gap-2 sm:mt-6 sm:gap-3">
              <Button
                variant="outline"
                className="flex-1 text-[10px] sm:text-sm"
                onClick={() => setShowCancelConfirm(false)}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700 text-[10px] sm:text-sm"
                onClick={handleCancelMatch}
                disabled={cancelMatch.isPending}
              >
                {cancelMatch.isPending ? (
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-4 sm:w-4" />
                    Cancelando...
                  </span>
                ) : (
                  "Sim, cancelar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
