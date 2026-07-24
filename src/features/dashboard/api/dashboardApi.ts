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
import type { PeriodFilter } from "@/shared/types";

export async function fetchPlayer(uid?: string) {
  return getPlayer(uid);
}

export async function fetchPlayerStats(uid?: string) {
  return getPlayerStats(uid);
}

export async function fetchMatchHistory(uid?: string, filters?: {
  result?: "win" | "loss" | "draw";
  period?: PeriodFilter;
  page?: number;
  pageSize?: number;
}) {
  return getMatchHistory(uid, filters);
}

export async function fetchRanking() {
  return getRanking();
}

export async function fetchAchievements(uid?: string) {
  return getAchievements(uid);
}

export async function fetchChartData(uid?: string, period: PeriodFilter = "30days") {
  return getChartData(uid, period);
}

export async function fetchRankingEvolution(uid?: string) {
  return getRankingEvolution(uid);
}

export async function fetchScoreEvolution(uid?: string) {
  return getScoreEvolution(uid);
}
