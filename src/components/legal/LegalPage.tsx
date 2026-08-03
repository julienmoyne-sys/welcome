import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Link } from "@/i18n/navigation";

type Section = { title: string; paragraphs: string[]; list?: string[] };
type Row = { label: string; value: string; link?: "tel" | "mailto" };
type CookieRow = { name: string; type: string; duration: string; purpose: string };
type Guide = { name: string; steps: string[] };

/**
 * Gabarit unique des six pages légales.
 *
 * Tout le contenu vient des messages du namespace passé en `namespace`, et les
 * blocs propres à certaines pages (tableau de l'éditeur, tableau des cookies,
 * guides par navigateur, liste des droits) sont détectés par présence de clé via
 * `t.has()`. Cela évite six composants quasi identiques.
 */
export function LegalPage({ namespace, jsonLd }: { namespace: string; jsonLd: ReactNode }) {
  const t = useTranslations(namespace);
  const tCommon = useTranslations("common");

  const sections = t.raw("sections") as Section[];
  const rowsKey = t.has("publisherRows") ? "publisherRows" : "controllerRows";
  const hasRows = t.has("publisherRows") || t.has("controllerRows");
  const rows = hasRows ? (t.raw(rowsKey) as Row[]) : [];
  const rowsTitle = t.has("publisherTitle") ? t("publisherTitle") : t.has("controllerTitle") ? t("controllerTitle") : "";

  const rightsTitle = t.has("rightsSectionTitle") ? t("rightsSectionTitle") : null;
  const rights = rightsTitle ? (t.raw("rights") as string[]) : [];

  return (
    <div className="min-h-screen bg-welcome-white">
      {jsonLd}
      <Header />

      <main className="mx-auto w-full max-w-[880px] px-6 pb-28 pt-[130px] sm:px-8">
        <p className="font-inter text-[13px] font-medium uppercase tracking-[0.22em] text-welcome-gold">
          {t.has("eyebrow") ? t("eyebrow") : tCommon("legalEyebrow")}
        </p>
        <h1 className="mt-4 font-manrope text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-welcome-black sm:text-[46px]">
          {t("titleLead")} <span className="text-welcome-gold">{t("titleHighlight")}</span>
        </h1>
        <p className="mt-6 font-inter text-[16px] leading-[1.75] text-welcome-body">{t("intro")}</p>

        {hasRows && (
          <section className="mt-14">
            <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
              {rowsTitle}
            </h2>
            <dl className="mt-6 overflow-hidden rounded-[20px] border border-welcome-black/[0.06] bg-welcome-cream/60 shadow-[0_2px_20px_rgba(11,11,11,0.04)]">
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid gap-1 px-6 py-4 sm:grid-cols-[240px_1fr] sm:gap-6 sm:py-[18px] ${
                    i > 0 ? "border-t border-welcome-black/[0.06]" : ""
                  }`}
                >
                  <dt className="font-inter text-[14px] text-welcome-body">{row.label}</dt>
                  <dd className="font-manrope text-[15px] font-medium text-welcome-black">
                    {row.link ? (
                      <a
                        className="transition-colors hover:text-welcome-gold"
                        href={`${row.link}:${row.link === "tel" ? row.value.replace(/\s/g, "") : row.value}`}
                      >
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {t.has("publisherNote") && (
              <p className="mt-4 font-inter text-[13px] leading-relaxed text-welcome-body">
                {t("publisherNote")}
              </p>
            )}
          </section>
        )}

        {t.has("tableTitle") && <CookieTable namespace={namespace} />}

        {sections.map((section) => (
          <section key={section.title} className="mt-12">
            <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="font-inter text-[16px] leading-[1.8] text-welcome-body">
                  {paragraph}
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

              {rightsTitle === section.title && (
                <>
                  <ul className="mt-4 space-y-2 pl-5 font-inter text-[16px] leading-[1.8] text-welcome-body">
                    {rights.map((right) => (
                      <li key={right} className="list-disc marker:text-welcome-gold">
                        {right}
                      </li>
                    ))}
                  </ul>
                  <p className="font-inter text-[16px] leading-[1.8] text-welcome-body">
                    {t("rightsFooterBefore")}{" "}
                    <a
                      className="text-welcome-gold underline underline-offset-4 transition-colors hover:text-welcome-black"
                      href="mailto:contact@welcome-coworking.com"
                    >
                      contact@welcome-coworking.com
                    </a>{" "}
                    {t("rightsFooterAfter")}
                  </p>
                </>
              )}

              {t.has("contactSectionTitle") && t("contactSectionTitle") === section.title && (
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

        {t.has("guidesTitle") && <BrowserGuides namespace={namespace} />}

        <div className="mt-16 flex flex-col items-start gap-4 border-t border-welcome-black/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-inter text-[13px] text-welcome-body">{tCommon("lastUpdated")}</p>
          <Link
            href="/"
            className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-welcome-gold px-7 font-manrope text-[15px] font-semibold text-[#0b0b0b] transition-transform duration-200 hover:-translate-y-[1px]"
          >
            {tCommon("backHome")}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function CookieTable({ namespace }: { namespace: string }) {
  const t = useTranslations(namespace);
  const rows = t.raw("rows") as CookieRow[];
  const columns = ["name", "type", "duration", "purpose"] as const;

  return (
    <section className="mt-14">
      <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
        {t("tableTitle")}
      </h2>
      <div className="mt-6 overflow-hidden rounded-[20px] border border-welcome-black/[0.06] bg-welcome-cream/60 shadow-[0_2px_20px_rgba(11,11,11,0.04)]">
        <div className="hidden grid-cols-[1.4fr_0.9fr_0.7fr_1.8fr] gap-6 px-6 py-4 sm:grid">
          {columns.map((column) => (
            <span
              key={column}
              className="font-inter text-[13px] font-semibold text-welcome-black"
            >
              {t(`tableHeaders.${column}`)}
            </span>
          ))}
        </div>
        {rows.map((row, i) => (
          <div
            key={row.name}
            className={`grid gap-4 px-6 py-5 sm:grid-cols-[1.4fr_0.9fr_0.7fr_1.8fr] sm:gap-6 ${
              i > 0
                ? "border-t border-welcome-black/[0.06]"
                : "border-t border-welcome-black/[0.06] sm:border-t-0"
            }`}
          >
            {columns.map((column) => (
              <div key={column} className="flex flex-col gap-1">
                <span className="font-inter text-[13px] font-semibold text-welcome-body sm:hidden">
                  {t(`tableHeaders.${column}`)}
                </span>
                <span
                  className={
                    column === "name"
                      ? "font-manrope text-[15px] font-medium text-welcome-black"
                      : "font-inter text-[15px] leading-relaxed text-welcome-body"
                  }
                >
                  {row[column]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function BrowserGuides({ namespace }: { namespace: string }) {
  const t = useTranslations(namespace);
  const guides = t.raw("guides") as Guide[];

  return (
    <section className="mt-14">
      <h2 className="font-manrope text-[22px] font-semibold text-welcome-black">
        {t("guidesTitle")}
      </h2>
      <div className="mt-6 space-y-6">
        {guides.map((guide) => (
          <div
            key={guide.name}
            className="overflow-hidden rounded-[20px] border border-welcome-black/[0.06] bg-welcome-cream/60 p-6 shadow-[0_2px_20px_rgba(11,11,11,0.04)]"
          >
            <h3 className="font-manrope text-[17px] font-semibold text-welcome-black">
              {guide.name}
            </h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 font-inter text-[15px] leading-[1.75] text-welcome-body marker:text-welcome-gold">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
