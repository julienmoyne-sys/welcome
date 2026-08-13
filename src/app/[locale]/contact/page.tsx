import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, localePath } from "@/lib/metadata";
import { breadcrumbJsonLd, SITE_NAME } from "@/lib/seo";

const PATH = "/contact";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, path: PATH, namespace: "metadata.contact" });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contactPage");
  const tMeta = await getTranslations("metadata.contact");

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
        <section className="px-6 pb-4 pt-16 text-center sm:pt-20 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
              {t("eyebrow")}
            </p>
            <h1 className="mt-5 font-manrope text-[42px] font-bold leading-[1.08] tracking-tight text-welcome-black sm:text-[54px] lg:text-[62px]">
              {t("title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-inter text-[18px] leading-[1.75] text-welcome-body">
              {t("lead")}
            </p>
          </div>
        </section>
        <ContactSection showHeader={false} />
      </main>
      <Footer />
    </div>
  );
}
