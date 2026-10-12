import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccessSection } from "@/components/AccessSection";
import { EditorialSection } from "@/components/EditorialSection";
import { ExploreSection } from "@/components/ExploreSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeContactSection } from "@/components/HomeContactSection";
import { JsonLd } from "@/components/JsonLd";
import { PricingSection } from "@/components/PricingSection";
import { ReassuranceSection } from "@/components/ReassuranceSection";
import { ReferencesSection } from "@/components/ReferencesSection";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";
import { GEO_META, localBusinessJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const metadata = await buildPageMetadata({ locale, path: "/", namespace: "metadata.home" });

  // Les balises `geo.*` ne sont posées que sur l'accueil : c'est la page qui porte
  // le balisage `LocalBusiness`.
  return { ...metadata, other: { ...GEO_META } };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("hero");

  return (
    <div className="min-h-screen bg-welcome-cream">
      <JsonLd data={localBusinessJsonLd()} />

      <Header />
      <main>
        <section className="relative flex min-h-[720px] w-full items-center overflow-hidden xl:min-h-[min(56.25vw,1200px)]">
          {/* Visuel d'en-tête, et LCP de la page : `priority` le fait précharger.
              En `<Image>` plutôt qu'en background CSS, il est optimisé (AVIF/WebP,
              variantes par largeur d'écran) et porte son texte alternatif. */}
          <HeroCarousel
            alts={[t("imageAlt1"), t("imageAlt2"), t("imageAlt4")]}
            previousLabel={t("previousSlide")}
            nextLabel={t("nextSlide")}
            slideLabel={t("carouselLabel")}
          />

          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-welcome-cream from-0% via-welcome-cream/95 via-40% to-transparent to-75% dark:hidden" />
          <div className="pointer-events-none absolute inset-0 z-10 hidden bg-gradient-to-r from-welcome-cream/95 via-welcome-cream/75 to-transparent dark:block" />

          <div className="pointer-events-none relative z-20 mx-auto w-full max-w-[1400px] px-6 lg:px-10">
            <div className="max-w-2xl">
              <p className="font-manrope text-sm font-semibold uppercase tracking-[0.15em] text-welcome-gold">
                {t("eyebrow")}
              </p>
              <h1 className="mt-5 font-manrope text-5xl font-semibold leading-[1.08] tracking-tight text-welcome-black md:text-6xl lg:text-7xl">
                {t("titleLine1")}
                <br />
                <span className="text-welcome-gold">{t("titleLine2")}</span>
              </h1>
              <p className="mt-6 max-w-lg font-manrope text-lg leading-relaxed text-welcome-black/80">
                {t.rich("lead", {
                  strong: (chunks) => <strong className="font-bold">{chunks}</strong>,
                })}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="pointer-events-auto hidden h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg lg:inline-flex"
                >
                  {t("ctaVisit")}
                </Link>
                <a
                  href="https://wa.me/33622805536"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto inline-flex h-[52px] items-center justify-center rounded-[12px] bg-[#25D366] px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg lg:hidden"
                >
                  {t("ctaWhatsapp")}
                </a>
                <Link
                  href="/#espaces"
                  className="pointer-events-auto inline-flex h-[52px] items-center justify-center rounded-[12px] border border-welcome-black/20 bg-welcome-white/80 px-8 font-manrope text-[16px] font-semibold text-welcome-black backdrop-blur-sm transition-all duration-200 hover:bg-welcome-white hover:shadow-md"
                >
                  {t("ctaDiscover")}
                </Link>
              </div>
            </div>
          </div>
        </section>
        <ReassuranceSection />
        <EditorialSection />
        <ExploreSection />
        <PricingSection />
        <ReferencesSection />
        <AccessSection />
        <HomeContactSection />
      </main>
      <Footer />
    </div>
  );
}
