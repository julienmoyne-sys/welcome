import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { CookieBanner } from "@/components/CookieBanner";
import { JsonLd } from "@/components/JsonLd";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LOCALE_TAGS, routing, type Locale } from "@/i18n/routing";
import { organizationJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";

import "../globals.css";

// Polices auto-hébergées : Next les télécharge au build et les sert depuis le
// domaine du site. Supprime deux préconnexions et une requête CSS bloquante vers
// Google Fonts, et `display: swap` évite le décalage de mise en page.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter-sans",
  display: "swap",
});

/** Prérend les trois langues au build plutôt qu'à la première requête. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.site" });

  // `metadataBase` rend absolues les URL canoniques et Open Graph déclarées en
  // relatif dans les pages — indispensable côté crawlers.
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    authors: [{ name: SITE_NAME }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: LOCALE_TAGS[locale as Locale],
      title: t("title"),
      description: t("ogDescription"),
    },
    twitter: { card: "summary_large_image" },
    verification: {
      google: "FLutgEx-FpgmWVENiDRkxQ3CwDY2hIGIxEHe0TpM-Ac",
    },
    // Pas d'`icons` ici : `src/app/favicon.ico`, `icon.png` et `apple-icon.png`
    // sont détectés par convention de fichier et émettent leurs `sizes`/`type`.
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Requis pour que le rendu statique fonctionne dans toute la branche.
  setRequestLocale(locale);

  // `suppressHydrationWarning` est requis par next-themes : il écrit la classe de
  // thème sur <html> avant l'hydratation, donc le serveur ne peut pas la connaître.
  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>
            {children}
            <Analytics />
            <SpeedInsights />
            <CookieBanner />
          </ThemeProvider>
        </NextIntlClientProvider>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
