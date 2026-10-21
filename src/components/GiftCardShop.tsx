"use client";

import Image, { type StaticImageData } from "next/image";
import { ArrowRight, Check, CreditCard, Gift, Pencil, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import giftCardBirthday from "@/assets/gift-card-template-birthday.png";
import giftCardCongratulations from "@/assets/gift-card-template-congratulations.png";
import giftCardGreen from "@/assets/gift-card-template-green.png";
import giftCardIvory from "@/assets/gift-card-template-ivory.png";
import giftCardRed from "@/assets/gift-card-template-red.png";
import giftCardThankYou from "@/assets/gift-card-template-thank-you.png";
import { submitGiftCard, validateGiftCard } from "@/lib/gift-card.actions";

type Design = "ivory" | "red" | "green" | "birthday" | "thankYou" | "congratulations";
type Occasion = "christmas" | "birthday" | "congratulations" | "thankYou";
type OrganizationType = "company" | "association" | "individual" | "public";

const DESIGNS: Array<{ id: Design; image: StaticImageData; occasion: Occasion }> = [
  { id: "ivory", image: giftCardIvory, occasion: "christmas" },
  { id: "red", image: giftCardRed, occasion: "christmas" },
  { id: "green", image: giftCardGreen, occasion: "christmas" },
  { id: "birthday", image: giftCardBirthday, occasion: "birthday" },
  { id: "thankYou", image: giftCardThankYou, occasion: "thankYou" },
  {
    id: "congratulations",
    image: giftCardCongratulations,
    occasion: "congratulations",
  },
];

export function GiftCardShop() {
  const t = useTranslations("shop");
  const locale = useLocale();
  const [form, setForm] = useState({
    design: "ivory" as Design,
    occasion: "christmas" as Occasion,
    amount: "",
    from: "",
    recipient: "",
    message: "",
    organizationType: "" as OrganizationType | "",
    lastName: "",
    firstName: "",
    billingAddress: "",
    email: "",
    emailConfirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "redirecting" | "error">("idle");

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      if (key === "email") delete next.emailConfirmation;
      return next;
    });
  };

  const selectDesign = (design: Design, occasion: Occasion) => {
    setForm((current) => ({ ...current, design, occasion }));
    setStatus("idle");
    setErrors((current) => {
      const next = { ...current };
      delete next.design;
      delete next.occasion;
      return next;
    });
  };

  const scrollToOrder = () => {
    window.requestAnimationFrame(() => {
      document
        .getElementById("gift-card-order")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setStatus("submitting");

    try {
      if (step === 1) {
        const validation = await validateGiftCard(form, locale);
        if (validation.status === "invalid") {
          setErrors(validation.fieldErrors);
          setStatus("error");
          return;
        }

        setStep(2);
        setStatus("idle");
        scrollToOrder();
        return;
      }

      const result = await submitGiftCard(form, locale);
      if (result.status === "invalid") {
        setErrors(result.fieldErrors);
        setStep(1);
        setStatus("error");
        scrollToOrder();
        return;
      }
      if (result.status === "error") {
        setStatus("error");
        return;
      }

      setStatus("redirecting");
      window.location.assign(result.paymentUrl);
    } catch {
      setStatus("error");
    }
  };

  const editOrder = () => {
    setStep(1);
    setStatus("idle");
    scrollToOrder();
  };

  return (
    <main>
      <section className="relative overflow-hidden bg-[#062f25] px-6 py-20 text-white lg:px-10 lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
          <Sparkles className="absolute left-[8%] top-12 h-16 w-16 text-[#e3c366]" />
          <Sparkles className="absolute right-[10%] top-20 h-10 w-10 text-[#e3c366]" />
          <Sparkles className="absolute bottom-10 left-[22%] h-8 w-8 text-white" />
          <Sparkles className="absolute bottom-12 right-[25%] h-14 w-14 text-white" />
        </div>
        <div className="relative mx-auto max-w-[980px] text-center">
          <p className="font-inter text-[14px] font-semibold uppercase tracking-[0.18em] text-[#e3c366]">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-5 font-manrope text-[43px] font-bold leading-[1.06] tracking-tight sm:text-[58px] lg:text-[72px]">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-inter text-[18px] leading-[1.75] text-white/80">
            {t("hero.lead")}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#e3c366]/40 bg-white/10 px-5 py-2.5 font-inter text-sm text-white/90 backdrop-blur-sm">
            <Gift className="h-4 w-4 text-[#e3c366]" aria-hidden="true" />
            {t("hero.validity")}
          </div>
        </div>
      </section>

      <section className="bg-welcome-cream px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center">
            <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
              {t("designs.eyebrow")}
            </p>
            <h2 className="mt-4 font-manrope text-[34px] font-semibold tracking-tight text-welcome-black sm:text-[44px]">
              {t("designs.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-inter text-[16px] leading-relaxed text-welcome-body/75">
              {t("designs.lead")}
            </p>
          </div>

          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {DESIGNS.map(({ id, image, occasion }) => {
              const selected = form.design === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectDesign(id, occasion)}
                  className={`group overflow-hidden rounded-[22px] border-2 bg-welcome-white text-left shadow-[0_18px_45px_-34px_rgba(11,11,11,0.35)] transition-all duration-300 hover:-translate-y-1 ${
                    selected
                      ? "border-welcome-gold shadow-[0_20px_50px_-26px_rgba(198,178,74,0.6)]"
                      : "border-transparent hover:border-welcome-gold/45"
                  }`}
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={image}
                      alt={t(`designs.items.${id}.alt`)}
                      fill
                      sizes="(min-width: 1024px) 31vw, (min-width: 640px) 70vw, calc(100vw - 48px)"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    {selected && (
                      <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-welcome-gold text-[#0b0b0b] shadow-lg">
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 px-5 py-5">
                    <div>
                      <h3 className="font-manrope text-[19px] font-semibold text-welcome-black">
                        {t(`designs.items.${id}.title`)}
                      </h3>
                      <p className="mt-1 font-inter text-sm text-welcome-body/65">
                        {t(`designs.items.${id}.description`)}
                      </p>
                    </div>
                    <span className="shrink-0 font-inter text-xs font-semibold uppercase tracking-[0.08em] text-welcome-gold">
                      {selected ? t("designs.selected") : t("designs.choose")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-welcome-white px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1120px] items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-[130px]">
            <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
              {t("form.eyebrow")}
            </p>
            <h2 className="mt-4 font-manrope text-[36px] font-semibold leading-tight tracking-tight text-welcome-black sm:text-[44px]">
              {t("form.title")}
            </h2>
            <p className="mt-5 font-inter text-[16px] leading-[1.75] text-welcome-body/75">
              {t("form.lead")}
            </p>
            <div className="mt-8 rounded-[18px] border border-welcome-gold/30 bg-welcome-cream p-5">
              <p className="font-manrope text-sm font-semibold text-welcome-black">
                {t("form.summaryLabel")}
              </p>
              <p className="mt-1 font-inter text-sm text-welcome-body/70">
                {t(`designs.items.${form.design}.title`)}
                {form.amount ? ` · ${form.amount} € TTC` : ""}
              </p>
            </div>
          </div>

          <form
            id="gift-card-order"
            onSubmit={handleSubmit}
            className="rounded-[24px] border border-welcome-black/[0.07] bg-welcome-cream p-6 shadow-[0_24px_70px_-48px_rgba(11,11,11,0.45)] sm:p-9"
            noValidate
          >
            <div className="mb-7 flex items-center gap-3" aria-label={t("form.progressLabel")}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-welcome-gold font-manrope text-sm font-bold text-[#0b0b0b]">
                {step}
              </span>
              <div>
                <p className="font-manrope text-sm font-semibold text-welcome-black">
                  {step === 1 ? t("form.stepOneTitle") : t("form.stepTwoTitle")}
                </p>
                <p className="font-inter text-xs text-welcome-body/65">
                  {t("form.stepCount", { step })}
                </p>
              </div>
            </div>

            <div className={step === 1 ? "grid gap-6 sm:grid-cols-2" : "hidden"}>
              <Field htmlFor="gift-occasion" label={t("form.occasion")} className="sm:col-span-2">
                <select
                  id="gift-occasion"
                  disabled
                  value={form.occasion}
                  className="h-14 w-full cursor-not-allowed rounded-[12px] border border-welcome-black/10 bg-welcome-black/[0.06] px-4 font-inter text-base text-welcome-body/65 opacity-100"
                >
                  <option value="christmas">{t("form.occasionTypes.christmas")}</option>
                  <option value="birthday">{t("form.occasionTypes.birthday")}</option>
                  <option value="congratulations">{t("form.occasionTypes.congratulations")}</option>
                  <option value="thankYou">{t("form.occasionTypes.thankYou")}</option>
                </select>
                <p className="mt-2 font-inter text-xs text-welcome-body/60">
                  {t("form.occasionLocked")}
                </p>
              </Field>
              <Field
                htmlFor="gift-amount"
                label={t("form.amount")}
                error={errors.amount}
                className="sm:col-span-2"
              >
                <div className="relative">
                  <input
                    id="gift-amount"
                    type="number"
                    min="1"
                    max="10000"
                    step="0.01"
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(event) => update("amount", event.target.value)}
                    aria-invalid={Boolean(errors.amount)}
                    aria-describedby={errors.amount ? "gift-amount-error" : undefined}
                    className="h-14 w-full rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 pr-12 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-manrope font-semibold text-welcome-body/60">
                    € TTC
                  </span>
                </div>
              </Field>
              <Field htmlFor="gift-from" label={t("form.from")} error={errors.from}>
                <input
                  id="gift-from"
                  type="text"
                  value={form.from}
                  onChange={(event) => update("from", event.target.value)}
                  aria-invalid={Boolean(errors.from)}
                  aria-describedby={errors.from ? "gift-from-error" : undefined}
                  className="h-14 w-full rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                />
              </Field>
              <Field htmlFor="gift-recipient" label={t("form.recipient")} error={errors.recipient}>
                <input
                  id="gift-recipient"
                  type="text"
                  value={form.recipient}
                  onChange={(event) => update("recipient", event.target.value)}
                  aria-invalid={Boolean(errors.recipient)}
                  aria-describedby={errors.recipient ? "gift-recipient-error" : undefined}
                  className="h-14 w-full rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                />
              </Field>
              <Field
                htmlFor="gift-message"
                label={t("form.message")}
                error={errors.message}
                className="sm:col-span-2"
              >
                <textarea
                  id="gift-message"
                  rows={5}
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "gift-message-error" : undefined}
                  className="w-full resize-y rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 py-3 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                />
              </Field>

              <div className="mt-2 border-t border-welcome-black/10 pt-7 sm:col-span-2">
                <h3 className="font-manrope text-[22px] font-semibold text-welcome-black">
                  {t("form.billingTitle")}
                </h3>
                <p className="mt-2 font-inter text-sm leading-relaxed text-welcome-body/70">
                  {t("form.billingLead")}
                </p>
              </div>

              <Field
                htmlFor="gift-organization-type"
                label={t("form.organizationType")}
                error={errors.organizationType}
                className="sm:col-span-2"
              >
                <select
                  id="gift-organization-type"
                  required
                  value={form.organizationType}
                  onChange={(event) => update("organizationType", event.target.value)}
                  aria-invalid={Boolean(errors.organizationType)}
                  aria-describedby={
                    errors.organizationType ? "gift-organization-type-error" : undefined
                  }
                  className="h-14 w-full rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                >
                  <option value="">{t("form.organizationTypes.placeholder")}</option>
                  <option value="company">{t("form.organizationTypes.company")}</option>
                  <option value="association">{t("form.organizationTypes.association")}</option>
                  <option value="individual">{t("form.organizationTypes.individual")}</option>
                  <option value="public">{t("form.organizationTypes.public")}</option>
                </select>
              </Field>

              <Field htmlFor="gift-last-name" label={t("form.lastName")} error={errors.lastName}>
                <input
                  id="gift-last-name"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? "gift-last-name-error" : undefined}
                  className="h-14 w-full rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                />
              </Field>

              <Field htmlFor="gift-first-name" label={t("form.firstName")} error={errors.firstName}>
                <input
                  id="gift-first-name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? "gift-first-name-error" : undefined}
                  className="h-14 w-full rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                />
              </Field>

              <Field
                htmlFor="gift-billing-address"
                label={t("form.billingAddress")}
                error={errors.billingAddress}
                className="sm:col-span-2"
              >
                <textarea
                  id="gift-billing-address"
                  rows={3}
                  required
                  autoComplete="street-address"
                  value={form.billingAddress}
                  onChange={(event) => update("billingAddress", event.target.value)}
                  aria-invalid={Boolean(errors.billingAddress)}
                  aria-describedby={
                    errors.billingAddress ? "gift-billing-address-error" : undefined
                  }
                  className="w-full resize-y rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 py-3 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                />
              </Field>

              <Field htmlFor="gift-email" label={t("form.email")} error={errors.email}>
                <input
                  id="gift-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "gift-email-error" : undefined}
                  className="h-14 w-full rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                />
              </Field>

              <Field
                htmlFor="gift-email-confirmation"
                label={t("form.emailConfirmation")}
                error={errors.emailConfirmation}
              >
                <input
                  id="gift-email-confirmation"
                  type="email"
                  required
                  autoComplete="off"
                  value={form.emailConfirmation}
                  onChange={(event) => update("emailConfirmation", event.target.value)}
                  aria-invalid={Boolean(errors.emailConfirmation)}
                  aria-describedby={
                    errors.emailConfirmation ? "gift-email-confirmation-error" : undefined
                  }
                  className="h-14 w-full rounded-[12px] border border-welcome-black/15 bg-welcome-white px-4 font-inter text-base text-welcome-black outline-none transition focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                />
              </Field>
            </div>

            {step === 1 ? (
              <div
                role="note"
                className="mt-7 flex items-start gap-3 rounded-[14px] border border-welcome-gold/35 bg-welcome-gold/10 p-4"
              >
                <CreditCard
                  className="mt-0.5 h-5 w-5 shrink-0 text-welcome-gold"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-manrope text-sm font-semibold text-welcome-black">
                    {t("form.nextStepsTitle")}
                  </p>
                  <p className="mt-1 font-inter text-sm leading-relaxed text-welcome-body/75">
                    {t("form.nextSteps")}
                  </p>
                </div>
              </div>
            ) : (
              <OrderReview form={form} onEdit={editOrder} t={t} />
            )}

            <button
              type="submit"
              disabled={status === "submitting" || status === "redirecting"}
              className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-[13px] bg-welcome-gold px-7 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              {step === 1 ? (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              )}
              {status === "submitting"
                ? t("form.checking")
                : status === "redirecting"
                  ? t("form.redirecting")
                  : step === 1
                    ? t("form.nextButton")
                    : t("form.payButton")}
            </button>

            <div aria-live="polite">
              {status === "error" && Object.keys(errors).length === 0 && (
                <p className="mt-5 rounded-[12px] bg-red-600/10 px-4 py-3 font-inter text-sm text-red-700 dark:text-red-300">
                  {t("form.error")}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function OrderReview({
  form,
  onEdit,
  t,
}: {
  form: {
    design: Design;
    occasion: Occasion;
    amount: string;
    from: string;
    recipient: string;
    message: string;
    organizationType: OrganizationType | "";
    lastName: string;
    firstName: string;
    billingAddress: string;
    email: string;
    emailConfirmation: string;
  };
  onEdit: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const locale = useLocale();
  const design = DESIGNS.find((item) => item.id === form.design) ?? DESIGNS[0];
  const amount = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(Number(form.amount));
  const issueDate = new Date();
  const expirationDate = new Date(issueDate);
  expirationDate.setFullYear(issueDate.getFullYear() + 2);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const validity = t("form.validitySummary", {
    start: dateFormatter.format(issueDate),
    end: dateFormatter.format(expirationDate),
  });
  const occasion = t(`form.occasionTypes.${form.occasion}`);
  const voucherOccasion =
    form.occasion === "christmas"
      ? `${occasion.toLocaleUpperCase(locale)} ${issueDate.getFullYear()}`
      : occasion.toLocaleUpperCase(locale);

  const orderRows = [
    [t("form.reviewDesign"), t(`designs.items.${form.design}.title`)],
    [t("form.occasion"), occasion],
    [t("form.amount"), amount],
    [t("form.recipient"), form.recipient],
    [t("form.from"), form.from],
  ];
  const billingRows = [
    [
      t("form.organizationType"),
      form.organizationType ? t(`form.organizationTypes.${form.organizationType}`) : "",
    ],
    [t("form.reviewBillingName"), `${form.firstName} ${form.lastName}`],
    [t("form.billingAddress"), form.billingAddress],
    [t("form.email"), form.email],
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-manrope text-[26px] font-semibold text-welcome-black">
            {t("form.reviewTitle")}
          </h3>
          <p className="mt-2 max-w-2xl font-inter text-sm leading-relaxed text-welcome-body/70">
            {t("form.reviewLead")}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-welcome-black/15 bg-welcome-white px-4 py-2 font-manrope text-sm font-semibold text-welcome-black transition hover:border-welcome-gold"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          {t("form.editButton")}
        </button>
      </div>

      <PersonalizedVoucherPreview
        design={form.design}
        image={design.image}
        alt={t(`designs.items.${form.design}.alt`)}
        occasion={voucherOccasion}
        amount={amount}
        recipient={form.recipient}
        from={form.from}
        message={form.message}
        validity={validity}
        recipientLabel={t("form.recipient")}
        fromLabel={t("form.from")}
        messageLabel={t("form.message")}
      />

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <ReviewPanel title={t("form.orderSummaryTitle")} rows={orderRows} />
        <ReviewPanel title={t("form.billingSummaryTitle")} rows={billingRows} />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-[14px] border border-welcome-gold/35 bg-welcome-gold/10 p-4">
        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-welcome-gold" aria-hidden="true" />
        <p className="font-inter text-sm leading-relaxed text-welcome-body/75">
          {t("form.paymentRedirectNotice")}
        </p>
      </div>
    </div>
  );
}

function PersonalizedVoucherPreview({
  design,
  image,
  alt,
  occasion,
  amount,
  recipient,
  from,
  message,
  validity,
  recipientLabel,
  fromLabel,
  messageLabel,
}: {
  design: Design;
  image: StaticImageData;
  alt: string;
  occasion: string;
  amount: string;
  recipient: string;
  from: string;
  message: string;
  validity: string;
  recipientLabel: string;
  fromLabel: string;
  messageLabel: string;
}) {
  const details = (
    <div className="space-y-[0.25em] leading-tight">
      <p className="truncate">
        <strong>{recipientLabel}</strong> {recipient}
      </p>
      <p className="truncate">
        <strong>{fromLabel}</strong> {from}
      </p>
      <p className="line-clamp-2 italic">
        <strong className="not-italic">{messageLabel}</strong> {message}
      </p>
    </div>
  );

  return (
    <div className="relative mt-7 aspect-[3/2] overflow-hidden rounded-[20px] border border-welcome-gold/35 bg-[#062f25] shadow-[0_24px_55px_-35px_rgba(6,47,37,0.75)]">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 55vw, calc(100vw - 48px)"
        className="object-cover"
      />

      {(design === "ivory" || design === "thankYou") && (
        <div className="absolute inset-0 font-inter text-[#171512]">
          <p className="absolute left-[4%] top-[29%] w-[49%] truncate text-center text-[clamp(8px,2.5vw,24px)] font-semibold uppercase tracking-[0.12em] text-[#bd8528]">
            {occasion}
          </p>
          <p className="absolute left-[5%] top-[36%] flex h-[18%] w-[47%] items-center justify-center whitespace-nowrap text-center text-[clamp(18px,6vw,58px)] font-extrabold leading-none text-[#bd8528]">
            {amount}
          </p>
          <p className="absolute left-[5%] top-[54%] w-[47%] text-center text-[clamp(5px,1.15vw,11px)]">
            {validity}
          </p>
          <div className="absolute left-[7%] top-[75%] w-[41%] text-[clamp(5px,1.3vw,12px)]">
            {details}
          </div>
        </div>
      )}

      {(design === "red" || design === "birthday") && (
        <div className="absolute inset-0 font-serif text-[#94131a]">
          <p className="absolute left-[20%] top-[52%] w-[44%] truncate text-center text-[clamp(8px,2.5vw,24px)] font-bold uppercase tracking-[0.08em]">
            {occasion}
          </p>
          <p className="absolute left-[23.5%] top-[58.5%] flex h-[15%] w-[36%] items-center justify-center whitespace-nowrap text-center text-[clamp(16px,4.3vw,44px)] font-bold leading-none text-[#fff8e9]">
            {amount}
          </p>
          <p className="absolute left-[23%] top-[76%] w-[38%] text-center text-[clamp(5px,1.1vw,10px)] text-[#2b1b14]">
            {validity}
          </p>
          <div className="absolute left-[71%] top-[53%] w-[24%] text-[clamp(5px,1.25vw,12px)]">
            {details}
          </div>
        </div>
      )}

      {(design === "green" || design === "congratulations") && (
        <div className="absolute inset-0 font-serif">
          <p className="absolute left-[5%] top-[25%] w-[50%] truncate text-center text-[clamp(8px,2.5vw,24px)] font-bold uppercase tracking-[0.06em] text-[#fff9e8]">
            {occasion}
          </p>
          <p className="absolute left-[8%] top-[34%] flex h-[18.5%] w-[39.5%] items-center justify-center whitespace-nowrap text-center text-[clamp(16px,4.5vw,46px)] font-bold leading-none text-[#063a2a]">
            {amount}
          </p>
          <p className="absolute left-[8%] top-[55%] w-[41%] text-center text-[clamp(5px,1.1vw,10px)] text-[#fff9e8]">
            {validity}
          </p>
          <div className="absolute left-[8%] top-[78%] w-[43%] text-[clamp(5px,1.25vw,12px)] text-[#171512]">
            {details}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewPanel({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="rounded-[16px] border border-welcome-black/10 bg-welcome-white p-5">
      <h4 className="font-manrope text-sm font-semibold text-welcome-black">{title}</h4>
      <dl className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="border-t border-welcome-black/[0.07] pt-3 first:border-0 first:pt-0"
          >
            <dt className="font-inter text-xs text-welcome-body/55">{label}</dt>
            <dd className="mt-1 whitespace-pre-wrap font-inter text-sm font-medium text-welcome-black">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Field({
  htmlFor,
  label,
  error,
  className = "",
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-manrope text-sm font-semibold text-welcome-black"
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          className="mt-2 font-inter text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
