import { useTranslations } from "next-intl";

import type { FaqItem } from "@/lib/seo";

export function FaqSection() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FaqItem[];
  const categoryOrder = t.raw("categoryOrder") as string[];

  // Regroupement par clé de catégorie : l'ordre vient de `categoryOrder`, stable
  // d'une langue à l'autre puisqu'il s'appuie sur des clés et non sur les libellés.
  const grouped = items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <section id="faq" className="scroll-mt-[90px] bg-welcome-white py-[120px]">
      <div className="mx-auto w-full max-w-[900px] px-6">
        <p className="font-manrope text-sm font-semibold uppercase tracking-[0.15em] text-welcome-gold">
          {t("eyebrow")}
        </p>
        {/* `h1` de la page /faq : ce composant n'est utilisé que là, et la page n'avait
            aucun titre de niveau 1. Classes inchangées, donc rendu visuel identique. */}
        <h1 className="mt-4 font-manrope text-4xl font-semibold leading-tight tracking-tight text-welcome-black md:text-5xl">
          {t("titleLead")} <span className="text-welcome-gold">{t("titleHighlight")}</span>
        </h1>

        <div className="mt-14 space-y-14">
          {categoryOrder.map(
            (category) =>
              grouped[category] && (
                <div key={category}>
                  <h3 className="mb-6 inline-flex items-center font-manrope text-[15px] font-semibold uppercase tracking-[0.12em] text-welcome-gold">
                    <span className="mr-3 h-[6px] w-[6px] rounded-full bg-welcome-gold" />
                    {t(`categories.${category}`)}
                  </h3>
                  <div className="divide-y divide-welcome-black/10 rounded-[20px] border border-welcome-black/10 bg-welcome-white px-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
                    {grouped[category].map((item) => (
                      <details key={item.question} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-manrope text-[17px] font-semibold text-welcome-black">
                          <h4 className="font-manrope text-[17px] font-semibold">
                            {item.question}
                          </h4>
                          <span className="shrink-0 text-welcome-gold transition-transform duration-200 group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <p className="mt-4 font-inter text-[15px] leading-relaxed text-welcome-black/70">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      </div>
    </section>
  );
}
