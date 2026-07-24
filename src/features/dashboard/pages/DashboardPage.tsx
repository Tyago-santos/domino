import { motion } from "framer-motion";
import { KPISection } from "../components/KPISection";
import { RankingEvolutionChart } from "../components/RankingEvolutionChart";
import { ScoreEvolutionChart } from "../components/ScoreEvolutionChart";
import { WinsByPeriodChart } from "../components/WinsByPeriodChart";
import { MatchesChart } from "../components/MatchesChart";
import { RecentMatchesTable } from "../components/RecentMatchesTable";
import { DashboardGreeting } from "../components/DashboardGreeting";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const sectionVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <DashboardGreeting />

      <motion.div variants={sectionVariants}>
        <KPISection />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div variants={sectionVariants}>
          <RankingEvolutionChart />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <ScoreEvolutionChart />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div variants={sectionVariants}>
          <WinsByPeriodChart />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <MatchesChart />
        </motion.div>
      </div>

      <motion.div variants={sectionVariants}>
        <RecentMatchesTable />
      </motion.div>
    </motion.div>
  );
}
