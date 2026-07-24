import {
  ref,
  set,
  get,
  push,
} from "firebase/database";
import { db } from "./firestore";

export async function seedDatabase(): Promise<boolean> {
  const playersSnap = await get(ref(db, "players"));
  if (playersSnap.exists()) return false;

  const playerIds = [
    "seed-player-001", "seed-player-002", "seed-player-003", "seed-player-004",
    "seed-player-005", "seed-player-006", "seed-player-007", "seed-player-008",
    "seed-player-009", "seed-player-010", "seed-player-011", "seed-player-012",
    "seed-player-013", "seed-player-014", "seed-player-015",
  ];

  const playersData = [
    { name: "Carlos Eduardo", nickname: "Carlinhos", city: "São Paulo", state: "SP", club: "Domino SP", category: "Profissional", bio: "Jogador profissional há 20 anos.", },
    { name: "Roberto Almeida", nickname: "Robertão", city: "Rio de Janeiro", state: "RJ", club: "RJ Domino Club", category: "Profissional", bio: "Especialista em peças duplas.", },
    { name: "João Silva", nickname: "Mão de Ouro", city: "Belo Horizonte", state: "MG", club: "Clube Vittas", category: "Avançado", bio: "Jogador de dominó há mais de 15 anos. Especialista em jogadas estratégicas.", },
    { name: "Fernando Costa", nickname: "Fernandinho", city: "Curitiba", state: "PR", club: "Paraná Domino", category: "Avançado", bio: "Competidor nato, adora torneios.", },
    { name: "Marcos Oliveira", nickname: "Marcão", city: "Porto Alegre", state: "RS", club: "Gaúchos do Domino", category: "Avançado", bio: "Jogador estilo agressivo.", },
    { name: "Pedro Santos", nickname: "Pedrão", city: "Salvador", state: "BA", club: "BA Domino", category: "Intermediário", bio: "Aprendiz rápido, subindo no ranking.", },
    { name: "Lucas Pereira", nickname: "Luquinhas", city: "Brasília", state: "DF", club: "DF Domino Club", category: "Intermediário", bio: "Estrategista de mesa.", },
    { name: "Gabriel Ferreira", nickname: "Gabigol", city: "Fortaleza", state: "CE", club: "CE Domino", category: "Intermediário", bio: "Velocidade e precisão.", },
    { name: "Rafael Lima", nickname: "Rafinha", city: "Recife", state: "PE", club: "PE Domino", category: "Intermediário", bio: "Joga com calma e inteligência.", },
    { name: "Thiago Souza", nickname: "Thiaguinho", city: "Belém", state: "PA", club: "PA Domino", category: "Iniciante", bio: "Começou recentemente, muito dedicado.", },
    { name: "Diego Ribeiro", nickname: "Digão", city: "Manaus", state: "AM", club: "AM Domino", category: "Iniciante", bio: "Representando o norte.", },
    { name: "Bruno Martins", nickname: "Bruninho", city: "Vitória", state: "ES", club: "ES Domino", category: "Iniciante", bio: "Sempre em busca de melhorar.", },
    { name: "André Araújo", nickname: "Dedé", city: "Goiânia", state: "GO", club: "GO Domino", category: "Iniciante", bio: "Amante do dominó desde criança.", },
    { name: "Carlos Mendes", nickname: "Mendes", city: "Belo Horizonte", state: "MG", club: "Clube Vittas", category: "Avançado", bio: "Parceiro de dupla fiel.", },
    { name: "Ana Beatriz", nickname: "Aninha", city: "Belo Horizonte", state: "MG", club: "Clube Vittas", category: "Avançado", bio: "Jogadora competitiva e dedicada.", },
  ];

  const playersUpdates: Record<string, unknown> = {};
  for (let i = 0; i < playerIds.length; i++) {
    const p = playersData[i]!;
    const score = 3200 - i * 80;
    playersUpdates[playerIds[i]!] = {
      uid: playerIds[i],
      name: p.name,
      nickname: p.nickname,
      avatar: "",
      city: p.city,
      state: p.state,
      club: p.club,
      category: p.category,
      bio: p.bio,
      registrationDate: new Date("2023-03-15").toISOString(),
      score,
      createdAt: new Date().toISOString(),
    };
  }
  await set(ref(db, "players"), playersUpdates);

  const opponents = ["Roberto Almeida", "Fernando Costa", "Marcos Oliveira", "Pedro Santos", "Lucas Pereira", "Gabriel Ferreira", "Rafael Lima", "Thiago Souza", "Diego Ribeiro", "Bruno Martins"];
  const partners = ["Carlos Mendes", "Ana Beatriz"];
  const tournaments = ["Circuito Mineiro 2026", "Copa Domino Brasil", "Aberto de Domino BH", "Circuito Nordeste 2026"];
  const myId = "seed-player-003";

  const matchesUpdates: Record<string, unknown> = {};
  for (let i = 0; i < 80; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 180));
    const isWin = Math.random() < 0.65;
    const isDraw = !isWin && Math.random() < 0.05;
    const result = isWin ? "win" : isDraw ? "draw" : "loss";
    const score = isWin ? Math.floor(50 + Math.random() * 50) : Math.floor(20 + Math.random() * 30);
    const scoreConceded = isWin ? Math.floor(10 + Math.random() * 25) : Math.floor(40 + Math.random() * 40);
    const matchId = push(ref(db, "matches")).key!;

    matchesUpdates[matchId] = {
      playerId: myId,
      date: d.toISOString(),
      opponent: opponents[Math.floor(Math.random() * opponents.length)],
      partner: partners[Math.floor(Math.random() * partners.length)],
      result,
      score,
      scoreConceded,
      duration: Math.floor(25 + Math.random() * 25),
      tournament: Math.random() < 0.4 ? tournaments[Math.floor(Math.random() * tournaments.length)] : "",
    };
  }
  await set(ref(db, "matches"), matchesUpdates);

  const tournamentsData: Record<string, unknown> = {};
  const tNames = [
    { name: "Circuito Mineiro de Dominó 2026", date: new Date("2026-08-15"), location: "Centro de Eventos, Belo Horizonte", organizer: "Federação Mineira de Dominó", status: "upcoming", participants: 32, maxParticipants: 64, prize: "R$ 5.000,00", regulation: "Formato suíço, 7 rodadas." },
    { name: "Copa Dominó Brasil 2026", date: new Date("2026-07-25"), location: "Ginásio do Ibirapuera, São Paulo", organizer: "Confederação Brasileira de Dominó", status: "ongoing", participants: 48, maxParticipants: 64, prize: "R$ 15.000,00", regulation: "Eliminatório direto, 6 rodadas." },
    { name: "Aberto de Dominó BH", date: new Date("2026-09-05"), location: "Arena Vittas, Belo Horizonte", organizer: "Clube Vittas", status: "upcoming", participants: 18, maxParticipants: 32, prize: "R$ 2.000,00", regulation: "Liga interna, 5 rodadas." },
    { name: "Circuito Nordeste 2026", date: new Date("2026-07-10"), location: "Centro de Convenções, Salvador", organizer: "Liga Nordestina de Dominó", status: "finished", participants: 64, maxParticipants: 64, prize: "R$ 10.000,00", regulation: "Eliminatório suíço, 8 rodadas." },
    { name: "Grand Prix Dominó Sul 2026", date: new Date("2026-07-30"), location: "Auditório Central, Porto Alegre", organizer: "Associação Gaúcha de Dominó", status: "upcoming", participants: 40, maxParticipants: 48, prize: "R$ 8.000,00", regulation: "Sistema suíço, 6 rodadas." },
  ];
  for (const t of tNames) {
    const id = push(ref(db, "tournaments")).key!;
    tournamentsData[id] = { ...t, date: t.date.toISOString() };
  }
  await set(ref(db, "tournaments"), tournamentsData);

  const achievementsData: Record<string, unknown> = {};
  const aList = [
    { name: "Primeira Vitória", description: "Ganhe sua primeira partida", icon: "Trophy", maxProgress: 1 },
    { name: "Sequência de 5", description: "Ganhe 5 partidas seguidas", icon: "Flame", maxProgress: 5 },
    { name: "100 Partidas", description: "Jogue 100 partidas", icon: "Target", maxProgress: 100 },
    { name: "Mestre do Ranking", description: "Alcance o top 5 do ranking", icon: "Medal", maxProgress: 5 },
    { name: "Jogador Social", description: "Jogue com 10 parceiros diferentes", icon: "Users", maxProgress: 10 },
    { name: "Campeão de Torneio", description: "Vença um torneio", icon: "Crown", maxProgress: 1 },
    { name: "Sequência de 10", description: "Ganhe 10 partidas seguidas", icon: "Flame", maxProgress: 10 },
    { name: "Maratonista", description: "Jogue 500 partidas", icon: "Timer", maxProgress: 500 },
  ];
  for (const a of aList) {
    const id = push(ref(db, "achievements")).key!;
    achievementsData[id] = a;
  }
  await set(ref(db, "achievements"), achievementsData);

  const achievementKeys = Object.keys(achievementsData);
  const myAchievements: Record<string, unknown> = {};
  const paData = [
    { playerId: myId, achievementIndex: 0, achievementId: achievementKeys[0], progress: 1, unlocked: true },
    { playerId: myId, achievementIndex: 1, achievementId: achievementKeys[1], progress: 5, unlocked: true },
    { playerId: myId, achievementIndex: 2, achievementId: achievementKeys[2], progress: 80, unlocked: false },
    { playerId: myId, achievementIndex: 4, achievementId: achievementKeys[4], progress: 3, unlocked: false },
  ];
  for (const ma of paData) {
    const id = push(ref(db, "playerAchievements")).key!;
    myAchievements[id] = {
      playerId: ma.playerId,
      achievementIndex: ma.achievementIndex,
      achievementId: ma.achievementId,
      progress: ma.progress,
      unlocked: ma.unlocked,
      unlockedAt: ma.unlocked ? new Date().toISOString() : null,
    };
  }
  await set(ref(db, "playerAchievements"), myAchievements);

  const teamsUpdates: Record<string, unknown> = {};
  const teamsData = [
    { name: "Dupla Dourada", player1Id: "seed-player-003", player2Id: "seed-player-014", club: "Clube Vittas", city: "Belo Horizonte" },
    { name: "Furacão 2000", player1Id: "seed-player-001", player2Id: "seed-player-005", club: "Domino SP", city: "São Paulo" },
    { name: "Os Imbatíveis", player1Id: "seed-player-002", player2Id: "seed-player-006", club: "RJ Domino Club", city: "Rio de Janeiro" },
    { name: "Relâmpago Azul", player1Id: "seed-player-007", player2Id: "seed-player-008", club: "DF Domino Club", city: "Brasília" },
    { name: "Mistura Certa", player1Id: "seed-player-015", player2Id: "seed-player-009", club: "Clube Vittas", city: "Belo Horizonte" },
  ];
  const teamIds: string[] = [];
  for (const t of teamsData) {
    const id = push(ref(db, "teams")).key!;
    teamsUpdates[id] = t;
    teamIds.push(id);
  }
  await set(ref(db, "teams"), teamsUpdates);

  const dmUpdates: Record<string, unknown> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 180));
    const t1 = teamIds[0];
    const t2 = teamIds[Math.floor(Math.random() * (teamIds.length - 1)) + 1];
    const isWin = Math.random() < 0.6;
    const id = push(ref(db, "doublesMatches")).key!;

    dmUpdates[id] = {
      team1Id: t1,
      team2Id: t2,
      date: d.toISOString(),
      result: isWin ? "win" : "loss",
      score1: isWin ? Math.floor(50 + Math.random() * 50) : Math.floor(20 + Math.random() * 30),
      score2: isWin ? Math.floor(10 + Math.random() * 25) : Math.floor(40 + Math.random() * 40),
      duration: Math.floor(30 + Math.random() * 30),
      tournament: Math.random() < 0.3 ? tournaments[Math.floor(Math.random() * tournaments.length)] : "",
      rounds: Math.floor(3 + Math.random() * 5),
    };
  }
  await set(ref(db, "doublesMatches"), dmUpdates);

  const matchPlayers: { id: string; name: string; nickname: string; category: string; score: number }[] = [
    { id: playerIds[0]!, name: "Carlos Eduardo", nickname: "Carlinhos", category: "Profissional", score: 3200 },
    { id: playerIds[1]!, name: "Roberto Almeida", nickname: "Robertão", category: "Profissional", score: 3120 },
    { id: playerIds[2]!, name: "João Silva", nickname: "Mão de Ouro", category: "Avançado", score: 3040 },
    { id: playerIds[3]!, name: "Fernando Costa", nickname: "Fernandinho", category: "Avançado", score: 2960 },
    { id: playerIds[4]!, name: "Marcos Oliveira", nickname: "Marcão", category: "Avançado", score: 2880 },
    { id: playerIds[5]!, name: "Pedro Santos", nickname: "Pedrão", category: "Intermediário", score: 2800 },
    { id: playerIds[6]!, name: "Lucas Pereira", nickname: "Luquinhas", category: "Intermediário", score: 2720 },
  ];

  const matchUpdates: Record<string, unknown> = {};
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    const isDoubles = Math.random() < 0.4;
    const mode = isDoubles ? "doubles" : "individual";
    const playerCount = isDoubles ? 4 : (Math.random() < 0.5 ? 2 : 3);

    let players: typeof matchPlayers;
    if (playerCount === 2) {
      players = [matchPlayers[0]!, matchPlayers[Math.floor(Math.random() * 6) + 1]!];
    } else if (playerCount === 3) {
      const indices = [0, 1, 2].map((j) => Math.min(j + Math.floor(Math.random() * 2), matchPlayers.length - 1));
      players = indices.map((j) => matchPlayers[j]!);
    } else {
      players = matchPlayers.slice(0, 4);
    }

    const winnerIdx = Math.floor(Math.random() * players.length);
    const winner = players[winnerIdx]!;
    const startedAt = new Date(d);
    startedAt.setMinutes(startedAt.getMinutes() - Math.floor(20 + Math.random() * 40));
    const duration = Math.floor((d.getTime() - startedAt.getTime()) / 1000);

    const matchId = push(ref(db, "matches")).key!;
    const base: Record<string, unknown> = {
      name: i < 3 ? ["Partida amigável", "Rodada rápida", "Duelo fierce"][i] : "",
      mode,
      status: "finished",
      playerCount,
      players,
      startedAt: startedAt.toISOString(),
      endedAt: d.toISOString(),
      duration,
      createdAt: startedAt.toISOString(),
      createdBy: players[0]!.id,
      createdByName: players[0]!.nickname,
    };

    if (mode === "doubles") {
      base.teamA = { name: "Equipe A", playerIds: [players[0]!.id, players[1]!.id] };
      base.teamB = { name: "Equipe B", playerIds: [players[2]!.id, players[3]!.id] };
      base.winningTeam = Math.random() < 0.5 ? "A" : "B";
    } else {
      base.winnerId = winner.id;
    }

    matchUpdates[matchId] = base;
  }
  await set(ref(db, "matches"), matchUpdates);

  return true;
}
