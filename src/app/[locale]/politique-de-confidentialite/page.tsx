import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, OG_DEFAULTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Welcome Coworking Strasbourg",
  description:
    "Politique de confidentialité de Welcome Coworking : collecte, utilisation, conservation et droits relatifs à vos données personnelles.",
  alternates: { canonical: "/politique-de-confidentialite" },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/politique-de-confidentialite",
    title: "Politique de confidentialité — Welcome Coworking",
    description:
      "Collecte, utilisation, conservation et droits relatifs à vos données personnelles sur welcome-coworking.com.",
  },
  twitter: { card: "summary" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Politique de confidentialité", path: "/politique-de-confidentialite" },
]);

type Row = { label: string; value: React.ReactNode };

const responsableRows: Row[] = [
  { label: "Raison sociale", value: "BUZZ CAPITAL" },
  { label: "Nom commercial", value: "Welcome Coworking" },
  { label: "Adresse", value: "204 avenue de Colmar, 67100 Strasbourg, France" },
  { label: "SIRET", value: "825 282 551 00019" },
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
    title: "Données collectées",
    paragraphs: [
      "Nous collectons uniquement les données nécessaires à la prise de contact et à l'organisation éventuelle d'une visite : nom, prénom, adresse e-mail, numéro de téléphone et contenu du message.",
      "Ces données sont fournies volontairement via le formulaire de contact. Aucune donnée n'est collectée automatiquement à des fins de profilage publicitaire.",
    ],
  },
  {
    title: "Finalités et base légale",
    paragraphs: [
      "Vos données sont utilisées pour répondre à vos demandes, vous fournir les informations sollicitées et, le cas échéant, organiser une visite de l'espace. La base légale du traitement est votre consentement, exprimé lors de l'envoi du formulaire, ainsi que l'intérêt légitime de Welcome Coworking à gérer ses relations avec ses prospects et clients.",
    ],
  },
  {
    title: "Destinataires des données",
    paragraphs: [
      "Seuls les responsables et collaborateurs de Welcome Coworking habilités à traiter votre demande ont accès à vos données. Elles ne sont pas vendues, louées ni cédées à des tiers à des fins commerciales.",
      "L'hébergement du site est assuré par OVHcloud, qui peut être amené à héberger les données techniques liées aux messages. Ce sous-traitant agit sous la responsabilité de BUZZ CAPITAL et dans le respect des obligations du RGPD.",
    ],
  },
  {
    title: "Durée de conservation",
    paragraphs: [
      "Les données issues du formulaire de contact sont conservées pendant la durée nécessaire au traitement de votre demande, puis archivées à des fins de preuve et de gestion des relations commerciales pendant une durée maximale de trois ans à compter du dernier contact, sauf obligation légale contraire.",
    ],
  },
  {
    title: "Vos droits",
    paragraphs: [
      "Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée, vous disposez des droits suivants :",
    ],
  },
  {
    title: "Sécurité",
    paragraphs: [
      "Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'altération, l'accès non autorisé ou la divulgation. Cela inclut notamment l'utilisation d'une connexion sécurisée (HTTPS) et l'hébergement chez un prestataire reconnu.",
      "En dépit de ces précautions, aucun système n'étant infaillible, nous vous invitons à ne jamais communiquer d'informations sensibles dans le formulaire de contact.",
    ],
  },
  {
    title: "Cookies et traceurs",
    paragraphs: [
      "Le site utilise uniquement des cookies et du stockage local strictement nécessaires à son fonctionnement, notamment pour mémoriser votre préférence d'affichage (mode clair ou sombre). Aucun cookie publicitaire ou de mesure d'audience tiers n'est déposé. Pour plus de détails, consultez notre politique de cookies.",
    ],
  },
  {
    title: "Modifications",
    paragraphs: [
      "Cette politique de confidentialité peut être mise à jour à tout moment pour refléter l'évolution de nos pratiques ou des obligations légales. La date de dernière mise à jour est indiquée en bas de page.",
    ],
  },
];

const rights = [
  "Droit d'accès à vos données personnelles ;",
  "Droit de rectification des données inexactes ;",
  "Droit à l'effacement (droit à l'oubli) dans les conditions prévues par la loi ;",
  "Droit à la limitation du traitement ;",
  "Droit d'opposition au traitement, notamment à des fins de prospection commerciale ;",
  "Droit à la portabilité de vos données ;",
  "Droit de définir des directives relatives au sort de vos données après votre décès.",
];

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-welcome-white">
      <JsonLd data={breadcrumb} />

      <Header />

      <main className="mx-auto w-full max-w-[880px] px-6 pb-28 pt-[130px] sm:px-8">
        <p className="font-inter text-[13px] font-medium uppercase tracking-[0.22em] text-welcome-gold">
          Protection des données
        </p>
        <h1 className="mt-4 font-manrope text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-welcome-black sm:text-[46px]">
          Politique de <span className="text-welcome-gold">confidentialité</span>
        </h1>
        <p className="mt-6 font-inter text-[16px] leading-[1.75] text-welcome-body">
          Cette page décrit comment Welcome Coworking collecte, utilise et protège vos données
          personnelles lorsque vous utilisez le site welcome-coworking.com.
        </p>

        <section className="mt-14">
          <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
            Responsable du traitement
          </h2>
          <dl className="mt-6 overflow-hidden rounded-[20px] border border-welcome-black/[0.06] bg-welcome-cream/60 shadow-[0_2px_20px_rgba(11,11,11,0.04)]">
            {responsableRows.map((row, i) => (
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
              {section.title === "Vos droits" && (
                <ul className="mt-4 space-y-2 pl-5 font-inter text-[16px] leading-[1.8] text-welcome-body">
                  {rights.map((right, i) => (
                    <li key={i} className="list-disc marker:text-welcome-gold">
                      {right}
                    </li>
                  ))}
                </ul>
              )}
              {section.title === "Vos droits" && (
                <p className="font-inter text-[16px] leading-[1.8] text-welcome-body">
                  Pour exercer ces droits, envoyez-nous un message à{" "}
                  <a
                    className="text-welcome-gold underline underline-offset-4 transition-colors hover:text-welcome-black"
                    href="mailto:contact@welcome-coworking.com"
                  >
                    contact@welcome-coworking.com
                  </a>{" "}
                  ou écrivez à l'adresse postale indiquée ci-dessus. Nous nous engageons à vous
                  répondre dans un délai d'un mois. Vous pouvez également introduire une réclamation
                  auprès de la CNIL (www.cnil.fr).
                </p>
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
