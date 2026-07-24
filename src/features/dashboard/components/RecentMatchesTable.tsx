import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useMatchHistory } from "../hooks/useDashboard";
import type { MatchResult } from "@/shared/types";

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function resultBadge(result: MatchResult) {
  switch (result) {
    case "win":
      return <Badge variant="success">Vitória</Badge>;
    case "loss":
      return <Badge variant="destructive">Derrota</Badge>;
    case "draw":
      return <Badge variant="warning">Empate</Badge>;
  }
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

export function RecentMatchesTable() {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<MatchResult | "all">("all");

  const { data, isLoading, error } = useMatchHistory(
    "year",
    resultFilter === "all" ? undefined : resultFilter
  );

  if (isLoading) return <TableSkeleton />;

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas Partidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-text-muted">
            Erro ao carregar histórico de partidas.
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredMatches = data.matches.filter((match) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return (
      match.opponent.toLowerCase().includes(lower) ||
      match.partner.toLowerCase().includes(lower) ||
      (match.tournament && match.tournament.toLowerCase().includes(lower))
    );
  });

  const filterButtons: { value: MatchResult | "all"; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "win", label: "Vitórias" },
    { value: "loss", label: "Derrotas" },
    { value: "draw", label: "Empates" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Últimas Partidas</CardTitle>
        <span className="text-sm text-text-muted dark:text-text-muted">
          {data.total} partida{data.total !== 1 ? "s" : ""}
        </span>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md border border-surface-border bg-surface pl-10 pr-3 py-2 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-surface-border dark:bg-surface dark:text-text"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Filter className="mr-1 h-4 w-4 text-text-muted" />
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setResultFilter(btn.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  resultFilter === btn.value
                    ? "bg-emerald-600 text-white dark:bg-emerald-500"
                    : "text-text-muted hover:bg-surface-muted hover:text-text dark:text-text-muted dark:hover:bg-surface-muted dark:hover:text-text"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-text-muted">
            Nenhuma partida encontrada.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-md border border-surface-border dark:border-surface-border sm:block">
              <table className="w-full text-sm">
                <thead className="border-b border-surface-border dark:border-surface-border">
                  <tr>
                    <th className="h-10 px-4 text-left font-medium text-text-muted dark:text-text-muted">Data</th>
                    <th className="h-10 px-4 text-left font-medium text-text-muted dark:text-text-muted">Adversário</th>
                    <th className="h-10 hidden md:table-cell px-4 text-left font-medium text-text-muted dark:text-text-muted">Parceiro</th>
                    <th className="h-10 px-4 text-left font-medium text-text-muted dark:text-text-muted">Resultado</th>
                    <th className="h-10 px-4 text-right font-medium text-text-muted dark:text-text-muted">Pontuação</th>
                    <th className="h-10 hidden lg:table-cell px-4 text-right font-medium text-text-muted dark:text-text-muted">Duração</th>
                    <th className="h-10 hidden lg:table-cell px-4 text-left font-medium text-text-muted dark:text-text-muted">Campeonato</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => (
                    <tr
                      key={match.id}
                      className="border-b border-surface-border transition-colors hover:bg-surface-muted/50 dark:border-surface-border dark:hover:bg-surface-muted/50"
                    >
                      <td className="px-4 py-3 text-text dark:text-text">
                        {new Date(match.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-medium text-text dark:text-text">{match.opponent}</td>
                      <td className="hidden md:table-cell px-4 py-3 text-text dark:text-text">{match.partner}</td>
                      <td className="px-4 py-3">{resultBadge(match.result)}</td>
                      <td className="px-4 py-3 text-right font-medium text-text dark:text-text">{match.score} x {match.scoreConceded}</td>
                      <td className="hidden lg:table-cell px-4 py-3 text-right text-text-muted dark:text-text-muted">{formatDuration(match.duration)}</td>
                      <td className="hidden lg:table-cell px-4 py-3 text-text-muted dark:text-text-muted">{match.tournament || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 sm:hidden">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-lg border border-surface-border bg-surface-muted/50 p-3 dark:border-surface-border dark:bg-surface-muted/50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    {resultBadge(match.result)}
                    <span className="text-xs text-text-muted dark:text-text-muted">
                      {new Date(match.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text dark:text-text">
                    {match.opponent}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-text dark:text-text">
                      {match.score} x {match.scoreConceded}
                    </span>
                    {match.tournament && (
                      <span className="text-xs text-text-muted dark:text-text-muted truncate max-w-[140px]">
                        {match.tournament}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
