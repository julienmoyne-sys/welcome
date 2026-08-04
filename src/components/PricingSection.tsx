import { Armchair, Briefcase, Check, DoorOpen, Presentation } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

/**
 * Clé de traduction ↔ icône. `featured` met en avant la salle de réunion, et
 * `cta` distingue le libellé « Comparer » de « En savoir plus ».
 */
const PLANS = [
  { key: "nomad", icon: Briefcase, cta: "compare", href: "/comparatif-solutions" },
  { key: "openSpace", icon: Armchair, cta: "compare", href: "/comparatif-solutions" },
  { key: "privateOffice", icon: DoorOpen, cta: "compare", href: "/comparatif-solutions" },
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
            {t("lead")}
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
                className={`relative flex flex-col rounded-[20px] p-8 shadow-[0_8px_40px_-12px_rgba(11,11,11,0.08)] transition-all duration-300 lg:p-10 ${
                  "featured" in plan && plan.featured
                    ? "z-10 scale-[1.02] bg-welcome-gold/[0.04] shadow-[0_16px_48px_-12px_rgba(11,11,11,0.12)] md:-my-2 md:py-10"
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

                {/* Button */}
                <div className="mt-10">
                  <Link
                    href={plan.href}
                    className={`inline-flex h-[52px] w-full items-center justify-center rounded-[12px] border font-manrope text-[15px] font-semibold text-welcome-black transition-all duration-200 hover:border-welcome-black hover:bg-welcome-black hover:text-welcome-ink-fg ${
                      plan.cta === "learnMore"
                        ? "border-welcome-gold/40 bg-welcome-gold/10"
                        : "border-welcome-black/15 bg-welcome-black/[0.04]"
                    }`}
                  >
                    {t(plan.cta)}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
