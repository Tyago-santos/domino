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
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por nome, apelido ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-surface-border bg-surface-muted py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>
          {selectedIds.length} de {maxSelection} selecionados
        </span>
        {selectedIds.length >= maxSelection && (
          <span className="text-primary-500 font-medium">Limite atingido</span>
        )}
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-surface-border p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-surface-border p-6 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-muted">Nenhum jogador encontrado</p>
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
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                  isSelected
                    ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:bg-primary-950/30"
                    : isDisabled
                      ? "border-surface-border opacity-50 cursor-not-allowed"
                      : "border-surface-border hover:border-primary-300 hover:bg-surface-muted dark:hover:border-primary-700"
                )}
              >
                <Avatar size="default" src={player.avatar} fallback={player.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-text">{player.name}</p>
                  <p className="text-xs text-text-muted">@{player.nickname}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                    <span>{player.category}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                    isSelected
                      ? "bg-primary-500 text-white"
                      : "border border-surface-border bg-surface-muted"
                  )}
                >
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
