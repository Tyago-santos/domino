import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  History,
  Swords,
  Trophy,
  Clock,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, Badge, Skeleton, EmptyState, Select } from "@/components/ui";
import { useMatchHistory } from "../hooks/useMatch";
import type { MatchMode } from "@/shared/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min ${s}s`;
}

export default function MatchHistoryPage() {
  const navigate = useNavigate();
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMatchHistory({
    mode: modeFilter === "all" ? undefined : (modeFilter as MatchMode),
    page,
    pageSize: 10,
  });

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/play")}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-muted hover:text-text"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
            <History className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Histórico de Partidas
            </h1>
            <p className="text-sm text-text-muted">
              {data?.total ?? 0} partidas encontradas
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-text-muted" />
        <Select
          value={modeFilter}
          onChange={(e) => {
            setModeFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "all", label: "Todos os modos" },
            { value: "individual", label: "Individual" },
            { value: "doubles", label: "Duplas" },
          ]}
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : data?.matches && data.matches.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-xl border border-surface-border bg-surface md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Modo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Participantes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Resultado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Duração
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {data.matches.map((match) => (
                    <tr key={match.id} className="transition-colors hover:bg-surface-muted/50">
                      <td className="px-4 py-3">
                        <Badge variant={match.mode === "doubles" ? "secondary" : "outline"}>
                          <Swords className="mr-1 h-3 w-3" />
                          {match.mode === "doubles" ? "Duplas" : "Individual"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {match.players.slice(0, 4).map((p) => (
                              <div
                                key={p.id}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-surface bg-primary-100 text-[9px] font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                              >
                                {p.nickname.charAt(0)}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-text-muted">
                            {match.players.map((p) => p.nickname).join(", ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          <Trophy className="mr-1 h-3 w-3" />
                          {match.mode === "individual"
                            ? match.players.find((p) => p.id === match.winnerId)?.nickname || "?"
                            : match.winningTeam === "A"
                              ? match.teamA?.name || "Equipe A"
                              : match.teamB?.name || "Equipe B"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-sm text-text-muted">
                          <Clock className="h-3.5 w-3.5" />
                          {match.duration ? formatDuration(match.duration) : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {match.endedAt
                          ? new Date(match.endedAt).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {data.matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-surface-border bg-surface p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={match.mode === "doubles" ? "secondary" : "outline"}>
                        {match.mode === "doubles" ? "Duplas" : "Individual"}
                      </Badge>
                      <Badge variant="success">
                        <Trophy className="mr-1 h-3 w-3" />
                        {match.mode === "individual"
                          ? match.players.find((p) => p.id === match.winnerId)?.nickname || "?"
                          : match.winningTeam === "A"
                            ? match.teamA?.name
                            : match.teamB?.name}
                      </Badge>
                    </div>
                    <span className="text-xs text-text-muted">
                      {match.endedAt
                        ? new Date(match.endedAt).toLocaleDateString("pt-BR")
                        : "-"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    {match.players.map((p) => p.nickname).join(" vs ")}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {match.duration ? formatDuration(match.duration) : "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {match.players.length} jogadores
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  Página {data.page} de {data.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<History className="h-12 w-12" />}
            title="Nenhuma partida encontrada"
            description="Suas partidas finalizadas aparecerão aqui."
            actionLabel="Criar Partida"
            onAction={() => navigate("/play")}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
