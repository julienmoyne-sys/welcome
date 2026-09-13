"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, BadgeCheck, Phone, Snowflake, Sparkles, Sun, X } from "lucide-react";
import { useTranslations } from "next-intl";

const featureIcons = [Sun, Sparkles, Snowflake];

export function LaunchOffer() {
  const t = useTranslations("launchOffer");
  const features = t.raw("features") as string[];

  return (
    <Dialog.Root>
      <aside aria-label={t("eyebrow")} className="bg-[#233e35] text-[#fffaf0]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-3 text-center font-inter text-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#ecd39c]">
            {t("eyebrow")}
          </span>
          <p>
            {t("summary")} <strong className="whitespace-nowrap text-base">495 €</strong>{" "}
            <span className="text-xs">{t("unit")}</span>
          </p>
          <Dialog.Trigger className="inline-flex min-h-8 cursor-pointer items-center gap-1 border-b border-[#ecd39c]/60 font-semibold text-[#ecd39c] outline-offset-4 hover:text-white focus-visible:outline-2">
            {t("details")} <ArrowUpRight size={16} aria-hidden="true" />
          </Dialog.Trigger>
        </div>
      </aside>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-[#10271f]/65 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] bg-[#faf7ef] text-[#233e35] shadow-2xl focus:outline-none">
          <div className="px-6 pb-6 pt-8 sm:px-10 sm:pb-8 sm:pt-10">
            <p className="pr-8 font-inter text-xs font-bold uppercase tracking-[0.18em] text-[#79612f]">
              {t("eyebrow")}
            </p>
            <Dialog.Title className="mt-4 max-w-sm font-manrope text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t("title")}
            </Dialog.Title>
            <Dialog.Description className="mt-4 font-inter text-sm leading-relaxed text-[#52645b]">
              {t("intro")}
            </Dialog.Description>
            <div className="my-6 rounded-2xl border border-[#233e35]/10 bg-white/70 p-5 sm:p-6">
              <p className="font-inter text-sm text-[#52645b]">
                {t("instead")} <del>575 €</del> <span className="text-xs">{t("unit")}</span>
              </p>
              <p className="mt-1 font-manrope text-[68px] font-semibold leading-none tracking-[-0.06em] sm:text-[80px]">
                495 <span className="text-4xl">€</span>
              </p>
              <p className="mt-2 font-inter text-sm">{t("unit")}</p>
              <p className="mt-4 inline-block rounded-full bg-[#e7eedf] px-3 py-1.5 font-inter text-xs font-semibold">
                {t("saving")}
              </p>
            </div>
            <ul className="grid gap-3 font-inter text-sm sm:grid-cols-3 sm:gap-4">
              {features.map((feature, index) => {
                const Icon = featureIcons[index];
                return (
                  <li key={feature} className="flex items-center gap-2 sm:flex-col sm:items-start">
                    <Icon size={20} className="shrink-0 text-[#79612f]" aria-hidden="true" />
                    {feature}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 flex items-start gap-3 border-t border-[#233e35]/15 pt-5 font-inter text-sm font-semibold leading-relaxed">
              <BadgeCheck className="mt-0.5 shrink-0" size={22} aria-hidden="true" />
              {t("guarantee")}
            </p>
          </div>
          <div className="bg-[#233e35] px-6 py-5 text-center text-[#fffaf0] sm:px-10">
            <a
              href="tel:+33622805536"
              className="flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#ecd39c] px-3 py-3 font-manrope text-lg font-bold text-[#233e35] outline-offset-4 transition-colors hover:bg-[#f5dfb4] focus-visible:outline-2"
            >
              <Phone size={20} aria-hidden="true" />
              <span>
                <span className="block text-xs font-medium">{t("cta")}</span>06 22 80 55 36
              </span>
            </a>
            <p className="mt-3 font-inter text-xs text-[#fffaf0]/80">{t("availability")}</p>
          </div>
          <Dialog.Close
            aria-label={t("close")}
            className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[#233e35] outline-offset-2 hover:bg-[#233e35]/10 focus-visible:outline-2"
          >
            <X size={22} aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
