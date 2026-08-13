import { createDeck, dealHands, shuffleDeck } from "./deck";
import { canPlay, computeHandPipSum, firstSeatToOpen, getValidMoves } from "./rules";
import {
  DominoRuleError,
  type BoardSide,
  type DominoBoard,
  type DominoGameConfig,
  type DominoGameState,
  type DominoHandState,
  type DominoPlayerState,
  type DominoSeat,
  type DominoTile,
  type DominoUnit,
  type DominoUnitId,
  type HandResult,
  type PlacedTile,
  type Pip,
} from "./types";

export const DEFAULT_TARGET_SCORE = 100;

function seatsForConfig(config: DominoGameConfig): DominoSeat[] {
  return Array.from({ length: config.players }, (_, i) => i as DominoSeat);
}

/** The scoring units for this config: two partnerships, or one per seat. */
export function unitsForConfig(config: DominoGameConfig): DominoUnit[] {
  const seats = seatsForConfig(config);
  if (config.mode === "TEAMS") {
    return [
      { id: "A", seats: seats.filter((s) => s % 2 === 0) },
      { id: "B", seats: seats.filter((s) => s % 2 === 1) },
    ];
  }
  return seats.map((seat) => ({ id: String(seat), seats: [seat] }));
}

/** Seats 0/2 form team A and 1/3 form team B in TEAMS mode; every seat is its own unit otherwise. */
export function unitOfSeat(seat: DominoSeat, config: DominoGameConfig): DominoUnitId {
  return config.mode === "TEAMS" ? (seat % 2 === 0 ? "A" : "B") : String(seat);
}

export function nextSeat(seat: DominoSeat, config: DominoGameConfig): DominoSeat {
  return ((seat + 1) % config.players) as DominoSeat;
}

const emptyBoard = (): DominoBoard => ({ chain: [], leftEnd: null, rightEnd: null });

function playerAt(hand: DominoHandState, seat: DominoSeat): DominoPlayerState {
  const player = hand.players.find((p) => p.seat === seat);
  if (!player) {
    throw new DominoRuleError("INVALID_SEATING", `Seat ${seat} is not part of this hand.`);
  }
  return player;
}

function unitPipSums(
  players: DominoPlayerState[],
  config: DominoGameConfig
): Record<DominoUnitId, number> {
  const sums: Record<DominoUnitId, number> = {};
  for (const unit of unitsForConfig(config)) sums[unit.id] = 0;
  for (const player of players) {
    const unit = unitOfSeat(player.seat, config);
    sums[unit] = (sums[unit] ?? 0) + computeHandPipSum(player.hand);
  }
  return sums;
}

/** Sum of every other unit's pips — what the given unit collects for winning the hand. */
function pipsOwedTo(winningUnit: DominoUnitId, pipSum: Record<DominoUnitId, number>): number {
  return Object.entries(pipSum).reduce(
    (sum, [unit, value]) => (unit === winningUnit ? sum : sum + value),
    0
  );
}

function dealNewHand(
  handNumber: number,
  seating: string[],
  config: DominoGameConfig,
  startingSeat: DominoSeat | null,
  rng: () => number
): DominoHandState {
  // Block dominoes: with 2 players, 14 of the 28 tiles simply never enter play.
  const hands = dealHands(shuffleDeck(createDeck(), rng), config.players);
  const players: DominoPlayerState[] = seatsForConfig(config).map((seat) => ({
    seat,
    playerId: seating[seat]!,
    hand: hands[seat]!,
  }));

  const opener = startingSeat ?? firstSeatToOpen(players);

  return {
    handNumber,
    phase: "playing",
    players,
    board: emptyBoard(),
    startingSeat: opener,
    currentTurn: opener,
    passStreak: 0,
    moves: [],
    result: null,
  };
}

export function createGame(params: {
  /** playerIds in seat order — length must match `config.players`; TEAMS alternates A/B/A/B. */
  seating: string[];
  config: DominoGameConfig;
  rng?: () => number;
}): DominoGameState {
  const { seating, config, rng = Math.random } = params;

  if (config.mode === "TEAMS" && config.players !== 4) {
    throw new DominoRuleError("INVALID_CONFIG", "Teams play requires exactly 4 players.");
  }
  if (seating.length !== config.players || new Set(seating).size !== config.players) {
    throw new DominoRuleError("INVALID_SEATING", `A table needs ${config.players} distinct players.`);
  }

  const score: Record<DominoUnitId, number> = {};
  for (const unit of unitsForConfig(config)) score[unit.id] = 0;

  return {
    config,
    phase: "playing",
    score,
    seating,
    hand: dealNewHand(1, seating, config, null, rng),
    handHistory: [],
    result: null,
  };
}

/** Attaches the tile to the chosen end, flipping it to match the open pip. */
function placeTile(board: DominoBoard, tile: DominoTile, side: BoardSide): DominoBoard {
  if (board.chain.length === 0) {
    const placed: PlacedTile = { tile, leftValue: tile.left, rightValue: tile.right };
    return { chain: [placed], leftEnd: tile.left, rightEnd: tile.right };
  }

  if (side === "left") {
    const end = board.leftEnd as Pip;
    if (tile.left !== end && tile.right !== end) {
      throw new DominoRuleError(
        "TILE_DOES_NOT_FIT",
        `Tile ${tile.id} does not fit the left end (${end}).`
      );
    }
    // The half matching the open end faces the chain; the other half becomes the new end.
    const outer: Pip = tile.left === end ? tile.right : tile.left;
    const placed: PlacedTile = { tile, leftValue: outer, rightValue: end };
    return { chain: [placed, ...board.chain], leftEnd: outer, rightEnd: board.rightEnd };
  }

  const end = board.rightEnd as Pip;
  if (tile.left !== end && tile.right !== end) {
    throw new DominoRuleError(
      "TILE_DOES_NOT_FIT",
      `Tile ${tile.id} does not fit the right end (${end}).`
    );
  }
  const outer: Pip = tile.left === end ? tile.right : tile.left;
  const placed: PlacedTile = { tile, leftValue: end, rightValue: outer };
  return { chain: [...board.chain, placed], leftEnd: board.leftEnd, rightEnd: outer };
}

/** Applies a hand result to the score and decides whether the match is over. */
function closeHand(
  state: DominoGameState,
  hand: DominoHandState,
  result: HandResult
): DominoGameState {
  const score = { ...state.score };
  if (result.winningUnit) {
    score[result.winningUnit] = (score[result.winningUnit] ?? 0) + result.points;
  }

  const finishedHand: DominoHandState = { ...hand, phase: "finished", result };
  const handHistory = [...state.handHistory, result];

  const winningUnit =
    Object.entries(score).find(([, points]) => points >= state.config.targetScore)?.[0] ?? null;

  if (!winningUnit) {
    return { ...state, score, hand: finishedHand, handHistory };
  }

  const winningSeats = unitsForConfig(state.config).find((u) => u.id === winningUnit)!.seats;
  const shutout = Object.entries(score).every(([id, points]) => id === winningUnit || points === 0);

  return {
    ...state,
    phase: "finished",
    score,
    hand: finishedHand,
    handHistory,
    result: { winningUnit, winningSeats, score, shutout },
  };
}

export function playTile(
  state: DominoGameState,
  seat: DominoSeat,
  tileId: string,
  side: BoardSide
): DominoGameState {
  if (state.phase === "finished") {
    throw new DominoRuleError("MATCH_OVER", "This match is already over.");
  }
  const hand = state.hand;
  if (hand.phase === "finished") {
    throw new DominoRuleError("HAND_OVER", "This hand is over. Start the next one.");
  }
  if (hand.currentTurn !== seat) {
    throw new DominoRuleError("NOT_YOUR_TURN", "It is not your turn.");
  }

  const player = playerAt(hand, seat);
  const tile = player.hand.find((t) => t.id === tileId);
  if (!tile) {
    throw new DominoRuleError("TILE_NOT_IN_HAND", `Tile ${tileId} is not in your hand.`);
  }

  const boardBeforePlay = hand.board;
  const board = placeTile(boardBeforePlay, tile, side);
  const remaining = player.hand.filter((t) => t.id !== tileId);

  const players = hand.players.map((p) => (p.seat === seat ? { ...p, hand: remaining } : p));
  const moves = [...hand.moves, { seat, type: "play" as const, tileId, side }];

  // Went out: no tiles left.
  if (remaining.length === 0) {
    const pipSum = unitPipSums(players, state.config);
    const winningUnit = unitOfSeat(seat, state.config);
    const result: HandResult = {
      winningUnit,
      winningSeat: seat,
      wasBlocked: false,
      points: pipsOwedTo(winningUnit, pipSum),
      pipSum,
      isDraw: false,
      nextStartingSeat: seat,
    };
    return closeHand(state, { ...hand, players, board, moves }, result);
  }

  return {
    ...state,
    hand: {
      ...hand,
      players,
      board,
      moves,
      passStreak: 0,
      currentTurn: nextSeat(seat, state.config),
    },
  };
}

export function isBlocked(hand: DominoHandState, config: DominoGameConfig): boolean {
  return hand.passStreak >= config.players;
}

/**
 * Blocked table: the unit with the fewest pips left takes the hand, collecting
 * every other unit's remaining pips. A tie across the lowest units voids the
 * hand — nobody scores and the tiles are redealt.
 */
export function resolveBlockedHand(hand: DominoHandState, config: DominoGameConfig): HandResult {
  const pipSum = unitPipSums(hand.players, config);
  const entries = Object.entries(pipSum);
  const lowest = Math.min(...entries.map(([, value]) => value));
  const lightestUnits = entries.filter(([, value]) => value === lowest).map(([id]) => id);

  if (lightestUnits.length !== 1) {
    return {
      winningUnit: null,
      winningSeat: null,
      wasBlocked: true,
      points: 0,
      pipSum,
      isDraw: true,
      // Voided hand: whoever was due to open still opens.
      nextStartingSeat: hand.startingSeat,
    };
  }

  const winningUnit = lightestUnits[0]!;
  // The winning unit's lightest hand opens the next one.
  const lightestSeat = hand.players
    .filter((player) => unitOfSeat(player.seat, config) === winningUnit)
    .sort((a, b) => computeHandPipSum(a.hand) - computeHandPipSum(b.hand))[0];

  return {
    winningUnit,
    winningSeat: null,
    wasBlocked: true,
    points: pipsOwedTo(winningUnit, pipSum),
    pipSum,
    isDraw: false,
    nextStartingSeat: lightestSeat?.seat ?? hand.startingSeat,
  };
}

export function passTurn(state: DominoGameState, seat: DominoSeat): DominoGameState {
  if (state.phase === "finished") {
    throw new DominoRuleError("MATCH_OVER", "This match is already over.");
  }
  const hand = state.hand;
  if (hand.phase === "finished") {
    throw new DominoRuleError("HAND_OVER", "This hand is over. Start the next one.");
  }
  if (hand.currentTurn !== seat) {
    throw new DominoRuleError("NOT_YOUR_TURN", "It is not your turn.");
  }

  const player = playerAt(hand, seat);
  if (canPlay(player.hand, hand.board)) {
    throw new DominoRuleError("MUST_PLAY", "You have a legal move — you cannot pass.");
  }

  const passed: DominoHandState = {
    ...hand,
    passStreak: hand.passStreak + 1,
    moves: [...hand.moves, { seat, type: "pass" as const }],
    currentTurn: nextSeat(seat, state.config),
  };

  if (isBlocked(passed, state.config)) {
    return closeHand(state, passed, resolveBlockedHand(passed, state.config));
  }
  return { ...state, hand: passed };
}

/** Deals the next hand, keeping the score. Used after a win or a voided hand. */
export function startNextHand(
  state: DominoGameState,
  rng: () => number = Math.random
): DominoGameState {
  if (state.phase === "finished") {
    throw new DominoRuleError("MATCH_OVER", "This match is already over.");
  }
  if (state.hand.phase !== "finished") {
    throw new DominoRuleError("HAND_IN_PROGRESS", "The current hand is still running.");
  }

  const startingSeat = state.hand.result?.nextStartingSeat ?? state.hand.startingSeat;
  return {
    ...state,
    hand: dealNewHand(state.hand.handNumber + 1, state.seating, state.config, startingSeat, rng),
  };
}

/** Legal moves for a seat in the current hand; empty when it is not that seat's turn. */
export function validMovesForSeat(state: DominoGameState, seat: DominoSeat) {
  const hand = state.hand;
  if (hand.phase === "finished" || hand.currentTurn !== seat) return [];
  return getValidMoves(playerAt(hand, seat).hand, hand.board);
}

/** True once a stuck seat has no legal move left and may pass. */
export function canPassNow(state: DominoGameState, seat: DominoSeat): boolean {
  const hand = state.hand;
  if (hand.phase === "finished" || hand.currentTurn !== seat) return false;
  const player = playerAt(hand, seat);
  return !canPlay(player.hand, hand.board);
}

export function seatOfPlayer(state: DominoGameState, playerId: string): DominoSeat | null {
  const index = state.seating.indexOf(playerId);
  return index === -1 ? null : (index as DominoSeat);
}

export function handOfSeat(state: DominoGameState, seat: DominoSeat): DominoTile[] {
  return playerAt(state.hand, seat).hand;
}
