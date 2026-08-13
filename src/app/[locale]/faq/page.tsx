import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, localePath } from "@/lib/metadata";
import { breadcrumbJsonLd, faqPageJsonLd, SITE_NAME, type FaqItem } from "@/lib/seo";

const PATH = "/faq";

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
    namespace: "metadata.faq",
    twitterCard: "summary",
  });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faq");
  const tMeta = await getTranslations("metadata.faq");
  const items = t.raw("items") as FaqItem[];

  return (
    <div className="min-h-screen bg-welcome-white">
      {/* Le balisage FAQPage reprend les questions de la langue courante, et son
          `@id` est propre à l'URL localisée pour ne pas collisionner entre langues. */}
      <JsonLd data={faqPageJsonLd(items, localePath(locale, PATH))} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: SITE_NAME, path: localePath(locale, "/") },
          { name: tMeta("ogTitle"), path: localePath(locale, PATH) },
        ])}
      />

      <Header />
      <main className="pt-[90px]">
        <FaqSection />
        <section className="bg-welcome-cream py-[100px]">
          <div className="mx-auto w-full max-w-[900px] px-6 text-center">
            <h2 className="font-manrope text-3xl font-semibold tracking-tight text-welcome-black md:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-inter text-[16px] leading-relaxed text-welcome-body">
              {t("cta.lead")}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg"
            >
              {t("cta.button")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
