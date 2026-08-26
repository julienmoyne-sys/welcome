import Image from "next/image";
import { Check, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import meetingRoomImage from "@/assets/salle-reunion-pro.png";
import { Footer } from "@/components/Footer";
import { GoogleReviews } from "@/components/GoogleReviews";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { localePath } from "@/lib/metadata";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  localBusinessJsonLd,
  SITE_MAP_URL,
  SITE_NAME,
} from "@/lib/seo";

const PATH = "/salle-de-reunion";
type Item = { title: string; text: string };
type Price = { title: string; price: string; details: string[]; button: string; href: string };
type Faq = { question: string; answer: string };

export async function MeetingRoomPage({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations("meetingRoomPage");
  const prices = t.raw("pricing.cards") as Price[];
  const uses = t.raw("uses.items") as Item[];
  const equipment = t.raw("equipment.items") as Item[];
  const faq = t.raw("faq.items") as Faq[];

  return (
    <div className="min-h-screen bg-welcome-cream">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: SITE_NAME, path: localePath(locale, "/") },
          { name: t("eyebrow"), path: localePath(locale, PATH) },
        ])}
      />
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd
        data={faqPageJsonLd(
          faq.map((item) => ({ ...item, category: "meeting-room" })),
          localePath(locale, PATH),
        )}
      />
      <Header />
      <main>
        <section className="px-6 pb-20 pt-12 lg:px-10 lg:pb-28">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="font-inter text-sm font-medium uppercase tracking-[0.14em] text-welcome-sage">
                {t("eyebrow")}
              </p>
              <h1 className="mt-5 font-manrope text-[42px] font-bold leading-[1.05] tracking-tight text-welcome-black sm:text-[56px] lg:text-[62px]">
                {t("title")}
              </h1>
              <p className="mt-5 font-manrope text-xl font-semibold text-welcome-gold">
                {t("tagline")}
              </p>
              <p className="mt-6 max-w-xl font-inter text-[17px] leading-[1.75] text-welcome-body">
                {t("lead")}
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex h-[52px] items-center rounded-xl bg-welcome-gold px-8 font-manrope font-semibold text-[#0b0b0b] transition hover:brightness-105 hover:shadow-lg"
              >
                {t("availability")}
              </Link>
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded-[24px] shadow-[0_24px_70px_-35px_rgba(11,11,11,0.45)] sm:min-h-[560px]">
              <Image
                src={meetingRoomImage}
                alt={t("imageAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="welcome-photo object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section className="bg-welcome-white px-6 py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="text-center font-manrope text-[34px] font-bold tracking-tight text-welcome-black sm:text-[42px]">
              {t("pricing.title")}
            </h2>
            <div className="mt-10 grid gap-6 md:auto-rows-fr md:grid-cols-2">
              {prices.map((card, index) => (
                <article
                  key={card.title}
                  className={`flex h-full flex-col rounded-[22px] border p-7 sm:p-9 ${index === 1 ? "border-welcome-gold/50 bg-[#0b0b0b]" : "border-black/10 bg-white"}`}
                >
                  <h3
                    className={`font-manrope text-2xl font-bold ${index === 1 ? "text-white" : "text-[#0b0b0b]"}`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`mt-4 font-manrope text-xl font-semibold ${index === 1 ? "text-white" : "text-[#465544]"}`}
                  >
                    {card.price}
                  </p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {card.details.map((detail) => (
                      <li
                        key={detail}
                        className={`flex gap-3 font-inter text-[15px] leading-relaxed ${index === 1 ? "text-white" : "text-[#333333]"}`}
                      >
                        <Check
                          className="mt-1 h-4 w-4 shrink-0 text-welcome-sage"
                          aria-hidden="true"
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={card.href}
                    className={`mt-7 box-border flex w-full shrink-0 items-center justify-center self-center rounded-xl border border-transparent px-6 py-0 text-center font-manrope text-sm font-semibold leading-none transition ${index === 1 ? "h-12 min-h-12 max-h-12 bg-welcome-gold text-[#0b0b0b] hover:brightness-105" : "h-[52px] min-h-[52px] max-h-[52px] bg-[#0b0b0b] text-white hover:bg-[#273126]"}`}
                  >
                    {card.button}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <InfoGrid title={t("uses.title")} intro={t("uses.intro")} items={uses} />
        <InfoGrid
          title={t("equipment.title")}
          intro={t("equipment.intro")}
          items={equipment}
          light
        />

        <section className="px-6 py-20 lg:px-10 lg:py-24">
          <div className="mx-auto grid max-w-[1120px] gap-10 rounded-[24px] bg-welcome-black p-8 text-welcome-ink-fg sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-manrope text-[32px] font-bold tracking-tight sm:text-[40px]">
                {t("location.title")}
              </h2>
              <p className="mt-5 whitespace-pre-line font-inter text-[17px] leading-relaxed text-welcome-ink-fg/80">
                {t("location.address")}
              </p>
              <p className="mt-5 max-w-3xl font-inter leading-[1.75] text-welcome-ink-fg/75">
                {t("location.text")}
              </p>
            </div>
            <a
              href={SITE_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-welcome-gold px-7 font-manrope font-semibold text-[#0b0b0b]"
            >
              <MapPin className="h-5 w-5" aria-hidden="true" />
              {t("location.button")}
            </a>
          </div>
        </section>

        <section className="bg-welcome-white px-6 py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[1180px] text-center">
            <h2 className="font-manrope text-[34px] font-bold tracking-tight text-welcome-black sm:text-[42px]">
              {t("trust.title")}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl font-inter text-[17px] leading-relaxed text-welcome-body">
              {t("trust.text")}
            </p>
            <div className="mt-10 text-left">
              <GoogleReviews />
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[960px]">
            <h2 className="font-manrope text-[34px] font-bold tracking-tight text-welcome-black sm:text-[42px]">
              {t("faq.title")}
            </h2>
            <div className="mt-9 space-y-4">
              {faq.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-[18px] border border-welcome-black/10 bg-welcome-white p-6"
                >
                  <summary className="cursor-pointer list-none font-manrope text-lg font-semibold text-welcome-black">
                    {item.question}
                  </summary>
                  <p className="mt-4 font-inter leading-[1.7] text-welcome-body">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-welcome-black px-6 py-20 text-center text-welcome-ink-fg">
          <h2 className="font-manrope text-[32px] font-semibold sm:text-[40px]">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl font-inter text-welcome-ink-fg/70">{t("ctaText")}</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-[52px] items-center rounded-xl bg-welcome-gold px-8 font-manrope font-semibold text-[#0b0b0b]"
          >
            {t("availability")}
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoGrid({
  title,
  intro,
  items,
  light = false,
}: {
  title: string;
  intro: string;
  items: Item[];
  light?: boolean;
}) {
  return (
    <section
      className={`${light ? "bg-welcome-white" : "bg-welcome-cream"} px-6 py-20 lg:px-10 lg:py-24`}
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="max-w-3xl">
          <h2 className="font-manrope text-[34px] font-bold tracking-tight text-welcome-black sm:text-[42px]">
            {title}
          </h2>
          <p className="mt-5 font-inter text-[17px] leading-relaxed text-welcome-body">{intro}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-[20px] border border-welcome-black/[0.08] bg-welcome-cream p-6"
            >
              <h3 className="font-manrope text-lg font-semibold text-welcome-black">
                {item.title}
              </h3>
              <p className="mt-3 font-inter text-[15px] leading-relaxed text-welcome-body/80">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
