import type { DisplaySlideConfig } from "./types";

export const DISPLAY_TRANSITION_MS = 1_200;
export const DISPLAY_REFRESH_MS = 5 * 60 * 1_000;

/**
 * Point de configuration unique du carrousel. L'ordre du tableau est l'ordre
 * d'affichage ; `enabled` et `durationMs` pourront ensuite venir de l'admin.
 */
export const DISPLAY_SLIDES: DisplaySlideConfig[] = [
  { id: "welcome", enabled: true, durationMs: 10_000 },
  { id: "today", enabled: true, durationMs: 10_000 },
  { id: "services", enabled: true, durationMs: 10_000 },
  { id: "practical", enabled: true, durationMs: 10_000 },
  { id: "announcement", enabled: true, durationMs: 10_000 },
  { id: "branding", enabled: true, durationMs: 10_000 },
];

export const DISPLAY_ANNOUNCEMENT = {
  eyebrow: "La vie chez Welcome!",
  title: "Un espace qui s’adapte à votre journée.",
  body: "Réunion, concentration ou échange informel : choisissez l’ambiance qui vous ressemble.",
  label: "Annonce Welcome!",
};
