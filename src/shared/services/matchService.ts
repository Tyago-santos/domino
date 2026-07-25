import {
  ref,
  get,
  set,
  push,
  remove,
} from "firebase/database";
import { db } from "../config/firestore";
import type {
  GameMatch,
  MatchPlayer,
  MatchConfirmation,
  MatchMode,
  PlayerCount,
  GameMatchStatus,
  PeriodFilter,
} from "../types";

interface PlayerData {
  name: string;
  nickname: string;
  avatar?: string;
  city: string;
  state: string;
  club: string;
  category: string;
}

interface MatchData {
  name: string;
  mode: MatchMode;
  status: GameMatchStatus;
  playerCount: PlayerCount;
  players: MatchPlayer[];
  teamA?: { name: string; playerIds: string[] };
  teamB?: { name: string; playerIds: string[] };
  winnerId?: string;
  winningTeam?: 'A' | 'B';
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

interface PlayerMatchHistoryData {
  playerId: string;
  date: string;
  time: string;
  mode: MatchMode;
  opponent: string;
  partner: string;
  result: "win" | "loss";
  duration: number;
  tournament?: string;
}

interface ConfirmationData {
  playerId: string;
  confirmedAt: string;
}

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

export async function getAllPlayers(): Promise<MatchPlayer[]> {
  const snap = await get(ref(db, "players"));
  const players: MatchPlayer[] = [];
  snap.forEach((child) => {
    const d = child.val() as PlayerData;
    players.push({
      id: child.key!,
      name: d.name,
      nickname: d.nickname,
      avatar: d.avatar || "",
      category: d.category,
    });
  });
  return players;
}

export async function createMatch(data: {
  name: string;
  mode: MatchMode;
  playerCount: PlayerCount;
  players: MatchPlayer[];
  teamA?: { name: string; playerIds: string[] };
  teamB?: { name: string; playerIds: string[] };
  createdBy: string;
  createdByName: string;
}): Promise<GameMatch> {
  const newRef = push(ref(db, "activeMatches"));
  const matchData: MatchData = {
    name: data.name,
    mode: data.mode,
    status: "waiting",
    playerCount: data.playerCount,
    players: data.players,
    teamA: data.teamA,
    teamB: data.teamB,
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy,
    createdByName: data.createdByName,
  };
  await set(newRef, matchData);
  return { id: newRef.key!, ...matchData };
}

export async function startMatch(matchId: string): Promise<void> {
  await set(ref(db, `activeMatches/${matchId}/status`), "in_progress");
  await set(ref(db, `activeMatches/${matchId}/startedAt`), new Date().toISOString());
}

export async function getActiveMatch(matchId: string): Promise<GameMatch | null> {
  const snap = await get(ref(db, `activeMatches/${matchId}`));
  if (!snap.exists()) return null;
  const d = snap.val() as MatchData;
  return { id: matchId, ...d };
}

export async function getActiveMatchForPlayer(uid: string): Promise<GameMatch | null> {
  const snap = await get(ref(db, "activeMatches"));
  let found: GameMatch | null = null;
  snap.forEach((child) => {
    const d = child.val() as MatchData;
    const isPlayer = (d.players ?? []).some((p) => p.id === uid);
    if (isPlayer && d.status !== "finished") {
      found = { id: child.key!, ...d };
    }
  });
  return found;
}

export async function confirmVictory(
  matchId: string,
  playerId: string
): Promise<{ finalized: boolean; match?: GameMatch }> {
  const match = await getActiveMatch(matchId);
  if (!match || match.status === "finished") {
    return { finalized: false };
  }

  if (match.mode === "individual") {
    await set(ref(db, `activeMatches/${matchId}/winnerId`), playerId);
    await set(ref(db, `activeMatches/${matchId}/status`), "finished");
    const endedAt = new Date().toISOString();
    await set(ref(db, `activeMatches/${matchId}/endedAt`), endedAt);

    const startedAt = match.startedAt ? new Date(match.startedAt).getTime() : Date.now();
    const duration = Math.floor((Date.now() - startedAt) / 1000);
    await set(ref(db, `activeMatches/${matchId}/duration`), duration);

    const winnerIds = [playerId];
    const loserIds = match.players.filter((p) => p.id !== playerId).map((p) => p.id);
    await updatePlayerStats(winnerIds, "win");
    await updatePlayerStats(loserIds, "loss");

    const finishedMatch: GameMatch = { ...match, winnerId: playerId, status: "finished", endedAt, duration };
    await recordPlayerHistory(finishedMatch, winnerIds, loserIds, endedAt, duration);
    await moveToHistory(matchId, finishedMatch);
    return { finalized: true };
  }

  const confirmRef = ref(db, `matchConfirmations/${matchId}/${playerId}`);
  await set(confirmRef, { playerId, confirmedAt: new Date().toISOString() });

  const confirmSnap = await get(ref(db, `matchConfirmations/${matchId}`));
  const confirmations: string[] = [];
  confirmSnap.forEach((child) => {
    confirmations.push(child.val().playerId);
  });

  const teamAMembers = match.teamA?.playerIds || [];
  const teamBMembers = match.teamB?.playerIds || [];

  let winningTeam: 'A' | 'B' | null = null;
  if (teamAMembers.every((id) => confirmations.includes(id))) {
    winningTeam = "A";
  } else if (teamBMembers.every((id) => confirmations.includes(id))) {
    winningTeam = "B";
  }

  if (winningTeam) {
    await set(ref(db, `activeMatches/${matchId}/winningTeam`), winningTeam);
    await set(ref(db, `activeMatches/${matchId}/status`), "finished");
    const endedAt = new Date().toISOString();
    await set(ref(db, `activeMatches/${matchId}/endedAt`), endedAt);

    const startedAt = match.startedAt ? new Date(match.startedAt).getTime() : Date.now();
    const duration = Math.floor((Date.now() - startedAt) / 1000);
    await set(ref(db, `activeMatches/${matchId}/duration`), duration);

    const winnerIds = winningTeam === "A" ? teamAMembers : teamBMembers;
    const loserIds = winningTeam === "A" ? teamBMembers : teamAMembers;
    await updatePlayerStats(winnerIds, "win");
    await updatePlayerStats(loserIds, "loss");

    const finishedMatch: GameMatch = { ...match, winningTeam, status: "finished", endedAt, duration };
    await recordPlayerHistory(finishedMatch, winnerIds, loserIds, endedAt, duration);
    await moveToHistory(matchId, finishedMatch);
    return { finalized: true, match: finishedMatch };
  }

  return { finalized: false };
}

async function moveToHistory(matchId: string, match: GameMatch): Promise<void> {
  const historyRef = push(ref(db, "matches"));
  const { id: _id, ...matchWithoutId } = match;
  await set(historyRef, matchWithoutId);
  await remove(ref(db, `activeMatches/${matchId}`));
  await remove(ref(db, `matchConfirmations/${matchId}`));
}

async function recordPlayerHistory(
  match: GameMatch,
  winnerIds: string[],
  loserIds: string[],
  endedAt: string,
  duration: number
): Promise<void> {
  const playerById = new Map(match.players.map((player) => [player.id, player]));
  const teamAIds = new Set(match.teamA?.playerIds ?? []);
  const teamBIds = new Set(match.teamB?.playerIds ?? []);

  function resolvePartnerName(playerId: string): string {
    if (match.mode !== "doubles") return "";
    const teamIds = teamAIds.has(playerId) ? teamAIds : teamBIds;
    const partnerId = Array.from(teamIds).find((id) => id !== playerId);
    return partnerId ? playerById.get(partnerId)?.name || "" : "";
  }

  function resolveOpponentName(playerId: string): string {
    if (match.mode === "doubles") {
      return teamAIds.has(playerId)
        ? match.teamB?.name || "Equipe adversária"
        : match.teamA?.name || "Equipe adversária";
    }

    const opponentNames = match.players
      .filter((player) => player.id !== playerId)
      .map((player) => player.name);

    if (opponentNames.length === 0) return "Adversário";
    if (opponentNames.length === 1) return opponentNames[0]!;
    return opponentNames.join(" x ");
  }

  async function writeRecord(playerId: string, result: "win" | "loss"): Promise<void> {
    const record: PlayerMatchHistoryData = {
      playerId,
      date: endedAt.split("T")[0] || endedAt,
      time: endedAt.split("T")[1]?.substring(0, 5) || "",
      mode: match.mode,
      opponent: resolveOpponentName(playerId),
      partner: resolvePartnerName(playerId),
      result,
      duration,
      tournament: match.tournament,
    };

    await set(push(ref(db, "matches")), record);
  }

  for (const playerId of winnerIds) {
    await writeRecord(playerId, "win");
  }

  for (const playerId of loserIds) {
    await writeRecord(playerId, "loss");
  }
}

export async function updatePlayerStats(
  playerIds: string[],
  result: "win" | "loss"
): Promise<void> {
  for (const pid of playerIds) {
    const snap = await get(ref(db, `players/${pid}`));
    if (!snap.exists()) continue;
    const d = snap.val() as PlayerData & {
      totalMatches?: number;
      wins?: number;
      losses?: number;
      currentStreak?: number;
      bestStreak?: number;
    };

    const totalMatches = (d.totalMatches || 0) + 1;
    const wins = (d.wins || 0) + (result === "win" ? 1 : 0);
    const losses = (d.losses || 0) + (result === "loss" ? 1 : 0);

    let currentStreak = d.currentStreak || 0;
    let bestStreak = d.bestStreak || 0;
    if (result === "win") {
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }

    await set(ref(db, `players/${pid}`), {
      ...snap.val(),
      totalMatches,
      wins,
      losses,
      currentStreak,
      bestStreak,
    });
  }
}

export async function getConfirmations(matchId: string): Promise<MatchConfirmation[]> {
  const snap = await get(ref(db, `matchConfirmations/${matchId}`));
  const confirmations: MatchConfirmation[] = [];
  snap.forEach((child) => {
    const d = child.val() as ConfirmationData;
    confirmations.push({
      matchId,
      playerId: d.playerId,
      confirmedAt: d.confirmedAt,
    });
  });
  return confirmations;
}

export async function getMatchHistory(filters?: {
  mode?: MatchMode;
  period?: PeriodFilter;
  page?: number;
  pageSize?: number;
}): Promise<{ matches: GameMatch[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const snap = await get(ref(db, "matches"));
  const matches: GameMatch[] = [];
  snap.forEach((child) => {
    const d = child.val() as MatchData;
    if (Array.isArray(d.players)) {
      matches.push({ id: child.key!, ...d });
    }
  });

  matches.sort((a, b) => {
    const dateA = a.endedAt || a.createdAt;
    const dateB = b.endedAt || b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  let filtered = matches;
  if (filters?.mode) filtered = filtered.filter((m) => m.mode === filters.mode);
  if (filters?.period) {
    const { start } = toDateRange(filters.period);
    filtered = filtered.filter((m) => {
      const date = m.endedAt || m.createdAt;
      return new Date(date) >= start;
    });
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { matches: paginated, total, page, pageSize, totalPages };
}

export async function cancelMatch(matchId: string): Promise<void> {
  await remove(ref(db, `activeMatches/${matchId}`));
  await remove(ref(db, `matchConfirmations/${matchId}`));
}

export async function getRecentMatches(uid: string): Promise<GameMatch[]> {
  const snap = await get(ref(db, "matches"));
  const matches: GameMatch[] = [];
  snap.forEach((child) => {
    const d = child.val() as MatchData;
    const isParticipant = (d.players ?? []).some((p) => p.id === uid);
    if (isParticipant) {
      matches.push({ id: child.key!, ...d });
    }
  });
  matches.sort((a, b) => {
    const dateA = a.endedAt || a.createdAt;
    const dateB = b.endedAt || b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  return matches;
}
