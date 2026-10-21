import type { Metadata } from "next";
import { ArrowRight, Check, FileText, Mail } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.shopConfirmation" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function ShopConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop.confirmation");

  return (
    <div className="min-h-screen bg-welcome-cream">
      <Header />
      <main className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(198,178,74,0.2),transparent_65%)]"
          aria-hidden="true"
        />

        <section className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-welcome-gold/35 bg-welcome-white shadow-[0_30px_90px_-45px_rgba(11,11,11,0.45)]">
          <div className="relative border-b border-welcome-line px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-welcome-gold text-[#0b0b0b] shadow-[0_16px_40px_-18px_rgba(198,178,74,0.9)]">
              <Check className="h-10 w-10" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <p className="font-manrope text-sm font-bold uppercase tracking-[0.22em] text-welcome-gold-dark">
              {t("eyebrow")}
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl font-manrope text-3xl font-semibold leading-tight text-welcome-black sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-inter text-base leading-7 text-welcome-muted sm:text-lg">
              {t("lead")}
            </p>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-10">
            <div className="rounded-2xl border border-welcome-line bg-welcome-cream/70 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-welcome-gold/15 text-welcome-gold-dark">
                <Mail className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="font-manrope text-xl font-semibold text-welcome-black">
                {t("emailTitle")}
              </h2>
              <p className="mt-3 font-inter text-sm leading-6 text-welcome-muted">
                {t("emailText")}
              </p>
            </div>

            <div className="rounded-2xl border border-welcome-line bg-welcome-cream/70 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-welcome-gold/15 text-welcome-gold-dark">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="font-manrope text-xl font-semibold text-welcome-black">
                {t("invoiceTitle")}
              </h2>
              <p className="mt-3 font-inter text-sm leading-6 text-welcome-muted">
                {t("invoiceText")}
              </p>
            </div>
          </div>

          <div className="px-6 pb-10 text-center sm:px-10 sm:pb-12">
            <p className="font-inter text-sm text-welcome-muted">{t("contact")}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-welcome-gold px-6 font-manrope text-sm font-semibold text-[#0b0b0b] transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg"
              >
                {t("homeButton")}
              </Link>
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-welcome-line px-6 font-manrope text-sm font-semibold text-welcome-black transition-all hover:-translate-y-0.5 hover:border-welcome-gold"
              >
                {t("shopButton")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
