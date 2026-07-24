import { Search, X } from "lucide-react";
import { Input, Select, Button } from "@/components/ui";
import type { HistoryFilters as HistoryFiltersType } from "../hooks/useHistory";
import { cn } from "@/shared/lib/utils";

interface HistoryFiltersProps {
  filters: HistoryFiltersType;
  tournaments: string[];
  partners: string[];
  opponents: string[];
  onFilterChange: <K extends keyof HistoryFiltersType>(
    key: K,
    value: HistoryFiltersType[K],
  ) => void;
  onReset: () => void;
  className?: string;
}

const resultOptions = [
  { value: "all", label: "Todos" },
  { value: "win", label: "Vitórias" },
  { value: "loss", label: "Derrotas" },
  { value: "draw", label: "Empates" },
];

export function HistoryFilters({
  filters,
  tournaments,
  partners,
  opponents,
  onFilterChange,
  onReset,
  className,
}: HistoryFiltersProps) {
  const hasActiveFilters =
    filters.result !== "all" ||
    filters.tournament !== "" ||
    filters.partner !== "" ||
    filters.opponent !== "" ||
    filters.dateStart !== "" ||
    filters.dateEnd !== "" ||
    filters.search !== "";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text dark:text-text">
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5 text-text-muted"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por adversário, parceiro ou campeonato..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className={cn(
            "flex h-10 w-full rounded-md border border-surface-border bg-surface pl-10 pr-3 py-2 text-sm text-text",
            "placeholder:text-text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            "dark:border-surface-border dark:bg-surface dark:text-text",
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Input
          label="Data início"
          type="date"
          value={filters.dateStart}
          onChange={(e) => onFilterChange("dateStart", e.target.value)}
        />

        <Input
          label="Data fim"
          type="date"
          value={filters.dateEnd}
          onChange={(e) => onFilterChange("dateEnd", e.target.value)}
        />

        <Select
          label="Resultado"
          placeholder="Todos"
          value={filters.result}
          onChange={(e) =>
            onFilterChange(
              "result",
              e.target.value as HistoryFiltersType["result"],
            )
          }
          options={resultOptions}
        />

        <Select
          label="Campeonato"
          placeholder="Todos"
          value={filters.tournament}
          onChange={(e) => onFilterChange("tournament", e.target.value)}
          options={[
            { value: "", label: "Todos" },
            ...tournaments.map((t) => ({ value: t, label: t })),
          ]}
        />

        <Select
          label="Parceiro"
          placeholder="Todos"
          value={filters.partner}
          onChange={(e) => onFilterChange("partner", e.target.value)}
          options={[
            { value: "", label: "Todos" },
            ...partners.map((p) => ({ value: p, label: p })),
          ]}
        />

        <Select
          label="Adversário"
          placeholder="Todos"
          value={filters.opponent}
          onChange={(e) => onFilterChange("opponent", e.target.value)}
          options={[
            { value: "", label: "Todos" },
            ...opponents.map((o) => ({ value: o, label: o })),
          ]}
        />
      </div>
    </div>
  );
}
