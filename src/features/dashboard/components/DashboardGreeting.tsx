import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui";
import { usePlayer } from "../hooks/useDashboard";

export function DashboardGreeting() {
  const { data: player, isLoading } = usePlayer();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-96" />
      </div>
    );
  }

  const hour = new Date().getHours();
  let greeting = "Boa noite";
  if (hour >= 5 && hour < 12) greeting = "Bom dia";
  else if (hour >= 12 && hour < 18) greeting = "Boa tarde";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-2"
    >
      <h1 className="text-2xl font-bold text-text dark:text-text">
        {greeting}, {player?.name ?? "Jogador"}!
      </h1>
      <p className="text-sm text-text-muted dark:text-text-muted">
        Aqui está o resumo das suas estatísticas no domino.
      </p>
    </motion.div>
  );
}
