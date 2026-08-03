import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/JsonLd";
import { LegalPage } from "@/components/legal/LegalPage";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, localePath } from "@/lib/metadata";
import { breadcrumbJsonLd, SITE_NAME } from "@/lib/seo";

const PATH = "/gestion-des-cookies";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: PATH,
    namespace: "metadata.gestionCookies",
    twitterCard: "summary",
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("metadata.gestionCookies");

  return (
    <LegalPage
      namespace="legal.gestionCookies"
      jsonLd={
        <JsonLd
          data={breadcrumbJsonLd([
            { name: SITE_NAME, path: localePath(locale, "/") },
            { name: t("ogTitle"), path: localePath(locale, PATH) },
          ])}
        />
      }
    />
  );
}
