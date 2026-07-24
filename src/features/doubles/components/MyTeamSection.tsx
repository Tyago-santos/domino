import { useState } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Building2, Flame, Trophy, Star, UserPlus } from "lucide-react";
import { Card, Avatar, Button, Skeleton } from "@/components/ui";
import { useMyTeam } from "../hooks/useDoubles";
import { FormTeamModal } from "./FormTeamModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function CircularScore({ value, max = 100 }: { value: number; max?: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="150" height="150" className="-rotate-90">
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-border dark:text-surface-border"
        />
        <motion.circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-emerald-500 dark:text-emerald-400"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
          {value}%
        </span>
        <span className="text-xs text-text-muted dark:text-text-muted">
          SINERGIA
        </span>
      </div>
    </div>
  );
}

function TeamSectionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

export function MyTeamSection() {
  const { data: team, isLoading, error } = useMyTeam();
  const [showFormModal, setShowFormModal] = useState(false);

  if (isLoading) return <TeamSectionSkeleton />;

  if (error || !team) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center dark:border-emerald-700 dark:bg-emerald-950/20"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-text">
            Você ainda não tem uma dupla
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-text-muted">
            Forme uma dupla com outro jogador para competir no ranking de duplas,
            participar de torneios e subir de posição!
          </p>
          <Button
            onClick={() => setShowFormModal(true)}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Formar Dupla Agora
          </Button>
        </motion.div>

        <FormTeamModal open={showFormModal} onClose={() => setShowFormModal(false)} />
      </>
    );
  }

  const synergyScore = Math.round(
    ((team.wins / Math.max(team.totalMatches, 1)) * 100 + team.winRate) / 2
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
          <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text dark:text-text">
            {team.name}
          </h2>
          <p className="text-sm text-text-muted dark:text-text-muted">
            Sua dupla competitiva
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[team.player1, team.player2].map((player) => (
          <Card key={player.id} className="overflow-hidden">
            <div className="p-5">
              <div className="mb-4 flex items-center gap-4">
                <Avatar size="xl" src={player.avatar} fallback={player.name} />
                <div>
                  <p className="text-lg font-bold text-text dark:text-text">
                    {player.name}
                  </p>
                  <p className="text-sm text-text-muted dark:text-text-muted">
                    @{player.nickname}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-muted dark:text-text-muted">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {player.club}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {player.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface-muted p-3 text-center dark:bg-surface-muted">
                  <p className="flex items-center justify-center gap-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    <Star className="h-4 w-4" />
                    {player.score.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-[10px] text-text-muted dark:text-text-muted">Pontos</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-3 text-center dark:bg-surface-muted">
                  <p className="flex items-center justify-center gap-1 text-lg font-bold text-text dark:text-text">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    #{player.ranking}
                  </p>
                  <p className="text-[10px] text-text-muted dark:text-text-muted">Ranking</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-3 text-center dark:bg-surface-muted">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {player.winRate.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-text-muted dark:text-text-muted">Vitórias</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-3 text-center dark:bg-surface-muted">
                  <p className="flex items-center justify-center gap-1 text-lg font-bold text-orange-500 dark:text-orange-400">
                    <Flame className="h-4 w-4" />
                    {player.currentStreak}
                  </p>
                  <p className="text-[10px] text-text-muted dark:text-text-muted">Sequência</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex flex-col items-center gap-6 p-8 md:flex-row md:justify-center">
            <div className="text-center md:text-left">
              <h3 className="mb-2 text-lg font-bold text-text dark:text-text">
                Sinergia da Dupla
              </h3>
              <p className="max-w-xs text-sm text-text-muted dark:text-text-muted">
                Baseado na taxa de vitórias combinada e desempenho recente.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-bold text-text dark:text-text">{team.totalMatches}</p>
                  <p className="text-[10px] text-text-muted dark:text-text-muted">Partidas</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{team.wins}</p>
                  <p className="text-[10px] text-text-muted dark:text-text-muted">Vitórias</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-500 dark:text-red-400">{team.losses}</p>
                  <p className="text-[10px] text-text-muted dark:text-text-muted">Derrotas</p>
                </div>
              </div>
            </div>
            <CircularScore value={synergyScore} />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
