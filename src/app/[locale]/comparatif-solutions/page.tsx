import type { Metadata } from "next";
import { ArrowLeft, Check, Minus, X } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, localePath } from "@/lib/metadata";
import { breadcrumbJsonLd, SITE_NAME } from "@/lib/seo";

const PATH = "/comparatif-solutions";

type Status = "included" | "excluded" | "variable";
type Value = { status: Status; label: string };
type Offer = { name: string; tagline: string; idealFor: string };
type Group = { title: string; rows: { label: string; values: Value[] }[] };

function StatusIcon({ status }: { status: Status }) {
  if (status === "included") {
    return (
      <Check className="h-[18px] w-[18px] text-welcome-sage" strokeWidth={2.5} aria-hidden="true" />
    );
  }
  if (status === "excluded") {
    return (
      <X className="h-[18px] w-[18px] text-welcome-body/35" strokeWidth={2} aria-hidden="true" />
    );
  }
  return (
    <Minus className="h-[18px] w-[18px] text-welcome-gold" strokeWidth={2.5} aria-hidden="true" />
  );
}

function ComparisonValue({ value }: { value: Value }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusIcon status={value.status} />
      <span>{value.label}</span>
    </span>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, path: PATH, namespace: "metadata.comparison" });
}

export default async function ComparisonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("comparisonPage");
  const tMeta = await getTranslations("metadata.comparison");
  const offers = t.raw("offers") as Offer[];
  const groups = t.raw("groups") as Group[];

  return (
    <div className="min-h-screen bg-welcome-cream">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: SITE_NAME, path: localePath(locale, "/") },
          { name: tMeta("ogTitle"), path: localePath(locale, PATH) },
        ])}
      />
      <Header />

      <main>
        <section className="px-6 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:px-10">
          <div className="mx-auto max-w-[1180px]">
            <Link
              href="/#solutions"
              className="inline-flex items-center gap-2 font-manrope text-[15px] font-semibold text-welcome-body transition-colors hover:text-welcome-gold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("back")}
            </Link>

            <div className="mx-auto mt-12 max-w-3xl text-center">
              <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
                {t("eyebrow")}
              </p>
              <h1 className="mt-5 font-manrope text-[42px] font-bold leading-[1.08] tracking-tight text-welcome-black sm:text-[54px] lg:text-[62px]">
                {t("titleLead")} <span className="text-welcome-gold">{t("titleHighlight")}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl font-inter text-[18px] leading-[1.75] text-welcome-body">
                {t("lead")}
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 lg:px-10 lg:pb-32">
          <div className="mx-auto max-w-[1280px]">
            <div className="hidden overflow-hidden rounded-[24px] border border-welcome-black/[0.08] bg-welcome-white shadow-[0_24px_70px_-40px_rgba(11,11,11,0.35)] lg:block">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">{t("tableCaption")}</caption>
                <thead>
                  <tr>
                    <th className="w-[25%] border-b border-welcome-black/[0.08] bg-welcome-cream/70 p-7 text-left font-manrope text-[14px] font-semibold uppercase tracking-[0.1em] text-welcome-body/70">
                      {t("criteria")}
                    </th>
                    {offers.map((offer, index) => (
                      <th
                        key={offer.name}
                        scope="col"
                        className={`border-b border-l border-welcome-black/[0.08] p-7 text-left ${index === 1 ? "bg-welcome-gold/[0.07]" : "bg-welcome-white"}`}
                      >
                        <p className="font-manrope text-[24px] font-semibold text-welcome-black">
                          {offer.name}
                        </p>
                        <p className="mt-2 font-inter text-[14px] font-normal leading-relaxed text-welcome-body/75">
                          {offer.tagline}
                        </p>
                        <p className="mt-4 inline-flex rounded-full bg-welcome-black/[0.05] px-3 py-1 font-inter text-[12px] font-medium text-welcome-body">
                          {offer.idealFor}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <GroupRows key={group.title} group={group} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-6 lg:hidden">
              {offers.map((offer, offerIndex) => (
                <article
                  key={offer.name}
                  className={`overflow-hidden rounded-[22px] border border-welcome-black/[0.08] bg-welcome-white shadow-[0_16px_50px_-36px_rgba(11,11,11,0.35)] ${offerIndex === 1 ? "ring-1 ring-welcome-gold/35" : ""}`}
                >
                  <div className={offerIndex === 1 ? "bg-welcome-gold/[0.08] p-6" : "p-6"}>
                    <h2 className="font-manrope text-[27px] font-semibold text-welcome-black">
                      {offer.name}
                    </h2>
                    <p className="mt-2 font-inter text-[15px] leading-relaxed text-welcome-body/75">
                      {offer.tagline}
                    </p>
                    <p className="mt-4 inline-flex rounded-full bg-welcome-black/[0.05] px-3 py-1 font-inter text-[12px] font-medium text-welcome-body">
                      {offer.idealFor}
                    </p>
                  </div>
                  <div className="border-t border-welcome-black/[0.08]">
                    {groups
                      .flatMap((group) => group.rows)
                      .map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-welcome-black/[0.06] px-6 py-4 last:border-b-0"
                        >
                          <p className="font-inter text-[14px] font-medium text-welcome-body">
                            {row.label}
                          </p>
                          <p className="font-inter text-[14px] leading-snug text-welcome-black">
                            <ComparisonValue value={row.values[offerIndex]} />
                          </p>
                        </div>
                      ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-[14px] bg-welcome-white/70 px-5 py-4 font-inter text-[13px] text-welcome-body/75">
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-welcome-sage" />
                {t("legend.included")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Minus className="h-4 w-4 text-welcome-gold" />
                {t("legend.variable")}
              </span>
              <span className="inline-flex items-center gap-2">
                <X className="h-4 w-4 text-welcome-body/35" />
                {t("legend.excluded")}
              </span>
            </div>
            <p className="mx-auto mt-5 max-w-3xl text-center font-inter text-[13px] leading-relaxed text-welcome-body/65">
              {t("note")}
            </p>
          </div>
        </section>

        <section className="bg-welcome-black px-6 py-20 text-center sm:py-24 lg:px-10">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-manrope text-[34px] font-semibold leading-tight tracking-tight text-welcome-ink-fg sm:text-[42px]">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-inter text-[16px] leading-relaxed text-welcome-ink-fg/70">
              {t("ctaText")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all hover:brightness-105 hover:shadow-lg"
              >
                {t("ctaVisit")}
              </Link>
              <Link
                href="/faq"
                className="inline-flex h-[52px] items-center justify-center rounded-[12px] border border-welcome-ink-fg/25 px-8 font-manrope text-[16px] font-semibold text-welcome-ink-fg transition-all hover:border-welcome-gold hover:text-welcome-gold"
              >
                {t("ctaFaq")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function GroupRows({ group }: { group: Group }) {
  return (
    <>
      <tr>
        <th
          colSpan={4}
          className="bg-welcome-cream/70 px-7 py-3 text-left font-manrope text-[13px] font-semibold uppercase tracking-[0.1em] text-welcome-sage"
        >
          {group.title}
        </th>
      </tr>
      {group.rows.map((row) => (
        <tr key={row.label} className="border-b border-welcome-black/[0.06] last:border-b-0">
          <th
            scope="row"
            className="px-7 py-5 text-left font-inter text-[15px] font-medium text-welcome-body"
          >
            {row.label}
          </th>
          {row.values.map((value, index) => (
            <td
              key={`${row.label}-${index}`}
              className={`border-l border-welcome-black/[0.06] px-7 py-5 font-inter text-[14px] leading-snug text-welcome-black ${index === 1 ? "bg-welcome-gold/[0.035]" : ""}`}
            >
              <ComparisonValue value={value} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
