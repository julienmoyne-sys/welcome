import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, OG_DEFAULTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Welcome Coworking",
  description:
    "Conditions générales d'utilisation du site welcome-coworking.com, édité par BUZZ CAPITAL (SAS), espace de coworking à Strasbourg.",
  alternates: { canonical: "/conditions-generales-d-utilisation" },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/conditions-generales-d-utilisation",
    title: "Conditions générales d'utilisation — Welcome Coworking",
    description:
      "Règles d'accès et d'utilisation du site Welcome Coworking : contenus, formulaire de contact, responsabilité et droit applicable.",
  },
  twitter: { card: "summary" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Conditions générales d'utilisation", path: "/conditions-generales-d-utilisation" },
]);

const sections: { title: string; paragraphs: string[] }[] = [
  {
    title: "1. Objet",
    paragraphs: [
      "Les présentes conditions générales d'utilisation (les « CGU ») définissent les modalités d'accès et d'utilisation du site welcome-coworking.com (le « Site »), édité par la société BUZZ CAPITAL, SAS au capital de 10 000 €, immatriculée au RCS de Strasbourg sous le numéro 825 282 551, dont le siège social est situé 204 avenue de Colmar, 67100 Strasbourg.",
      "Le Site est un site vitrine présentant les espaces, les formules et les services de l'espace de coworking Welcome. Aucune vente ni réservation payante n'est réalisée en ligne.",
    ],
  },
  {
    title: "2. Acceptation des CGU",
    paragraphs: [
      "La navigation sur le Site implique l'acceptation pleine et entière des présentes CGU. L'éditeur peut les modifier à tout moment ; la version applicable est celle en ligne au moment de la consultation.",
    ],
  },
  {
    title: "3. Accès au Site",
    paragraphs: [
      "Le Site est accessible gratuitement, 24 heures sur 24 et 7 jours sur 7, sauf interruption pour maintenance, mise à jour, cas de force majeure ou défaillance technique. L'éditeur ne saurait être tenu responsable d'une indisponibilité temporaire.",
      "Les frais d'accès à internet et d'équipement restent à la charge de l'utilisateur.",
    ],
  },
  {
    title: "4. Utilisation du formulaire de contact",
    paragraphs: [
      "L'utilisateur s'engage à fournir des informations exactes lors de l'utilisation du formulaire de contact et à ne pas transmettre de contenu illicite, injurieux, diffamatoire ou portant atteinte aux droits de tiers.",
      "Les données transmises sont traitées conformément à la Politique de confidentialité et servent uniquement à répondre à la demande et, le cas échéant, à organiser une visite de l'espace.",
    ],
  },
  {
    title: "5. Comportements interdits",
    paragraphs: [
      "Sont notamment interdits : toute tentative d'accès non autorisé au Site ou à ses systèmes, l'extraction automatisée massive de contenus, l'introduction de programmes malveillants, ainsi que toute action susceptible de perturber le fonctionnement du Site.",
    ],
  },
  {
    title: "6. Propriété intellectuelle",
    paragraphs: [
      "L'ensemble des éléments du Site (textes, photographies, illustrations, logos, marques, mises en page et code) est protégé par le droit de la propriété intellectuelle et demeure la propriété de BUZZ CAPITAL ou de ses partenaires.",
      "Toute reproduction, représentation ou adaptation, totale ou partielle, est interdite sans autorisation écrite préalable.",
    ],
  },
  {
    title: "7. Liens hypertextes",
    paragraphs: [
      "Le Site peut renvoyer vers des services tiers (cartographie, messagerie, réseaux sociaux, avis clients). L'éditeur n'exerce aucun contrôle sur ces services et décline toute responsabilité quant à leur contenu ou à leurs pratiques.",
    ],
  },
  {
    title: "8. Responsabilité",
    paragraphs: [
      "Les informations publiées sur le Site sont fournies à titre indicatif et peuvent évoluer. Elles ne constituent pas une offre contractuelle ; les prestations font l'objet de contrats et de conditions communiqués séparément.",
      "L'éditeur ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du Site.",
    ],
  },
  {
    title: "9. Données personnelles et cookies",
    paragraphs: [
      "Le traitement des données personnelles et l'usage des cookies sont décrits dans la Politique de confidentialité et la Politique de cookies, accessibles depuis le pied de page du Site.",
    ],
  },
  {
    title: "10. Droit applicable et litiges",
    paragraphs: [
      "Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents seront ceux du ressort de Strasbourg.",
      "Toute question relative aux CGU peut être adressée à contact@welcome-coworking.com.",
    ],
  },
];

export default function Cgu() {
  return (
    <div className="min-h-screen bg-welcome-white">
      <JsonLd data={breadcrumb} />

      <Header />

      <main className="mx-auto w-full max-w-[880px] px-6 pb-28 pt-[130px] sm:px-8">
        <p className="font-inter text-[13px] font-medium uppercase tracking-[0.22em] text-welcome-gold">
          Informations légales
        </p>
        <h1 className="mt-4 font-manrope text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-welcome-black sm:text-[46px]">
          Conditions générales <span className="text-welcome-gold">d'utilisation</span>
        </h1>
        <p className="mt-6 font-inter text-[16px] leading-[1.75] text-welcome-body">
          Règles applicables à l'accès et à l'utilisation du site welcome-coworking.com.
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
