import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { cn } from "@/shared/lib/utils";
import { computeHandPipSum, type DominoTile } from "@/shared/lib/domino";
import { DominoTileView } from "./DominoTileView";

interface DominoHandProps {
  tiles: DominoTile[];
  /** Ids the player may legally play right now. */
  playableTileIds: Set<string>;
  selectedTileId: string | null;
  onSelect: (tileId: string) => void;
  /** False while it is someone else's turn — tiles stay visible but inert. */
  isMyTurn: boolean;
  handNumber: number;
}

export function DominoHand({
  tiles,
  playableTileIds,
  selectedTileId,
  onSelect,
  isMyTurn,
  handNumber,
}: DominoHandProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Deal animation: tiles fan in from the left whenever a new hand starts.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const targets = container.querySelectorAll<HTMLElement>("[data-hand-tile]");
    if (targets.length === 0) return;

    animate(targets, {
      translateY: [40, 0],
      translateX: [-24, 0],
      opacity: [0, 1],
      rotate: [-20, 0],
      duration: 520,
      delay: stagger(70),
      ease: "outBack",
    });
  }, [handNumber]);

  const pipSum = computeHandPipSum(tiles);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-3 sm:p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-text">Sua mão</h4>
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-text-muted">
            {tiles.length} {tiles.length === 1 ? "pedra" : "pedras"} · {pipSum} pts
          </span>
        </div>
        {isMyTurn && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Sua vez
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2"
      >
        {tiles.map((tile) => {
          const playable = isMyTurn && playableTileIds.has(tile.id);
          return (
            <div key={tile.id} data-hand-tile>
              <DominoTileView
                left={tile.left}
                right={tile.right}
                size="md"
                selected={selectedTileId === tile.id}
                dimmed={isMyTurn && !playable}
                onClick={playable ? () => onSelect(tile.id) : undefined}
                className={cn(playable && "ring-1 ring-primary-300/60")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface OpponentHandProps {
  name: string;
  tileCount: number;
  isCurrentTurn: boolean;
  isPartner: boolean;
}

/** Opponents and the partner show only their tile count — faces stay hidden. */
export function OpponentHand({ name, tileCount, isCurrentTurn, isPartner }: OpponentHandProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5 transition-colors",
        isCurrentTurn
          ? "border-green-500/60 bg-green-50 dark:bg-green-950/25"
          : "border-surface-border bg-surface"
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold text-text">{name}</span>
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
            isPartner
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
              : "bg-surface-muted text-text-muted"
          )}
        >
          {isPartner ? "Parceiro" : "Adversário"}
        </span>
      </div>
      <div className="flex items-center">
        {Array.from({ length: tileCount }).map((_, index) => (
          <DominoTileView
            key={index}
            left={0}
            right={0}
            size="sm"
            faceDown
            // Overlap so a full 7-tile hand still fits in the narrow card.
            className={index > 0 ? "-ml-[15px]" : undefined}
          />
        ))}
        {tileCount === 0 && (
          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
            Bateu!
          </span>
        )}
      </div>
    </div>
  );
}
