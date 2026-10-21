"use client";

import Image, { type StaticImageData } from "next/image";
import { Check, CreditCard, Gift, Send, Snowflake } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import giftCardGreen from "@/assets/gift-card-christmas-green.webp";
import giftCardIvory from "@/assets/gift-card-christmas-ivory.webp";
import giftCardRed from "@/assets/gift-card-christmas-red.webp";
import { submitGiftCard } from "@/lib/gift-card.actions";

type Design = "ivory" | "red" | "green";
type OrganizationType = "company" | "association" | "individual" | "public";

const DESIGNS: Array<{ id: Design; image: StaticImageData }> = [
  { id: "ivory", image: giftCardIvory },
  { id: "red", image: giftCardRed },
  { id: "green", image: giftCardGreen },
];

export function GiftCardShop() {
  const t = useTranslations("shop");
  const locale = useLocale();
  const [form, setForm] = useState({
    design: "ivory" as Design,
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
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setStatus("submitting");

    try {
      const result = await submitGiftCard(form, locale);
      if (result.status === "invalid") {
        setErrors(result.fieldErrors);
        setStatus("error");
        return;
      }
      if (result.status === "error") {
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm((current) => ({
        ...current,
        amount: "",
        from: "",
        recipient: "",
        message: "",
        organizationType: "",
        lastName: "",
        firstName: "",
        billingAddress: "",
        email: "",
        emailConfirmation: "",
      }));
    } catch {
      setStatus("error");
    }
  };

  return (
    <main>
      <section className="relative overflow-hidden bg-[#062f25] px-6 py-20 text-white lg:px-10 lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
          <Snowflake className="absolute left-[8%] top-12 h-16 w-16 text-[#e3c366]" />
          <Snowflake className="absolute right-[10%] top-20 h-10 w-10 text-[#e3c366]" />
          <Snowflake className="absolute bottom-10 left-[22%] h-8 w-8 text-white" />
          <Snowflake className="absolute bottom-12 right-[25%] h-14 w-14 text-white" />
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
            {DESIGNS.map(({ id, image }) => {
              const selected = form.design === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update("design", id)}
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
            onSubmit={handleSubmit}
            className="rounded-[24px] border border-welcome-black/[0.07] bg-welcome-cream p-6 shadow-[0_24px_70px_-48px_rgba(11,11,11,0.45)] sm:p-9"
            noValidate
          >
            <div className="grid gap-6 sm:grid-cols-2">
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

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-[13px] bg-welcome-gold px-7 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {status === "submitting" ? t("form.sending") : t("form.submit")}
            </button>

            <div aria-live="polite">
              {status === "success" && (
                <p className="mt-5 rounded-[12px] bg-emerald-600/10 px-4 py-3 font-inter text-sm text-emerald-700 dark:text-emerald-300">
                  {t("form.success")}
                </p>
              )}
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
