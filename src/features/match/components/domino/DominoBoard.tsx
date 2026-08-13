import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { BoardSide, DominoBoard as BoardState } from "@/shared/lib/domino";
import { DominoTileView } from "./DominoTileView";

interface DominoBoardProps {
  board: BoardState;
  /** Ends the selected tile could be attached to; empty disables both buttons. */
  availableSides: BoardSide[];
  onPlaySide: (side: BoardSide) => void;
  disabled?: boolean;
}

/** Chain never shrinks past this — beyond it, tiles would be unreadably small. */
const MIN_FIT_SCALE = 0.35;

export function DominoBoard({ board, availableSides, onPlaySide, disabled }: DominoBoardProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef(board.chain.length);
  const [fitScale, setFitScale] = useState(1);

  // Animate the tile that just landed.
  useEffect(() => {
    const previous = previousCountRef.current;
    previousCountRef.current = board.chain.length;
    if (board.chain.length <= previous) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const tiles = scroller.querySelectorAll<HTMLElement>("[data-domino-tile]");
    // A tile added on the left shifts the whole chain, so animate whichever end grew.
    const grewOnLeft = tiles[0]?.dataset.tileId === board.chain[0]?.tile.id;
    const landed = grewOnLeft ? tiles[0] : tiles[tiles.length - 1];
    if (!landed) return;

    animate(landed, {
      scale: [0.4, 1],
      opacity: [0, 1],
      rotate: [-12, 0],
      duration: 420,
      ease: "outBack",
    });
  }, [board.chain]);

  // Scale the whole chain down to fit the available width — no horizontal
  // scrolling needed, so the full table is always visible at a glance.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const row = rowRef.current;
    if (!scroller || !row) return;

    const fit = () => {
      const available = scroller.clientWidth;
      const natural = row.scrollWidth;
      if (available <= 0 || natural <= 0) return;
      setFitScale(Math.max(MIN_FIT_SCALE, Math.min(1, available / natural)));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [board.chain.length]);

  const canPlayLeft = !disabled && availableSides.includes("left");
  const canPlayRight = !disabled && availableSides.includes("right");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-900/30 bg-gradient-to-br from-emerald-800 to-emerald-950 p-3 shadow-inner sm:p-4">
      {/* Felt texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
          backgroundSize: "8px 8px",
        }}
      />

      <div className="relative flex items-center gap-2">
        <EndButton
          side="left"
          value={board.leftEnd}
          enabled={canPlayLeft}
          onClick={() => onPlaySide("left")}
        />

        <div
          ref={scrollerRef}
          className="flex min-h-[72px] flex-1 items-center justify-center overflow-hidden px-1 py-2 sm:min-h-[88px]"
        >
          {board.chain.length === 0 ? (
            <p className="w-full text-center text-xs text-emerald-200/70">
              Mesa vazia — quem abre joga a primeira pedra.
            </p>
          ) : (
            <div
              ref={rowRef}
              className="flex shrink-0 items-center gap-[3px] transition-transform duration-200"
              style={{ transform: `scale(${fitScale})` }}
            >
              {board.chain.map((placed, index) => {
                const isDouble = placed.tile.left === placed.tile.right;
                return (
                  <div
                    key={`${placed.tile.id}-${index}`}
                    data-domino-tile
                    data-tile-id={placed.tile.id}
                    className="shrink-0"
                  >
                    <DominoTileView
                      left={isDouble ? placed.tile.left : placed.leftValue}
                      right={isDouble ? placed.tile.right : placed.rightValue}
                      size="sm"
                      // Doubles sit crosswise on the table, like the real game.
                      orientation={isDouble ? "vertical" : "horizontal"}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <EndButton
          side="right"
          value={board.rightEnd}
          enabled={canPlayRight}
          onClick={() => onPlaySide("right")}
        />
      </div>
    </div>
  );
}

interface EndButtonProps {
  side: BoardSide;
  value: number | null;
  enabled: boolean;
  onClick: () => void;
}

function EndButton({ side, value, enabled, onClick }: EndButtonProps) {
  const Icon = side === "left" ? ArrowLeftToLine : ArrowRightToLine;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      aria-label={`Jogar na ponta ${side === "left" ? "esquerda" : "direita"}`}
      className={cn(
        "flex h-16 w-11 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-all sm:h-20 sm:w-14",
        enabled
          ? "animate-pulse border-amber-300 bg-amber-400/20 text-amber-100 hover:animate-none hover:bg-amber-400/35"
          : "border-emerald-300/20 text-emerald-200/40"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-base font-bold tabular-nums sm:text-lg">
        {value ?? "–"}
      </span>
    </button>
  );
}
