import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { db } from "../config/firestore";
import type {
  Player,
  Match,
  RankingEntry,
  Achievement,
  Stats,
  ChartDataPoint,
  PeriodFilter,
} from "../types";

function toDateRange(period?: PeriodFilter): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "7days":
      start.setDate(start.getDate() - 7);
      break;
    case "30days":
      start.setDate(start.getDate() - 30);
      break;
    case "90days":
      start.setDate(start.getDate() - 90);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setFullYear(2000, 0, 1);
  }
  return { start, end };
}

interface PlayerData {
  name: string;
  nickname: string;
  avatar?: string;
  city: string;
  state: string;
  club: string;
  category: string;
  bio?: string;
  registrationDate?: string;
  score?: number;
}

interface MatchData {
  playerId: string;
  date: string;
  opponent?: string;
  partner?: string;
  result: "win" | "loss" | "draw";
  score: number;
  scoreConceded: number;
  duration: number;
  tournament?: string;
}

export async function getPlayer(uid?: string): Promise<Player> {
  if (!uid) throw new Error("uid obrigatório");
  const playerSnap = await get(ref(db, `players/${uid}`));
  if (!playerSnap.exists()) throw new Error("Jogador não encontrado");
  const d = playerSnap.val() as PlayerData;

  const matchesSnap = await get(
    query(ref(db, "matches"), orderByChild("playerId"), equalTo(uid))
  );
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalScore = 0;
  let totalScoreConceded = 0;
  let totalDuration = 0;
  let bestStreak = 0;
  let streak = 0;

  const matchEntries: MatchData[] = [];
  matchesSnap.forEach((child) => {
    matchEntries.push(child.val() as MatchData);
  });
  matchEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const m of matchEntries) {
    if (m.result === "win") { wins++; streak++; if (streak > bestStreak) bestStreak = streak; }
    else if (m.result === "loss") { losses++; streak = 0; }
    else { draws++; streak = 0; }
    totalScore += m.score;
    totalScoreConceded += m.scoreConceded;
    totalDuration += m.duration;
  }

  const totalMatches = wins + losses + draws;

  return {
    id: uid,
    name: d.name,
    nickname: d.nickname,
    avatar: d.avatar || "",
    city: d.city,
    state: d.state,
    club: d.club,
    category: d.category,
    bio: d.bio || "",
    registrationDate: d.registrationDate || "",
    ranking: 0,
    score: d.score || 0,
    totalMatches,
    wins,
    losses,
    winRate: totalMatches > 0 ? wins / totalMatches : 0,
    currentStreak: streak,
    bestStreak,
    avgMatchDuration: totalMatches > 0 ? Math.round(totalDuration / totalMatches) : 0,
  };
}

export async function getPlayerStats(uid?: string): Promise<Stats> {
  if (!uid) throw new Error("uid obrigatório");
  const player = await getPlayer(uid);
  return {
    ranking: player.ranking,
    score: player.score,
    totalMatches: player.totalMatches,
    wins: player.wins,
    losses: player.losses,
    winRate: player.winRate,
    currentStreak: player.currentStreak,
    bestStreak: player.bestStreak,
    avgScore: player.totalMatches > 0 ? Math.round((player.wins * 178 + player.losses * 120) / player.totalMatches) : 0,
    avgScoreConceded: player.totalMatches > 0 ? Math.round((player.wins * 120 + player.losses * 178) / player.totalMatches) : 0,
    avgMatchDuration: player.avgMatchDuration,
  };
}

export async function getMatchHistory(
  uid?: string,
  filters?: {
    result?: "win" | "loss" | "draw";
    period?: PeriodFilter;
    page?: number;
    pageSize?: number;
  }
): Promise<{ matches: Match[]; total: number; page: number; pageSize: number; totalPages: number }> {
  if (!uid) throw new Error("uid obrigatório");
  const matchesSnap = await get(
    query(ref(db, "matches"), orderByChild("playerId"), equalTo(uid))
  );

  let matches: Match[] = [];
  matchesSnap.forEach((child) => {
    const data = child.val() as MatchData;
    matches.push({
      id: child.key!,
      date: data.date?.split("T")[0] || "",
      time: data.date?.split("T")[1]?.substring(0, 5) || "",
      opponent: data.opponent || "",
      partner: data.partner || "",
      result: data.result,
      score: data.score,
      scoreConceded: data.scoreConceded,
      duration: data.duration,
      tournament: data.tournament || "",
    });
  });

  matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (filters?.result) matches = matches.filter((m) => m.result === filters.result);
  if (filters?.period) {
    const { start } = toDateRange(filters.period);
    matches = matches.filter((m) => new Date(m.date) >= start);
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const total = matches.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = matches.slice((page - 1) * pageSize, page * pageSize);

  return { matches: paginated, total, page, pageSize, totalPages };
}

export async function getRanking(): Promise<RankingEntry[]> {
  const playersSnap = await get(ref(db, "players"));
  const entries: RankingEntry[] = [];

  const playerList: { id: string; data: PlayerData }[] = [];
  playersSnap.forEach((child) => {
    playerList.push({ id: child.key!, data: child.val() as PlayerData });
  });

  for (const p of playerList) {
    const matchesSnap = await get(
      query(ref(db, "matches"), orderByChild("playerId"), equalTo(p.id))
    );
    let wins = 0;
    let losses = 0;
    matchesSnap.forEach((child) => {
      const m = child.val() as MatchData;
      if (m.result === "win") wins++;
      else if (m.result === "loss") losses++;
    });
    const total = wins + losses;
    entries.push({
      position: 0,
      playerId: p.id,
      playerName: p.data.nickname || p.data.name,
      avatar: p.data.avatar || "",
      city: p.data.city || "",
      club: p.data.club || "",
      score: p.data.score || 0,
      winRate: total > 0 ? wins / total : 0,
      wins,
      losses,
      trend: "stable",
    });
  }

  entries.sort((a, b) => b.score - a.score);
  entries.forEach((e, i) => {
    e.position = i + 1;
  });

  return entries;
}

export async function getTournaments(): Promise<Achievement[]> {
  return [];
}

export async function getAchievements(uid?: string): Promise<Achievement[]> {
  if (!uid) throw new Error("uid obrigatório");
  const defsSnap = await get(ref(db, "achievements"));
  const playerAchSnap = await get(
    query(ref(db, "playerAchievements"), orderByChild("playerId"), equalTo(uid))
  );

  const defsList: { id: string; name: string; description: string; icon: string; maxProgress: number }[] = [];
  defsSnap.forEach((child) => {
    const d = child.val();
    defsList.push({ id: child.key!, name: d.name, description: d.description, icon: d.icon, maxProgress: d.maxProgress });
  });

  const playerAchMap = new Map<number, { progress: number; unlocked: boolean }>();
  playerAchSnap.forEach((child) => {
    const d = child.val();
    playerAchMap.set(d.achievementIndex, { progress: d.progress, unlocked: d.unlocked });
  });

  return defsList.map((def, i) => {
    const playerAch = playerAchMap.get(i);
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      date: playerAch?.unlocked ? new Date().toISOString() : undefined,
      progress: playerAch?.progress || 0,
      maxProgress: def.maxProgress,
      unlocked: playerAch?.unlocked || false,
    };
  });
}

export async function getChartData(
  uid?: string,
  period: PeriodFilter = "30days"
): Promise<{
  rankingEvolution: ChartDataPoint[];
  scoreEvolution: ChartDataPoint[];
  winsPerPeriod: ChartDataPoint[];
  matchesPerPeriod: ChartDataPoint[];
}> {
  if (!uid) throw new Error("uid obrigatório");
  const { start } = toDateRange(period);
  const matchesSnap = await get(
    query(ref(db, "matches"), orderByChild("playerId"), equalTo(uid))
  );

  const byMonth = new Map<string, { wins: number; total: number; score: number; ranking: number }>();

  matchesSnap.forEach((child) => {
    const d = child.val() as MatchData;
    const date = new Date(d.date);
    if (date < start) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) || { wins: 0, total: 0, score: 0, ranking: 10 };
    entry.total++;
    if (d.result === "win") entry.wins++;
    entry.score += d.score || 0;
    byMonth.set(key, entry);
  });

  const sorted = Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b));
  let rank = 10;
  let score = 0;

  const rankingEvolution: ChartDataPoint[] = [];
  const scoreEvolution: ChartDataPoint[] = [];
  const winsPerPeriod: ChartDataPoint[] = [];
  const matchesPerPeriod: ChartDataPoint[] = [];

  for (const [key, data] of sorted) {
    rank = Math.max(1, rank - (data.wins > data.total / 2 ? 1 : 0));
    score += data.score;
    rankingEvolution.push({ date: key + "-01", value: rank });
    scoreEvolution.push({ date: key + "-01", value: score });
    winsPerPeriod.push({ date: key + "-01", value: data.wins });
    matchesPerPeriod.push({ date: key + "-01", value: data.total });
  }

  return { rankingEvolution, scoreEvolution, winsPerPeriod, matchesPerPeriod };
}

export async function getRankingEvolution(uid?: string): Promise<ChartDataPoint[]> {
  if (!uid) throw new Error("uid obrigatório");
  const data = await getChartData(uid, "year");
  return data.rankingEvolution;
}

export async function getScoreEvolution(uid?: string): Promise<ChartDataPoint[]> {
  if (!uid) throw new Error("uid obrigatório");
  const data = await getChartData(uid, "year");
  return data.scoreEvolution;
}
