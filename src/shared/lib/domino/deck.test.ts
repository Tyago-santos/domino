import { describe, expect, it } from "vitest";
import { createDeck, DECK_SIZE, HAND_SIZE, dealHands, isDouble, tileId } from "./deck";

describe("createDeck", () => {
  it("generates exactly 28 tiles", () => {
    expect(createDeck()).toHaveLength(DECK_SIZE);
  });

  it("has no duplicate tiles", () => {
    const ids = createDeck().map((t) => t.id);
    expect(new Set(ids).size).toBe(DECK_SIZE);
  });

  it("holds exactly 7 doubles", () => {
    expect(createDeck().filter(isDouble)).toHaveLength(7);
  });

  it("treats [3|5] and [5|3] as the same tile id", () => {
    expect(tileId(3, 5)).toBe(tileId(5, 3));
    expect(tileId(3, 5)).toBe("3-5");
  });
});

describe("dealHands", () => {
  it("deals 7 tiles to each of 2 players — 14 of the 28 tiles never enter play", () => {
    const hands = dealHands(createDeck(), 2);
    expect(hands).toHaveLength(2);
    for (const hand of hands) expect(hand).toHaveLength(HAND_SIZE);
  });

  it("deals 7 tiles to each of 4 players, consuming the whole deck", () => {
    const hands = dealHands(createDeck(), 4);
    expect(hands).toHaveLength(4);
    for (const hand of hands) expect(hand).toHaveLength(HAND_SIZE);
    const seen = hands.flat().map((t) => t.id);
    expect(new Set(seen).size).toBe(DECK_SIZE);
  });

  it("never deals the same tile to two seats", () => {
    for (const players of [2, 4] as const) {
      const seen = dealHands(createDeck(), players)
        .flat()
        .map((t) => t.id);
      expect(new Set(seen).size).toBe(seen.length);
    }
  });

  it("rejects a deck that isn't a full 28-tile set", () => {
    expect(() => dealHands(createDeck().slice(0, 27), 4)).toThrow();
  });
});
