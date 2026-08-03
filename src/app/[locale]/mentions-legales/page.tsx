import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, OG_DEFAULTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Mentions légales — Welcome Coworking Strasbourg",
  description:
    "Mentions légales de Welcome Coworking, espace de coworking à Strasbourg exploité par BUZZ CAPITAL (SAS), 204 avenue de Colmar, 67100 Strasbourg.",
  alternates: { canonical: "/mentions-legales" },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/mentions-legales",
    title: "Mentions légales — Welcome Coworking",
    description:
      "Éditeur, hébergeur, propriété intellectuelle et données personnelles du site Welcome Coworking à Strasbourg.",
  },
  twitter: { card: "summary" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Mentions légales", path: "/mentions-legales" },
]);

type Row = { label: string; value: React.ReactNode };

const editeurRows: Row[] = [
  { label: "Dénomination sociale", value: "BUZZ CAPITAL" },
  { label: "Nom commercial", value: "Welcome Coworking" },
  { label: "Forme juridique", value: "Société par actions simplifiée (SAS)" },
  { label: "Capital social", value: "10 000 €" },
  { label: "Siège social", value: "204 avenue de Colmar, 67100 Strasbourg, France" },
  { label: "SIREN", value: "825 282 551" },
  { label: "SIRET (siège)", value: "825 282 551 00019" },
  { label: "Immatriculation", value: "RCS Strasbourg 825 282 551" },
  { label: "Numéro de TVA intracommunautaire", value: "FR71825282551" },
  {
    label: "Code d'activité (NAF/APE)",
    value: "8211Z — Services administratifs combinés de bureau",
  },
  { label: "Date de création", value: "15 février 2017" },
  { label: "Président / Directeur de la publication", value: "Julien Moyne" },
  {
    label: "Téléphone",
    value: (
      <a className="transition-colors hover:text-welcome-gold" href="tel:+33622805536">
        +33 6 22 80 55 36
      </a>
    ),
  },
  {
    label: "E-mail",
    value: (
      <a
        className="transition-colors hover:text-welcome-gold"
        href="mailto:contact@welcome-coworking.com"
      >
        contact@welcome-coworking.com
      </a>
    ),
  },
];

const sections: { title: string; paragraphs: React.ReactNode[] }[] = [
  {
    title: "Hébergement du site",
    paragraphs: [
      "Le site est hébergé par OVHcloud, société par actions simplifiée à associé unique, immatriculée au RCS de Lille Métropole sous le numéro 424 761 419 00045, dont le siège social est situé 2 rue Kellermann, 59100 Roubaix, France.",
      "Contact hébergeur : support@ovhcloud.com — Téléphone : +33 9 72 10 10 07.",
    ],
  },
  {
    title: "Objet du site",
    paragraphs: [
      "Le présent site a pour objet de présenter les espaces, les formules et les services de l'espace de coworking Welcome, situé 204 avenue de Colmar à Strasbourg, ainsi que de permettre aux visiteurs de prendre contact ou d'organiser une visite.",
      "Aucune vente en ligne n'est réalisée sur ce site. Les prestations font l'objet de contrats et de conditions communiqués séparément.",
    ],
  },
  {
    title: "Propriété intellectuelle",
    paragraphs: [
      "L'ensemble des éléments composant le site (structure, textes, illustrations, photographies, logos, marques, icônes, mises en page et code) est la propriété de BUZZ CAPITAL ou de ses partenaires et est protégé par le droit de la propriété intellectuelle.",
      "Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, de ces éléments, par quelque procédé que ce soit, est interdite sans l'autorisation écrite préalable de BUZZ CAPITAL.",
    ],
  },
  {
    title: "Données personnelles",
    paragraphs: [
      "Les données transmises via le formulaire de contact (nom, adresse e-mail, téléphone et message) sont utilisées uniquement pour répondre à votre demande et organiser, le cas échéant, une visite de l'espace. Elles ne sont ni vendues ni cédées à des tiers à des fins commerciales.",
      "Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Ces droits s'exercent par e-mail à contact@welcome-coworking.com.",
      "Vous pouvez également introduire une réclamation auprès de la CNIL (3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — www.cnil.fr).",
    ],
  },
  {
    title: "Cookies et mesure d'audience",
    paragraphs: [
      "Le site utilise uniquement les cookies et le stockage local strictement nécessaires à son fonctionnement, notamment la mémorisation de votre préférence d'affichage (mode clair ou sombre). Ces éléments ne nécessitent pas de consentement préalable.",
      "En l'absence de traceurs publicitaires ou de mesure d'audience tierce, aucun profilage n'est réalisé.",
    ],
  },
  {
    title: "Liens hypertextes",
    paragraphs: [
      "Le site peut contenir des liens vers des sites tiers (cartographie, messagerie, réseaux sociaux). BUZZ CAPITAL n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou à leurs pratiques en matière de données personnelles.",
    ],
  },
  {
    title: "Responsabilité",
    paragraphs: [
      "Les informations diffusées sur le site sont fournies à titre indicatif et peuvent être modifiées à tout moment. BUZZ CAPITAL s'efforce d'en assurer l'exactitude et la mise à jour, sans pouvoir garantir l'absence totale d'erreur ou d'interruption de service.",
    ],
  },
  {
    title: "Droit applicable",
    paragraphs: [
      "Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents seront ceux du ressort de Strasbourg.",
    ],
  },
];

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-welcome-white">
      <JsonLd data={breadcrumb} />

      <Header />

      <main className="mx-auto w-full max-w-[880px] px-6 pb-28 pt-[130px] sm:px-8">
        <p className="font-inter text-[13px] font-medium uppercase tracking-[0.22em] text-welcome-gold">
          Informations légales
        </p>
        <h1 className="mt-4 font-manrope text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-welcome-black sm:text-[46px]">
          Mentions <span className="text-welcome-gold">légales</span>
        </h1>
        <p className="mt-6 font-inter text-[16px] leading-[1.75] text-welcome-body">
          Informations relatives à l'éditeur du site welcome-coworking.com, conformément à l'article
          6 de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.
        </p>

        <section className="mt-14">
          <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
            Éditeur du site
          </h2>
          <dl className="mt-6 overflow-hidden rounded-[20px] border border-welcome-black/[0.06] bg-welcome-cream/60 shadow-[0_2px_20px_rgba(11,11,11,0.04)]">
            {editeurRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid gap-1 px-6 py-4 sm:grid-cols-[240px_1fr] sm:gap-6 sm:py-[18px] ${
                  i > 0 ? "border-t border-welcome-black/[0.06]" : ""
                }`}
              >
                <dt className="font-inter text-[14px] text-welcome-body">{row.label}</dt>
                <dd className="font-manrope text-[15px] font-medium text-welcome-black">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-inter text-[13px] leading-relaxed text-welcome-body">
            Société immatriculée au Registre du commerce et des sociétés de Strasbourg sous le
            numéro 825 282 551.
          </p>
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
