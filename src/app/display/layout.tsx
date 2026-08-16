import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "../globals.css";
import "./display.css";

export const metadata: Metadata = {
  title: "Affichage Welcome!",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: { index: false, follow: false, noarchive: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0b0b0b",
};

export default function DisplayLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
