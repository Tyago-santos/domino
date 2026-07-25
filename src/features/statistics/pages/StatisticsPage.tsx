import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, CalendarDays } from "lucide-react";
import { Select } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { RankingEvolutionStats } from "../components/RankingEvolutionStats";
import { WinsByMonthChart } from "../components/WinsByMonthChart";
import { MatchesByWeekChart } from "../components/MatchesByWeekChart";
import { WinRateChart } from "../components/WinRateChart";
import { AvgDurationChart } from "../components/AvgDurationChart";
import { WeeklyFrequencyChart } from "../components/WeeklyFrequencyChart";
import { ActiveHoursChart } from "../components/ActiveHoursChart";
import type { PeriodFilter } from "@/shared/types";

const PERIOD_OPTIONS = [
  { value: "today", label: "Hoje" },
  { value: "7days", label: "Últimos 7 dias" },
  { value: "30days", label: "Últimos 30 dias" },
  { value: "90days", label: "Últimos 90 dias" },
  { value: "year", label: "Último ano" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function StatisticsPage() {
  const [period, setPeriod] = useState<PeriodFilter>("30days");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-text sm:text-2xl">Estatísticas</h1>
          <p className="text-[10px] text-text-muted sm:text-sm">
            Análise detalhada do seu desempenho no dominó
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Select
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            label="Período"
          />
        </div>
      </div>

      <Tabs defaultValue="geral">
        <TabsList className="w-full overflow-x-auto sm:w-auto">
          <TabsTrigger value="geral" className="text-[10px] sm:text-sm">
            <BarChart3 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="desempenho" className="text-[10px] sm:text-sm">
            <TrendingUp className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            Desempenho
          </TabsTrigger>
          <TabsTrigger value="horarios" className="text-[10px] sm:text-sm">
            <Clock className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            Horários
          </TabsTrigger>
          <TabsTrigger value="historico" className="text-[10px] sm:text-sm">
            <CalendarDays className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2"
          >
            <motion.div variants={itemVariants}>
              <WinRateChart />
            </motion.div>
            <motion.div variants={itemVariants}>
              <RankingEvolutionStats period={period} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <WinsByMonthChart period={period} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <MatchesByWeekChart period={period} />
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="desempenho">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2"
          >
            <motion.div variants={itemVariants}>
              <AvgDurationChart />
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="horarios">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2"
          >
            <motion.div variants={itemVariants}>
              <WeeklyFrequencyChart />
            </motion.div>
            <motion.div variants={itemVariants}>
              <ActiveHoursChart />
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="historico">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:gap-6"
          >
            <motion.div variants={itemVariants}>
              <RankingEvolutionStats period={period} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <WinsByMonthChart period={period} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <MatchesByWeekChart period={period} />
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
