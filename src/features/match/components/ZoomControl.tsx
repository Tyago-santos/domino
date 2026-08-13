import { ZoomIn, ZoomOut } from "lucide-react";
import { ZOOM_MAX, ZOOM_MIN } from "../hooks/useScreenZoom";

interface ZoomControlProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/** Compact +/- pill so the whole match card can be scaled to fit the screen. */
export function ZoomControl({ zoom, onZoomIn, onZoomOut }: ZoomControlProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-surface-border bg-surface-muted p-0.5">
      <button
        type="button"
        aria-label="Diminuir zoom"
        disabled={zoom <= ZOOM_MIN}
        onClick={onZoomOut}
        className="flex h-6 w-6 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text disabled:opacity-30"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <span className="w-9 text-center text-[10px] font-semibold tabular-nums text-text-muted">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        aria-label="Aumentar zoom"
        disabled={zoom >= ZOOM_MAX}
        onClick={onZoomIn}
        className="flex h-6 w-6 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text disabled:opacity-30"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
