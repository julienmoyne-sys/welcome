import type { StaticImageData } from "next/image";
import Image from "next/image";
import {
  Armchair,
  ArrowLeft,
  Clock3,
  Coffee,
  LockKeyhole,
  MessageCircle,
  Monitor,
  Presentation,
  Printer,
  Sofa,
  UtensilsCrossed,
  Video,
  Wifi,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { localePath } from "@/lib/metadata";
import { breadcrumbJsonLd, SITE_NAME } from "@/lib/seo";

type SpaceKind = "openSpace" | "privateOffices" | "meetingRoom" | "kitchenLounge";
type SpaceNamespace =
  "openSpacePage" | "privateOfficesPage" | "meetingRoomPage" | "kitchenLoungePage";

const FEATURE_ICONS = {
  openSpace: [Clock3, Wifi, Coffee, Printer],
  privateOffices: [LockKeyhole, Wifi, Armchair, Clock3],
  meetingRoom: [Presentation, Monitor, Video, Wifi],
  kitchenLounge: [Coffee, Sofa, UtensilsCrossed, MessageCircle],
} as const;

export async function SpacePresentationPage({
  locale,
  path,
  namespace,
  image,
  kind,
}: {
  locale: string;
  path: string;
  namespace: SpaceNamespace;
  image: StaticImageData;
  kind: SpaceKind;
}) {
  setRequestLocale(locale);

  const t = await getTranslations(namespace);
  const features = t.raw("features") as { title: string; text: string }[];
  const icons = FEATURE_ICONS[kind];

  return (
    <div className="min-h-screen bg-welcome-cream">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: SITE_NAME, path: localePath(locale, "/") },
          { name: t("eyebrow"), path: localePath(locale, path) },
        ])}
      />

      <Header />
      <main>
        <section className="px-6 pb-20 pt-10 sm:pb-24 sm:pt-14 lg:px-10 lg:pb-28">
          <div className="mx-auto max-w-[1280px]">
            <Link
              href="/#espaces"
              className="inline-flex items-center gap-2 font-manrope text-[15px] font-semibold text-welcome-body transition-colors hover:text-welcome-gold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("back")}
            </Link>

            <div className="mt-8 grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div className="py-4">
                <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
                  {t("eyebrow")}
                </p>
                <h1 className="mt-5 font-manrope text-[44px] font-bold leading-[1.04] tracking-tight text-welcome-black sm:text-[56px] lg:text-[64px]">
                  {t("titleLead")} <span className="text-welcome-gold">{t("titleHighlight")}</span>
                </h1>
                <p className="mt-7 max-w-xl font-inter text-lg leading-[1.75] text-welcome-body">
                  {t("lead")}
                </p>
                <Link
                  href="/#contact"
                  className="mt-9 inline-flex h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg"
                >
                  {t("visit")}
                </Link>
              </div>

              <div className="relative min-h-[440px] overflow-hidden rounded-[24px] shadow-[0_24px_70px_-35px_rgba(11,11,11,0.45)] sm:min-h-[560px]">
                <Image
                  src={image}
                  alt={t("imageAlt")}
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="welcome-photo object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-welcome-white px-6 py-20 sm:py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1180px]">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
              <div>
                <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
                  {t("detailsEyebrow")}
                </p>
                <h2 className="mt-4 font-manrope text-[34px] font-bold leading-tight tracking-tight text-welcome-black sm:text-[42px]">
                  {t("detailsTitle")}
                </h2>
                <p className="mt-5 font-inter text-[17px] leading-[1.75] text-welcome-body">
                  {t("detailsText")}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {features.map((feature, index) => {
                  const Icon = icons[index];
                  return (
                    <article
                      key={feature.title}
                      className="rounded-[20px] border border-welcome-black/[0.07] bg-welcome-cream p-6 sm:p-7"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-welcome-gold/12 text-welcome-gold">
                        <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 font-manrope text-[18px] font-semibold text-welcome-black">
                        {feature.title}
                      </h3>
                      <p className="mt-2 font-inter text-[15px] leading-[1.65] text-welcome-body/80">
                        {feature.text}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-welcome-black px-6 py-20 text-center sm:py-24 lg:px-10">
          <div className="mx-auto max-w-2xl">
            <p className="font-manrope text-[32px] font-semibold leading-tight tracking-tight text-welcome-ink-fg sm:text-[40px]">
              {t("ctaTitle")}
            </p>
            <p className="mx-auto mt-4 max-w-xl font-inter text-[16px] leading-relaxed text-welcome-ink-fg/70">
              {t("ctaText")}
            </p>
            <Link
              href="/#contact"
              className="mt-8 inline-flex h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg"
            >
              {t("visit")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
