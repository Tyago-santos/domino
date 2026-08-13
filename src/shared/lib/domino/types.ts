/**
 * Domino engine types — generic double-six engine, block-dominoes rules.
 *
 * Supports 2 or 4 players, individual or fixed-team play, and a configurable
 * target score. There is no boneyard: a stuck player just passes. Scoring is
 * the classic rule: whoever empties their hand (or holds the fewest pips on
 * a blocked table) collects the pips left in every other unit's hand.
 */

/** Value on one half of a tile: 0 through 6. */
export type Pip = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DominoTile {
  /** Stable id shaped `${low}-${high}`, e.g. "3-6". */
  id: string;
  left: Pip;
  right: Pip;
}

/** Open end of the table where a tile is attached. */
export type BoardSide = "left" | "right";

export interface PlacedTile {
  tile: DominoTile;
  /** Value facing left once the tile has been flipped to match the chain. */
  leftValue: Pip;
  /** Value facing right once the tile has been flipped to match the chain. */
  rightValue: Pip;
}

export interface DominoBoard {
  /** Tiles in table order, from the left open end to the right one. */
  chain: PlacedTile[];
  /** Open pip on the left end; null while the table is empty. */
  leftEnd: Pip | null;
  /** Open pip on the right end; null while the table is empty. */
  rightEnd: Pip | null;
}

/** Seats in clockwise order. Only seats `0..players-1` are ever occupied. */
export type DominoSeat = 0 | 1 | 2 | 3;

export type DominoPlayerCount = 2 | 4;

/** INDIVIDUAL: every seat scores for itself. TEAMS: seats 0/2 and 1/3 are partners. */
export type DominoGameMode = "INDIVIDUAL" | "TEAMS";

export interface DominoGameConfig {
  players: DominoPlayerCount;
  mode: DominoGameMode;
  /** Points needed to win the match. */
  targetScore: number;
}

/**
 * A scoring unit: one player (INDIVIDUAL) or one partnership (TEAMS).
 * "A"/"B" in TEAMS mode; the seat number as a string in INDIVIDUAL mode.
 */
export type DominoUnitId = string;

export interface DominoUnit {
  id: DominoUnitId;
  seats: DominoSeat[];
}

export interface DominoPlayerState {
  seat: DominoSeat;
  /** Matches `MatchPlayer.id`. */
  playerId: string;
  hand: DominoTile[];
}

export interface DominoMove {
  tile: DominoTile;
  side: BoardSide;
}

export type DominoMoveRecord =
  | { seat: DominoSeat; type: "play"; tileId: string; side: BoardSide }
  | { seat: DominoSeat; type: "pass" };

export type HandPhase = "playing" | "finished";

export interface HandResult {
  /** Unit that won the hand; null when the hand was voided by a tie. */
  winningUnit: DominoUnitId | null;
  /** Seat that went out; null on a blocked or voided hand. */
  winningSeat: DominoSeat | null;
  /** True when the table blocked before anyone went out. */
  wasBlocked: boolean;
  points: number;
  /** Pips left in each unit's hands when the hand ended. */
  pipSum: Record<DominoUnitId, number>;
  /** True when the table blocked with every unit level: hand is voided and redealt. */
  isDraw: boolean;
  /** Who opens the next hand: the winner, or the same opener when the hand was voided. */
  nextStartingSeat: DominoSeat;
}

export interface DominoHandState {
  /** 1-based, incremented for every new hand of the same match. */
  handNumber: number;
  phase: HandPhase;
  players: DominoPlayerState[];
  board: DominoBoard;
  /** Seat that opened this hand. */
  startingSeat: DominoSeat;
  currentTurn: DominoSeat;
  /** Consecutive passes; reaching `players` means the table is blocked. */
  passStreak: number;
  moves: DominoMoveRecord[];
  /** Set once `phase === "finished"`. */
  result: HandResult | null;
}

export type GamePhase = "playing" | "finished";

export interface DominoGameResult {
  winningUnit: DominoUnitId;
  /** Seats belonging to the winning unit — a single seat in INDIVIDUAL mode. */
  winningSeats: DominoSeat[];
  score: Record<DominoUnitId, number>;
  /** True when every other unit finished on zero points ("buchuda"). */
  shutout: boolean;
}

export interface DominoGameState {
  config: DominoGameConfig;
  phase: GamePhase;
  score: Record<DominoUnitId, number>;
  /** Seat order: index is the seat, value is the playerId. Length matches `config.players`. */
  seating: string[];
  hand: DominoHandState;
  /** Results of every finished hand, in order. */
  handHistory: HandResult[];
  /** Set once `phase === "finished"`. */
  result: DominoGameResult | null;
}

/** Stable codes so the UI can localize rule errors without parsing messages. */
export type DominoRuleErrorCode =
  | "MATCH_OVER"
  | "HAND_OVER"
  | "HAND_IN_PROGRESS"
  | "NOT_YOUR_TURN"
  | "TILE_NOT_IN_HAND"
  | "TILE_DOES_NOT_FIT"
  | "MUST_PLAY"
  | "INVALID_SEATING"
  | "INVALID_CONFIG"
  | "INVALID_DECK";

/** Rule violation: playing out of turn, a tile that does not fit, passing with a legal move, etc. */
export class DominoRuleError extends Error {
  readonly code: DominoRuleErrorCode;

  constructor(code: DominoRuleErrorCode, message: string) {
    super(message);
    this.name = "DominoRuleError";
    this.code = code;
  }
}
