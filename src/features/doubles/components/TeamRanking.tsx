import { motion } from "framer-motion";
import { Trophy, Flame } from "lucide-react";
import { Card, Avatar, Progress, Skeleton } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types";

interface TeamRankingProps {
  teams: Team[];
  myTeamId?: string;
  isLoading?: boolean;
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

function RankingSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-surface-border py-3 last:border-0">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function medalColor(index: number) {
  if (index === 0) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  if (index === 1) return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  if (index === 2) return "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300";
  return "bg-surface-muted text-text-muted dark:bg-surface-muted dark:text-text-muted";
}

export function TeamRanking({ teams, myTeamId, isLoading }: TeamRankingProps) {
  if (isLoading) return <RankingSkeleton />;

  return (
    <Card className="overflow-hidden">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-muted dark:bg-surface-muted">
              <th className="px-4 py-3 text-left font-medium text-text-muted dark:text-text-muted">Pos.</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted dark:text-text-muted">Dupla</th>
              <th className="hidden px-4 py-3 text-left font-medium text-text-muted dark:text-text-muted md:table-cell">Jogadores</th>
              <th className="hidden px-4 py-3 text-left font-medium text-text-muted dark:text-text-muted md:table-cell">Clube</th>
              <th className="px-4 py-3 text-right font-medium text-text-muted dark:text-text-muted">Pontos</th>
              <th className="hidden px-4 py-3 text-left font-medium text-text-muted dark:text-text-muted lg:table-cell">Vitórias</th>
              <th className="hidden px-4 py-3 text-center font-medium text-text-muted dark:text-text-muted lg:table-cell">Sequência</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => {
              const isMyTeam = team.id === myTeamId;
              return (
                <motion.tr
                  key={team.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "border-b border-surface-border transition-colors last:border-0",
                    isMyTeam
                      ? "bg-emerald-50 dark:bg-emerald-950/20"
                      : "hover:bg-surface-muted dark:hover:bg-surface-muted"
                  )}
                >
                  <td className="px-4 py-3">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", medalColor(index))}>
                      {team.ranking}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <Avatar size="xs" src={team.player1.avatar} fallback={team.player1.name} />
                        <Avatar size="xs" src={team.player2.avatar} fallback={team.player2.name} />
                      </div>
                      <div>
                        <p className={cn("font-semibold", isMyTeam ? "text-emerald-700 dark:text-emerald-300" : "text-text dark:text-text")}>
                          {team.name}
                        </p>
                        {isMyTeam && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            <Trophy className="h-2.5 w-2.5" />
                            Sua Dupla
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <p className="text-text dark:text-text">{team.player1.nickname}</p>
                    <p className="text-xs text-text-muted dark:text-text-muted">& {team.player2.nickname}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-text-muted dark:text-text-muted md:table-cell">{team.club}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{team.score.toLocaleString("pt-BR")}</span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Progress value={team.winRate} className="h-2 w-20" indicatorClassName="bg-emerald-500 dark:bg-emerald-400" />
                      <span className="text-xs text-text-muted dark:text-text-muted">{team.winRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-center lg:table-cell">
                    {team.currentStreak > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                        <Flame className="h-3 w-3" />
                        {team.currentStreak}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted dark:text-text-muted">-</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 p-3 sm:hidden">
        {teams.map((team, index) => {
          const isMyTeam = team.id === myTeamId;
          return (
            <motion.div
              key={team.id}
              custom={index}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                "rounded-lg border border-surface-border p-3 dark:border-surface-border",
                isMyTeam
                  ? "bg-emerald-50 dark:bg-emerald-950/20"
                  : "bg-surface-muted/50 dark:bg-surface-muted/50"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", medalColor(index))}>
                    {team.ranking}
                  </span>
                  <div className="flex -space-x-2">
                    <Avatar size="xs" src={team.player1.avatar} fallback={team.player1.name} />
                    <Avatar size="xs" src={team.player2.avatar} fallback={team.player2.name} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", isMyTeam ? "text-emerald-700 dark:text-emerald-300" : "text-text dark:text-text")}>
                      {team.name}
                    </p>
                    {isMyTeam && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Trophy className="h-2.5 w-2.5" /> Sua Dupla
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {team.score.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-muted">
                <span>{team.player1.nickname} & {team.player2.nickname}</span>
                <div className="flex items-center gap-2">
                  <Progress value={team.winRate} className="h-1.5 w-12" indicatorClassName="bg-emerald-500 dark:bg-emerald-400" />
                  <span>{team.wins}V</span>
                  {team.currentStreak > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                      <Flame className="h-3 w-3" />{team.currentStreak}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
