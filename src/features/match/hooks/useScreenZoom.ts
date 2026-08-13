import { useEffect, useState } from "react";

const STORAGE_KEY = "match:zoom";
export const ZOOM_MIN = 0.65;
export const ZOOM_MAX = 1.15;
export const ZOOM_STEP = 0.05;

function readStoredZoom(): number {
  if (typeof window === "undefined") return 1;
  const stored = Number(window.localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(stored) && stored >= ZOOM_MIN && stored <= ZOOM_MAX ? stored : 1;
}

/** Scales the whole match card so it fits the screen without scrolling — persisted per device. */
export function useScreenZoom() {
  const [zoom, setZoom] = useState(readStoredZoom);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(zoom));
  }, [zoom]);

  return {
    zoom,
    zoomIn: () => setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100)),
    zoomOut: () => setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100)),
    reset: () => setZoom(1),
  };
}
