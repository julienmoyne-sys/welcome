"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/**
 * Clé de stockage historique, conservée volontairement : elle préserve la
 * préférence des visiteurs existants et elle est documentée nommément dans la
 * page « Politique de cookies ».
 */
export const THEME_STORAGE_KEY = "welcome-theme";

/** Durée du fondu, alignée sur la règle `.theme-transition` de globals.css. */
const TRANSITION_MS = 360;

/**
 * Adaptateur mince au-dessus de `next-themes`.
 *
 * `next-themes` gère la persistance, le suivi de la préférence système (y compris
 * ses changements en cours de session), la synchronisation entre onglets et le
 * script anti-FOUC. Ce wrapper n'ajoute qu'une chose : le fondu de 360 ms propre
 * à ce site, que `next-themes` ne fournit pas (son option
 * `disableTransitionOnChange` fait l'inverse).
 */
/*
 * Indicateur « l'hydratation est terminée ».
 *
 * Nécessaire parce que `next-themes` lit localStorage dès l'initialiseur de son
 * `useState` : `resolvedTheme` vaut donc déjà la valeur réelle au premier rendu
 * client, alors que le serveur a rendu le thème par défaut. Un composant qui
 * dérive un attribut du thème sans attendre produit une divergence d'hydratation.
 *
 * `useSyncExternalStore` donne ce drapeau sans `setState` dans un effet : React
 * utilise `getServerSnapshot` (false) pour le rendu serveur et l'hydratation, puis
 * détecte l'écart avec `getSnapshot` et re-rend une fois montée.
 */
const subscribeToNothing = () => () => {};
const isHydrated = () => true;
const isNotHydrated = () => false;

export function useTheme() {
  const { resolvedTheme, setTheme } = useNextTheme();

  const mounted = useSyncExternalStore(subscribeToNothing, isHydrated, isNotHydrated);
  const theme: Theme = resolvedTheme === "dark" ? "dark" : "light";

  const setThemeAnimated = useCallback(
    (next: Theme) => {
      const root = document.documentElement;
      root.classList.add("theme-transition");
      setTheme(next);
      window.setTimeout(() => root.classList.remove("theme-transition"), TRANSITION_MS);
    },
    [setTheme],
  );

  const toggleTheme = useCallback(() => {
    setThemeAnimated(theme === "dark" ? "light" : "dark");
  }, [setThemeAnimated, theme]);

  return { theme, mounted, setTheme: setThemeAnimated, toggleTheme };
}
