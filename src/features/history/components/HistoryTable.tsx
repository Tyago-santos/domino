import { useMemo, useState } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable, Badge, Avatar, Button } from "@/components/ui";
import type { ColumnDef } from "@/components/ui";
import type { Match } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

interface HistoryTableProps {
  matches: Match[];
  onExport?: () => void;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}min`;
  return `${mins}min`;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const resultConfig: Record<
  Match["result"],
  { label: string; variant: "success" | "destructive" }
> = {
  win: { label: "Vitória", variant: "success" },
  loss: { label: "Derrota", variant: "destructive" },
};

function MobileCard({ match }: { match: Match }) {
  const config = resultConfig[match.result];
  return (
    <div className={cn(
      "rounded-lg border border-surface-border p-3 dark:border-surface-border",
      match.result === "win" && "bg-emerald-50/50 dark:bg-emerald-950/20",
      match.result === "loss" && "bg-red-50/50 dark:bg-red-950/20",
    )}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text">{formatDate(match.date)}</span>
          <span className="text-xs text-text-muted">{match.time}</span>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
      <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar size="xs" src={match.opponentAvatar} alt={match.opponent} fallback={match.opponent} />
          <span className="text-xs text-text-muted">vs {match.opponent || "—"}</span>
        </div>

      </div>
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{formatDuration(match.duration)}</span>
        {match.tournament && <Badge variant="outline" className="font-normal text-[10px]">{match.tournament}</Badge>}
      </div>
    </div>
  );
}

export function HistoryTable({ matches, onExport }: HistoryTableProps) {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(matches.length / pageSize);
  const pagedMatches = matches.slice(page * pageSize, (page + 1) * pageSize);

  const columns: ColumnDef<Match>[] = useMemo(
    () => [
      {
        id: "date",
        header: "Data",
        accessorKey: "date" as keyof Match,
        sortable: true,
        cell: (row) => (
          <span className="font-medium text-text dark:text-text">
            {formatDate(row.date)}
          </span>
        ),
      },
      {
        id: "time",
        header: "Hora",
        accessorKey: "time" as keyof Match,
        sortable: true,
      },
      {
        id: "opponent",
        header: "Adversário",
        cell: (row) => (
          <div className="flex items-center gap-2.5">
            <Avatar
              size="xs"
              src={row.opponentAvatar}
              alt={row.opponent}
              fallback={row.opponent}
            />
            <span className="text-text dark:text-text">{row.opponent || "—"}</span>
          </div>
        ),
      },
      {
        id: "partner",
        header: "Parceiro",
        cell: (row) => (
          <div className="flex items-center gap-2.5">
            <Avatar
              size="xs"
              src={row.partnerAvatar}
              alt={row.partner}
              fallback={row.partner}
            />
            <span className="text-text dark:text-text">{row.partner || "—"}</span>
          </div>
        ),
      },
      {
        id: "result",
        header: "Resultado",
        accessorKey: "result" as keyof Match,
        sortable: true,
        cell: (row) => {
          const config = resultConfig[row.result];
          return <Badge variant={config.variant}>{config.label}</Badge>;
        },
      },

      {
        id: "duration",
        header: "Duração",
        accessorKey: "duration" as keyof Match,
        sortable: true,
        cell: (row) => (
          <span className="text-text-muted dark:text-text-muted">
            {formatDuration(row.duration)}
          </span>
        ),
      },
      {
        id: "tournament",
        header: "Campeonato",
        cell: (row) =>
          row.tournament ? (
            <Badge variant="outline" className="font-normal">
              {row.tournament}
            </Badge>
          ) : (
            <span className="text-text-muted dark:text-text-muted">—</span>
          ),
      },
    ],
    [],
  );

  const data = useMemo(() => matches as unknown as Record<string, unknown>[], [matches]);
  const typedColumns = useMemo(() => columns as unknown as ColumnDef<Record<string, unknown>>[], [columns]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted dark:text-text-muted">
          {matches.length} partida{matches.length !== 1 ? "s" : ""} encontrada
          {matches.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-1.5"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <DataTable<Record<string, unknown>>
          columns={typedColumns}
          data={data}
          enableSearch={false}
          emptyMessage="Nenhuma partida encontrada com os filtros selecionados."
          pageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {pagedMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <p className="text-sm">Nenhuma partida encontrada.</p>
          </div>
        ) : (
          pagedMatches.map((match) => (
            <MobileCard key={match.id} match={match} />
          ))
        )}
      </div>

      {/* Mobile pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between sm:hidden">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-text-muted">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
