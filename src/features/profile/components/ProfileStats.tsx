import { motion } from "framer-motion";
import {
  Gamepad2,
  Trophy,
  Frown,
  Percent,
  Medal,
  Flame,
  Zap,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Stats } from "@/shared/types";

interface ProfileStatsProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5 shadow-sm"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  if (isLoading) return <ProfileStatsSkeleton />;
  if (!stats) return null;

  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    return `${h}h ${m}min`;
  };

  const statCards = [
    {
      label: "Total de Partidas",
      value: stats.totalMatches,
      icon: <Gamepad2 className="h-4 w-4" />,
      trend: "neutral" as const,
      trendValue: undefined,
    },
    {
      label: "Vitórias",
      value: stats.wins,
      icon: <Trophy className="h-4 w-4" />,
      trend: "up" as const,
      trendValue: undefined,
    },
    {
      label: "Derrotas",
      value: stats.losses,
      icon: <Frown className="h-4 w-4" />,
      trend: "down" as const,
      trendValue: undefined,
    },
    {
      label: "Taxa de Vitória",
      value: `${stats.winRate.toFixed(1)}%`,
      icon: <Percent className="h-4 w-4" />,
      trend: (stats.winRate >= 50 ? "up" : "down") as "up" | "down",
      trendValue: undefined,
    },
    {
      label: "Ranking",
      value: `#${stats.ranking}`,
      icon: <Medal className="h-4 w-4" />,
      trend: "neutral" as const,
      trendValue: undefined,
    },

    {
      label: "Sequência Atual",
      value: stats.currentStreak,
      icon: <Flame className="h-4 w-4" />,
      trend: (stats.currentStreak > 0 ? "up" : "neutral") as "up" | "neutral",
      trendValue: undefined,
    },
    {
      label: "Melhor Sequência",
      value: stats.bestStreak,
      icon: <Zap className="h-4 w-4" />,
      trend: "up" as const,
      trendValue: undefined,
    },
    {
      label: "Duração Média",
      value: formatDuration(stats.avgMatchDuration),
      icon: <Clock className="h-4 w-4" />,
      trend: "neutral" as const,
      trendValue: undefined,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estatísticas Detalhadas</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                trendValue={stat.trendValue}
              />
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
