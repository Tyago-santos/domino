import { DominoRuleError, type DominoPlayerCount, type DominoTile, type Pip } from "./types";

export const PIPS: Pip[] = [0, 1, 2, 3, 4, 5, 6];

/** Tiles in a double-six set: 7 doubles plus 21 combinations. */
export const DECK_SIZE = 28;
export const HAND_SIZE = 7;

export function tileId(left: Pip, right: Pip): string {
  return left <= right ? `${left}-${right}` : `${right}-${left}`;
}

export function isDouble(tile: DominoTile): boolean {
  return tile.left === tile.right;
}

/** Full set, always in the same canonical order (0-0, 0-1, ... 6-6). */
export function createDeck(): DominoTile[] {
  const deck: DominoTile[] = [];
  for (const left of PIPS) {
    for (const right of PIPS) {
      if (right < left) continue;
      deck.push({ id: tileId(left, right), left, right });
    }
  }
  if (deck.length !== DECK_SIZE) {
    throw new DominoRuleError(
      "INVALID_DECK",
      `Invalid deck: built ${deck.length} tiles, expected ${DECK_SIZE}.`
    );
  }
  return deck;
}

/** Fisher-Yates. `rng` is injectable so the sanity script can replay games. */
export function shuffleDeck(
  deck: DominoTile[],
  rng: () => number = Math.random
): DominoTile[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = shuffled[i]!;
    const b = shuffled[j]!;
    shuffled[i] = b;
    shuffled[j] = a;
  }
  return shuffled;
}

/**
 * Deals seven tiles to each seat (block dominoes — no boneyard). With 4
 * players the whole set is consumed (4 x 7 = 28); with 2 players, 14 tiles
 * are simply never dealt and stay out of the game entirely.
 */
export function dealHands(deck: DominoTile[], players: DominoPlayerCount): DominoTile[][] {
  if (deck.length !== DECK_SIZE) {
    throw new DominoRuleError(
      "INVALID_DECK",
      `Dealing requires ${DECK_SIZE} tiles, got ${deck.length}.`
    );
  }
  return Array.from({ length: players }, (_, seat) => deck.slice(seat * HAND_SIZE, (seat + 1) * HAND_SIZE));
}
