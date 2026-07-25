import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Check } from "lucide-react";
import { Avatar, Skeleton } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { MatchPlayer } from "@/shared/types";

interface PlayerSelectorProps {
  players: MatchPlayer[];
  selectedIds: string[];
  maxSelection: number;
  onSelectionChange: (ids: string[]) => void;
  isLoading?: boolean;
}

export function PlayerSelector({
  players,
  selectedIds,
  maxSelection,
  onSelectionChange,
  isLoading,
}: PlayerSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = players.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.nickname.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  });

  function togglePlayer(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < maxSelection) {
      onSelectionChange([...selectedIds, id]);
    }
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted sm:left-3 sm:h-4 sm:w-4" />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-surface-border bg-surface-muted py-2 pl-8 pr-3 text-[10px] text-text placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-sm"
        />
      </div>

      <div className="flex items-center justify-between text-[9px] text-text-muted sm:text-sm">
        <span>
          {selectedIds.length} de {maxSelection} selecionados
        </span>
        {selectedIds.length >= maxSelection && (
          <span className="text-primary-500 font-medium">Limite atingido</span>
        )}
      </div>

      <div className="max-h-52 space-y-1.5 overflow-y-auto sm:max-h-72 sm:space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-surface-border p-2 sm:gap-3 sm:p-3">
              <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-20 sm:h-4 sm:w-24" />
                <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-16" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-surface-border p-4 text-center sm:p-6">
            <Users className="mx-auto mb-1.5 h-6 w-6 text-text-muted sm:mb-2 sm:h-8 sm:w-8" />
            <p className="text-[10px] text-text-muted sm:text-sm">Nenhum jogador encontrado</p>
          </div>
        ) : (
          filtered.map((player) => {
            const isSelected = selectedIds.includes(player.id);
            const isDisabled = !isSelected && selectedIds.length >= maxSelection;

            return (
              <motion.button
                key={player.id}
                whileHover={{ scale: isDisabled ? 1 : 1.01 }}
                whileTap={{ scale: isDisabled ? 1 : 0.99 }}
                onClick={() => !isDisabled && togglePlayer(player.id)}
                disabled={isDisabled}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border p-2 text-left transition-all sm:gap-3 sm:p-3",
                  isSelected
                    ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:bg-primary-950/30"
                    : isDisabled
                      ? "border-surface-border opacity-50 cursor-not-allowed"
                      : "border-surface-border hover:border-primary-300 hover:bg-surface-muted dark:hover:border-primary-700"
                )}
              >
                <Avatar size="sm" src={player.avatar} fallback={player.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[10px] font-semibold text-text sm:text-sm">{player.name}</p>
                  <p className="text-[9px] text-text-muted sm:text-xs">@{player.nickname}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[9px] text-text-muted sm:text-[11px]">
                    <span>{player.category}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full transition-colors sm:h-6 sm:w-6",
                    isSelected
                      ? "bg-primary-500 text-white"
                      : "border border-surface-border bg-surface-muted"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 sm:h-4 sm:w-4" />}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
