export interface Player {
  id: string;
  name: string;
  nickname: string;
  avatar?: string;
  city: string;
  state: string;
  club: string;
  category: string;
  bio?: string;
  registrationDate: string;
  ranking: number;
  score: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  avgMatchDuration: number;
}

export interface Match {
  id: string;
  date: string;
  time: string;
  opponent: string;
  opponentAvatar?: string;
  partner: string;
  partnerAvatar?: string;
  result: 'win' | 'loss' | 'draw';
  score: number;
  scoreConceded: number;
  duration: number;
  tournament?: string;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  participants: number;
  maxParticipants: number;
  prize?: string;
  regulation?: string;
}

export interface RankingEntry {
  position: number;
  playerId: string;
  playerName: string;
  avatar?: string;
  city: string;
  club: string;
  score: number;
  winRate: number;
  wins: number;
  losses: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  date?: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

export interface Stats {
  ranking: number;
  score: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  avgScore: number;
  avgScoreConceded: number;
  avgMatchDuration: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export type MatchResult = 'win' | 'loss' | 'draw';
export type Theme = 'light' | 'dark';
export type PeriodFilter = 'today' | '7days' | '30days' | '90days' | 'year' | 'custom';

export interface Team {
  id: string;
  name: string;
  player1: Player;
  player2: Player;
  avatar?: string;
  score: number;
  ranking: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  club: string;
  city: string;
}

export interface DoublesMatch {
  id: string;
  date: string;
  time: string;
  team1: { id: string; name: string; avatar?: string };
  team2: { id: string; name: string; avatar?: string };
  result: 'win' | 'loss' | 'draw';
  score1: number;
  score2: number;
  duration: number;
  tournament?: string;
  rounds?: number;
}

export interface DoublesStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  avgScore: number;
  avgScoreConceded: number;
  avgMatchDuration: number;
  bestPartner: string;
  totalPartners: number;
  ranking: number;
  score: number;
}

export interface Partner {
  id: string;
  name: string;
  nickname: string;
  avatar?: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  synergy: number;
}

export interface TeamInvitation {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  fromPlayerAvatar?: string;
  toPlayerId: string;
  toPlayerName: string;
  teamName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface AvailablePlayer {
  id: string;
  name: string;
  nickname: string;
  avatar?: string;
  city: string;
  club: string;
  score: number;
  ranking: number;
  winRate: number;
  totalMatches: number;
  inTeam: boolean;
}

export type MatchMode = 'individual' | 'doubles';
export type GameMatchStatus = 'waiting' | 'in_progress' | 'finished';
export type PlayerCount = 2 | 3 | 4;

export interface MatchPlayer {
  id: string;
  name: string;
  nickname: string;
  avatar?: string;
  category: string;
  score: number;
}

export interface GameMatch {
  id: string;
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

export interface MatchConfirmation {
  matchId: string;
  playerId: string;
  confirmedAt: string;
}
