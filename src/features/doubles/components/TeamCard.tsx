import { motion } from "framer-motion";
import { MapPin, Building2, Trophy, Flame, Star } from "lucide-react";
import { Card, Avatar, Progress } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types";

interface TeamCardProps {
  team: Team;
  isMyTeam?: boolean;
}

export function TeamCard({ team, isMyTeam = false }: TeamCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-shadow hover:shadow-lg",
          isMyTeam &&
            "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-800 dark:from-emerald-950/30 dark:to-surface"
        )}
      >
        {isMyTeam && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Star className="h-3 w-3" />
              Sua Dupla
            </span>
          </div>
        )}

        <div className="p-5">
          <h3 className="mb-3 text-lg font-bold text-text dark:text-text">
            {team.name}
          </h3>

          <div className="mb-4 flex items-center justify-center gap-[-8px]">
            <div className="relative z-10 -mr-3 rounded-full border-2 border-surface bg-surface">
              <Avatar size="lg" src={team.player1.avatar} fallback={team.player1.name} />
            </div>
            <div className="relative z-0 rounded-full border-2 border-surface bg-surface">
              <Avatar size="lg" src={team.player2.avatar} fallback={team.player2.name} />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-center gap-4 text-center">
            <div>
              <p className="text-xs text-text-muted dark:text-text-muted">
                {team.player1.nickname}
              </p>
            </div>
            <span className="text-text-muted dark:text-text-muted">&</span>
            <div>
              <p className="text-xs text-text-muted dark:text-text-muted">
                {team.player2.nickname}
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-center gap-3 text-xs text-text-muted dark:text-text-muted">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {team.club}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {team.city}
            </span>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 dark:bg-surface-muted">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {team.score.toLocaleString("pt-BR")}
              </p>
              <p className="text-[10px] text-text-muted dark:text-text-muted">
                Pontos
              </p>
            </div>
            <div className="h-8 w-px bg-surface-border dark:bg-surface-border" />
            <div className="text-center">
              <p className="flex items-center gap-1 text-lg font-bold text-text dark:text-text">
                <Trophy className="h-4 w-4 text-amber-500" />
                {team.ranking}º
              </p>
              <p className="text-[10px] text-text-muted dark:text-text-muted">
                Ranking
              </p>
            </div>
            <div className="h-8 w-px bg-surface-border dark:bg-surface-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-text dark:text-text">
                {team.winRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-text-muted dark:text-text-muted">
                Vitórias
              </p>
            </div>
          </div>

          <Progress
            value={team.winRate}
            indicatorClassName="bg-emerald-500 dark:bg-emerald-400"
            className="h-2"
          />

          {team.currentStreak > 0 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {team.currentStreak} vitórias seguidas
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
