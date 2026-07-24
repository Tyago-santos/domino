import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { HistorySummary as SummaryData } from "../hooks/useHistory";

interface HistorySummaryProps {
  summary: SummaryData;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function HistorySummary({ summary }: HistorySummaryProps) {
  const winRatePercent = Math.round(summary.winRate * 100);

  const cards = [
    {
      label: "Total de Partidas",
      value: summary.total,
      icon: Target,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      label: "Vitórias",
      value: summary.wins,
      icon: TrendingUp,
      color:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      label: "Derrotas",
      value: summary.losses,
      icon: TrendingDown,
      color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    },
    {
      label: "Empates",
      value: summary.draws,
      icon: Minus,
      color:
        "bg-surface-muted text-text-muted dark:bg-surface-muted dark:text-text-muted",
    },
    {
      label: "Taxa de Vitória",
      value: `${winRatePercent}%`,
      icon: Trophy,
      color: cn(
        winRatePercent >= 60
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
          : winRatePercent >= 40
            ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
            : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
      ),
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} variants={item}>
            <Card className="h-full">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted dark:text-text-muted">
                    {card.label}
                  </span>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      card.color,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-2xl font-bold tracking-tight text-text dark:text-text">
                  {card.value}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
