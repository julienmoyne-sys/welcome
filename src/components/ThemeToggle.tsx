"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

/*
 * L'apparence est pilotée par la variante Tailwind `dark:`, pas par l'état React.
 *
 * `next-themes` pose la classe `dark` sur <html> depuis son script inline, avant le
 * premier paint. Ces classes sont donc déjà justes au tout premier affichage, et
 * surtout identiques côté serveur et côté client : ni divergence d'hydratation, ni
 * bascule visible de l'interrupteur juste après l'hydratation.
 *
 * Chaque entrée porte la valeur du thème clair en base et celle du thème sombre en
 * `dark:`, ce qui reproduit exactement les combinaisons de l'ancienne logique.
 */
const VARIANTS = {
  default: {
    sun: "text-welcome-gold dark:text-welcome-black/35",
    moon: "text-welcome-black/35 dark:text-welcome-gold",
    track: "border-welcome-line bg-welcome-black/[0.07] focus-visible:ring-offset-welcome-header",
    knob: "bg-welcome-black dark:bg-welcome-white",
  },
  dark: {
    sun: "text-welcome-gold dark:text-welcome-footer-muted",
    moon: "text-welcome-footer-muted dark:text-welcome-gold",
    track:
      "border-welcome-white/20 bg-welcome-white/15 focus-visible:ring-offset-welcome-footer-bg",
    knob: "bg-welcome-white",
  },
} as const;

export function ThemeToggle({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "dark";
}) {
  const { theme, mounted, toggleTheme } = useTheme();
  const styles = VARIANTS[variant];

  // Seul `aria-checked` reste dérivé de l'état React : c'est un attribut du DOM, il
  // doit correspondre au rendu serveur, d'où l'attente de la fin de l'hydratation.
  const isDark = mounted && theme === "dark";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Sun
        aria-hidden="true"
        strokeWidth={1.5}
        className={`h-[15px] w-[15px] transition-colors duration-300 ${styles.sun}`}
      />
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Activer le mode sombre"
        onClick={toggleTheme}
        className={`relative h-[26px] w-[48px] shrink-0 cursor-pointer rounded-full border transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-welcome-gold focus-visible:ring-offset-2 ${styles.track}`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-[20px] w-[20px] translate-x-0 rounded-full shadow-[0_1px_4px_rgba(11,11,11,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] dark:translate-x-[22px] ${styles.knob}`}
        />
      </button>
      <Moon
        aria-hidden="true"
        strokeWidth={1.5}
        className={`h-[15px] w-[15px] transition-colors duration-300 ${styles.moon}`}
      />
    </div>
  );
}
