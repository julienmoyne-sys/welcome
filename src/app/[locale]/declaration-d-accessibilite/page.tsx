import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, OG_DEFAULTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Déclaration d'accessibilité — Welcome Coworking",
  description:
    "Déclaration d'accessibilité numérique du site welcome-coworking.com : état de conformité, moyens mis en œuvre et contact en cas de difficulté d'accès.",
  alternates: { canonical: "/declaration-d-accessibilite" },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/declaration-d-accessibilite",
    title: "Déclaration d'accessibilité — Welcome Coworking",
    description:
      "État de conformité, technologies utilisées et voies de recours concernant l'accessibilité du site Welcome Coworking.",
  },
  twitter: { card: "summary" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Déclaration d'accessibilité", path: "/declaration-d-accessibilite" },
]);

const sections: { title: string; paragraphs: string[]; list?: string[] }[] = [
  {
    title: "Engagement",
    paragraphs: [
      "BUZZ CAPITAL, éditeur du site welcome-coworking.com, s'engage à rendre son site accessible au plus grand nombre, y compris aux personnes en situation de handicap, conformément à l'esprit du Référentiel général d'amélioration de l'accessibilité (RGAA 4.1) et des règles WCAG 2.1 niveau AA.",
      "Cette démarche est volontaire : en tant qu'entreprise privée de moins de 250 salariés réalisant un chiffre d'affaires inférieur à 250 millions d'euros, le site n'est pas légalement soumis à l'obligation d'accessibilité prévue par l'article 47 de la loi n°2005-102 du 11 février 2005.",
    ],
  },
  {
    title: "État de conformité",
    paragraphs: [
      "Le site welcome-coworking.com est en conformité partielle avec le RGAA 4.1. Aucun audit d'accessibilité externe n'a été réalisé à ce jour ; l'évaluation repose sur des vérifications internes.",
    ],
  },
  {
    title: "Mesures mises en œuvre",
    paragraphs: ["Les dispositions suivantes ont été intégrées lors de la conception du site :"],
    list: [
      "Structure sémantique du contenu (titres hiérarchisés, repères de navigation, un seul contenu principal par page).",
      "Alternatives textuelles pour les images porteuses d'information et libellés accessibles pour les boutons composés d'icônes.",
      "Navigation complète au clavier avec indicateurs de focus visibles.",
      "Champs de formulaire associés à des étiquettes explicites et messages d'erreur textuels.",
      "Contrastes de couleurs renforcés et mode clair / mode sombre au choix de l'utilisateur.",
      "Interface responsive utilisable sur mobile, tablette et ordinateur, avec zoom jusqu'à 200 % sans perte d'information.",
    ],
  },
  {
    title: "Limites connues",
    paragraphs: [
      "Certains contenus fournis par des services tiers peuvent ne pas être totalement accessibles, notamment la carte Google Maps intégrée et le widget d'avis clients Google. L'adresse postale et l'itinéraire sont également disponibles sous forme de texte, et les coordonnées de contact restent accessibles par téléphone et par e-mail.",
    ],
  },
  {
    title: "Retour d'information et contact",
    paragraphs: [
      "Si vous rencontrez une difficulté pour accéder à un contenu ou à un service du site, vous pouvez nous contacter afin d'obtenir une alternative accessible : par e-mail à contact@welcome-coworking.com, par téléphone au +33 6 22 80 55 36, ou par courrier à BUZZ CAPITAL — 204 avenue de Colmar, 67100 Strasbourg.",
      "Nous nous engageons à répondre dans un délai raisonnable et à proposer une solution adaptée.",
    ],
  },
  {
    title: "Voies de recours",
    paragraphs: [
      "Si un signalement reste sans réponse satisfaisante, vous pouvez saisir le Défenseur des droits : formulaire en ligne sur formulaire.defenseurdesdroits.fr, ou par courrier (libre et sans affranchissement) à Défenseur des droits — Libre réponse 71120 — 75342 Paris CEDEX 07. Un délégué peut également être contacté dans votre département.",
    ],
  },
];

export default function Accessibilite() {
  return (
    <div className="min-h-screen bg-welcome-white">
      <JsonLd data={breadcrumb} />

      <Header />

      <main className="mx-auto w-full max-w-[880px] px-6 pb-28 pt-[130px] sm:px-8">
        <p className="font-inter text-[13px] font-medium uppercase tracking-[0.22em] text-welcome-gold">
          Informations légales
        </p>
        <h1 className="mt-4 font-manrope text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-welcome-black sm:text-[46px]">
          Déclaration <span className="text-welcome-gold">d'accessibilité</span>
        </h1>
        <p className="mt-6 font-inter text-[16px] leading-[1.75] text-welcome-body">
          Déclaration établie le 2 août 2026 concernant le site welcome-coworking.com.
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
              {section.list && (
                <ul className="mt-2 space-y-3">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 font-inter text-[16px] leading-[1.8] text-welcome-body"
                    >
                      <span
                        className="mt-[11px] h-[5px] w-[5px] shrink-0 rounded-full bg-welcome-gold"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
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
