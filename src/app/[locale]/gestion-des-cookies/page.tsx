import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, OG_DEFAULTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Gestion des cookies — Welcome Coworking Strasbourg",
  description:
    "Gérez vos préférences de cookies sur le site de Welcome Coworking. Découvrez comment activer, désactiver ou supprimer les cookies selon votre navigateur.",
  alternates: { canonical: "/gestion-des-cookies" },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/gestion-des-cookies",
    title: "Gestion des cookies — Welcome Coworking",
    description: "Comment gérer, activer ou supprimer les cookies sur welcome-coworking.com.",
  },
  twitter: { card: "summary" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Gestion des cookies", path: "/gestion-des-cookies" },
]);

const browserGuides = [
  {
    name: "Google Chrome",
    steps: [
      "Cliquez sur les trois points en haut à droite, puis sur Paramètres.",
      "Dans Confidentialité et sécurité, choisissez Cookies et autres données des sites.",
      "Activez ou désactivez les cookies selon vos préférences.",
      "Pour supprimer les cookies existants, cliquez sur Voir tous les cookies et données des sites.",
    ],
  },
  {
    name: "Mozilla Firefox",
    steps: [
      "Ouvrez le menu ☰, puis Paramètres.",
      "Dans le panneau Confidentialité et sécurité, repérez la section Cookies et données de sites.",
      "Choisissez le niveau de blocage souhaité ou cliquez sur Gérer les données pour supprimer les cookies.",
    ],
  },
  {
    name: "Safari",
    steps: [
      "Dans la barre de menus, cliquez sur Safari > Préférences.",
      "Sélectionnez l'onglet Confidentialité.",
      "Sous Cookies et données de site, choisissez d'empêcher ou d'autoriser le suivi.",
      "Cliquez sur Gérer les données de sites web pour supprimer les cookies existants.",
    ],
  },
  {
    name: "Microsoft Edge",
    steps: [
      "Cliquez sur les trois points, puis Paramètres.",
      "Rendez-vous dans Cookies et autorisations de site.",
      "Gérez et supprimez les cookies selon vos préférences.",
    ],
  },
];

const sections: { title: string; paragraphs: React.ReactNode[] }[] = [
  {
    title: "Vos préférences sur Welcome Coworking",
    paragraphs: [
      "Welcome Coworking dépose uniquement des cookies strictement nécessaires au fonctionnement du site. Aucun cookie publicitaire, de mesure d'audience ou de réseau social n'est utilisé.",
      "Les cookies actuellement déposés servent à mémoriser votre préférence d'affichage (mode clair ou sombre) et à enregistrer votre accord sur l'utilisation de ces cookies nécessaires.",
    ],
  },
  {
    title: "Comment gérer les cookies dans votre navigateur",
    paragraphs: [
      "Vous pouvez à tout moment configurer votre navigateur pour accepter, refuser ou supprimer les cookies. La procédure varie légèrement selon le logiciel utilisé. Retrouvez ci-dessous les grandes étapes pour les navigateurs les plus courants.",
    ],
  },
  {
    title: "Conséquences du refus des cookies",
    paragraphs: [
      "Le refus des cookies strictement nécessaires peut affecter le fonctionnement de certaines fonctionnalités du site. Par exemple, votre préférence de thème (clair ou sombre) pourrait ne pas être conservée d'une page à l'autre ou d'une visite à l'autre.",
      "Le refus des cookies tiers (Google Maps, WhatsApp, réseaux sociaux) peut limiter l'affichage ou l'interaction avec ces services intégrés au site.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Pour toute question relative aux cookies et à la gestion de vos préférences, vous pouvez nous contacter à l'adresse suivante :",
    ],
  },
];

export default function GestionCookies() {
  return (
    <div className="min-h-screen bg-welcome-white">
      <JsonLd data={breadcrumb} />

      <Header />

      <main className="mx-auto w-full max-w-[880px] px-6 pb-28 pt-[130px] sm:px-8">
        <p className="font-inter text-[13px] font-medium uppercase tracking-[0.22em] text-welcome-gold">
          Vos préférences
        </p>
        <h1 className="mt-4 font-manrope text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-welcome-black sm:text-[46px]">
          Gestion des <span className="text-welcome-gold">cookies</span>
        </h1>
        <p className="mt-6 font-inter text-[16px] leading-[1.75] text-welcome-body">
          Cette page vous explique comment gérer, activer ou supprimer les cookies déposés lors de
          votre visite sur welcome-coworking.com.
        </p>

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
              {section.title === "Contact" && (
                <p className="font-inter text-[16px] leading-[1.8] text-welcome-body">
                  <a
                    className="text-welcome-gold underline underline-offset-4 transition-colors hover:text-welcome-black"
                    href="mailto:contact@welcome-coworking.com"
                  >
                    contact@welcome-coworking.com
                  </a>
                </p>
              )}
            </div>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
            Guides par navigateur
          </h2>
          <div className="mt-6 space-y-6">
            {browserGuides.map((guide) => (
              <div
                key={guide.name}
                className="overflow-hidden rounded-[20px] border border-welcome-black/[0.06] bg-welcome-cream/60 p-6 shadow-[0_2px_20px_rgba(11,11,11,0.04)]"
              >
                <h3 className="font-manrope text-[17px] font-semibold text-welcome-black">
                  {guide.name}
                </h3>
                <ol className="mt-4 list-decimal space-y-2 pl-5 font-inter text-[15px] leading-[1.75] text-welcome-body marker:text-welcome-gold">
                  {guide.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

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
