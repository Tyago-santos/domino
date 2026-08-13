import { unitsForConfig, type DominoGameState, type DominoSeat, type DominoUnitId } from "@/shared/lib/domino";
import type { GameMatch } from "@/shared/types";

export interface DominoUnitDisplay {
  id: DominoUnitId;
  name: string;
  seats: DominoSeat[];
}

/** Player nickname (or name) for every occupied seat, keyed by seat number. */
export function nameBySeat(game: DominoGameState, match: GameMatch): Record<number, string> {
  const byId = new Map(match.players.map((player) => [player.id, player.nickname || player.name]));
  return game.seating.reduce<Record<number, string>>((acc, playerId, seat) => {
    acc[seat] = byId.get(playerId) ?? "Jogador";
    return acc;
  }, {});
}

/** One card per scoring unit: a fixed partnership in TEAMS mode, a lone player otherwise. */
export function unitDisplays(game: DominoGameState, match: GameMatch): DominoUnitDisplay[] {
  const names = nameBySeat(game, match);
  return unitsForConfig(game.config).map((unit) => ({
    id: unit.id,
    seats: unit.seats,
    name:
      game.config.mode === "TEAMS"
        ? unit.id === "A"
          ? match.teamA?.name || "Dupla A"
          : match.teamB?.name || "Dupla B"
        : (names[unit.seats[0]!] ?? "Jogador"),
  }));
}
