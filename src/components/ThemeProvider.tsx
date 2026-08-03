"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

import { THEME_STORAGE_KEY } from "@/hooks/useTheme";

/**
 * Reçoit `children` en props : les pages restent des composants serveur et le
 * prérendu statique n'est pas affecté par cette frontière client.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      // Bascule la classe `dark` sur <html>, ce qu'attend la variante Tailwind
      // `@custom-variant dark (&:is(.dark *))` définie dans globals.css.
      attribute="class"
      // Par défaut on suit l'OS, et on continue de le suivre tant que le visiteur
      // n'a pas fait de choix explicite.
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </NextThemesProvider>
  );
}
