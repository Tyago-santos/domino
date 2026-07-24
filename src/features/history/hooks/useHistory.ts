import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { getMatchHistory } from "@/shared/services/playerService";
import { useAuth } from "@/app/providers/AuthProvider";
import type { Match, MatchResult } from "@/shared/types";

export interface HistoryFilters {
  result: MatchResult | "all";
  tournament: string;
  partner: string;
  opponent: string;
  dateStart: string;
  dateEnd: string;
  search: string;
}

export interface HistorySummary {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

const DEFAULT_FILTERS: HistoryFilters = {
  result: "all",
  tournament: "",
  partner: "",
  opponent: "",
  dateStart: "",
  dateEnd: "",
  search: "",
};

export function useHistory(initialFilters?: Partial<HistoryFilters>) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<HistoryFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const updateFilter = useCallback(
    <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["matchHistory", user?.uid],
    queryFn: () => getMatchHistory(user!.uid, { pageSize: 200 }),
    enabled: !!user?.uid,
  });

  const allMatches: Match[] = data?.matches ?? [];

  const tournaments = useMemo(() => {
    const unique = new Set<string>();
    for (const match of allMatches) {
      if (match.tournament) unique.add(match.tournament);
    }
    return Array.from(unique).sort();
  }, [allMatches]);

  const partners = useMemo(() => {
    const unique = new Set<string>();
    for (const match of allMatches) {
      unique.add(match.partner);
    }
    return Array.from(unique).sort();
  }, [allMatches]);

  const opponents = useMemo(() => {
    const unique = new Set<string>();
    for (const match of allMatches) {
      unique.add(match.opponent);
    }
    return Array.from(unique).sort();
  }, [allMatches]);

  const filteredMatches = useMemo(() => {
    let result = allMatches;

    if (filters.result !== "all") {
      result = result.filter((m) => m.result === filters.result);
    }

    if (filters.tournament) {
      result = result.filter((m) => m.tournament === filters.tournament);
    }

    if (filters.partner) {
      result = result.filter((m) => m.partner === filters.partner);
    }

    if (filters.opponent) {
      result = result.filter((m) => m.opponent === filters.opponent);
    }

    if (filters.dateStart) {
      result = result.filter((m) => m.date >= filters.dateStart);
    }

    if (filters.dateEnd) {
      result = result.filter((m) => m.date <= filters.dateEnd);
    }

    if (filters.search) {
      const lower = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.opponent.toLowerCase().includes(lower) ||
          m.partner.toLowerCase().includes(lower) ||
          m.date.includes(lower) ||
          (m.tournament?.toLowerCase().includes(lower) ?? false),
      );
    }

    return result;
  }, [allMatches, filters]);

  const summary = useMemo<HistorySummary>(() => {
    const wins = filteredMatches.filter((m) => m.result === "win").length;
    const losses = filteredMatches.filter((m) => m.result === "loss").length;
    const draws = filteredMatches.filter((m) => m.result === "draw").length;
    const total = filteredMatches.length;
    const winRate = total > 0 ? wins / total : 0;

    return { total, wins, losses, draws, winRate };
  }, [filteredMatches]);

  return {
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
    error,
    refetch,
  };
}
