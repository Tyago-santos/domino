import { isDouble } from "./deck";
import type { BoardSide, DominoBoard, DominoMove, DominoPlayerState, DominoSeat, DominoTile } from "./types";

/** Total pips left in a hand. */
export function computeHandPipSum(hand: DominoTile[]): number {
  return hand.reduce((sum, tile) => sum + tile.left + tile.right, 0);
}

/** Every tile in hand paired with the end it could be attached to. */
export function getValidMoves(hand: DominoTile[], board: DominoBoard): DominoMove[] {
  if (board.chain.length === 0) {
    // Empty table: any tile may open the hand; "left" is the arbitrary convention.
    return hand.map((tile) => ({ tile, side: "left" as BoardSide }));
  }

  const moves: DominoMove[] = [];
  for (const tile of hand) {
    if (board.leftEnd !== null && (tile.left === board.leftEnd || tile.right === board.leftEnd)) {
      moves.push({ tile, side: "left" });
    }
    if (board.rightEnd !== null && (tile.left === board.rightEnd || tile.right === board.rightEnd)) {
      moves.push({ tile, side: "right" });
    }
  }
  return moves;
}

export function canPlay(hand: DominoTile[], board: DominoBoard): boolean {
  return getValidMoves(hand, board).length > 0;
}

/**
 * Seat that opens the first hand of a match: highest double, else highest
 * pip sum, else the lowest seat number as a deterministic last resort.
 */
export function firstSeatToOpen(players: DominoPlayerState[]): DominoSeat {
  let bestDouble: { seat: DominoSeat; value: number } | null = null;
  let bestSum: { seat: DominoSeat; value: number } | null = null;

  for (const player of players) {
    for (const tile of player.hand) {
      if (isDouble(tile) && (!bestDouble || tile.left > bestDouble.value)) {
        bestDouble = { seat: player.seat, value: tile.left };
      }
      const sum = tile.left + tile.right;
      if (!bestSum || sum > bestSum.value || (sum === bestSum.value && player.seat < bestSum.seat)) {
        bestSum = { seat: player.seat, value: sum };
      }
    }
  }

  if (bestDouble) return bestDouble.seat;
  if (bestSum) return bestSum.seat;
  // Unreachable with a real deal (hands are never empty), but keep it total.
  return players[0]?.seat ?? 0;
}
