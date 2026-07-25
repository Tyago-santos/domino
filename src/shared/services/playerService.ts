import {
  ref,
  get,
} from "firebase/database";
import { db } from "../config/firestore";
import type {
  Player,
  Match,
  MatchPlayer,
  RankingEntry,
  Stats,
  ChartDataPoint,
  MatchMode,
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

function getBucketKey(date: Date, period?: PeriodFilter): string {
  const useDailyBuckets = period === "today" || period === "7days" || period === "30days";
  if (useDailyBuckets) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function sortMatchesDesc(matches: Match[]): Match[] {
  return matches.sort((a, b) => {
    const dateA = `${a.date}T${a.time || "00:00"}`;
    const dateB = `${b.date}T${b.time || "00:00"}`;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

function matchSignature(match: Match): string {
  return [
    match.date,
    match.time,
    match.opponent,
    match.partner,
    match.result,
    match.duration,
    match.tournament || "",
  ].join("|");
}

type MatchRecord = Record<string, any>;
type GameMatchRecord = MatchRecord & {
  players: MatchPlayer[];
  createdAt: string;
  createdBy: string;
  createdByName: string;
};

function isGameMatchRecord(data: MatchRecord): data is GameMatchRecord {
  return Array.isArray(data.players);
}

function buildMatchFromGameRecord(uid: string, id: string, data: MatchRecord): Match[] {
  if (!isGameMatchRecord(data)) return [];

  const players = data.players ?? [];
  const player = players.find((item) => item.id === uid);
  if (!player) return [];

  const date = typeof data.endedAt === "string"
    ? data.endedAt
    : typeof data.createdAt === "string"
      ? data.createdAt
      : "";
  const normalizedDate = date.split("T")[0] || "";
  const normalizedTime = date.split("T")[1]?.substring(0, 5) || "";

  if (data.mode === "individual") {
    const winnerId = typeof data.winnerId === "string" ? data.winnerId : "";
    const opponentNames = players
      .filter((item) => item.id !== uid)
      .map((item) => item.name);

    return [
      {
        id,
        date: normalizedDate,
        time: normalizedTime,
        mode: "individual",
        opponent: opponentNames.join(" x "),
        partner: "",
        result: winnerId === uid ? "win" : "loss",
        duration: typeof data.duration === "number" ? data.duration : 0,
        tournament: typeof data.tournament === "string" ? data.tournament : "",
      },
    ];
  }

  const teamAIds = new Set((data.teamA?.playerIds ?? []) as string[]);
  const teamBIds = new Set((data.teamB?.playerIds ?? []) as string[]);
  const isTeamA = teamAIds.has(uid);
  const isTeamB = teamBIds.has(uid);
  if (!isTeamA && !isTeamB) return [];

  const partnerId = Array.from(isTeamA ? teamAIds : teamBIds).find((item) => item !== uid);
  const partner = players.find((item) => item.id === partnerId);
  const opponentTeam = isTeamA ? data.teamB : data.teamA;

  return [
    {
      id,
      date: normalizedDate,
      time: normalizedTime,
      mode: "doubles",
      opponent: opponentTeam?.name || "Equipe adversária",
      partner: partner?.nickname || partner?.name || "",
      result:
        (data.winningTeam === "A" && isTeamA) || (data.winningTeam === "B" && isTeamB)
          ? "win"
          : "loss",
      duration: typeof data.duration === "number" ? data.duration : 0,
      tournament: typeof data.tournament === "string" ? data.tournament : "",
    },
  ];
}

function buildMatchFromPlayerRecord(uid: string, id: string, data: MatchRecord): Match[] {
  const playerId = typeof data.playerId === "string" ? data.playerId : "";
  if (playerId !== uid) return [];

  return [
    {
      id,
      date: typeof data.date === "string" ? data.date.split("T")[0] || "" : "",
      time: typeof data.date === "string" ? data.date.split("T")[1]?.substring(0, 5) || "" : "",
      mode: (data.mode as MatchMode) || "individual",
      opponent: typeof data.opponent === "string" ? data.opponent : "",
      partner: typeof data.partner === "string" ? data.partner : "",
      result: data.result === "loss" ? "loss" : "win",
      duration: typeof data.duration === "number" ? data.duration : 0,
      tournament: typeof data.tournament === "string" ? data.tournament : "",
    },
  ];
}

async function getCombinedPlayerHistory(uid: string): Promise<Match[]> {
  const matchesSnap = await get(ref(db, "matches"));

  const matches: Match[] = [];
  const seen = new Set<string>();

  matchesSnap.forEach((child) => {
    const data = child.val() as MatchRecord;
    const fromGame = buildMatchFromGameRecord(uid, child.key!, data);
    const fromPlayer = buildMatchFromPlayerRecord(uid, child.key!, data);
    for (const match of [...fromGame, ...fromPlayer]) {
      const signature = matchSignature(match);
      if (seen.has(signature)) continue;
      seen.add(signature);
      matches.push(match);
    }
  });

  return sortMatchesDesc(matches);
}

async function getPlayerRankingPosition(uid: string): Promise<number> {
  const ranking = await getRanking();
  return ranking.find((entry) => entry.playerId === uid)?.position || 0;
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
}

export async function getPlayer(uid?: string): Promise<Player> {
  if (!uid) throw new Error("uid obrigatório");
  const playerSnap = await get(ref(db, `players/${uid}`));
  if (!playerSnap.exists()) throw new Error("Jogador não encontrado");
  const d = playerSnap.val() as PlayerData;

  const matchEntries = await getCombinedPlayerHistory(uid);
  let wins = 0;
  let losses = 0;
  let totalDuration = 0;
  let bestStreak = 0;
  let streak = 0;

  for (const m of matchEntries) {
    if (m.result === "win") { wins++; streak++; if (streak > bestStreak) bestStreak = streak; }
    else { losses++; streak = 0; }
    totalDuration += m.duration;
  }

  const totalMatches = wins + losses;

  const ranking = await getPlayerRankingPosition(uid);

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
    ranking,
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
    totalMatches: player.totalMatches,
    wins: player.wins,
    losses: player.losses,
    winRate: player.winRate,
    currentStreak: player.currentStreak,
    bestStreak: player.bestStreak,
    avgMatchDuration: player.avgMatchDuration,
  };
}

export async function getMatchHistory(
  uid?: string,
  filters?: {
    result?: "win" | "loss";
    period?: PeriodFilter;
    page?: number;
    pageSize?: number;
  }
): Promise<{ matches: Match[]; total: number; page: number; pageSize: number; totalPages: number }> {
  if (!uid) throw new Error("uid obrigatório");
  let matches = await getCombinedPlayerHistory(uid);

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
    const matches = await getCombinedPlayerHistory(p.id);
    let wins = 0;
    let losses = 0;
    matches.forEach((m) => {
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
      winRate: total > 0 ? wins / total : 0,
      wins,
      losses,
      trend: "stable",
    });
  }

  entries.sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
  entries.forEach((e, i) => {
    e.position = i + 1;
  });

  return entries;
}

export async function getTournaments(): Promise<unknown[]> {
  return [];
}

export async function getChartData(
  uid?: string,
  period: PeriodFilter = "30days"
): Promise<{
  rankingEvolution: ChartDataPoint[];
  winsPerPeriod: ChartDataPoint[];
  matchesPerPeriod: ChartDataPoint[];
}> {
  if (!uid) throw new Error("uid obrigatório");
  const { start } = toDateRange(period);
  const matches = await getCombinedPlayerHistory(uid);

  const byMonth = new Map<string, { wins: number; total: number; ranking: number }>();

  matches.forEach((d) => {
    const date = new Date(`${d.date}T${d.time || "00:00"}`);
    if (date < start) return;
    const key = getBucketKey(date, period);
    const entry = byMonth.get(key) || { wins: 0, total: 0, ranking: 10 };
    entry.total++;
    if (d.result === "win") entry.wins++;
    byMonth.set(key, entry);
  });

  const sorted = Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b));

  const rankingEvolution: ChartDataPoint[] = [];
  const winsPerPeriod: ChartDataPoint[] = [];
  const matchesPerPeriod: ChartDataPoint[] = [];
  let rank = 10;

  for (const [key, data] of sorted) {
    const date = key.length === 10 ? key : `${key}-01`;
    rank = Math.max(1, rank - (data.wins > data.total / 2 ? 1 : 0));
    rankingEvolution.push({ date, value: rank });
    winsPerPeriod.push({ date, value: data.wins });
    matchesPerPeriod.push({ date, value: data.total });
  }

  return { rankingEvolution, winsPerPeriod, matchesPerPeriod };
}

export async function getRankingEvolution(
  uid?: string,
  period: PeriodFilter = "year"
): Promise<ChartDataPoint[]> {
  if (!uid) throw new Error("uid obrigatório");
  const data = await getChartData(uid, period);
  return data.rankingEvolution;
}
