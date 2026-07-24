import { useCallback } from "react";
import { motion } from "framer-motion";
import { History, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from "@/components/ui";
import { useHistory } from "../hooks/useHistory";
import { HistorySummary } from "../components/HistorySummary";
import { HistoryFilters } from "../components/HistoryFilters";
import { HistoryTable } from "../components/HistoryTable";

function exportToCSV(matches: ReturnType<typeof useHistory>["filteredMatches"]) {
  const headers = [
    "Data",
    "Hora",
    "Adversário",
    "Parceiro",
    "Resultado",
    "Pontos Marcados",
    "Pontos Sofridos",
    "Duração (min)",
    "Campeonato",
  ];

  const resultLabel: Record<string, string> = {
    win: "Vitória",
    loss: "Derrota",
    draw: "Empate",
  };

  const rows = matches.map((m) => [
    m.date,
    m.time,
    m.opponent,
    m.partner,
    resultLabel[m.result] ?? m.result,
    String(m.score),
    String(m.scoreConceded),
    String(m.duration),
    m.tournament ?? "",
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `historico_partidas_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[260px] rounded-lg" />
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  );
}

export default function HistoryPage() {
  const {
    filters,
    updateFilter,
    resetFilters,
    filteredMatches,
    summary,
    tournaments,
    partners,
    opponents,
    isLoading,
    isError,
    refetch,
  } = useHistory();

  const handleExport = useCallback(() => {
    exportToCSV(filteredMatches);
  }, [filteredMatches]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text dark:text-text">
            Histórico
          </h1>
          <p className="text-sm text-text-muted dark:text-text-muted">
            Acompanhe todas as suas partidas
          </p>
        </div>
      </motion.div>

      {isLoading && <LoadingSkeleton />}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <div className="text-center">
              <p className="font-medium text-text dark:text-text">
                Erro ao carregar histórico
              </p>
              <p className="text-sm text-text-muted dark:text-text-muted">
                Tente novamente mais tarde.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <HistorySummary summary={summary} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <HistoryFilters
                  filters={filters}
                  tournaments={tournaments}
                  partners={partners}
                  opponents={opponents}
                  onFilterChange={updateFilter}
                  onReset={resetFilters}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Partidas</CardTitle>
              </CardHeader>
              <CardContent>
                <HistoryTable
                  matches={filteredMatches}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
