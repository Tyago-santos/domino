import { describe, expect, it } from "vitest";
import {
  canPassNow,
  createGame,
  isBlocked,
  nextSeat,
  passTurn,
  playTile,
  resolveBlockedHand,
  startNextHand,
  unitOfSeat,
  unitsForConfig,
  validMovesForSeat,
} from "./engine";
import {
  DominoRuleError,
  type DominoGameConfig,
  type DominoGameState,
  type DominoHandState,
  type DominoPlayerState,
  type DominoSeat,
  type DominoTile,
} from "./types";

const TEAMS_4: DominoGameConfig = { players: 4, mode: "TEAMS", targetScore: 100 };
const INDIVIDUAL_2: DominoGameConfig = { players: 2, mode: "INDIVIDUAL", targetScore: 100 };
const INDIVIDUAL_4: DominoGameConfig = { players: 4, mode: "INDIVIDUAL", targetScore: 100 };

/** Builds a tile in canonical low-high order, exactly like `createDeck`. */
const t = (a: number, b: number): DominoTile => {
  const left = Math.min(a, b) as DominoTile["left"];
  const right = Math.max(a, b) as DominoTile["right"];
  return { id: `${left}-${right}`, left, right };
};

/** Builds a fully-formed state for a hand already in progress, bypassing the shuffle. */
function makeState(params: {
  config: DominoGameConfig;
  hands: DominoTile[][];
  board?: DominoHandState["board"];
  currentTurn?: DominoSeat;
  score?: Record<string, number>;
}): DominoGameState {
  const { config, hands, board, currentTurn = 0, score } = params;
  const seating = hands.map((_, i) => `p${i}`);
  const players: DominoPlayerState[] = hands.map((hand, seat) => ({
    seat: seat as DominoSeat,
    playerId: seating[seat]!,
    hand,
  }));

  const finalScore: Record<string, number> = score ?? {};
  if (!score) for (const unit of unitsForConfig(config)) finalScore[unit.id] = 0;

  return {
    config,
    phase: "playing",
    score: finalScore,
    seating,
    hand: {
      handNumber: 1,
      phase: "playing",
      players,
      board: board ?? { chain: [], leftEnd: null, rightEnd: null },
      startingSeat: currentTurn,
      currentTurn,
      passStreak: 0,
      moves: [],
      result: null,
    },
    handHistory: [],
    result: null,
  };
}

describe("createGame", () => {
  it("deals 7 tiles per seat and opens with the highest double", () => {
    const state = createGame({ seating: ["a", "b", "c", "d"], config: TEAMS_4, rng: () => 0.999 });
    expect(state.hand.players.every((p) => p.hand.length === 7)).toBe(true);
    // A fixed rng means the deal is deterministic — the top of the shuffled
    // deck ends up in seat 0, and 6-6 always sorts last in the canonical deck.
    const openerHasSixSix = state.hand.players
      .find((p) => p.seat === state.hand.startingSeat)!
      .hand.some((tile) => tile.left === 6 && tile.right === 6);
    expect(openerHasSixSix).toBe(true);
  });

  it("rejects a seating whose length doesn't match the config", () => {
    expect(() => createGame({ seating: ["a", "b", "c"], config: TEAMS_4 })).toThrow(DominoRuleError);
  });

  it("rejects TEAMS mode with anything other than 4 players", () => {
    expect(() =>
      createGame({ seating: ["a", "b"], config: { ...TEAMS_4, players: 2 } })
    ).toThrow(DominoRuleError);
  });
});

describe("playTile", () => {
  it("accepts a tile that fits an open end", () => {
    const state = makeState({
      config: TEAMS_4,
      hands: [[t(6, 3)], [t(1, 1)], [t(2, 2)], [t(3, 3)]],
    });
    const next = playTile(state, 0, "3-6", "left");
    expect(next.hand.board.chain).toHaveLength(1);
  });

  it("rejects a tile that does not match any open end", () => {
    const state = makeState({
      config: TEAMS_4,
      hands: [[t(6, 3), t(1, 2)], [t(1, 1)], [t(2, 2)], [t(3, 3)]],
      board: { chain: [{ tile: t(6, 3), leftValue: 6, rightValue: 3 }], leftEnd: 6, rightEnd: 3 },
    });
    expect(() => playTile(state, 0, "1-2", "right")).toThrow(DominoRuleError);
    try {
      playTile(state, 0, "1-2", "right");
    } catch (error) {
      expect(error).toBeInstanceOf(DominoRuleError);
      expect((error as DominoRuleError).code).toBe("TILE_DOES_NOT_FIT");
    }
  });

  it("rejects a tile the player does not hold", () => {
    const state = makeState({ config: TEAMS_4, hands: [[t(6, 3)], [t(1, 1)], [t(2, 2)], [t(3, 3)]] });
    expect(() => playTile(state, 0, "5-5", "left")).toThrow(DominoRuleError);
  });

  it("rejects a play out of turn", () => {
    const state = makeState({
      config: TEAMS_4,
      hands: [[t(6, 3)], [t(1, 1)], [t(2, 2)], [t(3, 3)]],
      currentTurn: 1,
    });
    expect(() => playTile(state, 0, "3-6", "left")).toThrow(DominoRuleError);
  });

  it("validates and rotates a tile onto the left end", () => {
    const board: DominoHandState["board"] = {
      chain: [{ tile: t(6, 3), leftValue: 6, rightValue: 3 }],
      leftEnd: 6,
      rightEnd: 3,
    };
    const state = makeState({ config: TEAMS_4, hands: [[t(2, 6)], [], [], []], board });
    const next = playTile(state, 0, "2-6", "left");
    // 6 faces the existing chain; 2 becomes the new open end.
    expect(next.hand.board.leftEnd).toBe(2);
    expect(next.hand.board.chain[0]).toMatchObject({ leftValue: 2, rightValue: 6 });
  });

  it("validates and rotates a tile onto the right end", () => {
    const board: DominoHandState["board"] = {
      chain: [
        { tile: t(6, 3), leftValue: 6, rightValue: 3 },
        { tile: t(3, 5), leftValue: 3, rightValue: 5 },
      ],
      leftEnd: 6,
      rightEnd: 5,
    };
    const state = makeState({ config: TEAMS_4, hands: [[t(2, 5)], [], [], []], board });
    const next = playTile(state, 0, "2-5", "right");
    expect(next.hand.board.rightEnd).toBe(2);
    expect(next.hand.board.chain[next.hand.board.chain.length - 1]).toMatchObject({
      leftValue: 5,
      rightValue: 2,
    });
  });
});

describe("turn order", () => {
  it("advances to the next seat after a play", () => {
    const state = makeState({
      config: TEAMS_4,
      hands: [[t(6, 3), t(0, 4)], [t(1, 1)], [t(2, 2)], [t(3, 3)]],
    });
    const next = playTile(state, 0, "3-6", "left");
    expect(next.hand.currentTurn).toBe(1);
  });

  it("wraps back to seat 0 after the last seat", () => {
    expect(nextSeat(3, TEAMS_4)).toBe(0);
    expect(nextSeat(1, INDIVIDUAL_2)).toBe(0);
  });

  it("does not let a seat play twice in a row", () => {
    const state = makeState({ config: TEAMS_4, hands: [[t(6, 3)], [t(1, 1)], [t(2, 2)], [t(3, 3)]] });
    const afterFirstPlay = playTile(state, 0, "3-6", "left");
    expect(() => playTile(afterFirstPlay, 0, "0-0", "left")).toThrow(DominoRuleError);
    expect(validMovesForSeat(afterFirstPlay, 0)).toHaveLength(0);
  });
});

describe("passing", () => {
  it("rejects a pass while a legal move is available", () => {
    const state = makeState({ config: TEAMS_4, hands: [[t(6, 3)], [t(1, 1)], [t(2, 2)], [t(3, 3)]] });
    expect(() => passTurn(state, 0)).toThrow(DominoRuleError);
    try {
      passTurn(state, 0);
    } catch (error) {
      expect(error).toBeInstanceOf(DominoRuleError);
      expect((error as DominoRuleError).code).toBe("MUST_PLAY");
    }
  });

  it("passes immediately once no legal move exists — no boneyard to draw from", () => {
    const board: DominoHandState["board"] = {
      chain: [{ tile: t(6, 3), leftValue: 6, rightValue: 3 }],
      leftEnd: 6,
      rightEnd: 3,
    };
    const state = makeState({ config: TEAMS_4, hands: [[t(1, 1)], [], [], []], board });
    expect(canPassNow(state, 0)).toBe(true);
    const next = passTurn(state, 0);
    expect(next.hand.passStreak).toBe(1);
    expect(next.hand.currentTurn).toBe(1);
    expect(next.hand.moves).toContainEqual({ seat: 0, type: "pass" });
  });
});

describe("victory", () => {
  it("detects a player going out and closes the hand", () => {
    const state = makeState({
      config: TEAMS_4,
      hands: [[t(6, 3)], [t(1, 1), t(2, 4)], [t(2, 2)], [t(3, 3)]],
    });
    const next = playTile(state, 0, "3-6", "left");
    expect(next.hand.phase).toBe("finished");
    expect(next.hand.result?.winningSeat).toBe(0);
  });

  it("credits the whole team when one partner goes out", () => {
    const state = makeState({
      config: TEAMS_4,
      hands: [[t(6, 3)], [t(1, 1), t(2, 4)], [t(2, 2)], [t(3, 3)]],
    });
    const next = playTile(state, 0, "3-6", "left");
    expect(next.hand.result?.winningUnit).toBe(unitOfSeat(0, TEAMS_4));
    expect(next.score[unitOfSeat(0, TEAMS_4)]).toBeGreaterThan(0);
  });

  it("resolves a blocked table in favour of the lightest unit", () => {
    const hand: DominoHandState = {
      handNumber: 1,
      phase: "playing",
      players: [
        { seat: 0, playerId: "a", hand: [t(0, 0)] }, // 0 pips
        { seat: 1, playerId: "b", hand: [t(6, 6)] }, // 12 pips
        { seat: 2, playerId: "c", hand: [t(1, 1)] }, // 2 pips
        { seat: 3, playerId: "d", hand: [t(5, 5)] }, // 10 pips
      ],
      board: { chain: [], leftEnd: null, rightEnd: null },
      startingSeat: 0,
      currentTurn: 0,
      passStreak: 4,
      moves: [],
      result: null,
    };
    expect(isBlocked(hand, TEAMS_4)).toBe(true);
    const result = resolveBlockedHand(hand, TEAMS_4);
    // Team A (seats 0,2) holds 2 pips; team B (seats 1,3) holds 22.
    expect(result.winningUnit).toBe("A");
    expect(result.isDraw).toBe(false);
    expect(result.points).toBe(22);
  });

  it("voids a blocked hand when every unit is level", () => {
    const hand: DominoHandState = {
      handNumber: 1,
      phase: "playing",
      players: [
        { seat: 0, playerId: "a", hand: [t(0, 5)] },
        { seat: 1, playerId: "b", hand: [t(5, 0)] },
      ],
      board: { chain: [], leftEnd: null, rightEnd: null },
      startingSeat: 0,
      currentTurn: 0,
      passStreak: 2,
      moves: [],
      result: null,
    };
    const result = resolveBlockedHand(hand, INDIVIDUAL_2);
    expect(result.isDraw).toBe(true);
    expect(result.winningUnit).toBeNull();
    expect(result.points).toBe(0);
  });

  it("awards the winner the sum of every other unit's remaining pips", () => {
    // Individual, 4 players: the winner should collect all three opponents' pips.
    const state = makeState({
      config: INDIVIDUAL_4,
      hands: [
        [t(6, 3)],
        [t(2, 2)], // 4 pips
        [t(4, 2)], // 6 pips
        [t(5, 5)], // 10 pips
      ],
    });
    const next = playTile(state, 0, "3-6", "left");
    expect(next.hand.result?.points).toBe(4 + 6 + 10);
  });
});

describe("match", () => {
  it("ends the match once a unit reaches the target score", () => {
    const state = makeState({
      config: { ...TEAMS_4, targetScore: 10 },
      hands: [[t(6, 3)], [t(1, 1), t(2, 4)], [t(2, 2)], [t(3, 3)]],
      score: { A: 5, B: 3 },
    });
    const next = playTile(state, 0, "3-6", "left");
    expect(next.phase).toBe("finished");
    expect(next.result?.winningUnit).toBe("A");
    expect(next.result?.score.A).toBeGreaterThanOrEqual(10);
  });

  it("keeps the score across hands when nobody has reached the target", () => {
    const state = makeState({
      config: { ...TEAMS_4, targetScore: 1000 },
      hands: [[t(6, 3)], [t(1, 1), t(2, 4)], [t(2, 2)], [t(3, 3)]],
      score: { A: 5, B: 3 },
    });
    const next = playTile(state, 0, "3-6", "left");
    expect(next.phase).toBe("playing");
    expect(next.score.A).toBeGreaterThan(5);
    expect(next.score.B).toBe(3);
  });

  it("deals a fresh hand for the next round via startNextHand", () => {
    const state = makeState({
      config: { ...TEAMS_4, targetScore: 1000 },
      hands: [[t(6, 3)], [t(1, 1), t(2, 4)], [t(2, 2)], [t(3, 3)]],
    });
    const finished = playTile(state, 0, "3-6", "left");
    const rng = () => 0.42;
    const dealt = startNextHand(finished, rng);
    expect(dealt.hand.handNumber).toBe(2);
    expect(dealt.hand.phase).toBe("playing");
    expect(dealt.hand.players.every((p) => p.hand.length === 7)).toBe(true);
  });

  it("rejects every action once the match is finished", () => {
    const state = makeState({
      config: { ...TEAMS_4, targetScore: 10 },
      hands: [[t(6, 3)], [t(1, 1), t(2, 4)], [t(2, 2)], [t(3, 3)]],
      score: { A: 5, B: 3 },
    });
    const finished = playTile(state, 0, "3-6", "left");
    expect(finished.phase).toBe("finished");
    expect(() => playTile(finished, 1, "1-1", "left")).toThrow(DominoRuleError);
    expect(() => passTurn(finished, 1)).toThrow(DominoRuleError);
    expect(() => startNextHand(finished)).toThrow(DominoRuleError);
  });
});

/** Deterministic mulberry32 so a failing run can be replayed from its seed. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Plays a full random match to completion, asserting tile conservation and board integrity throughout. */
function playRandomMatch(config: DominoGameConfig, seed: number): DominoGameState {
  const rng = makeRng(seed);
  const seating = Array.from({ length: config.players }, (_, i) => `p${i}`);
  let state = createGame({ seating, config, rng });
  let guard = 0;

  while (state.phase === "playing") {
    if (++guard > 10_000) throw new Error(`match ${seed} did not terminate`);

    if (state.hand.phase === "finished") {
      state = startNextHand(state, rng);
      continue;
    }

    const seat = state.hand.currentTurn;
    const ids = [
      ...state.hand.board.chain.map((p) => p.tile.id),
      ...state.hand.players.flatMap((p) => p.hand.map((t2) => t2.id)),
    ];
    if (ids.length !== config.players * 7) {
      throw new Error(`tile conservation broken in match ${seed}: ${ids.length} tiles in play`);
    }
    if (new Set(ids).size !== ids.length) {
      throw new Error(`duplicate tile detected in match ${seed}`);
    }

    const moves = validMovesForSeat(state, seat);
    if (moves.length > 0) {
      const move = moves[Math.floor(rng() * moves.length)]!;
      state = playTile(state, seat, move.tile.id, move.side);
      continue;
    }
    state = passTurn(state, seat);
  }

  return state;
}

describe("full-match simulation", () => {
  const configs: [string, DominoGameConfig][] = [
    ["2-player individual", INDIVIDUAL_2],
    ["4-player individual", INDIVIDUAL_4],
    ["4-player teams", TEAMS_4],
  ];

  for (const [label, config] of configs) {
    it(`plays ${label} matches to a clean finish`, () => {
      for (let seed = 1; seed <= 25; seed++) {
        const state = playRandomMatch({ ...config, targetScore: 15 }, seed);
        expect(state.phase).toBe("finished");
        expect(state.result).not.toBeNull();
        const winner = state.result!.winningUnit;
        expect(state.score[winner]).toBeGreaterThanOrEqual(15);
        for (const [unit, points] of Object.entries(state.score)) {
          if (unit !== winner) expect(points).toBeLessThan(15);
        }
        const totalPoints = state.handHistory.reduce((sum, h) => sum + h.points, 0);
        const totalScore = Object.values(state.score).reduce((sum, v) => sum + v, 0);
        expect(totalPoints).toBe(totalScore);
      }
    });
  }
});
