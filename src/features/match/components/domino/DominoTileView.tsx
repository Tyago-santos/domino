import { forwardRef } from "react";
import { cn } from "@/shared/lib/utils";
import type { Pip } from "@/shared/lib/domino";

/**
 * Pip layout on a 3x3 grid, in units of the half-face box (0..1 on both axes).
 * Index of the array is the pip count.
 */
const PIP_POSITIONS: [number, number][][] = [
  [],
  [[0.5, 0.5]],
  [
    [0.25, 0.25],
    [0.75, 0.75],
  ],
  [
    [0.25, 0.25],
    [0.5, 0.5],
    [0.75, 0.75],
  ],
  [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.75],
    [0.75, 0.75],
  ],
  [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.5, 0.5],
    [0.25, 0.75],
    [0.75, 0.75],
  ],
  [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.5],
    [0.75, 0.5],
    [0.25, 0.75],
    [0.75, 0.75],
  ],
];

export type TileSize = "sm" | "md" | "lg";

const SIZES: Record<TileSize, { w: number; h: number }> = {
  sm: { w: 26, h: 52 },
  md: { w: 34, h: 68 },
  lg: { w: 44, h: 88 },
};

interface HalfFaceProps {
  value: Pip;
  /** Origin of this half within the tile's viewBox. */
  x: number;
  y: number;
  size: number;
  pipRadius: number;
  className: string;
}

function HalfFace({ value, x, y, size, pipRadius, className }: HalfFaceProps) {
  return (
    <g>
      {(PIP_POSITIONS[value] ?? []).map(([px, py], index) => (
        <circle
          key={index}
          cx={x + px * size}
          cy={y + py * size}
          r={pipRadius}
          className={className}
        />
      ))}
    </g>
  );
}

interface DominoTileViewProps {
  left: Pip;
  right: Pip;
  size?: TileSize;
  /** Vertical stacks the halves (hand view); horizontal lays them side by side (table). */
  orientation?: "vertical" | "horizontal";
  faceDown?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  className?: string;
}

export const DominoTileView = forwardRef<HTMLButtonElement, DominoTileViewProps>(
  function DominoTileView(
    {
      left,
      right,
      size = "md",
      orientation = "vertical",
      faceDown = false,
      selected = false,
      dimmed = false,
      onClick,
      className,
    },
    ref
  ) {
    const base = SIZES[size];
    const width = orientation === "vertical" ? base.w : base.h;
    const height = orientation === "vertical" ? base.h : base.w;
    const half = orientation === "vertical" ? base.w : base.w;
    const pipRadius = half * 0.085;

    const interactive = Boolean(onClick);

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={!interactive}
        aria-label={faceDown ? "Pedra virada" : `Pedra ${left}-${right}`}
        className={cn(
          "relative shrink-0 rounded-[6px] transition-all duration-200",
          interactive && "cursor-pointer hover:-translate-y-1 hover:shadow-lg",
          !interactive && "cursor-default",
          selected && "-translate-y-1.5 ring-2 ring-primary-500 ring-offset-2 ring-offset-surface",
          dimmed && "opacity-35 saturate-50",
          className
        )}
        style={{ width, height }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="drop-shadow-sm"
        >
          <rect
            x="0.5"
            y="0.5"
            width={width - 1}
            height={height - 1}
            rx="5"
            className={cn(
              "stroke-[1.5]",
              faceDown
                ? "fill-primary-700 stroke-primary-900 dark:fill-primary-800 dark:stroke-primary-950"
                : "fill-[#fdfcf8] stroke-stone-300 dark:fill-stone-100 dark:stroke-stone-400"
            )}
          />

          {faceDown ? (
            <circle
              cx={width / 2}
              cy={height / 2}
              r={Math.min(width, height) * 0.18}
              className="fill-primary-400/50"
            />
          ) : (
            <>
              {/* Divider between the two halves */}
              {orientation === "vertical" ? (
                <line
                  x1={width * 0.16}
                  y1={height / 2}
                  x2={width * 0.84}
                  y2={height / 2}
                  className="stroke-stone-300 stroke-[1.5] dark:stroke-stone-400"
                />
              ) : (
                <line
                  x1={width / 2}
                  y1={height * 0.16}
                  x2={width / 2}
                  y2={height * 0.84}
                  className="stroke-stone-300 stroke-[1.5] dark:stroke-stone-400"
                />
              )}

              <HalfFace
                value={left}
                x={0}
                y={0}
                size={half}
                pipRadius={pipRadius}
                className="fill-stone-800 dark:fill-stone-900"
              />
              <HalfFace
                value={right}
                x={orientation === "vertical" ? 0 : half}
                y={orientation === "vertical" ? half : 0}
                size={half}
                pipRadius={pipRadius}
                className="fill-stone-800 dark:fill-stone-900"
              />
            </>
          )}
        </svg>
      </button>
    );
  }
);
