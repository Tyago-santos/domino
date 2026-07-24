import { motion } from "framer-motion";
import { Clock, Users, Swords } from "lucide-react";
import { Avatar, Badge } from "@/components/ui";
import type { GameMatch } from "@/shared/types";

interface ActiveMatchCardProps {
  match: GameMatch;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export function ActiveMatchCard({ match }: ActiveMatchCardProps) {
  const elapsed = match.startedAt
    ? Math.floor((Date.now() - new Date(match.startedAt).getTime()) / 1000)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface p-4 transition-all hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
        <Swords className="h-6 w-6 text-primary-600 dark:text-primary-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-text">
            {match.name || "Partida"}
          </p>
          <Badge variant={match.mode === "doubles" ? "secondary" : "outline"} className="shrink-0">
            {match.mode === "doubles" ? "Duplas" : "Individual"}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {match.players.length} jogadores
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(elapsed)}
          </span>
        </div>
      </div>

      <div className="flex -space-x-2">
        {match.players.slice(0, 4).map((p) => (
          <Avatar key={p.id} size="sm" src={p.avatar} fallback={p.name} className="border-2 border-surface" />
        ))}
      </div>

      <Badge variant={match.status === "in_progress" ? "success" : "warning"} className="shrink-0">
        {match.status === "in_progress" ? "Em andamento" : "Aguardando"}
      </Badge>
    </motion.div>
  );
}
