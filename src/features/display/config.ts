import type { DisplaySlideConfig } from "./types";

export const DISPLAY_TRANSITION_MS = 1_200;
export const DISPLAY_REFRESH_MS = 30_000;
export const DISPLAY_STATE_TICK_MS = 10_000;

/**
 * Point de configuration unique du carrousel. L'ordre du tableau est l'ordre
 * d'affichage ; `enabled` et `durationMs` pourront ensuite venir de l'admin.
 */
export const DISPLAY_SLIDES: DisplaySlideConfig[] = [
  { id: "welcome", enabled: true, durationMs: 10_000 },
  { id: "availability", enabled: true, durationMs: 12_000 },
  { id: "website", enabled: true, durationMs: 12_000 },
];
