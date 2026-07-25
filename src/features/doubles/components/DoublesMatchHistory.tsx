import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, Clock, Swords } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Input, Button, Skeleton, EmptyState } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import { useDoublesMatchHistory } from "../hooks/useDoubles";

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25 },
  }),
};

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

function getResultBadge(result: 'win' | 'loss') {
  switch (result) {
    case 'win':
      return <Badge variant="success">Vitória</Badge>;
    case 'loss':
      return <Badge variant="destructive">Derrota</Badge>;
  }

  return null;
}

export function DoublesMatchHistory() {
  const [resultFilter, setResultFilter] = useState<"win" | "loss" | "">("");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useDoublesMatchHistory({
    result: resultFilter || undefined,
    pageSize: 10,
  });

  const matches = data?.matches ?? [];

  const filtered = matches.filter((m) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      m.team1.name.toLowerCase().includes(term) ||
      m.team2.name.toLowerCase().includes(term) ||
      m.tournament?.toLowerCase().includes(term)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <CardTitle className="text-[11px] font-bold sm:text-lg">Histórico de Partidas da Dupla</CardTitle>
          {data && (
            <span className="text-[9px] text-text-muted dark:text-text-muted sm:text-sm">
              Total: <span className="font-semibold text-text dark:text-text">{data.total}</span> partidas
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted dark:text-text-muted sm:left-3 sm:h-4 sm:w-4" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-[10px] sm:pl-9 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {(["", "win", "loss"] as const).map((filter) => (
              <Button
                key={filter}
                variant={resultFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setResultFilter(filter)}
                className={cn(
                  "text-[9px] sm:text-sm",
                  filter === "" && "border-emerald-200 dark:border-emerald-800"
                )}
              >
                <Filter className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" />
                {filter === "" ? "Todas" : filter === "win" ? "Vitórias" : "Derrotas"}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="py-12 text-center text-sm text-text-muted">
            Erro ao carregar histórico de partidas.
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Swords className="h-7 w-7 text-text-muted" />}
            title="Nenhuma partida encontrada"
            description="Não há partidas de dupla que correspondam aos filtros selecionados."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted dark:bg-surface-muted">
                    <th className="px-3 py-2.5 text-left font-medium text-text-muted dark:text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Data
                      </span>
                    </th>
                    <th className="hidden px-3 py-2.5 text-left font-medium text-text-muted dark:text-text-muted md:table-cell">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Hora
                      </span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium text-text-muted dark:text-text-muted">
                      Sua Dupla vs Adversária
                    </th>
                    <th className="px-3 py-2.5 text-center font-medium text-text-muted dark:text-text-muted">
                      Resultado
                    </th>
                    <th className="hidden px-3 py-2.5 text-center font-medium text-text-muted dark:text-text-muted lg:table-cell">
                      Duração
                    </th>
                    <th className="hidden px-3 py-2.5 text-center font-medium text-text-muted dark:text-text-muted lg:table-cell">
                      Rodadas
                    </th>
                    <th className="hidden px-3 py-2.5 text-left font-medium text-text-muted dark:text-text-muted xl:table-cell">
                      Campeonato
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((match, index) => {
                    const isTeam1 = match.mySide === "team1";
                    const myTeam = isTeam1 ? match.team1 : match.team2;
                    const opponent = isTeam1 ? match.team2 : match.team1;
                    return (
                      <motion.tr
                        key={match.id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="border-b border-surface-border transition-colors last:border-0 hover:bg-surface-muted dark:hover:bg-surface-muted"
                      >
                        <td className="whitespace-nowrap px-3 py-3 text-text dark:text-text">
                          {new Date(match.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="hidden whitespace-nowrap px-3 py-3 text-text-muted dark:text-text-muted md:table-cell">
                          {match.time}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text dark:text-text">
                              {myTeam.name}
                            </span>
                            <span className="text-text-muted dark:text-text-muted">vs</span>
                            <span className="text-text-muted dark:text-text-muted">
                              {opponent.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {getResultBadge(match.result)}
                        </td>
                        <td className="hidden px-3 py-3 text-center text-text-muted dark:text-text-muted lg:table-cell">
                          {match.duration} min
                        </td>
                        <td className="hidden px-3 py-3 text-center text-text-muted dark:text-text-muted lg:table-cell">
                          {match.rounds ?? "-"}
                        </td>
                        <td className="hidden px-3 py-3 text-text-muted dark:text-text-muted xl:table-cell">
                          {match.tournament || "-"}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 sm:hidden">
              {filtered.map((match, index) => {
                const isTeam1 = match.mySide === "team1";
                const myTeam = isTeam1 ? match.team1 : match.team2;
                const opponent = isTeam1 ? match.team2 : match.team1;
                return (
                  <motion.div
                    key={match.id}
                    custom={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-lg border border-surface-border bg-surface-muted/50 p-3 dark:border-surface-border dark:bg-surface-muted/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      {getResultBadge(match.result)}
                      <span className="text-xs text-text-muted dark:text-text-muted">
                        {new Date(match.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-text dark:text-text">{myTeam.name}</span>
                      <span className="text-text-muted dark:text-text-muted">vs</span>
                      <span className="text-text-muted dark:text-text-muted">{opponent.name}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      {match.tournament && (
                        <span className="text-xs text-text-muted dark:text-text-muted truncate max-w-[140px]">
                          {match.tournament}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
