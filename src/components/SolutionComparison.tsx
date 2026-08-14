"use client";

import {
  Armchair,
  BadgeEuro,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  CookingPot,
  DoorOpen,
  GlassWater,
  Handshake,
  KeyRound,
  LayoutGrid,
  Minus,
  Presentation,
  Printer,
  Snowflake,
  UserRoundCheck,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useTranslations } from "next-intl";

import avantagesCseLogo from "@/assets/avantages-cse-monochrome.png";
import chatGptBusiness from "@/assets/chatgpt-business-welcome-strasbourg.png";
import reductionsGrandesEnseignes from "@/assets/reductions-grandes-enseignes.png";
import welcomeCoworkingCapsuleNoire from "@/assets/welcome-coworking-capsule-noire.png";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Cell = {
  type: "included" | "bookable" | "excluded" | "text" | "conditional";
  label?: string;
};

type ComparisonRow = {
  label: string;
  cells: Cell[];
};

type ComparisonGroup = {
  title: string;
  rows: ComparisonRow[];
};

const ROW_ICONS = [
  Clock3,
  UserRoundCheck,
  Clock3,
  Handshake,
  GlassWater,
  LayoutGrid,
  DoorOpen,
  Presentation,
  KeyRound,
  CalendarDays,
  Wifi,
  CookingPot,
  Printer,
  Snowflake,
  Coffee,
  BadgeEuro,
] as const;

const PLAN_STYLES = [
  "bg-welcome-white",
  "bg-welcome-sage/[0.055]",
  "bg-welcome-gold/[0.075]",
  "bg-welcome-gold/[0.14]",
] as const;

function StatusMark({ cell, labels }: { cell: Cell; labels: Record<string, string> }) {
  if (cell.type === "included" || cell.type === "conditional") {
    return (
      <span
        className="inline-flex items-center gap-1.5"
        aria-label={labels.included}
        title={labels.included}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_4px_14px_-6px_rgba(5,150,105,0.9)]">
          <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
        </span>
        {cell.type === "conditional" ? (
          <span className="font-manrope text-[16px] font-bold text-welcome-black">*</span>
        ) : null}
      </span>
    );
  }

  if (cell.type === "bookable") {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-500/35 bg-amber-500/15"
        aria-label={labels.bookable}
        title={labels.bookable}
      >
        <CalendarDays
          className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400"
          aria-hidden="true"
        />
      </span>
    );
  }

  if (cell.type === "excluded") {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center text-welcome-body/35"
        aria-label={labels.excluded}
      >
        <Minus className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="font-inter text-[14px] font-semibold leading-snug text-welcome-black">
      {cell.label}
    </span>
  );
}

function ChatGptLogo() {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b0b0b] text-white dark:bg-white dark:text-[#0b0b0b]">
      <svg viewBox="146 227 268 265" className="h-[22px] w-[22px]" role="img" aria-label="ChatGPT">
        <path
          fill="currentColor"
          d="M249.176 323.434V298.276C249.176 296.158 249.971 294.569 251.825 293.509L302.406 264.381C309.29 260.409 317.5 258.555 325.973 258.555C357.75 258.555 377.877 283.185 377.877 309.399C377.877 311.253 377.877 313.371 377.611 315.49L325.178 284.771C322.001 282.919 318.822 282.919 315.645 284.771L249.176 323.434ZM367.283 421.415V361.301C367.283 357.592 365.694 354.945 362.516 353.092L296.048 314.43L317.763 301.982C319.617 300.925 321.206 300.925 323.058 301.982L373.639 331.112C388.205 339.586 398.003 357.592 398.003 375.069C398.003 395.195 386.087 413.733 367.283 421.412V421.415ZM233.553 368.452L211.838 355.742C209.986 354.684 209.19 353.095 209.19 350.975V292.718C209.19 264.383 230.905 242.932 260.301 242.932C271.423 242.932 281.748 246.641 290.49 253.26L238.321 283.449C235.146 285.303 233.555 287.951 233.555 291.659V368.455L233.553 368.452ZM280.292 395.462L249.176 377.985V340.913L280.292 323.436L311.407 340.913V377.985L280.292 395.462ZM300.286 475.968C289.163 475.968 278.837 472.259 270.097 465.64L322.264 435.449C325.441 433.597 327.03 430.949 327.03 427.239V350.445L349.011 363.155C350.865 364.213 351.66 365.802 351.66 367.922V426.179C351.66 454.514 329.679 475.965 300.286 475.965V475.968ZM237.525 416.915L186.944 387.785C172.378 379.31 162.582 361.305 162.582 343.827C162.582 323.436 174.763 305.164 193.563 297.485V357.861C193.563 361.571 195.154 364.217 198.33 366.071L264.535 404.467L242.82 416.915C240.967 417.972 239.377 417.972 237.525 416.915ZM234.614 460.343C204.689 460.343 182.71 437.833 182.71 410.028C182.71 407.91 182.976 405.792 183.238 403.672L235.405 433.863C238.582 435.715 241.763 435.715 244.938 433.863L311.407 395.466V420.622C311.407 422.742 310.612 424.331 308.758 425.389L258.179 454.519C251.293 458.491 243.083 460.343 234.611 460.343H234.614ZM300.286 491.854C332.329 491.854 359.073 469.082 365.167 438.892C394.825 431.211 413.892 403.406 413.892 375.073C413.892 356.535 405.948 338.529 391.648 325.552C392.972 319.991 393.766 314.43 393.766 308.87C393.766 271.003 363.048 242.666 327.562 242.666C320.413 242.666 313.528 243.723 306.644 246.109C294.725 234.457 278.307 227.042 260.301 227.042C228.258 227.042 201.513 249.815 195.42 280.004C165.761 287.685 146.694 315.49 146.694 343.824C146.694 362.362 154.638 380.368 168.938 393.344C167.613 398.906 166.819 404.467 166.819 410.027C166.819 447.894 197.538 476.231 233.024 476.231C240.172 476.231 247.058 475.173 253.943 472.788C265.859 484.441 282.278 491.854 300.286 491.854Z"
        />
      </svg>
    </span>
  );
}

function CseLogo() {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-welcome-gold/45 bg-white p-1 shadow-sm">
      <Image
        src={avantagesCseLogo}
        alt="Avantages CSE"
        className="h-full w-full rounded-full object-cover object-center"
        sizes="36px"
      />
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ComparisonContactCta({ title, className = "" }: { title: string; className?: string }) {
  return (
    <aside
      className={`comparison-contact-cta mt-8 rounded-[20px] border border-welcome-gold/55 bg-welcome-gold/[0.12] px-6 py-7 text-center ${className}`}
    >
      <h2 className="font-manrope text-[28px] font-semibold leading-tight text-welcome-black">
        {title}
      </h2>
      <a
        href="https://wa.me/33622805536"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-md"
        aria-label={`WhatsApp : +33 6 22 80 55 36`}
      >
        <WhatsAppIcon />
        +33 6 22 80 55 36
      </a>
    </aside>
  );
}

function PopupLabel({
  label,
  viewLabel,
  modalTitle,
  image,
}: {
  label: string;
  viewLabel: string;
  modalTitle: string;
  image: StaticImageData;
}) {
  return (
    <span className="font-inter text-[14px] font-semibold leading-snug text-welcome-black">
      {label}{" "}
      <Dialog>
        <span className="comparison-cse-view whitespace-nowrap">
          (
          <DialogTrigger asChild>
            <button
              type="button"
              className="font-semibold text-welcome-sage underline decoration-welcome-gold/70 underline-offset-2 transition-colors hover:text-welcome-gold focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-welcome-gold"
            >
              {viewLabel}
            </button>
          </DialogTrigger>
          )
        </span>
        <DialogContent className="max-h-[92vh] w-[94vw] max-w-[900px] overflow-y-auto border-welcome-gold/30 bg-white p-2 sm:rounded-[20px] sm:p-4">
          <DialogTitle className="sr-only">{modalTitle}</DialogTitle>
          <Image
            src={image}
            alt={modalTitle}
            className="h-auto w-full rounded-[12px]"
            sizes="(max-width: 640px) 94vw, 900px"
          />
        </DialogContent>
      </Dialog>
    </span>
  );
}

export function SolutionComparison({ contactTitle }: { contactTitle: string }) {
  const t = useTranslations("comparisonTable");
  const plans = t.raw("plans") as { kicker: string; name: string; price: string }[];
  const groups = t.raw("groups") as ComparisonGroup[];
  const labels = t.raw("legend") as Record<string, string>;
  const groupOffsets = groups.map((_, index) =>
    groups.slice(0, index).reduce((total, group) => total + group.rows.length, 0),
  );

  return (
    <div className="comparison-print-root">
      <div className="comparison-print-action mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-welcome-black/15 bg-welcome-white px-5 font-manrope text-[14px] font-semibold text-welcome-black transition-all duration-200 hover:border-welcome-gold hover:text-welcome-gold hover:shadow-sm"
        >
          <Printer className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          {t("printButton")}
        </button>
      </div>
      <div className="comparison-mobile-view space-y-8 lg:hidden">
        <div className="grid grid-cols-2 gap-3">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className={`rounded-[18px] border border-welcome-black/[0.08] p-4 text-center ${PLAN_STYLES[index]}`}
            >
              <span
                className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[10px] font-semibold uppercase tracking-[0.08em] text-welcome-black ${
                  index >= 2 ? "bg-welcome-gold/20" : "bg-welcome-sage/12"
                }`}
              >
                {plan.kicker}
              </span>
              <h2 className="mt-3 min-h-10 font-manrope text-[15px] font-bold leading-snug text-welcome-black">
                {plan.name}
              </h2>
              <p className="mt-3 font-manrope text-[21px] font-bold leading-tight text-welcome-black">
                {plan.price}
              </p>
              <p className="mt-1 font-inter text-[10px] leading-snug text-welcome-body/60">
                {t("priceSuffix")}
              </p>
            </article>
          ))}
        </div>

        {groups.map((group, groupIndex) => (
          <section key={group.title} aria-labelledby={`mobile-group-${groupIndex}`}>
            <h3
              id={`mobile-group-${groupIndex}`}
              className="mb-3 font-manrope text-[13px] font-bold uppercase tracking-[0.1em] text-welcome-sage"
            >
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.rows.map((row, index) => {
                const rowIndex = groupOffsets[groupIndex] + index;
                const isChatGpt = row.label === "ChatGPT Business";
                const Icon = ROW_ICONS[rowIndex] ?? Coffee;
                const isCse = Icon === BadgeEuro;

                return (
                  <article
                    key={row.label}
                    className={`overflow-hidden rounded-[18px] border border-welcome-black/[0.08] bg-welcome-white ${
                      isChatGpt || isCse ? "ring-1 ring-welcome-gold/25" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-3 border-b border-welcome-black/[0.07] px-4 py-3.5 ${
                        isCse
                          ? "comparison-cse-cell"
                          : isChatGpt
                            ? "comparison-criteria-highlight"
                            : "comparison-criteria-header"
                      }`}
                    >
                      {isCse ? (
                        <CseLogo />
                      ) : isChatGpt ? (
                        <ChatGptLogo />
                      ) : (
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-welcome-sage/10 text-welcome-sage">
                          <Icon
                            className="h-[18px] w-[18px]"
                            strokeWidth={1.7}
                            aria-hidden="true"
                          />
                        </span>
                      )}
                      {isCse ? (
                        <PopupLabel
                          label={row.label}
                          viewLabel={t("cseView")}
                          modalTitle={t("cseModalTitle")}
                          image={reductionsGrandesEnseignes}
                        />
                      ) : isChatGpt ? (
                        <PopupLabel
                          label={row.label}
                          viewLabel={t("cseView")}
                          modalTitle={t("chatGptModalTitle")}
                          image={chatGptBusiness}
                        />
                      ) : (
                        <span className="font-inter text-[14px] font-semibold leading-snug text-welcome-black">
                          {row.label}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2">
                      {row.cells.map((cell, planIndex) => (
                        <div
                          key={`${row.label}-mobile-${planIndex}`}
                          className={`flex min-h-[82px] flex-col items-center justify-center gap-2 border-welcome-black/[0.07] px-2 py-3 text-center odd:border-r [&:nth-child(n+3)]:border-t ${PLAN_STYLES[planIndex]}`}
                        >
                          <span className="font-inter text-[9px] font-bold uppercase tracking-[0.07em] text-welcome-body/55">
                            {plans[planIndex].name}
                          </span>
                          <StatusMark cell={cell} labels={labels} />
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[16px] bg-welcome-white p-4">
          <span className="inline-flex items-center gap-2 font-inter text-[12px] text-welcome-body">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white"
              title={labels.included}
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            {labels.included}
          </span>
          <span className="inline-flex items-center gap-2 font-inter text-[12px] text-welcome-body">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-500/35 bg-amber-500/15"
              title={labels.bookable}
            >
              <CalendarDays
                className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400"
                aria-hidden="true"
              />
            </span>
            {labels.bookable}
          </span>
          <span className="inline-flex items-center gap-2 font-inter text-[12px] text-welcome-body">
            <Minus className="h-5 w-5 text-welcome-body/35" aria-hidden="true" />
            {labels.excluded}
          </span>
          <span className="w-full font-inter text-[12px] font-medium text-welcome-body">
            {t("condition")}
          </span>
        </div>
        <ComparisonContactCta title={contactTitle} />
      </div>

      <div className="comparison-print-content hidden lg:block">
        <div className="comparison-print-sheet max-w-full overflow-hidden rounded-[24px] border border-welcome-black/[0.08] bg-welcome-white shadow-[0_28px_80px_-48px_rgba(11,11,11,0.35)] lg:overflow-visible">
          <div className="max-w-full overflow-x-auto overscroll-x-contain lg:overflow-visible">
            <div className="min-w-[1120px]">
              <div className="comparison-sticky-header grid grid-cols-[240px_repeat(4,minmax(0,1fr))] border-b border-welcome-black/[0.09] bg-welcome-white lg:sticky lg:top-[90px] lg:z-30 lg:shadow-[0_14px_28px_-22px_rgba(11,11,11,0.45)]">
                <div className="comparison-criteria-header sticky left-0 z-20 flex flex-col items-start justify-between p-6 lg:p-7">
                  <Image
                    src={welcomeCoworkingCapsuleNoire}
                    alt="Welcome! Coworking"
                    className="h-auto w-32 self-center"
                    sizes="128px"
                  />
                  <span className="font-inter text-[13px] font-semibold uppercase tracking-[0.12em] text-welcome-sage">
                    {t("criteria")}
                  </span>
                </div>
                {plans.map((plan, index) => (
                  <div
                    key={plan.name}
                    className={`relative flex min-h-[210px] flex-col items-center border-l border-welcome-black/[0.08] px-4 py-6 text-center transition-colors duration-300 lg:px-5 lg:py-7 ${PLAN_STYLES[index]}`}
                  >
                    <span
                      className={`inline-flex rounded-full px-3 py-1 font-inter text-[11px] font-semibold uppercase tracking-[0.1em] text-welcome-black ${
                        index >= 2 ? "bg-welcome-gold/20" : "bg-welcome-sage/12"
                      }`}
                    >
                      {plan.kicker}
                    </span>
                    <h2 className="mt-4 min-h-14 font-manrope text-[20px] font-bold leading-tight text-welcome-black">
                      {plan.name}
                    </h2>
                    <p className="mt-5 font-manrope text-[27px] font-bold leading-none tracking-tight text-welcome-black">
                      {plan.price}
                    </p>
                    <p className="mt-2 font-inter text-[12px] text-welcome-body/60">
                      {t("priceSuffix")}
                    </p>
                  </div>
                ))}
              </div>

              {groups.map((group, groupIndex) => (
                <section key={group.title} aria-labelledby={`group-${groupIndex}`}>
                  <div className="grid grid-cols-[240px_repeat(4,minmax(0,1fr))] border-b border-welcome-black/[0.08] bg-welcome-black/[0.025]">
                    <h3
                      id={`group-${groupIndex}`}
                      className="sticky left-0 z-20 col-span-5 bg-welcome-cream px-6 py-3 font-manrope text-[13px] font-bold uppercase tracking-[0.11em] text-welcome-sage lg:px-7"
                    >
                      {group.title}
                    </h3>
                  </div>
                  {group.rows.map((row, index) => {
                    const rowIndex = groupOffsets[groupIndex] + index;
                    const isChatGpt = row.label === "ChatGPT Business";
                    const Icon = ROW_ICONS[rowIndex] ?? Coffee;
                    const isCse = Icon === BadgeEuro;

                    return (
                      <div
                        key={row.label}
                        className={`group grid min-h-[76px] grid-cols-[240px_repeat(4,minmax(0,1fr))] border-b border-welcome-black/[0.07] last:border-b-0 ${
                          isCse ? "comparison-cse-row" : ""
                        }`}
                      >
                        <div
                          className={`comparison-criteria-cell sticky left-0 z-10 flex items-center gap-3 px-6 py-4 transition-colors lg:px-7 ${
                            isCse
                              ? "comparison-cse-cell"
                              : isChatGpt
                                ? "comparison-criteria-highlight"
                                : ""
                          }`}
                        >
                          {isCse ? (
                            <CseLogo />
                          ) : isChatGpt ? (
                            <ChatGptLogo />
                          ) : (
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-welcome-sage/10 text-welcome-sage">
                              <Icon
                                className="h-[18px] w-[18px]"
                                strokeWidth={1.7}
                                aria-hidden="true"
                              />
                            </span>
                          )}
                          {isCse ? (
                            <PopupLabel
                              label={row.label}
                              viewLabel={t("cseView")}
                              modalTitle={t("cseModalTitle")}
                              image={reductionsGrandesEnseignes}
                            />
                          ) : isChatGpt ? (
                            <PopupLabel
                              label={row.label}
                              viewLabel={t("cseView")}
                              modalTitle={t("chatGptModalTitle")}
                              image={chatGptBusiness}
                            />
                          ) : (
                            <span className="font-inter text-[14px] font-semibold leading-snug text-welcome-black">
                              {row.label}
                            </span>
                          )}
                        </div>
                        {row.cells.map((cell, index) => (
                          <div
                            key={`${row.label}-${index}`}
                            className={`flex items-center justify-center border-l border-welcome-black/[0.07] px-2.5 py-4 text-center transition-colors duration-200 group-hover:bg-welcome-black/[0.018] ${PLAN_STYLES[index]}`}
                          >
                            <StatusMark cell={cell} labels={labels} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </section>
              ))}
            </div>
          </div>
        </div>

        <div className="comparison-print-legend mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
          <span className="inline-flex items-center gap-2 font-inter text-[13px] text-welcome-body">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white"
              title={labels.included}
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            {labels.included}
          </span>
          <span className="inline-flex items-center gap-2 font-inter text-[13px] text-welcome-body">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-500/35 bg-amber-500/15"
              title={labels.bookable}
            >
              <CalendarDays
                className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400"
                aria-hidden="true"
              />
            </span>
            {labels.bookable}
          </span>
          <span className="inline-flex items-center gap-2 font-inter text-[13px] text-welcome-body">
            <Minus className="h-5 w-5 text-welcome-body/35" aria-hidden="true" />
            {labels.excluded}
          </span>
          <span className="font-inter text-[13px] font-medium text-welcome-body">
            {t("condition")}
          </span>
        </div>
        <ComparisonContactCta title={contactTitle} />
      </div>
    </div>
  );
}
