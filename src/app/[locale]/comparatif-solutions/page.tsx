import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, localePath } from "@/lib/metadata";
import { breadcrumbJsonLd, SITE_NAME } from "@/lib/seo";

const PATH = "/comparatif-solutions";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const metadata = await buildPageMetadata({
    locale,
    path: PATH,
    namespace: "metadata.comparison",
  });

  return { ...metadata, robots: { index: false, follow: true } };
}

export default async function ComparisonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("comparisonPage");
  const tMeta = await getTranslations("metadata.comparison");

  return (
    <div className="flex min-h-screen flex-col bg-welcome-cream">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: SITE_NAME, path: localePath(locale, "/") },
          { name: tMeta("ogTitle"), path: localePath(locale, PATH) },
        ])}
      />
      <Header />

      <main className="flex flex-1 items-center px-6 py-20 lg:px-10">
        <section className="mx-auto w-full max-w-3xl text-center">
          <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 font-manrope text-[42px] font-bold leading-[1.08] tracking-tight text-welcome-black sm:text-[54px]">
            {t("status")}
          </h1>
          <Link
            href="/#solutions"
            className="mt-10 inline-flex items-center gap-2 font-manrope text-[15px] font-semibold text-welcome-body transition-colors hover:text-welcome-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("back")}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
