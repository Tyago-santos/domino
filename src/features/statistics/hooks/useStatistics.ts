import { useQuery } from "@tanstack/react-query";
import {
  getPlayerStats,
  getChartData,
  getRankingEvolution,
} from "@/shared/services/playerService";
import { useAuth } from "@/app/providers/AuthProvider";
import type { PeriodFilter } from "@/shared/types";

export function usePlayerStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["statistics", "playerStats", user?.uid],
    queryFn: () => getPlayerStats(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChartData(period: PeriodFilter = "30days") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["statistics", "chartData", user?.uid, period],
    queryFn: () => getChartData(user!.uid, period),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingEvolution(period: PeriodFilter = "year") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["statistics", "rankingEvolution", user?.uid, period],
    queryFn: () => getRankingEvolution(user!.uid, period),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}
