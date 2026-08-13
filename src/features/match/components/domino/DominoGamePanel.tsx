import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Dices, Loader2 } from "lucide-react";
import { useDominoGame } from "../../hooks/useDominoGame";
import { unitOfSeat, type BoardSide, type DominoSeat } from "@/shared/lib/domino";
import type { GameMatch } from "@/shared/types";
import { nameBySeat, unitDisplays } from "./dominoDisplay";
import { DominoBoard } from "./DominoBoard";
import { DominoHand, OpponentHand } from "./DominoHand";
import { DominoScoreboard } from "./DominoScoreboard";
import { DominoTurnIndicator } from "./DominoTurnIndicator";
import { DominoHandResultModal } from "./DominoHandResultModal";
import { DominoGameResultModal } from "./DominoGameResultModal";

interface DominoGamePanelProps {
  match: GameMatch;
  /** Routes into the existing confirm-victory pipeline. */
  onConfirmVictory: () => void;
  isConfirming: boolean;
  /** True once the local player already registered the result. */
  hasConfirmed: boolean;
}

export function DominoGamePanel({
  match,
  onConfirmVictory,
  isConfirming,
  hasConfirmed,
}: DominoGamePanelProps) {
  const {
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
  } = useDominoGame(match);

  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  const units = useMemo(() => (game ? unitDisplays(game, match) : []), [game, match]);
  const names = useMemo(() => (game ? nameBySeat(game, match) : {}), [game, match]);

  const availableSides = selectedTileId ? sidesForTile(selectedTileId) : [];

  // Drop the selection whenever the turn moves on or a new hand is dealt.
  useEffect(() => {
    if (!isMyTurn) setSelectedTileId(null);
  }, [isMyTurn, game?.hand.handNumber]);

  // Announce every pass as it lands, so the table understands why the turn moved on.
  const seenMovesRef = useRef<{ handNumber: number; count: number }>({ handNumber: 0, count: 0 });
  useEffect(() => {
    if (!game) return;
    const seen = seenMovesRef.current;
    const moves = game.hand.moves;

    if (seen.handNumber !== game.hand.handNumber) {
      seenMovesRef.current = { handNumber: game.hand.handNumber, count: moves.length };
      return;
    }
    if (moves.length > seen.count) {
      for (const move of moves.slice(seen.count)) {
        if (move.type === "pass") {
          toast(`${names[move.seat] ?? "Jogador"} passou a vez`);
        }
      }
      seenMovesRef.current = { handNumber: game.hand.handNumber, count: moves.length };
    }
  }, [game, names]);

  if (!isSupported) return null;

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-surface-border p-8 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Distribuindo as pedras...
      </div>
    );
  }

  function handleSelectTile(tileId: string) {
    const sides = sidesForTile(tileId);
    // Only one legal end (or an empty table): play straight away, no extra tap.
    const onlySide = sides.length === 1 ? sides[0] : undefined;
    if (onlySide) {
      void play(tileId, onlySide);
      setSelectedTileId(null);
      return;
    }
    setSelectedTileId((current) => (current === tileId ? null : tileId));
  }

  function handlePlaySide(side: BoardSide) {
    if (!selectedTileId) return;
    void play(selectedTileId, side);
    setSelectedTileId(null);
  }

  const handEnded = game.hand.phase === "finished";
  const matchEnded = game.phase === "finished";
  const iWonMatch = myUnit !== null && game.result?.winningUnit === myUnit;

  const otherSeats = game.seating.map((_, seat) => seat as DominoSeat).filter((seat) => seat !== mySeat);
  const opponentGridClass = otherSeats.length <= 1 ? "grid-cols-1" : "sm:grid-cols-3";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dices className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        <h3 className="text-sm font-bold text-text">Mesa de dominó</h3>
      </div>

      <DominoScoreboard
        units={units}
        score={game.score}
        targetScore={game.config.targetScore}
        myUnit={myUnit}
        handNumber={game.hand.handNumber}
        handHistory={game.handHistory}
      />

      <div className={`grid grid-cols-1 gap-2 ${opponentGridClass}`}>
        {otherSeats.map((seat) => (
          <OpponentHand
            key={seat}
            name={names[seat] ?? "Jogador"}
            tileCount={game.hand.players.find((p) => p.seat === seat)?.hand.length ?? 0}
            isCurrentTurn={!handEnded && game.hand.currentTurn === seat}
            isPartner={myUnit !== null && unitOfSeat(seat, game.config) === myUnit}
          />
        ))}
      </div>

      <DominoBoard
        board={game.hand.board}
        availableSides={availableSides}
        onPlaySide={handlePlaySide}
        disabled={!isMyTurn || isBusy}
      />

      {!handEnded && (
        <DominoTurnIndicator
          currentPlayerName={names[game.hand.currentTurn] ?? "Jogador"}
          isMyTurn={isMyTurn}
          canPass={canPass}
          onPass={() => void pass()}
          isBusy={isBusy}
          awaitingSide={Boolean(selectedTileId)}
        />
      )}

      {mySeat !== null && (
        <DominoHand
          tiles={myHand}
          playableTileIds={playableTileIds}
          selectedTileId={selectedTileId}
          onSelect={handleSelectTile}
          isMyTurn={isMyTurn && !isBusy}
          handNumber={game.hand.handNumber}
        />
      )}

      <DominoHandResultModal
        open={handEnded && !matchEnded}
        result={game.hand.result}
        units={units}
        myUnit={myUnit}
        onNextHand={() => void dealNextHand()}
        isBusy={isBusy}
      />

      <DominoGameResultModal
        open={matchEnded && !hasConfirmed}
        result={game.result}
        units={units}
        myUnit={myUnit}
        canConfirm={Boolean(iWonMatch)}
        onConfirm={onConfirmVictory}
        isConfirming={isConfirming}
        needsPartnerConfirm={game.config.mode === "TEAMS"}
      />
    </div>
  );
}
