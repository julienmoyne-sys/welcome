import { Armchair, Briefcase, Check, DoorOpen, Presentation } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

/**
 * Clé de traduction ↔ icône. `featured` met en avant la salle de réunion, et
 * `cta` distingue le libellé « Comparer » de « En savoir plus ».
 */
const PLANS = [
  { key: "nomad", icon: Briefcase, cta: "compare", href: "/comparatif-solutions?plan=nomad" },
  {
    key: "openSpace",
    icon: Armchair,
    cta: "compare",
    href: "/comparatif-solutions?plan=open-space",
  },
  {
    key: "privateOffice",
    icon: DoorOpen,
    cta: "compare",
    href: "/comparatif-solutions?plan=private-office",
  },
  {
    key: "meetingRoom",
    icon: Presentation,
    cta: "learnMore",
    href: "/salle-de-reunion?from=solutions",
    featured: true,
  },
] as const;

export function PricingSection() {
  const t = useTranslations("pricing");

  return (
    <section className="bg-welcome-cream py-24 sm:py-28 lg:py-[120px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            id="solutions"
            className="scroll-mt-[120px] font-inter text-[15px] font-medium uppercase tracking-[0.12em] text-welcome-sage"
          >
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-manrope text-[36px] font-bold leading-[1.12] tracking-tight text-welcome-black sm:text-[42px] lg:text-[48px] xl:text-[56px]">
            {t("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-inter text-lg leading-[1.7] text-welcome-body">
            {t.rich("lead", {
              strong: (chunks) => <strong className="font-bold">{chunks}</strong>,
            })}
          </p>
        </div>

        {/* Cards grid */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const features = t.raw(`plans.${plan.key}.features`) as string[];

            return (
              <article
                key={plan.key}
                className={`relative flex flex-col rounded-[20px] px-6 py-8 shadow-[0_8px_40px_-12px_rgba(11,11,11,0.08)] transition-all duration-300 lg:px-7 lg:py-10 ${
                  "featured" in plan && plan.featured
                    ? "z-10 bg-welcome-gold/[0.04] shadow-[0_16px_48px_-12px_rgba(11,11,11,0.12)]"
                    : "bg-welcome-white hover:shadow-[0_12px_44px_-12px_rgba(11,11,11,0.1)]"
                }`}
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-welcome-gold/10">
                  <Icon className="text-welcome-gold" size={24} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="mt-6 font-manrope text-[24px] font-semibold leading-tight text-welcome-black lg:text-[26px]">
                  {t(`plans.${plan.key}.name`)}
                </h3>

                {/* Features */}
                <ul className="mt-8 flex flex-1 flex-col gap-4">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 font-inter text-[16px] leading-[1.5] text-welcome-body"
                    >
                      <Check
                        className="mt-0.5 shrink-0 text-welcome-gold"
                        size={18}
                        strokeWidth={2}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Availability and button */}
                <div className="mt-10">
                  <p className="mb-4 flex items-center justify-center gap-2 font-inter text-[14px] font-medium text-welcome-body">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                      aria-hidden="true"
                    />
                    {t(`plans.${plan.key}.availability`)}
                  </p>
                  <Link
                    href={plan.href}
                    className={`inline-flex h-[52px] w-full items-center justify-center rounded-[12px] border font-manrope text-[15px] font-semibold transition-all duration-200 ${
                      plan.cta === "learnMore"
                        ? "border-[#0b0b0b] bg-[#0b0b0b] text-white hover:border-[#0b0b0b]/85 hover:bg-[#0b0b0b]/85 dark:border-welcome-gold/40 dark:bg-welcome-gold/10 dark:text-welcome-black dark:hover:border-welcome-black dark:hover:bg-welcome-black dark:hover:text-welcome-ink-fg"
                        : "border-welcome-sage bg-welcome-sage text-white hover:border-welcome-sage/90 hover:bg-welcome-sage/90 hover:text-white dark:text-[#0b0b0b] dark:hover:text-[#0b0b0b]"
                    }`}
                  >
                    {t(plan.cta)}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-right font-inter text-[13px] text-welcome-body">
          {t("commitmentNote")}
        </p>
      </div>
    </section>
  );
}
