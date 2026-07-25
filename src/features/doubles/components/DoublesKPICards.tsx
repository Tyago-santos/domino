import { motion } from "framer-motion";
import {
  Gamepad2,
  Trophy,
  Target,
  Percent,
  Medal,
  Star,
  Flame,
  TrendingUp,
  Clock,
  UserCheck,
} from "lucide-react";
import { KPICard, Skeleton } from "@/components/ui";
import { useDoublesStats } from "../hooks/useDoubles";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-lg border border-surface-border bg-surface p-6"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function DoublesKPICards() {
  const { data: stats, isLoading, error } = useDoublesStats();

  if (isLoading) return <KPISkeleton />;

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-dashed border-surface-border p-8 text-center text-text-muted">
        Erro ao carregar estatísticas da dupla.
      </div>
    );
  }

  const kpis = [
    {
      icon: <Gamepad2 className="h-5 w-5" />,
      label: "Total Partidas",
      value: stats.totalMatches,
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: "Vitórias",
      value: stats.wins,
    },
    {
      icon: <Target className="h-5 w-5" />,
      label: "Derrotas",
      value: stats.losses,
    },
    {
      icon: <Percent className="h-5 w-5" />,
      label: "Taxa de Vitória",
      value: `${(stats.winRate * 100 / 100).toFixed(1)}%`,
    },
    {
      icon: <Medal className="h-5 w-5" />,
      label: "Ranking Dupla",
      value: `#${stats.ranking}`,
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "Vitórias",
      value: stats.wins,
    },
    {
      icon: <Flame className="h-5 w-5" />,
      label: "Seq. Atual",
      value: stats.currentStreak,
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Melhor Seq.",
      value: stats.bestStreak,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Tempo Médio",
      value: `${stats.avgMatchDuration} min`,
    },
    {
      icon: <UserCheck className="h-5 w-5" />,
      label: "Melhor Parceiro",
      value: stats.bestPartner,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {kpis.map((kpi) => (
        <motion.div key={kpi.label} variants={item}>
          <KPICard icon={kpi.icon} label={kpi.label} value={kpi.value} />
        </motion.div>
      ))}
    </motion.div>
  );
}
