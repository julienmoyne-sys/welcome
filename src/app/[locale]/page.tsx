import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AccessSection } from "@/components/AccessSection";
import { ContactSection } from "@/components/ContactSection";
import { EditorialSection } from "@/components/EditorialSection";
import { ExploreSection } from "@/components/ExploreSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { PricingSection } from "@/components/PricingSection";
import { ReassuranceSection } from "@/components/ReassuranceSection";
import { ReferencesSection } from "@/components/ReferencesSection";
import { GEO_META, localBusinessJsonLd, OG_DEFAULTS } from "@/lib/seo";
import heroImage from "@/assets/hero-welcome-real.png";

const HERO_ALT =
  "Espace de coworking Welcome avec bar en bois, verrières noires, plantes et éclairage chaleureux";

export const metadata: Metadata = {
  title: "Coworking à Strasbourg — Welcome Coworking | Bureaux & open space",
  description:
    "Espace de coworking premium à Strasbourg : open space, bureaux privatifs et salle de réunion au 204 avenue de Colmar. Tram Couffignal, parking gratuit, accès 24/7.",
  alternates: { canonical: "/" },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/",
    title: "Coworking à Strasbourg — Welcome Coworking",
    description:
      "Open space, bureaux privatifs et salle de réunion dans un lieu lumineux et chaleureux à Strasbourg. Plus de 100 entreprises accueillies depuis 2017.",
    // Le visuel de partage vient d'`OG_DEFAULTS`, commun à toutes les pages.
  },
  // Sans `twitter:image`, X retombe sur `og:image` : inutile de le redéclarer.
  twitter: { card: "summary_large_image" },
  // Uniquement sur l'accueil : c'est la page qui porte le balisage `LocalBusiness`.
  other: { ...GEO_META },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-welcome-cream">
      <JsonLd data={localBusinessJsonLd()} />

      <Header />
      <main>
        <section className="relative flex min-h-[720px] w-full items-center">
          {/* Visuel d'en-tête, et LCP de la page : `priority` le fait précharger.
              En `<Image>` plutôt qu'en background CSS, il est optimisé (AVIF/WebP,
              variantes par largeur d'écran) et porte son texte alternatif. */}
          <Image
            src={heroImage}
            alt={HERO_ALT}
            fill
            fetchPriority="high"
            loading="eager"
            // `sizes="100vw"` sans déduction : la section est pleine largeur.
            sizes="100vw"
            // Photographie recouverte aux deux tiers par le dégradé ci-dessous :
            // −45 % de poids par rapport au défaut de 75, sans perte perceptible.
            quality={60}
            className="welcome-photo object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-welcome-cream/95 via-welcome-cream/75 to-transparent" />

          <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-10">
            <div className="max-w-2xl">
              <p className="font-manrope text-sm font-semibold uppercase tracking-[0.15em] text-welcome-gold">
                Bienvenue chez Welcome.
              </p>
              <h1 className="mt-5 font-manrope text-5xl font-semibold leading-[1.08] tracking-tight text-welcome-black md:text-6xl lg:text-7xl">
                Comme à la maison.
                <br />
                <span className="text-welcome-gold">En beaucoup plus inspirant.</span>
              </h1>
              <p className="mt-6 max-w-lg font-manrope text-lg leading-relaxed text-welcome-black/80">
                Découvrez un espace où le confort d’un salon, l’énergie d’un collectif et les
                services d’un bureau premium se rencontrent.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/#contact"
                  className="hidden h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg lg:inline-flex"
                >
                  Organiser une visite
                </Link>
                <a
                  href="https://wa.me/33622805536"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[52px] items-center justify-center rounded-[12px] bg-[#25D366] px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg lg:hidden"
                >
                  WhatsApp
                </a>
                <Link
                  href="/#espaces"
                  className="inline-flex h-[52px] items-center justify-center rounded-[12px] border border-welcome-black/20 bg-welcome-white/80 px-8 font-manrope text-[16px] font-semibold text-welcome-black backdrop-blur-sm transition-all duration-200 hover:bg-welcome-white hover:shadow-md"
                >
                  Découvrir Welcome
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
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
