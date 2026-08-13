import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { SolutionComparison } from "@/components/SolutionComparison";
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
  return buildPageMetadata({ locale, path: PATH, namespace: "metadata.comparison" });
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

      <main className="flex-1">
        <section className="px-6 pb-16 pt-16 text-center sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24">
          <div className="mx-auto max-w-3xl">
            <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
              {t("eyebrow")}
            </p>
            <h1 className="mt-5 font-manrope text-[42px] font-bold leading-[1.06] tracking-tight text-welcome-black sm:text-[56px] lg:text-[64px]">
              {t("titleLead")} <span className="text-welcome-gold">{t("titleHighlight")}</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl font-inter text-[18px] leading-[1.75] text-welcome-body">
              {t("lead")}
            </p>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 sm:pb-28 lg:px-10 lg:pb-32">
          <div className="mx-auto max-w-[1400px]">
            <SolutionComparison />
          </div>
        </section>

        <section className="bg-welcome-black px-6 py-20 text-center sm:py-24 lg:px-10">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-manrope text-[32px] font-semibold leading-tight tracking-tight text-welcome-ink-fg sm:text-[40px]">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-inter text-[16px] leading-relaxed text-welcome-ink-fg/70">
              {t("ctaText")}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg"
            >
              {t("ctaVisit")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
