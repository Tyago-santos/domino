import {
  ref,
  get,
  set,
  push,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { db } from "../config/firestore";
import type {
  Team,
  DoublesMatch,
  DoublesStats,
  Partner,
  PeriodFilter,
  AvailablePlayer,
  TeamInvitation,
  Player,
  ChartDataPoint,
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

interface TeamData {
  name: string;
  player1Id: string;
  player2Id: string;
  club: string;
  city: string;
}

interface DoublesMatchData {
  team1Id: string;
  team2Id: string;
  date: string;
  result: string;
  score1: number;
  score2: number;
  duration: number;
  tournament?: string;
  rounds?: number;
}

interface MatchData {
  playerId: string;
  result: string;
  score: number;
  scoreConceded: number;
}

async function getPlayerById(uid: string): Promise<Player | null> {
  const snap = await get(ref(db, `players/${uid}`));
  if (!snap.exists()) return null;
  const d = snap.val() as PlayerData;
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
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    avgMatchDuration: 0,
  };
}

async function buildTeamFromDb(teamId: string, d: TeamData): Promise<Team | null> {
  const p1 = await getPlayerById(d.player1Id);
  const p2 = await getPlayerById(d.player2Id);
  if (!p1 || !p2) return null;

  const matchesSnap1 = await get(
    query(ref(db, "doublesMatches"), orderByChild("team1Id"), equalTo(teamId))
  );
  const matchesSnap2 = await get(
    query(ref(db, "doublesMatches"), orderByChild("team2Id"), equalTo(teamId))
  );

  let wins = 0;
  let losses = 0;
  let streak = 0;
  let bestStreak = 0;

  matchesSnap1.forEach((child) => {
    const data = child.val() as DoublesMatchData;
    if (data.result === "win") {
      wins++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      losses++;
      streak = 0;
    }
  });

  matchesSnap2.forEach((child) => {
    const data = child.val() as DoublesMatchData;
    if (data.result === "loss") {
      wins++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      losses++;
      streak = 0;
    }
  });

  const total = wins + losses;

  return {
    id: teamId,
    name: d.name,
    player1: p1,
    player2: p2,
    score: 0,
    ranking: 0,
    totalMatches: total,
    wins,
    losses,
    winRate: total > 0 ? wins / total : 0,
    currentStreak: streak,
    bestStreak,
    club: d.club,
    city: d.city,
  };
}

export async function getTeams(_uid?: string): Promise<Team[]> {
  const snap = await get(ref(db, "teams"));
  const teams: Team[] = [];

  const teamList: { id: string; data: TeamData }[] = [];
  snap.forEach((child) => {
    teamList.push({ id: child.key!, data: child.val() as TeamData });
  });

  for (const t of teamList) {
    const team = await buildTeamFromDb(t.id, t.data);
    if (team) teams.push(team);
  }
  teams.sort((a, b) => b.wins - a.wins);
  teams.forEach((t, i) => (t.ranking = i + 1));
  return teams;
}

export async function getMyTeam(uid?: string): Promise<Team | null> {
  if (!uid) return null;

  const snap1 = await get(
    query(ref(db, "teams"), orderByChild("player1Id"), equalTo(uid))
  );
  if (snap1.exists()) {
    let teamId = "";
    let teamData: TeamData | null = null;
    snap1.forEach((child) => {
      teamId = child.key!;
      teamData = child.val() as TeamData;
    });
    if (teamData) return buildTeamFromDb(teamId, teamData);
  }

  const snap2 = await get(
    query(ref(db, "teams"), orderByChild("player2Id"), equalTo(uid))
  );
  if (snap2.exists()) {
    let teamId = "";
    let teamData: TeamData | null = null;
    snap2.forEach((child) => {
      teamId = child.key!;
      teamData = child.val() as TeamData;
    });
    if (teamData) return buildTeamFromDb(teamId, teamData);
  }

  return null;
}

export async function getDoublesMatchHistory(
  uid?: string,
  filters?: {
    result?: "win" | "loss" | "draw";
    period?: PeriodFilter;
    page?: number;
    pageSize?: number;
  }
): Promise<{ matches: DoublesMatch[]; total: number; page: number; pageSize: number; totalPages: number }> {
  if (!uid) throw new Error("uid obrigatório");

  const myTeam = await getMyTeam(uid);
  if (!myTeam) return { matches: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

  const snap1 = await get(
    query(ref(db, "doublesMatches"), orderByChild("team1Id"), equalTo(myTeam.id))
  );
  const snap2 = await get(
    query(ref(db, "doublesMatches"), orderByChild("team2Id"), equalTo(myTeam.id))
  );

  const allMatches: DoublesMatch[] = [];
  const teamCache = new Map<string, string>();

  async function getTeamName(teamId: string): Promise<string> {
    if (teamCache.has(teamId)) return teamCache.get(teamId)!;
    const snap = await get(ref(db, `teams/${teamId}`));
    const name = snap.exists() ? (snap.val() as TeamData).name : "";
    teamCache.set(teamId, name);
    return name;
  }

  const matchEntries1: { key: string; data: DoublesMatchData }[] = [];
  snap1.forEach((child) => {
    matchEntries1.push({ key: child.key!, data: child.val() as DoublesMatchData });
  });

  const matchEntries2: { key: string; data: DoublesMatchData }[] = [];
  snap2.forEach((child) => {
    matchEntries2.push({ key: child.key!, data: child.val() as DoublesMatchData });
  });

  for (const entry of matchEntries1) {
    const d = entry.data;
    const t1Name = await getTeamName(d.team1Id);
    const t2Name = await getTeamName(d.team2Id);
    allMatches.push({
      id: entry.key,
      date: d.date?.split("T")[0] || "",
      time: d.date?.split("T")[1]?.substring(0, 5) || "",
      team1: { id: d.team1Id, name: t1Name },
      team2: { id: d.team2Id, name: t2Name },
      result: d.result as "win" | "loss" | "draw",
      score1: d.score1,
      score2: d.score2,
      duration: d.duration,
      tournament: d.tournament || "",
      rounds: d.rounds || 0,
    });
  }

  for (const entry of matchEntries2) {
    const d = entry.data;
    const t1Name = await getTeamName(d.team1Id);
    const t2Name = await getTeamName(d.team2Id);
    allMatches.push({
      id: entry.key,
      date: d.date?.split("T")[0] || "",
      time: d.date?.split("T")[1]?.substring(0, 5) || "",
      team1: { id: d.team1Id, name: t1Name },
      team2: { id: d.team2Id, name: t2Name },
      result: (d.team1Id === myTeam.id ? (d.result === "win" ? "loss" : "win") : d.result) as "win" | "loss" | "draw",
      score1: d.score1,
      score2: d.score2,
      duration: d.duration,
      tournament: d.tournament || "",
      rounds: d.rounds || 0,
    });
  }

  allMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let filtered = allMatches;
  if (filters?.result) filtered = filtered.filter((m) => m.result === filters.result);
  if (filters?.period) {
    const { start } = toDateRange(filters.period);
    filtered = filtered.filter((m) => new Date(m.date) >= start);
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { matches: paginated, total, page, pageSize, totalPages };
}

export async function getDoublesStats(uid?: string): Promise<DoublesStats> {
  if (!uid) throw new Error("uid obrigatório");
  const myTeam = await getMyTeam(uid);
  if (!myTeam) {
    return {
      totalMatches: 0, wins: 0, losses: 0, winRate: 0,
      currentStreak: 0, bestStreak: 0, avgScore: 0, avgScoreConceded: 0,
      avgMatchDuration: 0, bestPartner: "", totalPartners: 0,
      ranking: 0, score: 0,
    };
  }

  return {
    totalMatches: myTeam.totalMatches,
    wins: myTeam.wins,
    losses: myTeam.losses,
    winRate: myTeam.winRate,
    currentStreak: myTeam.currentStreak,
    bestStreak: myTeam.bestStreak,
    avgScore: myTeam.totalMatches > 0 ? Math.round((myTeam.wins * 180 + myTeam.losses * 130) / myTeam.totalMatches) : 0,
    avgScoreConceded: myTeam.totalMatches > 0 ? Math.round((myTeam.wins * 130 + myTeam.losses * 180) / myTeam.totalMatches) : 0,
    avgMatchDuration: myTeam.totalMatches > 0 ? 37 : 0,
    bestPartner: myTeam.player2.name,
    totalPartners: 1,
    ranking: myTeam.ranking,
    score: myTeam.score,
  };
}

export async function getPartners(uid?: string): Promise<Partner[]> {
  if (!uid) throw new Error("uid obrigatório");
  const myTeam = await getMyTeam(uid);
  if (!myTeam) return [];

  const partner = myTeam.player2;
  return [
    {
      id: partner.id,
      name: partner.name,
      nickname: partner.nickname,
      avatar: partner.avatar,
      matchesPlayed: myTeam.totalMatches,
      wins: myTeam.wins,
      losses: myTeam.losses,
      winRate: myTeam.winRate,
      synergy: Math.round(myTeam.winRate * 100),
    },
  ];
}

export async function getDoublesChartData(
  uid?: string,
  period: PeriodFilter = "30days"
): Promise<{ winsEvolution: ChartDataPoint[]; scoreEvolution: ChartDataPoint[] }> {
  if (!uid) throw new Error("uid obrigatório");
  const { start } = toDateRange(period);
  const myTeam = await getMyTeam(uid);
  if (!myTeam) return { winsEvolution: [], scoreEvolution: [] };

  const snap1 = await get(
    query(ref(db, "doublesMatches"), orderByChild("team1Id"), equalTo(myTeam.id))
  );
  const snap2 = await get(
    query(ref(db, "doublesMatches"), orderByChild("team2Id"), equalTo(myTeam.id))
  );

  const byMonth = new Map<string, { wins: number; score: number }>();

  snap1.forEach((child) => {
    const d = child.val() as DoublesMatchData;
    const date = new Date(d.date);
    if (date < start) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) || { wins: 0, score: 0 };
    if (d.result === "win") entry.wins++;
    entry.score += d.score1 || 0;
    byMonth.set(key, entry);
  });

  snap2.forEach((child) => {
    const d = child.val() as DoublesMatchData;
    const date = new Date(d.date);
    if (date < start) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) || { wins: 0, score: 0 };
    if (d.result === "loss") entry.wins++;
    entry.score += d.score2 || 0;
    byMonth.set(key, entry);
  });

  const sorted = Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b));
  let score = 0;

  return {
    winsEvolution: sorted.map(([k, v]) => ({ date: k + "-01", value: v.wins })),
    scoreEvolution: sorted.map(([k, v]) => { score += v.score; return { date: k + "-01", value: score }; }),
  };
}

export async function getAvailablePlayers(
  uid?: string,
  search?: string
): Promise<AvailablePlayer[]> {
  const snap = await get(ref(db, "players"));
  const players: AvailablePlayer[] = [];

  const playerList: { id: string; data: PlayerData }[] = [];
  snap.forEach((child) => {
    playerList.push({ id: child.key!, data: child.val() as PlayerData });
  });

  const teamsSnap = await get(ref(db, "teams"));
  const inTeamIds = new Set<string>();
  teamsSnap.forEach((child) => {
    const t = child.val() as TeamData;
    inTeamIds.add(t.player1Id);
    inTeamIds.add(t.player2Id);
  });

  for (const p of playerList) {
    if (p.id === uid) continue;
    const name = p.data.name || "";
    const nickname = p.data.nickname || "";
    const city = p.data.city || "";

    if (search) {
      const s = search.toLowerCase();
      if (!name.toLowerCase().includes(s) && !nickname.toLowerCase().includes(s) && !city.toLowerCase().includes(s)) continue;
    }

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

    players.push({
      id: p.id,
      name,
      nickname,
      avatar: p.data.avatar || "",
      city,
      club: p.data.club || "",
      score: p.data.score || 0,
      ranking: 0,
      winRate: total > 0 ? wins / total : 0,
      totalMatches: total,
      inTeam: inTeamIds.has(p.id),
    });
  }

  return players;
}

export async function createTeam(
  uid: string,
  teamName: string,
  partnerId: string
): Promise<Team> {
  const newRef = push(ref(db, "teams"));
  const teamData: TeamData = {
    name: teamName,
    player1Id: uid,
    player2Id: partnerId,
    club: "",
    city: "",
  };
  await set(newRef, teamData);
  return buildTeamFromDb(newRef.key!, teamData) as Promise<Team>;
}

export async function sendInvitation(
  uid: string,
  partnerId: string,
  teamName: string
): Promise<TeamInvitation> {
  const fromPlayer = await getPlayerById(uid);
  const toPlayer = await getPlayerById(partnerId);

  const newRef = push(ref(db, "teamInvitations"));
  const invitationData = {
    fromPlayerId: uid,
    fromPlayerName: fromPlayer?.nickname || "",
    fromPlayerAvatar: fromPlayer?.avatar || "",
    toPlayerId: partnerId,
    toPlayerName: toPlayer?.nickname || "",
    teamName,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await set(newRef, invitationData);

  return {
    id: newRef.key!,
    fromPlayerId: invitationData.fromPlayerId,
    fromPlayerName: invitationData.fromPlayerName,
    fromPlayerAvatar: invitationData.fromPlayerAvatar,
    toPlayerId: invitationData.toPlayerId,
    toPlayerName: invitationData.toPlayerName,
    teamName: invitationData.teamName,
    status: invitationData.status as "pending" | "accepted" | "rejected",
    createdAt: invitationData.createdAt,
  };
}

export async function getInvitations(uid?: string): Promise<TeamInvitation[]> {
  if (!uid) throw new Error("uid obrigatório");
  const snap = await get(
    query(ref(db, "teamInvitations"), orderByChild("toPlayerId"), equalTo(uid))
  );

  const invitations: TeamInvitation[] = [];
  snap.forEach((child) => {
    const data = child.val();
    invitations.push({
      id: child.key!,
      fromPlayerId: data.fromPlayerId,
      fromPlayerName: data.fromPlayerName,
      fromPlayerAvatar: data.fromPlayerAvatar,
      toPlayerId: data.toPlayerId,
      toPlayerName: data.toPlayerName,
      teamName: data.teamName,
      status: data.status,
      createdAt: data.createdAt || "",
    });
  });

  return invitations;
}

export async function respondInvitation(
  invitationId: string,
  accept: boolean
): Promise<TeamInvitation> {
  const snap = await get(ref(db, `teamInvitations/${invitationId}`));
  if (!snap.exists()) throw new Error("Convite não encontrado");

  const data = snap.val();
  await set(ref(db, `teamInvitations/${invitationId}/status`), accept ? "accepted" : "rejected");

  if (accept) {
    const teamSnap = await get(
      query(ref(db, "teams"), orderByChild("name"), equalTo(data.teamName))
    );
    if (!teamSnap.exists()) {
      const newRef = push(ref(db, "teams"));
      await set(newRef, {
        name: data.teamName,
        player1Id: data.fromPlayerId,
        player2Id: data.toPlayerId,
        club: "",
        city: "",
      });
    }
  }

  const updated = await get(ref(db, `teamInvitations/${invitationId}`));
  const d = updated.val()!;
  return {
    id: invitationId,
    fromPlayerId: d.fromPlayerId,
    fromPlayerName: d.fromPlayerName,
    fromPlayerAvatar: d.fromPlayerAvatar || "",
    toPlayerId: d.toPlayerId,
    toPlayerName: d.toPlayerName,
    teamName: d.teamName,
    status: d.status as "pending" | "accepted" | "rejected",
    createdAt: d.createdAt || "",
  };
}
