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
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2.5 sm:px-6 sm:py-4">
        <CardTitle className="text-[11px] font-bold sm:text-lg">Últimas Partidas</CardTitle>
        <span className="text-[9px] text-text-muted dark:text-text-muted sm:text-sm">
          {data.total} partida{data.total !== 1 ? "s" : ""}
        </span>
      </CardHeader>
      <CardContent className="px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted sm:left-3 sm:h-4 sm:w-4" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full rounded-md border border-surface-border bg-surface pl-8 pr-3 py-1.5 text-[10px] text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-surface-border dark:bg-surface dark:text-text sm:h-10 sm:pl-10 sm:py-2 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
            <Filter className="mr-0.5 h-3 w-3 text-text-muted sm:mr-1 sm:h-4 sm:w-4" />
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setResultFilter(btn.value)}
                className={`rounded-md px-2 py-1 text-[9px] font-medium transition-all sm:px-3 sm:py-1.5 sm:text-xs ${
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
            <div className="hidden overflow-x-auto rounded-md border border-surface-border dark:border-surface-border sm:block md:overflow-visible">
              <table className="w-full text-sm">
                <thead className="border-b border-surface-border dark:border-surface-border">
                  <tr>
                    <th className="h-10 px-4 text-left font-medium text-text-muted dark:text-text-muted">Data</th>
                    <th className="h-10 px-4 text-left font-medium text-text-muted dark:text-text-muted">Adversário</th>
                    <th className="h-10 hidden md:table-cell px-4 text-left font-medium text-text-muted dark:text-text-muted">Parceiro</th>
                    <th className="h-10 px-4 text-left font-medium text-text-muted dark:text-text-muted">Resultado</th>
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
                  {match.tournament && (
                    <p className="mt-1 text-xs text-text-muted dark:text-text-muted truncate">
                      {match.tournament}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
