import { useQuery } from "@tanstack/react-query";
import type { PeriodFilter } from "@/shared/types";
import {
  getPlayer,
  getPlayerStats,
  getMatchHistory,
  getRanking,
  getChartData,
  getRankingEvolution,
} from "@/shared/services/playerService";
import { useAuth } from "@/app/providers/AuthProvider";

export function usePlayer() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["player", user?.uid],
    queryFn: () => getPlayer(user!.uid),
    enabled: !!user?.uid,
  });
}

export function usePlayerStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["playerStats", user?.uid],
    queryFn: () => getPlayerStats(user!.uid),
    enabled: !!user?.uid,
  });
}

export function useMatchHistory(
  period: PeriodFilter = "30days",
  result?: "win" | "loss"
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["matchHistory", user?.uid, period, result],
    queryFn: () => getMatchHistory(user!.uid, { period, result, pageSize: 10 }),
    enabled: !!user?.uid,
  });
}

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: getRanking,
  });
}

export function useRankingEvolution(period: PeriodFilter = "30days") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["rankingEvolution", user?.uid, period],
    queryFn: () => getRankingEvolution(user!.uid, period),
    enabled: !!user?.uid,
  });
}

export function useChartData(period: PeriodFilter = "30days") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chartData", user?.uid, period],
    queryFn: () => getChartData(user!.uid, period),
    enabled: !!user?.uid,
  });
}


