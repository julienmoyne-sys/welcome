import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { ExternalLinkGuard } from "@/features/vtc/ExternalLinkGuard";

import "../globals.css";
import "./vtc.css";

export const metadata: Metadata = {
  title: "Welcome VTC",
  description: "Interface passagers Welcome VTC",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#090a0a",
};

export default function VtcLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ExternalLinkGuard />
        {children}
      </body>
    </html>
  );
}
