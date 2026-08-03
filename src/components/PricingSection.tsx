import Link from "next/link";
import { Armchair, DoorOpen, Presentation, Briefcase, Check } from "lucide-react";

const plans = [
  {
    name: "Nomade",
    icon: Briefcase,
    cta: "Comparer",
    features: ["Sans minimum", "Internet fibre", "Accès autonome", "Réservation à l'heure"],
    href: "/#solutions",
  },
  {
    name: "Open Space",
    icon: Armchair,
    cta: "Comparer",
    features: ["Accès flexible", "Internet fibre", "Café", "Impression"],
    href: "/#solutions",
  },
  {
    name: "Bureau privatif",
    icon: DoorOpen,
    cta: "Comparer",
    features: ["Bureau fermé", "Accès sécurisé", "Mobilier premium", "Internet fibre"],
    href: "/#solutions",
  },
  {
    name: "Salle de réunion",
    icon: Presentation,
    featured: true,
    cta: "En savoir plus",
    features: ["Écran", "Visioconférence", "Jusqu'à 12 personnes", "Réservation simple"],
    href: "/#solutions",
  },
];

export function PricingSection() {
  return (
    <section className="bg-welcome-cream py-24 sm:py-28 lg:py-[120px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            id="solutions"
            className="scroll-mt-[120px] font-inter text-[15px] font-medium uppercase tracking-[0.12em] text-welcome-sage"
          >
            Nos solutions
          </p>
          <h2 className="mt-4 font-manrope text-[36px] font-bold leading-[1.12] tracking-tight text-welcome-black sm:text-[42px] lg:text-[48px] xl:text-[56px]">
            Choisissez votre rythme.
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-inter text-lg leading-[1.7] text-welcome-body">
            Que vous veniez occasionnellement ou toute l’année, nous avons imaginé des solutions
            simples dans des espaces intimistes à partir de 20€ HT / mois.
          </p>
        </div>

        {/* Cards grid */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-[20px] p-8 shadow-[0_8px_40px_-12px_rgba(11,11,11,0.08)] transition-all duration-300 lg:p-10 ${
                  plan.featured
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
                  {plan.name}
                </h3>

                {/* Features */}
                <ul className="mt-8 flex flex-1 flex-col gap-4">
                  {plan.features.map((feature) => (
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
                    className="inline-flex h-[52px] w-full items-center justify-center rounded-[12px] border border-welcome-black/20 bg-transparent font-manrope text-[15px] font-semibold text-welcome-black transition-all duration-200 hover:border-welcome-black hover:bg-welcome-black hover:text-welcome-ink-fg"
                  >
                    {plan.cta}
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
