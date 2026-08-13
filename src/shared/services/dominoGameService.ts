import { get, onValue, ref, remove, runTransaction, set } from "firebase/database";
import { db } from "../config/firestore";
import type {
  DominoGameState,
  DominoHandState,
  DominoPlayerState,
} from "../lib/domino";

/**
 * Live domino state lives beside the match metadata but in its own node, so the
 * per-move churn never touches the `GameMatch` record that history, ranking and
 * stats read from.
 *
 * Note: all four hands sit in this node, so a determined player could read their
 * opponents' tiles through the network tab. Hiding them for real needs per-path
 * Firebase security rules — tracked as follow-up hardening.
 */
function gameRef(matchId: string) {
  return ref(db, `activeMatches/${matchId}/game`);
}

/**
 * The Realtime Database drops empty arrays and nulls on write, so a state that
 * went up with `chain: []` and `result: null` comes back with those keys missing.
 * Every read is funnelled through here to put them back before the engine — which
 * assumes they exist — ever sees the state.
 */
export function normalizeGameState(raw: unknown): DominoGameState | null {
  if (!raw || typeof raw !== "object") return null;
  const state = raw as DominoGameState;

  const hand = (state.hand ?? {}) as DominoHandState;
  const players = (hand.players ?? []) as DominoPlayerState[];

  const normalizedHand: DominoHandState = {
    ...hand,
    players: players.map((player) => ({ ...player, hand: player.hand ?? [] })),
    board: {
      chain: hand.board?.chain ?? [],
      leftEnd: hand.board?.leftEnd ?? null,
      rightEnd: hand.board?.rightEnd ?? null,
    },
    passStreak: hand.passStreak ?? 0,
    moves: hand.moves ?? [],
    result: hand.result ?? null,
  };

  return {
    ...state,
    score: state.score ?? {},
    hand: normalizedHand,
    handHistory: state.handHistory ?? [],
    result: state.result ?? null,
  };
}

export async function getGame(matchId: string): Promise<DominoGameState | null> {
  const snapshot = await get(gameRef(matchId));
  return normalizeGameState(snapshot.val());
}

/** Writes the initial state only if no game has been dealt for this match yet. */
export async function initGame(
  matchId: string,
  state: DominoGameState
): Promise<DominoGameState> {
  const result = await runTransaction(gameRef(matchId), (current: unknown) => current ?? state);
  return normalizeGameState(result.snapshot.val()) ?? state;
}

export function subscribeGame(
  matchId: string,
  onChange: (state: DominoGameState | null) => void
): () => void {
  return onValue(gameRef(matchId), (snapshot) => {
    onChange(normalizeGameState(snapshot.val()));
  });
}

/**
 * Applies a move inside a transaction, so two devices acting at once cannot
 * clobber each other — the loser of the race re-runs `apply` against the state
 * that actually won, and its move is rejected if the engine says so.
 */
export async function applyMove(
  matchId: string,
  apply: (state: DominoGameState) => DominoGameState
): Promise<DominoGameState> {
  let failure: unknown = null;

  const result = await runTransaction(gameRef(matchId), (current: unknown) => {
    const state = normalizeGameState(current);
    if (!state) return current;
    try {
      failure = null;
      return apply(state);
    } catch (error) {
      // Returning undefined aborts the transaction, leaving the server untouched.
      failure = error;
      return undefined;
    }
  });

  if (failure) throw failure;
  if (!result.committed || !result.snapshot.exists()) {
    throw new Error("Move was not committed.");
  }
  return normalizeGameState(result.snapshot.val())!;
}

export async function replaceGame(matchId: string, state: DominoGameState): Promise<void> {
  await set(gameRef(matchId), state);
}

export async function clearGame(matchId: string): Promise<void> {
  await remove(gameRef(matchId));
}
