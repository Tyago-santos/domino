import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { getAchievements } from "@/shared/services/playerService";
import { useAuth } from "@/app/providers/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/shared/lib/utils";
import type { Achievement } from "@/shared/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

interface AchievementItemProps {
  achievement: Achievement;
  index: number;
}

function AchievementItem({ achievement, index }: AchievementItemProps) {
  return (
    <motion.div variants={itemVariants}>
      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border p-4 transition-colors",
          achievement.unlocked
            ? "border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-950/30"
            : "border-surface-border bg-surface opacity-70"
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg",
            achievement.unlocked
              ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
              : "bg-surface-muted text-text-muted"
          )}
        >
          {achievement.unlocked ? (
            <Award className="h-6 w-6" />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-text">
              {achievement.name}
            </h4>
            {achievement.unlocked && (
              <Badge variant="success" className="shrink-0 text-[10px]">
                Desbloqueada
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            {achievement.description}
          </p>

          <div className="mt-2 flex items-center gap-3">
            <Progress
              value={achievement.progress}
              max={achievement.maxProgress}
              className="h-2 flex-1"
              indicatorClassName={cn(
                !achievement.unlocked && "bg-amber-500 dark:bg-amber-400"
              )}
            />
            <span className="shrink-0 text-xs font-medium text-text-muted">
              {achievement.progress}/{achievement.maxProgress}
            </span>
          </div>

          {achievement.date && (
            <p className="mt-1 text-[10px] text-text-muted">
              Conquistada em{" "}
              {new Date(achievement.date).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>

        <span className="text-xl font-bold text-text-muted">
          {index + 1}°
        </span>
      </div>
    </motion.div>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-surface-border p-4"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileAchievements() {
  const { user } = useAuth();
  const {
    data: achievements,
    isLoading,
  } = useQuery({
    queryKey: ["achievements", user?.uid],
    queryFn: () => getAchievements(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });

  const displayAchievements = achievements?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conquistas Recentes</CardTitle>
          {achievements && (
            <Badge variant="secondary">
              {achievements.filter((a) => a.unlocked).length} de{" "}
              {achievements.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <AchievementsSkeleton />
        ) : displayAchievements.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            Nenhuma conquista encontrada.
          </p>
        ) : (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {displayAchievements.map((achievement, index) => (
              <AchievementItem
                key={achievement.id}
                achievement={achievement}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
