import type { Metadata } from "next";
import Link from "next/link";

import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, OG_DEFAULTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes sur Welcome Coworking Strasbourg",
  description:
    "Toutes les réponses sur Welcome Coworking à Strasbourg : tarifs, accès 24/7, bureaux privatifs, salle de réunion, stationnement et visite de l'espace.",
  alternates: { canonical: "/faq" },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/faq",
    title: "FAQ — Welcome Coworking Strasbourg",
    description:
      "Questions fréquentes sur le coworking Welcome à Strasbourg : formules, horaires, services et organisation d'une visite.",
  },
  twitter: { card: "summary" },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-welcome-white">
      <JsonLd data={faqPageJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Questions fréquentes", path: "/faq" },
        ])}
      />

      <Header />
      <main className="pt-[90px]">
        <FaqSection />
        <section className="bg-welcome-cream py-[100px]">
          <div className="mx-auto w-full max-w-[900px] px-6 text-center">
            <h2 className="font-manrope text-3xl font-semibold tracking-tight text-welcome-black md:text-4xl">
              Une autre question ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-inter text-[16px] leading-relaxed text-welcome-body">
              Écrivez-nous ou venez découvrir l'espace : nous répondons rapidement et organisons les
              visites sur rendez-vous.
            </p>
            <Link
              href="/#contact"
              className="mt-8 inline-flex h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg"
            >
              Nous contacter
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
