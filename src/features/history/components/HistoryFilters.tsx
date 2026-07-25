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
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-medium text-text dark:text-text sm:text-sm">
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1 text-[9px] text-text-muted sm:gap-1.5 sm:text-sm"
          >
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted sm:left-3 sm:h-4 sm:w-4" />
        <input
          type="text"
          placeholder="Buscar..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className={cn(
            "flex h-9 w-full rounded-md border border-surface-border bg-surface pl-8 pr-3 py-1.5 text-[10px] text-text sm:h-10 sm:pl-10 sm:py-2 sm:text-sm",
            "placeholder:text-text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            "dark:border-surface-border dark:bg-surface dark:text-text",
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-5">
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
