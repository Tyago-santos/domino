import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import * as dominoService from "@/shared/services/dominoGameService";
import {
  canPassNow,
  createGame,
  DEFAULT_TARGET_SCORE,
  DominoRuleError,
  getValidMoves,
  passTurn,
  playTile,
  seatOfPlayer,
  startNextHand,
  unitOfSeat,
  type BoardSide,
  type DominoGameConfig,
  type DominoGameState,
  type DominoRuleErrorCode,
  type DominoSeat,
  type DominoUnitId,
} from "@/shared/lib/domino";
import type { GameMatch } from "@/shared/types";

/** Rule errors carry a stable code; the player-facing wording lives here. */
const RULE_ERROR_MESSAGES: Record<DominoRuleErrorCode, string> = {
  MATCH_OVER: "Esta partida já terminou.",
  HAND_OVER: "Esta mão já terminou. Inicie a próxima.",
  HAND_IN_PROGRESS: "A mão atual ainda está em andamento.",
  NOT_YOUR_TURN: "Não é a sua vez de jogar.",
  TILE_NOT_IN_HAND: "Você não tem essa pedra.",
  TILE_DOES_NOT_FIT: "Essa pedra não encaixa nessa ponta.",
  MUST_PLAY: "Você tem uma jogada válida — não pode passar.",
  INVALID_SEATING: "A mesa não tem o número certo de jogadores.",
  INVALID_CONFIG: "Configuração de partida inválida para o dominó.",
  INVALID_DECK: "Baralho inválido.",
};

function describeError(error: unknown): string {
  if (error instanceof DominoRuleError) return RULE_ERROR_MESSAGES[error.code];
  return "Não foi possível completar a jogada. Tente de novo.";
}

/**
 * Doubles alternates teams around the table (A, B, A, B) so partners sit
 * across from each other. Individual play just seats everyone in the order
 * they were added to the match.
 */
export function buildSeating(match: GameMatch): string[] | null {
  if (match.mode === "doubles") {
    const [a1, a2] = match.teamA?.playerIds ?? [];
    const [b1, b2] = match.teamB?.playerIds ?? [];
    if (!a1 || !a2 || !b1 || !b2) return null;
    return [a1, b1, a2, b2];
  }
  const ids = match.players.map((p) => p.id);
  return ids.length === match.playerCount ? ids : null;
}

function buildConfig(match: GameMatch): DominoGameConfig | null {
  if (match.playerCount !== 2 && match.playerCount !== 4) return null;
  if (match.mode === "doubles" && match.playerCount !== 4) return null;
  return {
    players: match.playerCount,
    mode: match.mode === "doubles" ? "TEAMS" : "INDIVIDUAL",
    targetScore: DEFAULT_TARGET_SCORE,
  };
}

export function useDominoGame(match: GameMatch | null | undefined) {
  const { user } = useAuth();
  const [game, setGame] = useState<DominoGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const dealingRef = useRef(false);

  const matchId = match?.id ?? null;
  const seating = useMemo(() => (match ? buildSeating(match) : null), [match]);
  const config = useMemo(() => (match ? buildConfig(match) : null), [match]);

  /** The engine drives 2- and 4-player tables, individual or in fixed pairs. */
  const isSupported = Boolean(match && config && seating);

  useEffect(() => {
    if (!matchId || !isSupported) {
      setGame(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = dominoService.subscribeGame(matchId, (state) => {
      setGame(state);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [matchId, isSupported]);

  /** First player to open the running match deals the tiles for everyone. */
  useEffect(() => {
    if (!matchId || !isSupported || !seating || !config) return;
    if (isLoading || game || dealingRef.current) return;
    if (match?.status !== "in_progress") return;

    dealingRef.current = true;
    dominoService
      .initGame(matchId, createGame({ seating, config }))
      .catch(() => toast.error("Não foi possível distribuir as pedras."))
      .finally(() => {
        dealingRef.current = false;
      });
  }, [matchId, isSupported, seating, config, isLoading, game, match?.status]);

  const mySeat: DominoSeat | null = useMemo(() => {
    if (!game || !user?.uid) return null;
    return seatOfPlayer(game, user.uid);
  }, [game, user?.uid]);

  const myUnit: DominoUnitId | null = useMemo(() => {
    if (!game || mySeat === null) return null;
    return unitOfSeat(mySeat, game.config);
  }, [game, mySeat]);

  const myHand = useMemo(() => {
    if (!game || mySeat === null) return [];
    return game.hand.players.find((player) => player.seat === mySeat)?.hand ?? [];
  }, [game, mySeat]);

  const isMyTurn = Boolean(
    game && game.phase === "playing" && game.hand.phase === "playing" && game.hand.currentTurn === mySeat
  );

  /** Legal moves for the local player, regardless of whose turn it is, so the
   *  hand can dim unplayable tiles even while waiting. */
  const validMoves = useMemo(() => {
    if (!game || mySeat === null) return [];
    return getValidMoves(myHand, game.hand.board);
  }, [game, mySeat, myHand]);

  const playableTileIds = useMemo(
    () => new Set(validMoves.map((move) => move.tile.id)),
    [validMoves]
  );

  const canPass = Boolean(game && mySeat !== null && canPassNow(game, mySeat));

  const run = useCallback(
    async (mutate: (state: DominoGameState) => DominoGameState) => {
      if (!matchId) return;
      setIsBusy(true);
      try {
        const next = await dominoService.applyMove(matchId, mutate);
        setGame(next);
      } catch (error) {
        toast.error(describeError(error));
      } finally {
        setIsBusy(false);
      }
    },
    [matchId]
  );

  const play = useCallback(
    (tileId: string, side: BoardSide) => {
      if (mySeat === null) return;
      return run((state) => playTile(state, mySeat, tileId, side));
    },
    [run, mySeat]
  );

  const pass = useCallback(() => {
    if (mySeat === null) return;
    return run((state) => passTurn(state, mySeat));
  }, [run, mySeat]);

  const dealNextHand = useCallback(() => run((state) => startNextHand(state)), [run]);

  /** Which ends the given tile may be attached to right now. */
  const sidesForTile = useCallback(
    (tileId: string): BoardSide[] =>
      validMoves.filter((move) => move.tile.id === tileId).map((move) => move.side),
    [validMoves]
  );

  return {
    isSupported,
    isLoading,
    isBusy,
    game,
    mySeat,
    myUnit,
    myHand,
    isMyTurn,
    canPass,
    playableTileIds,
    sidesForTile,
    play,
    pass,
    dealNextHand,
  };
}
