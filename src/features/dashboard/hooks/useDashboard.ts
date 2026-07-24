import { useQuery } from "@tanstack/react-query";
import type { PeriodFilter } from "@/shared/types";
import {
  getPlayer,
  getPlayerStats,
  getMatchHistory,
  getRanking,
  getChartData,
  getRankingEvolution,
  getScoreEvolution,
  getAchievements,
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
  result?: "win" | "loss" | "draw"
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
    queryFn: () => getRankingEvolution(user!.uid),
    enabled: !!user?.uid,
    select: (data) => {
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case "today":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "7days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "year":
          startDate = new Date(now);
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date("2000-01-01");
      }
      return data.filter((point) => new Date(point.date) >= startDate);
    },
  });
}

export function useScoreEvolution(period: PeriodFilter = "30days") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["scoreEvolution", user?.uid, period],
    queryFn: () => getScoreEvolution(user!.uid),
    enabled: !!user?.uid,
    select: (data) => {
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case "today":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "7days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "year":
          startDate = new Date(now);
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date("2000-01-01");
      }
      return data.filter((point) => new Date(point.date) >= startDate);
    },
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

export function useAchievements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["achievements", user?.uid],
    queryFn: () => getAchievements(user!.uid),
    enabled: !!user?.uid,
  });
}
