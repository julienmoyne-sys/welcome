import type { Metadata } from "next";
import Image from "next/image";

import loungeImage from "@/assets/espace-commun-welcome.png";
import meetingImage from "@/assets/salle-reunion-welcome-carree.jpg";

import officeImage from "@/assets/bureau-individuel-ambiance.png";
import cloudImage from "@/assets/bureau-individuel-ambiance-nuages.png";
import spaceImage from "@/assets/bureaux-privatifs-espace-commun.jpg";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, localePath } from "@/lib/metadata";
import { breadcrumbJsonLd, faqPageJsonLd, SITE_MAP_URL, SITE_NAME, SITE_URL } from "@/lib/seo";

const PATH = "/bureau-privatif-individuel-1-personne-strasbourg";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, path: PATH, namespace: "metadata.individualOffice" });
}

export default async function IndividualOfficePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("individualOfficePage");
  const faq = t.raw("faq") as { question: string; answer: string }[];
  const cost = t.raw("cost") as { title: string; text: string }[];
  const url = `${SITE_URL}${localePath(locale, PATH)}`;
  const heading = "font-manrope text-3xl font-bold tracking-tight text-welcome-black sm:text-4xl";

  return (
    <div className="min-h-screen bg-welcome-cream">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: SITE_NAME, path: localePath(locale, "/") },
          { name: t("back"), path: localePath(locale, "/bureaux-privatifs") },
          { name: t("title"), path: localePath(locale, PATH) },
        ])}
      />
      <JsonLd
        data={faqPageJsonLd(
          faq.map((item) => ({ ...item, category: "privateOffice" })),
          localePath(locale, PATH),
        )}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${url}#service`,
          name: t("title"),
          description: t("lead"),
          url,
          provider: { "@id": `${SITE_URL}/#organization` },
          areaServed: { "@type": "City", name: "Strasbourg" },
        }}
      />
      <Header />
      <main className="mx-auto max-w-5xl space-y-16 px-6 py-12 font-inter text-lg leading-relaxed text-welcome-body sm:py-16 lg:px-10">
        <section aria-labelledby="office-title">
          <Link href="/bureaux-privatifs" className="text-base underline underline-offset-4">
            {t("back")}
          </Link>
          <h1
            id="office-title"
            className="mt-8 font-manrope text-4xl font-bold leading-tight tracking-tight text-welcome-black sm:text-5xl"
          >
            {t("title")}
          </h1>
          <p className="mt-6">{t("lead")}</p>
          <p className="mt-8 font-manrope text-3xl font-bold text-welcome-black">{t("price")}</p>
          <p className="mt-3 text-base">{t("conditions")}</p>
          <h2 className={`${heading} mt-10`}>{t("includedTitle")}</h2>
          <ul className="mt-6 list-disc space-y-2 pl-6">
            {(t.raw("included") as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-xl bg-welcome-gold px-6 py-4 font-semibold text-[#0b0b0b]"
          >
            {t("contact")}
          </Link>
        </section>
        <section aria-labelledby="visuals-title">
          <h2 id="visuals-title" className={heading}>
            {t("visuals.title")}
          </h2>
          <figure className="mt-8">
            <div className="grid gap-5 sm:grid-cols-[1.25fr_0.75fr]">
              <Image
                src={officeImage}
                alt={t("visuals.officeAlt")}
                sizes="(min-width: 640px) 60vw, 100vw"
                className="h-full w-full rounded-2xl object-cover"
              />
              <Image
                src={cloudImage}
                alt={t("visuals.cloudAlt")}
                sizes="(min-width: 640px) 35vw, 100vw"
                className="h-full max-h-[640px] w-full rounded-2xl object-cover"
              />
            </div>
            <figcaption className="mt-3 text-sm">{t("visuals.illustrationCaption")}</figcaption>
          </figure>
          <figure className="mt-8">
            <Image
              src={spaceImage}
              alt={t("visuals.spaceAlt")}
              sizes="(min-width: 1024px) 944px, 100vw"
              className="h-auto w-full rounded-2xl"
            />
            <figcaption className="mt-3 text-sm">{t("visuals.spaceCaption")}</figcaption>
          </figure>
          <div className="mt-8 grid items-start gap-6 sm:grid-cols-2">
            <figure>
              <Image
                src={loungeImage}
                alt={t("visuals.loungeAlt")}
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 50vw, 100vw"
                className="aspect-square w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-3 text-sm">{t("visuals.loungeCaption")}</figcaption>
            </figure>
            <figure>
              <Image
                src={meetingImage}
                alt={t("visuals.meetingAlt")}
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 50vw, 100vw"
                className="aspect-square w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-3 text-sm">{t("visuals.meetingCaption")}</figcaption>
            </figure>
          </div>
        </section>
        <section aria-labelledby="cost-title">
          <h2 id="cost-title" className={heading}>
            {t("costTitle")}
          </h2>
          <div className="mt-8 space-y-6">
            {cost.map((item) => (
              <article key={item.title} className="rounded-2xl bg-welcome-white p-6">
                <h3 className="font-manrope text-xl font-semibold text-welcome-black">
                  {item.title}
                </h3>
                <p className="mt-3">{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="audience-title">
          <h2 id="audience-title" className={heading}>
            {t("audienceTitle")}
          </h2>
          <ul className="mt-6 list-disc space-y-2 pl-6">
            {(t.raw("audience") as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="location-title">
          <h2 id="location-title" className={heading}>
            {t("locationTitle")}
          </h2>
          <p className="mt-6">{t("location")}</p>
          <a href={SITE_MAP_URL} className="mt-4 inline-block underline underline-offset-4">
            {t("map")}
          </a>
        </section>
        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className={heading}>
            {t("faqTitle")}
          </h2>
          <div className="mt-8 space-y-8">
            {faq.map((item) => (
              <article key={item.question}>
                <h3 className="font-manrope text-xl font-semibold text-welcome-black">
                  {item.question}
                </h3>
                <p className="mt-3">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
