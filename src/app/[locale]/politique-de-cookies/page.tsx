import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, OG_DEFAULTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Politique de cookies — Welcome Coworking Strasbourg",
  description:
    "Politique de cookies de Welcome Coworking : découvrez les traceurs utilisés sur le site, leur finalité et comment gérer vos préférences.",
  alternates: { canonical: "/politique-de-cookies" },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/politique-de-cookies",
    title: "Politique de cookies — Welcome Coworking",
    description:
      "Les cookies et traceurs utilisés sur welcome-coworking.com et la gestion de vos préférences.",
  },
  twitter: { card: "summary" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Politique de cookies", path: "/politique-de-cookies" },
]);

type CookieRow = { name: string; type: string; duration: string; purpose: string };

const cookieRows: CookieRow[] = [
  {
    name: "welcome-theme",
    type: "Préférence",
    duration: "1 an",
    purpose:
      "Mémorise votre choix d'affichage (mode clair ou sombre) pour conserver une expérience cohérente d'une visite à l'autre.",
  },
  {
    name: "welcome-cookie-consent",
    type: "Préférence",
    duration: "1 an",
    purpose:
      "Enregistre votre accord sur le dépôt des cookies strictement nécessaires au fonctionnement du site.",
  },
];

const sections: { title: string; paragraphs: React.ReactNode[] }[] = [
  {
    title: "Qu'est-ce qu'un cookie ?",
    paragraphs: [
      "Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou smartphone) lors de la visite d'un site web. Il permet au site de mémoriser des informations utiles pour faciliter votre navigation et améliorer votre expérience.",
      "Le terme « cookie » désigne ici, de manière générale, l'ensemble des traceurs déposés ou lus lors de la consultation du site.",
    ],
  },
  {
    title: "Cookies strictement nécessaires",
    paragraphs: [
      "Welcome Coworking utilise uniquement des cookies strictement nécessaires au bon fonctionnement du site. Ces cookies ne nécessitent pas de consentement préalable, conformément aux règles de la CNIL et au RGPD.",
      "Ils servent à mémoriser vos préférences essentielles, notamment votre choix de thème (clair ou sombre), et à garantir la stabilité de votre navigation.",
    ],
  },
  {
    title: "Cookies de mesure d'audience",
    paragraphs: [
      "Le site ne dépose actuellement aucun cookie de mesure d'audience, de publicité ou de réseaux sociaux. Aucun profilage publicitaire n'est réalisé et aucune donnée de navigation n'est partagée avec des tiers à des fins de ciblage.",
    ],
  },
  {
    title: "Cookies tiers",
    paragraphs: [
      "Les seuls liens vers des services tiers présents sur le site (carte Google Maps, bouton WhatsApp, réseaux sociaux) peuvent déposer leurs propres cookies lorsque vous interagissez avec eux. Welcome Coworking n'a pas le contrôle sur ces cookies et vous invite à consulter les politiques de confidentialité respectives de ces services.",
    ],
  },
  {
    title: "Gestion des cookies",
    paragraphs: [
      "Vous pouvez à tout moment configurer votre navigateur pour refuser ou supprimer les cookies. La désactivation des cookies strictement nécessaires peut toutefois affecter le fonctionnement du site, notamment la mémorisation de votre préférence d'affichage.",
      "Pour en savoir plus sur la gestion des cookies selon votre navigateur, vous pouvez consulter les pages d'aide dédiées de Google Chrome, Mozilla Firefox, Safari ou Microsoft Edge.",
    ],
  },
  {
    title: "Durée de conservation",
    paragraphs: [
      "Les cookies déposés par Welcome Coworking sont conservés pour une durée maximale d'un an. Passé ce délai, ils sont automatiquement supprimés ou renouvelés lors de votre prochaine visite, selon votre choix.",
    ],
  },
  {
    title: "Modifications",
    paragraphs: [
      "Cette politique de cookies peut être mise à jour à tout moment pour refléter l'évolution de nos pratiques ou des obligations légales. La date de dernière mise à jour est indiquée en bas de page.",
    ],
  },
];

export default function PolitiqueCookies() {
  return (
    <div className="min-h-screen bg-welcome-white">
      <JsonLd data={breadcrumb} />

      <Header />

      <main className="mx-auto w-full max-w-[880px] px-6 pb-28 pt-[130px] sm:px-8">
        <p className="font-inter text-[13px] font-medium uppercase tracking-[0.22em] text-welcome-gold">
          Gestion des traceurs
        </p>
        <h1 className="mt-4 font-manrope text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-welcome-black sm:text-[46px]">
          Politique de <span className="text-welcome-gold">cookies</span>
        </h1>
        <p className="mt-6 font-inter text-[16px] leading-[1.75] text-welcome-body">
          Cette page vous informe des cookies et traceurs utilisés par Welcome Coworking sur le site
          welcome-coworking.com, ainsi que de la manière dont vous pouvez gérer vos préférences.
        </p>

        <section className="mt-14">
          <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
            Cookies déposés sur le site
          </h2>
          <div className="mt-6 overflow-hidden rounded-[20px] border border-welcome-black/[0.06] bg-welcome-cream/60 shadow-[0_2px_20px_rgba(11,11,11,0.04)]">
            <div className="hidden grid-cols-[1.4fr_0.9fr_0.7fr_1.8fr] gap-6 px-6 py-4 sm:grid">
              <span className="font-inter text-[13px] font-semibold text-welcome-black">Nom</span>
              <span className="font-inter text-[13px] font-semibold text-welcome-black">Type</span>
              <span className="font-inter text-[13px] font-semibold text-welcome-black">Durée</span>
              <span className="font-inter text-[13px] font-semibold text-welcome-black">
                Finalité
              </span>
            </div>
            {cookieRows.map((row, i) => (
              <div
                key={row.name}
                className={`grid gap-4 px-6 py-5 sm:grid-cols-[1.4fr_0.9fr_0.7fr_1.8fr] sm:gap-6 ${
                  i > 0
                    ? "border-t border-welcome-black/[0.06]"
                    : "border-t border-welcome-black/[0.06] sm:border-t-0"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-inter text-[13px] font-semibold text-welcome-body sm:hidden">
                    Nom
                  </span>
                  <span className="font-manrope text-[15px] font-medium text-welcome-black">
                    {row.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-inter text-[13px] font-semibold text-welcome-body sm:hidden">
                    Type
                  </span>
                  <span className="font-inter text-[15px] text-welcome-body">{row.type}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-inter text-[13px] font-semibold text-welcome-body sm:hidden">
                    Durée
                  </span>
                  <span className="font-inter text-[15px] text-welcome-body">{row.duration}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-inter text-[13px] font-semibold text-welcome-body sm:hidden">
                    Finalité
                  </span>
                  <span className="font-inter text-[15px] leading-relaxed text-welcome-body">
                    {row.purpose}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.title} className="mt-12">
            <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="font-inter text-[16px] leading-[1.8] text-welcome-body">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-16 flex flex-col items-start gap-4 border-t border-welcome-black/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-inter text-[13px] text-welcome-body">
            Dernière mise à jour : août 2026
          </p>
          <Link
            href="/"
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-welcome-gold px-7 font-manrope text-[15px] font-semibold text-[#0b0b0b] transition-transform duration-200 hover:-translate-y-[1px]"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
